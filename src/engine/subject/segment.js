// src/engine/subject/segment.js
// Finds the main subject of a picture, on this device. A small neural network (U2-Net, the 4.6 MB "p" model) runs in
// the browser through ONNX Runtime. The picture is never sent anywhere: only the runtime and the model file are
// downloaded, once, the first time a subject-aware treatment is opened.
const SIDE = 320;                                       // the network works on 320 by 320 pictures
const ORT_VERSION = '1.31.1';
// The runtime is fetched from a CDN rather than bundled (it is a 15 MB file). If the first one cannot be reached, the second is tried.
const ORT_BASES = [`https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`, `https://unpkg.com/onnxruntime-web@${ORT_VERSION}/dist/`];
// Read when needed, not at load: the build scripts import every style in plain Node, where import.meta.env does not exist.
const modelUrl = () => `${(import.meta.env && import.meta.env.BASE_URL) || '/'}models/u2netp.onnx`;
const MEAN = [0.485, 0.456, 0.406], STD = [0.229, 0.224, 0.225];
const KEEP = 4;                                         // how many finished masks to remember

let engine = null;                                      // Promise of { ort, session }, made once
let queue = Promise.resolve();                          // the network runs one picture at a time
const ready = new Map();                                // picture signature -> mask
const pending = new Map();                              // picture signature -> Promise of mask

async function startEngine(note) {
  note('Loading the subject finder');
  let failure = null;
  for (const base of ORT_BASES) {
    try {
      const ort = await import(/* @vite-ignore */ base + 'ort.wasm.min.mjs');
      ort.env.wasm.wasmPaths = base;
      ort.env.wasm.numThreads = 1;
      const session = await ort.InferenceSession.create(modelUrl(), { executionProviders: ['wasm'] });
      return { ort, session };
    } catch (e) { failure = e; }
  }
  throw failure;
}

function loadEngine(note) {
  if (!engine) {
    engine = startEngine(note);
    engine.catch(() => { engine = null; });
  }
  return engine;
}

// A short fingerprint of a picture: its size and a hash of a sample of its real pixel values. (Scaling it down to a
// thumbnail and hashing that gave a different answer from one call to the next, so the pixels are read directly.)
function signature(env, picture) {
  const w = picture.width, h = picture.height, c = env.makeCanvas(w, h).getContext('2d', { willReadFrequently: true });
  c.drawImage(picture, 0, 0);
  const d = c.getImageData(0, 0, w, h).data, step = 4 * 29;
  let hash = 2166136261;
  for (let i = 0; i < d.length; i += step) hash = Math.imul(hash ^ d[i] ^ (d[i + 1] << 8) ^ (d[i + 2] << 16), 16777619);
  return w + 'x' + h + ':' + (hash >>> 0);
}

async function infer(env, picture, note) {
  const { ort, session } = await loadEngine(note);
  note('Finding the subject');
  const small = env.makeCanvas(SIDE, SIDE), sc = small.getContext('2d', { willReadFrequently: true });
  sc.imageSmoothingQuality = 'high';
  sc.drawImage(picture, 0, 0, SIDE, SIDE);
  const px = sc.getImageData(0, 0, SIDE, SIDE).data, n = SIDE * SIDE, input = new Float32Array(3 * n);
  let top = 1;
  for (let i = 0; i < px.length; i += 4) top = Math.max(top, px[i], px[i + 1], px[i + 2]);
  for (let i = 0, j = 0; i < n; i++, j += 4) for (let k = 0; k < 3; k++) input[k * n + i] = (px[j + k] / top - MEAN[k]) / STD[k];
  const out = await session.run({ [session.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, SIDE, SIDE]) });
  const raw = out[session.outputNames[0]].data;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) { const v = raw[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
  const span = hi - lo || 1, tiny = sc.createImageData(SIDE, SIDE);
  for (let i = 0, j = 0; i < n; i++, j += 4) { tiny.data[j] = tiny.data[j + 1] = tiny.data[j + 2] = 255; tiny.data[j + 3] = Math.round(((raw[i] - lo) / span) * 255); }
  const low = env.makeCanvas(SIDE, SIDE);
  low.getContext('2d').putImageData(tiny, 0, 0);
  // the mask is brought up to the size of the picture; its alpha channel is how much of each pixel is the subject
  const mask = env.makeCanvas(picture.width, picture.height), mc = mask.getContext('2d');
  mc.imageSmoothingQuality = 'high';
  mc.drawImage(low, 0, 0, picture.width, picture.height);
  return mask;
}

// The subject of `picture` as a canvas the same size, whose alpha says how much of each pixel belongs to it.
export function findSubject(env, picture, note = () => {}) {
  const sig = signature(env, picture);
  if (ready.has(sig)) return Promise.resolve(ready.get(sig));
  if (!pending.has(sig)) {
    const job = (queue = queue.then(() => infer(env, picture, note)));
    queue = queue.catch(() => null);
    pending.set(sig, job.then(
      (mask) => { ready.set(sig, mask); if (ready.size > KEEP) ready.delete(ready.keys().next().value); pending.delete(sig); return mask; },
      (e) => { pending.delete(sig); throw e; },
    ));
  }
  return pending.get(sig);
}

export const peekSubject = (env, picture) => ready.get(signature(env, picture)) || null;

// What a treatment needs inside `render`: the mask when it is ready, or a note to show while it is not. The first call
// starts the search and `cache.redraw` repaints when it finishes. On video the mask from an earlier frame is kept, and
// refreshed in the background about twice a second, so the picture never waits for the network.
export function subjectState(env, work, cache) {
  const keep = cache.keep || (cache.keep = cache.last || { mask: null, busy: false, failed: false, at: 0, note: 'Finding the subject' });
  const video = !!cache.last;
  if (!video) {
    const hit = peekSubject(env, work);
    if (hit) { keep.mask = hit; return { mask: hit, note: '' }; }
  }
  const stale = video && keep.mask && performance.now() - keep.at > 600;
  if (!keep.busy && !keep.failed && (!keep.mask || stale)) {
    keep.busy = true;
    const again = () => { if (cache.redraw) cache.redraw(); };
    findSubject(env, work, (n) => { keep.note = n; again(); })
      .then((m) => { keep.mask = m; keep.at = performance.now(); })
      .catch((e) => { keep.failed = true; console.warn('Subject finder failed:', e); })
      .finally(() => { keep.busy = false; again(); });
  }
  return { mask: keep.mask, note: keep.failed ? 'The subject finder could not start on this device' : keep.note };
}
