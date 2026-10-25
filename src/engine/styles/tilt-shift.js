// src/engine/styles/tilt-shift.js
import { still, clamp, smoothstep } from '../utils.js';
import { pixels, blurRGB } from '../helpers.js';

const RADII = [0, 1.6, 3.6, 7, 12];

export default still({
  id: 'tilt-shift',
  name: 'Tilt-Shift',
  blurb: 'A thin band of sharpness with blur everywhere else, boosted colour and contrast: the world turns into a very small model of itself.',
  maxSide: 1000,
  params: [
    { key: 'focus', label: 'Where the sharp band sits', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'width', label: 'Width of the band', type: 'range', min: 4, max: 60, step: 1, default: 18 },
    { key: 'blur', label: 'Blur strength', type: 'range', min: 10, max: 100, step: 1, default: 60 },
    { key: 'angle', label: 'Tilt the band', type: 'range', min: -45, max: 45, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'shape', label: 'Shape', type: 'select', default: 'line', options: [['line', 'Band'], ['radial', 'Round spot']] },
    { key: 'sat', label: 'Colour boost', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: 0, max: 100, step: 1, default: 35 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, N = W * H;
    const key = p.blur + '|' + W;
    if (cache.key !== key) {
      const k = 0.35 + (p.blur / 100) * 1.1;
      cache.lv = RADII.map((r, i) => (i === 0 ? null : blurRGB(d, W, H, Math.max(1, Math.round(r * k * sc)), 2)));
      cache.key = key;
    }
    const lv = cache.lv, last = RADII.length - 1, a = (p.angle * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a), cx = W / 2, cy = H * (p.focus / 100);
    const half = (p.width / 100) * H * 0.5, fall = H * 0.38, sa = 1 + (p.sat / 100) * 0.85, ct = 1 + (p.contrast / 100) * 0.45;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      const dist = p.shape === 'radial' ? Math.hypot((x - cx) * 1.15, (y - cy)) : Math.abs((x - cx) * nx + (y - cy) * ny);
      const t = smoothstep(half, half + fall, dist) * last, f = Math.min(last - 1e-6, t) | 0, fr = t - f;
      let R, G, B;
      if (f === 0) { R = d[o] * (1 - fr) + lv[1][0][i] * fr; G = d[o + 1] * (1 - fr) + lv[1][1][i] * fr; B = d[o + 2] * (1 - fr) + lv[1][2][i] * fr; }
      else { R = lv[f][0][i] * (1 - fr) + lv[f + 1][0][i] * fr; G = lv[f][1][i] * (1 - fr) + lv[f + 1][1][i] * fr; B = lv[f][2][i] * (1 - fr) + lv[f + 1][2][i] * fr; }
      const l = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      R = l + (R - l) * sa; G = l + (G - l) * sa; B = l + (B - l) * sa;
      o4[o] = clamp((R / 255 - 0.5) * ct + 0.5) * 255; o4[o + 1] = clamp((G / 255 - 0.5) * ct + 0.5) * 255; o4[o + 2] = clamp((B / 255 - 0.5) * ct + 0.5) * 255; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
