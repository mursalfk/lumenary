// src/engine/styles/pop-art.js
import { still, boxBlur, sobel, hexToRgb } from '../utils.js';
import { pixels, paintPixels, contrast, rgbList } from '../helpers.js';

// Four colour sets, darkest to lightest. Panels of a 2 x 2 grid each take a different one.
const SETS = [
  ['#16141a', '#e6194b', '#ffe600', '#fff4d4'],
  ['#16141a', '#0057b8', '#ff8fc8', '#fff4d4'],
  ['#16141a', '#00a651', '#ff6a00', '#fff4d4'],
  ['#16141a', '#7b2cbf', '#00d1ff', '#fff4d4'],
].map(rgbList);

export default still({
  id: 'pop-art',
  name: 'Pop Art',
  blurb: 'Screen-print colour in four panels: flat inks, bold outlines and Ben-Day dots.',
  maxSide: 1000,
  params: [
    { key: 'layout', label: 'Panels', type: 'select', default: 'grid', options: [['grid', 'Four panels'], ['single', 'One panel']] },
    { key: 'levels', label: 'Inks per panel', type: 'range', min: 3, max: 4, step: 1, default: 4 },
    { key: 'dots', label: 'Ben-Day dots', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'dotSize', label: 'Dot size', type: 'range', min: 4, max: 20, step: 1, default: 9 },
    { key: 'outline', label: 'Outline', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -30, max: 80, step: 1, default: 30 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    if (!cache.mag) cache.mag = sobel(boxBlur(cache.L, W, H, 2), W, H, 1).mag;
    const L = cache.L, mag = cache.mag, n = p.levels, k = p.contrast / 100;
    const grid = p.layout === 'grid', pw = grid ? W / 2 : W, ph = grid ? H / 2 : H;
    const s = Math.max(3, p.dotSize * W / 1000), dotAmt = p.dots / 100;
    const thr = 0.35 - p.outline / 100 * 0.28;
    paintPixels(ctx, W, H, (x, y, o) => {
      const tx = grid && x >= pw ? 1 : 0, ty = grid && y >= ph ? 1 : 0;
      const set = SETS[(ty * 2 + tx) % 4];
      const sx = Math.min(W - 1, ((x - tx * pw) / pw * W) | 0), sy = Math.min(H - 1, ((y - ty * ph) / ph * H) | 0), i = sy * W + sx;
      let c;
      if (p.outline > 0 && mag[i] > thr) c = set[0];
      else {
        const v = contrast(L[i], k) * n, b = Math.min(n - 1, v | 0), f = v - b;
        // inks: dark, mid ... light (levels 3 skips the second mid ink)
        const ink = (j) => set[n === 3 ? [0, 2, 3][j] : j];
        // Ben-Day: inside a band the next ink shows through as dots that grow towards the next band
        const dx = (x % s) - s / 2, dy = ((y + (((x / s) | 0) % 2) * s / 2) % s) - s / 2;
        const inDot = dx * dx + dy * dy < (f * s * 0.72) * (f * s * 0.72);
        c = ink(inDot && dotAmt > 0.01 && b < n - 1 && f > 1 - dotAmt ? b + 1 : b);
        if (dotAmt > 0.01 && b < n - 1 && inDot && f <= 1 - dotAmt) c = ink(b);
      }
      o[0] = c[0]; o[1] = c[1]; o[2] = c[2];
    });
    if (grid) {
      ctx.fillStyle = '#16141a';
      const w = Math.max(3, W * 0.008);
      ctx.fillRect(W / 2 - w / 2, 0, w, H); ctx.fillRect(0, H / 2 - w / 2, W, w);
    }
  },
});
