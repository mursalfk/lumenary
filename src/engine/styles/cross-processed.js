// src/engine/styles/cross-processed.js
import { still, clamp, lerp, rng, rgb2hsl, hsl2rgb } from '../utils.js';
import { addGrain, vignette } from '../helpers.js';

// Per-channel tone curves as [input, output] knots, joined by a smooth Catmull-Rom spline.
const LOOKS = {
  slide: { name: 'Slide film in colour chemistry', R: [[0, 0], [0.25, 0.11], [0.5, 0.56], [0.75, 0.93], [1, 1]], G: [[0, 0.03], [0.25, 0.3], [0.5, 0.6], [0.75, 0.86], [1, 0.99]], B: [[0, 0.17], [0.25, 0.37], [0.5, 0.5], [0.75, 0.6], [1, 0.74]] },
  negative: { name: 'Negative film in slide chemistry', R: [[0, 0.08], [0.25, 0.3], [0.5, 0.54], [0.75, 0.74], [1, 0.93]], G: [[0, 0], [0.25, 0.12], [0.5, 0.42], [0.75, 0.82], [1, 1]], B: [[0, 0.06], [0.25, 0.3], [0.5, 0.62], [0.75, 0.84], [1, 0.96]] },
  teal: { name: 'Teal and amber', R: [[0, 0.02], [0.25, 0.16], [0.5, 0.5], [0.75, 0.86], [1, 1]], G: [[0, 0.06], [0.25, 0.28], [0.5, 0.52], [0.75, 0.74], [1, 0.9]], B: [[0, 0.16], [0.25, 0.38], [0.5, 0.48], [0.75, 0.52], [1, 0.62]] },
};

function makeLut(pts) {
  const lut = new Float32Array(256), n = pts.length;
  const P = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  for (let v = 0; v < 256; v++) {
    const x = v / 255; let i = 0; while (i < n - 2 && x > pts[i + 1][0]) i++;
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), t = (x - p1[0]) / (p2[0] - p1[0] || 1), t2 = t * t, t3 = t2 * t;
    const y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
    lut[v] = clamp(y);
  }
  return lut;
}

export default still({
  id: 'cross-processed',
  name: 'Cross-Processed',
  blurb: 'Film developed in the wrong chemistry: each colour channel follows its own curve, so shadows turn one hue, highlights another and contrast jumps.',
  maxSide: 1100,
  params: [
    { key: 'look', label: 'Process', type: 'select', default: 'slide', options: Object.entries(LOOKS).map(([k, v]) => [k, v.name]) },
    { key: 'amount', label: 'Strength', type: 'range', min: 0, max: 100, step: 1, default: 85 },
    { key: 'sat', label: 'Saturation', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'fade', label: 'Faded blacks', type: 'range', min: 0, max: 100, step: 1, default: 15 },
    { key: 'vig', label: 'Dark corners', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 25 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    ctx.drawImage(work, 0, 0, W, H);
    const lk = LOOKS[p.look] || LOOKS.slide;
    if (cache.look !== p.look) { cache.lut = [makeLut(lk.R), makeLut(lk.G), makeLut(lk.B)]; cache.look = p.look; }
    const [lr, lg, lb] = cache.lut, a = p.amount / 100, sa = 0.7 + (p.sat / 100) * 0.9, fade = (p.fade / 100) * 0.1;
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2];
      let R = lerp(r0 / 255, lr[r0], a), G = lerp(g0 / 255, lg[g0], a), B = lerp(b0 / 255, lb[b0], a);
      const l = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      R = l + (R - l) * sa; G = l + (G - l) * sa; B = l + (B - l) * sa;
      d[i] = (fade + (1 - fade) * clamp(R)) * 255; d[i + 1] = (fade + (1 - fade) * clamp(G)) * 255; d[i + 2] = (fade + (1 - fade) * clamp(B)) * 255;
    }
    ctx.putImageData(img, 0, 0);
    vignette(ctx, W, H, (p.vig / 100) * 0.7, '10,6,22');
    addGrain(ctx, W, H, (p.grain / 100) * 0.8, 23);
  },
});
