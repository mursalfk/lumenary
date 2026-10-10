import { fitSize, scaleCanvas } from './utils.js';

export function defaultsOf(style) {
  const o = {};
  for (const p of style.params) o[p.key] = p.default;
  return o;
}

// Draws one style into a canvas. Still styles repaint when something changes; animated ones every frame.
export function createRuntime({ canvas, env, onSize }) {
  const ctx = canvas.getContext('2d');
  let style = null, renderer = null, params = {}, srcImg = null;
  let W = 0, H = 0, dirty = true, raf = 0, running = false, t0 = 0, last = 0;
  const pointer = { x: 0.5, y: 0.5, down: false, inside: false };

  function build() {
    if (!style || !srcImg) return;
    const { w, h } = fitSize(srcImg.width, srcImg.height, style.maxSide);
    const work = scaleCanvas(env, srcImg, w, h);
    W = w; H = h;
    canvas.width = w; canvas.height = h;
    if (renderer && renderer.dispose) renderer.dispose();
    renderer = style.create(env);
    renderer.setSource(work, W, H);
    renderer.setParams(params);
    dirty = true;
    t0 = performance.now();
    if (onSize) onSize(W, H);
  }

  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (!renderer) return;
    if (renderer.animated) {
      const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
      last = now;
      renderer.draw(ctx, t, dt, pointer);
    } else if (dirty) {
      renderer.draw(ctx, 0, 0, pointer);
      dirty = false;
    }
  }

  return {
    get size() { return { W, H }; },
    get animated() { return !!(renderer && renderer.animated); },
    setStyle(s, p) { style = s; params = p; build(); },
    setSource(img) { srcImg = img; build(); },
    setParams(p) { params = p; if (renderer) { renderer.setParams(p); dirty = true; } },
    invalidate() { dirty = true; },
    setPointer(p) { Object.assign(pointer, p); },
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    dispose() { this.stop(); if (renderer && renderer.dispose) renderer.dispose(); renderer = null; },

    // Re-render a still style at a larger size for export. Animated styles export the frame on screen.
    async exportBlob(scale = 1, type = 'image/png') {
      if (!style || !srcImg) return null;
      let target = canvas;
      if (!renderer.animated && scale > 1) {
        const { w, h } = fitSize(srcImg.width * scale, srcImg.height * scale, Math.min(4096, style.maxSide * scale));
        const big = env.makeCanvas(w, h);
        const work = scaleCanvas(env, srcImg, w, h);
        const r = style.create(env);
        r.setSource(work, w, h);
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
