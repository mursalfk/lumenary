// src/engine/runtime.js
import { fitSize, scaleCanvas } from './utils.js';

// A video is previewed at this working size at most, so that most treatments keep up with it. A treatment that
// still cannot keep up is previewed smaller and smaller, down to VIDEO_PREVIEW_MIN. The saved video is not affected.
export const VIDEO_PREVIEW_SIDE = 640;
export const VIDEO_PREVIEW_MIN = 320;
const SLOW_FRAME_MS = 120;
// Only this much of a video is used, in the preview and in the exported file.
export const VIDEO_LIMIT = 15;

export function defaultsOf(style) {
  const o = {};
  for (const p of style.params) o[p.key] = p.default;
  return o;
}

// Hands a renderer the next frame of a video. A renderer that knows how to swap the picture without starting over
// (`setFrame`) keeps its state: particles stay where they are, simulations keep running.
export function feedFrame(renderer, work, W, H) {
  if (renderer.setFrame) renderer.setFrame(work);
  else renderer.setSource(work, W, H);
}

// The frame a video element is showing, as a canvas no larger than `maxSide` on its long side.
export function grabFrame(env, video, maxSide = 3200) {
  const { w, h } = fitSize(video.videoWidth, video.videoHeight, maxSide);
  const c = env.makeCanvas(w, h), x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.drawImage(video, 0, 0, w, h);
  return c;
}

// Draws one style into a canvas. Still styles repaint when something changes; animated ones every frame.
// A source is { canvas } for a picture, or { canvas, video, limit } for a video: `canvas` is then its first frame,
// and every later frame is read from `video` as it plays.
export function createRuntime({ canvas, env, onSize }) {
  const ctx = canvas.getContext('2d');
  let style = null, renderer = null, params = {}, source = null, work = null, wctx = null;
  let W = 0, H = 0, dirty = true, raf = 0, running = false, t0 = 0, last = 0;
  let shown = -1, rest = 0, side = VIDEO_PREVIEW_SIDE, slow = 0;
  const pointer = { x: 0.5, y: 0.5, down: false, inside: false };
  const video = () => (source && source.video) || null;

  function build() {
    if (!style || !source) return;
    const img = source.canvas, cap = video() ? Math.min(style.maxSide, side) : style.maxSide;
    const { w, h } = fitSize(img.width, img.height, cap);
    work = scaleCanvas(env, img, w, h);
    wctx = work.getContext('2d');
    wctx.imageSmoothingQuality = 'high';
    W = w; H = h;
    canvas.width = w; canvas.height = h;
    if (renderer && renderer.dispose) renderer.dispose();
    renderer = style.create(env);
    renderer.setSource(work, W, H);
    renderer.setParams(params);
    dirty = true;
    shown = -1; rest = 0;
    t0 = performance.now();
    if (onSize) onSize(W, H);
  }

  // Reads the frame the video is showing into the working canvas, when it has moved on since the last one.
  // After a slow treatment the next frame waits a moment, so the page stays responsive while the video plays.
  function pull(now) {
    const v = video();
    if (!v || v.readyState < 2) return 0;
    if (v.currentTime >= source.limit) v.currentTime = 0;
    if (v.currentTime === shown || now < rest) return 0;
    shown = v.currentTime;
    wctx.drawImage(v, 0, 0, W, H);
    feedFrame(renderer, work, W, H);
    dirty = true;
    return performance.now();
  }

  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (!renderer) return;
    const began = pull(now);
    if (renderer.animated) {
      const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
      last = now;
      renderer.draw(ctx, t, dt, pointer);
    } else if (dirty) {
      renderer.draw(ctx, 0, 0, pointer);
      dirty = false;
    }
    if (began) {
      const end = performance.now(), cost = end - began;
      rest = end + cost * 0.35;
      // Three slow frames in a row: draw the preview smaller. (The saved video is rendered at full size regardless.)
      slow = cost > SLOW_FRAME_MS ? slow + 1 : 0;
      if (slow >= 3 && side > VIDEO_PREVIEW_MIN) {
        side = Math.max(VIDEO_PREVIEW_MIN, Math.round(side * 0.75));
        slow = 0;
        build();
      }
    }
  }

  function play() {
    const v = video();
    if (v && running && !source.paused()) v.play().catch(() => {});
  }

  return {
    get size() { return { W, H }; },
    get animated() { return !!(renderer && renderer.animated); },
    setStyle(s, p) { style = s; params = p; side = VIDEO_PREVIEW_SIDE; slow = 0; build(); },
    setSource(src) {
      const old = video();
      if (old && old !== (src && src.video)) old.pause();
      source = src; side = VIDEO_PREVIEW_SIDE; slow = 0; build(); play();
    },
    setParams(p) { params = p; if (renderer) { renderer.setParams(p); dirty = true; } },
    invalidate() { dirty = true; },
    setPointer(p) { Object.assign(pointer, p); },
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); play(); },
    stop() { running = false; cancelAnimationFrame(raf); const v = video(); if (v) v.pause(); },
    dispose() { this.stop(); if (renderer && renderer.dispose) renderer.dispose(); renderer = null; },

    // Re-render a still style at a larger size for export. Animated styles export the frame on screen.
    // With a video source, the frame being shown is the one that is saved.
    async exportBlob(scale = 1, type = 'image/png') {
      if (!style || !source) return null;
      let target = canvas;
      if (!renderer.animated && (scale > 1 || video())) {
        const img = video() && video().readyState >= 2 ? grabFrame(env, video()) : source.canvas;
        const { w, h } = fitSize(img.width * scale, img.height * scale, Math.min(4096, style.maxSide * scale));
        const big = env.makeCanvas(w, h);
        const full = scaleCanvas(env, img, w, h);
        const r = style.create(env);
        r.setSource(full, w, h);
        r.setParams(params);
        r.draw(big.getContext('2d'), 0, 0, pointer);
        target = big;
      }
      return new Promise((res) => target.toBlob((b) => res(b), type, 0.95));
    },

    // Record the live canvas to a WebM clip.
    recordWebM(seconds = 6) {
      return new Promise((resolve, reject) => {
        if (!canvas.captureStream || typeof MediaRecorder === 'undefined') return reject(new Error('Recording is not supported in this browser.'));
        const stream = canvas.captureStream(30);
        const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
        if (!mime) return reject(new Error('Recording is not supported in this browser.'));
        const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
        const chunks = [];
        rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
        rec.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
        rec.onerror = (e) => reject(e.error || new Error('Recording failed.'));
        rec.start();
        setTimeout(() => rec.state !== 'inactive' && rec.stop(), seconds * 1000);
      });
    },
  };
}

// One-off thumbnail for the homepage. Animated styles are advanced a second or so so they are not caught mid-intro.
export function renderThumb(env, style, srcCanvas, side = 420) {
  const { w, h } = fitSize(srcCanvas.width, srcCanvas.height, Math.min(side, style.maxSide));
  const work = scaleCanvas(env, srcCanvas, w, h);
  const out = env.makeCanvas(w, h);
  const ctx = out.getContext('2d');
  const r = style.create(env);
  r.setSource(work, w, h);
  const p = { ...defaultsOf(style), ...(style.thumbParams || {}) };
  r.setParams(p);
  const ptr = { x: 0.5, y: 0.5, down: false, inside: false };
  if (r.animated) {
    const warm = style.thumbAt || 1.6;
    if (r.step) for (let i = 0; i < Math.round(warm * 30); i++) r.step(1 / 30, ptr);
    r.draw(ctx, warm, r.step ? 0 : 1 / 30, ptr);
  } else r.draw(ctx, 0, 0, ptr);
  if (r.dispose) r.dispose();
  return out;
}
