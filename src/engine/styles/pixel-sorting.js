// src/engine/styles/pixel-sorting.js
import { still, rng } from '../utils.js';
import { pixels } from '../helpers.js';

const key = {
  brightness: (d, L, i) => L[i],
  red: (d, L, i) => d[i * 4],
  blue: (d, L, i) => d[i * 4 + 2],
  hue: (d, L, i) => { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx === mn) return 0; const c = mx - mn; return (mx === r ? ((g - b) / c + 6) % 6 : mx === g ? (b - r) / c + 2 : (r - g) / c + 4) / 6; },
};

export default still({
  id: 'pixel-sorting',
  name: 'Pixel Sorting',
  blurb: 'Streaks of pixels re-ordered by brightness, so highlights melt into long smears.',
  maxSide: 1000,
  params: [
    { key: 'dir', label: 'Direction', type: 'select', default: 'v', options: [['v', 'Vertical'], ['h', 'Horizontal']] },
    { key: 'by', label: 'Sort by', type: 'select', default: 'brightness', options: [['brightness', 'Brightness'], ['hue', 'Hue'], ['red', 'Red'], ['blue', 'Blue']] },
    { key: 'lo', label: 'Sort from', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'hi', label: 'Sort up to', type: 'range', min: 0, max: 100, step: 1, default: 100 },
    { key: 'streak', label: 'Streak length', type: 'range', min: 5, max: 100, step: 1, default: 60 },
    { key: 'reverse', label: 'Dark to light', type: 'toggle', default: false },
    { key: 'seed', label: 'Re-roll lengths', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const src = pixels(work, W, H, cache).data, L = cache.L, r = rng(p.seed * 19 + 4);
    const out = ctx.createImageData(W, H), o = out.data; o.set(src);
    const lo = Math.min(p.lo, p.hi) / 100, hi = Math.max(p.lo, p.hi) / 100, kf = key[p.by] || key.brightness;
    const vertical = p.dir === 'v', lines = vertical ? W : H, len = vertical ? H : W, stride = vertical ? W : 1, base = vertical ? 1 : W;
    const maxRun = Math.max(8, Math.round((p.streak / 100) * len));
    const keys = new Float32Array(len), buf = new Uint32Array(len), order = [];
    for (let ln = 0; ln < lines; ln++) {
      const start = ln * base;   // index of the first pixel on this line
      let t = 0;
      while (t < len) {
        const first = start + t * stride;
        if (L[first] < lo || L[first] > hi) { t++; continue; }
        // a run of pixels inside the band, cut at a random length no longer than maxRun
        const cap = Math.max(4, (maxRun * (0.4 + r() * 0.6)) | 0);
        let e = t;
        while (e < len && e - t < cap && L[start + e * stride] >= lo && L[start + e * stride] <= hi) e++;
        const n = e - t;
        if (n > 1) {
          order.length = n;
          for (let q = 0; q < n; q++) { const i = start + (t + q) * stride; order[q] = q; keys[q] = kf(src, L, i); const o4 = i * 4; buf[q] = (src[o4] << 16) | (src[o4 + 1] << 8) | src[o4 + 2]; }
          order.sort(p.reverse ? (a, b) => keys[b] - keys[a] : (a, b) => keys[a] - keys[b]);
          for (let q = 0; q < n; q++) { const c = buf[order[q]], o4 = (start + (t + q) * stride) * 4; o[o4] = (c >> 16) & 255; o[o4 + 1] = (c >> 8) & 255; o[o4 + 2] = c & 255; }
        }
        t = e + 1;
      }
    }
    ctx.putImageData(out, 0, 0);
  },
});
