// src/engine/styles/chrome.js
import { still, boxBlur, sobel, clamp } from '../utils.js';
import { pixels, paintPixels } from '../helpers.js';

// Environment seen in the mirror, top of the sky (0) to bottom of the ground (1). The horizon is a hard step.
const ENVS = {
  silver: [[0, [8, 9, 14]], [0.26, [92, 98, 114]], [0.44, [222, 228, 240]], [0.495, [255, 255, 255]], [0.505, [22, 22, 26]], [0.62, [68, 66, 64]], [0.82, [150, 152, 158]], [1, [232, 234, 240]]],
  gold: [[0, [28, 14, 4]], [0.26, [130, 82, 24]], [0.44, [250, 214, 130]], [0.495, [255, 246, 214]], [0.505, [44, 24, 6]], [0.62, [112, 72, 24]], [0.82, [214, 160, 66]], [1, [250, 214, 120]]],
  cobalt: [[0, [4, 8, 30]], [0.26, [22, 50, 150]], [0.44, [120, 180, 255]], [0.495, [236, 246, 255]], [0.505, [8, 12, 34]], [0.62, [30, 40, 90]], [0.82, [80, 120, 210]], [1, [170, 205, 255]]],
};

function envAt(stops, t, out) {
  t = clamp(t);
  let i = 0; while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
  const [t0, a] = stops[i], [t1, b] = stops[i + 1], k = clamp((t - t0) / (t1 - t0 || 1));
  out[0] = a[0] + (b[0] - a[0]) * k; out[1] = a[1] + (b[1] - a[1]) * k; out[2] = a[2] + (b[2] - a[2]) * k;
}

export default still({
  id: 'chrome',
  name: 'Chrome',
  blurb: 'Your picture cast in liquid metal: bright parts rise, and the surface mirrors a sky and a horizon.',
  maxSide: 1000,
  params: [
    { key: 'metal', label: 'Metal', type: 'select', default: 'silver', options: [['silver', 'Chrome'], ['gold', 'Gold'], ['cobalt', 'Cobalt']] },
    { key: 'smooth', label: 'Smoothness', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'depth', label: 'Relief', type: 'range', min: 5, max: 100, step: 1, default: 55 },
    { key: 'horizon', label: 'Horizon', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'gleam', label: 'Sharp gleam', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, r1 = Math.max(1, Math.round((2 + p.smooth / 100 * 14) * sc)), r2 = Math.max(1, Math.round(r1 / 3));
    const a = boxBlur(boxBlur(cache.L, W, H, r1), W, H, r1), b = boxBlur(cache.L, W, H, r2), h = new Float32Array(W * H);
    for (let i = 0; i < h.length; i++) h[i] = a[i] * 0.82 + b[i] * 0.18;
    const { gx, gy } = sobel(h, W, H, 1), k = (0.5 + (p.depth / 100) * 6) * (W / 500), stops = ENVS[p.metal] || ENVS.silver, e = [0, 0, 0];
    const t0 = 0.12 + (p.horizon / 100) * 0.42, lx = -0.42, ly = -0.52, lz = 0.74;
    paintPixels(ctx, W, H, (x, y, o) => {
      const i = y * W + x;
      let nx = -gx[i] * k, ny = -gy[i] * k, nz = 1;
      const inv = 1 / Math.hypot(nx, ny, nz); nx *= inv; ny *= inv; nz *= inv;
      // mirror direction for a viewer looking straight down
      const rx = 2 * nz * nx, ry = 2 * nz * ny;
      envAt(stops, t0 + ry * 0.4 + rx * 0.08 + h[i] * 0.08, e);
      let R = e[0], G = e[1], B = e[2];
      if (p.gleam) {
        const hx = lx, hy = ly, hz = lz + 1, hl = Math.hypot(hx, hy, hz), spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), 90);
        R += spec * 255; G += spec * 255; B += spec * 255;
      }
      o[0] = R; o[1] = G; o[2] = B;
    });
  },
});
