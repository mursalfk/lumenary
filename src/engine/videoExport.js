// src/engine/videoExport.js
// Turns a video into the same video seen through one treatment. Every frame is decoded, drawn through the
// treatment and encoded again, all inside this tab (WebCodecs, through the Mediabunny library), so the file never
// leaves the device. It does not run in real time: a slow treatment simply takes longer, and no frame is dropped.
import { fitSize } from './utils.js';
import { feedFrame, VIDEO_LIMIT } from './runtime.js';

export const VIDEO_SIDES = [480, 720, 1080];

export const canExportVideo = () => typeof VideoEncoder !== 'undefined' && typeof VideoDecoder !== 'undefined';

// The size a video of w x h is exported at: fitted to `side` on its long side, never larger than the original,
// never larger than a live treatment's own working size, and even in both directions as video encoders ask.
export function videoOutSize(style, w, h, side) {
  const cap = style.kind === 'animated' ? Math.min(side, style.maxSide) : side;
  const fit = fitSize(w, h, cap), even = (n) => Math.max(2, n - (n % 2));
  return { w: even(fit.w), h: even(fit.h) };
}

const pause = () => new Promise((done) => setTimeout(done, 0));

// Resolves to { blob, ext, width, height, frames, sound }. `onProgress` gets a number from 0 to 1.
// Abort `signal` to cancel: the promise then rejects with an error whose name is 'AbortError'.
export async function exportVideo({ file, style, params, env, side = 720, limit = VIDEO_LIMIT, onProgress, signal }) {
  if (!canExportVideo()) throw new Error('This browser cannot export video. Use a current Chrome, Edge, Safari or Firefox.');
  const mb = await import('./mediabunny.js');
  const input = new mb.Input({ source: new mb.BlobSource(file), formats: [mb.MP4, mb.QTFF, mb.WEBM, mb.MATROSKA] });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error('That file has no video in it.');
    if (!(await track.canDecode())) throw new Error('This browser cannot read that kind of video. Try an MP4 or WebM file.');

    const { w, h } = videoOutSize(style, track.displayWidth, track.displayHeight, side);
    // MP4 with H.264 plays everywhere, so it is the first choice. Browsers that cannot encode it get WebM.
    let format = new mb.Mp4OutputFormat(), codec = (await mb.canEncodeVideo('avc', { width: w, height: h })) ? 'avc' : null;
    if (!codec) {
      format = new mb.WebMOutputFormat();
      codec = await mb.getFirstEncodableVideoCodec(format.getSupportedVideoCodecs(), { width: w, height: h });
    }
    if (!codec) throw new Error('This browser cannot encode video at that size. Try a smaller size.');

    const duration = await input.computeDuration();
    const rate = (await track.computePacketStats(120)).averagePacketRate || 30;
    const output = new mb.Output({ format, target: new mb.BufferTarget() });
    // Sound is copied as it is when the container allows. An MP4 gets AAC where the browser can encode it, because
    // players that open MP4 expect it.
    const audio = format instanceof mb.Mp4OutputFormat && (await mb.canEncodeAudio('aac')) ? { codec: 'aac' } : undefined;

    const work = env.makeCanvas(w, h), wctx = work.getContext('2d'), out = env.makeCanvas(w, h), octx = out.getContext('2d');
    const renderer = style.create(env), pointer = { x: 0.5, y: 0.5, down: false, inside: false };
    wctx.imageSmoothingQuality = 'high';
    let frames = 0, clock = 0, before = null;

    const conversion = await mb.Conversion.init({
      input, output, audio, showWarnings: false,
      trim: duration > limit ? { start: 0, end: limit } : undefined,
      video: {
        codec, width: w, height: h, fit: 'fill', forceTranscode: true, allowTransformationMetadata: false,
        frameRate: rate > 31 ? 30 : undefined, quality: mb.QUALITY_VERY_HIGH, processedWidth: w, processedHeight: h,
        process: async (sample) => {
          await pause();   // lets the page draw the progress bar and hear the Cancel button
          sample.draw(wctx, 0, 0, w, h);
          if (frames === 0) { renderer.setSource(work, w, h); renderer.setParams(params); } else feedFrame(renderer, work, w, h);
          // Live treatments are stepped by the video's own clock, so they move at the same speed however long a frame takes.
          const dt = before === null ? 1 / 30 : Math.min(0.1, Math.max(1 / 240, sample.timestamp - before));
          before = sample.timestamp; clock += dt; frames += 1;
          renderer.draw(octx, clock, renderer.animated ? dt : 0, pointer);
          return out;
        },
      },
    });
    if (!conversion.isValid) throw new Error('That video could not be prepared for export in this browser.');
    const sound = conversion.utilizedTracks.some((t) => t.type === 'audio');
    const lostSound = conversion.discardedTracks.some((d) => d.track.type === 'audio');
    conversion.onProgress = (p) => onProgress && onProgress(p);
    const abort = () => conversion.cancel();
    if (signal) { if (signal.aborted) await abort(); else signal.addEventListener('abort', abort, { once: true }); }
    try {
      await conversion.execute();
    } catch (e) {
      if (e instanceof mb.ConversionCanceledError || (signal && signal.aborted)) throw Object.assign(new Error('Export cancelled.'), { name: 'AbortError' });
      throw e;
    } finally {
      if (signal) signal.removeEventListener('abort', abort);
      if (renderer.dispose) renderer.dispose();
    }
    return { blob: new Blob([output.target.buffer], { type: format.mimeType }), ext: format.fileExtension.replace(/^\./, ''), width: w, height: h, frames, sound, lostSound };
  } finally {
    if (input.dispose) input.dispose();
  }
}
