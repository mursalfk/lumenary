// src/engine/styles/gold-foil.js
import { still, vnoise, boxBlur, smoothstep, clamp, hexToRgb, hash2 } from '../utils.js';
import { pixels, stretchedL, slopes } from '../helpers.js';

const FOILS = {
  gold: [[0, [78, 44, 10]], [0.3, [196, 134, 42]], [0.5, [255, 230, 148]], [0.7, [206, 144, 52]], [1, [96, 56, 14]]],
  silver: [[0, [40, 44, 52]], [0.3, [150, 158, 170]], [0.5, [250, 252, 255]], [0.7, [156, 164, 176]], [1, [50, 54, 62]]],
  rose: [[0, [84, 36, 34]], [0.3, [196, 112, 100]], [0.5, [255, 214, 200]], [0.7, [200, 118, 106]], [1, [96, 44, 40]]],
};
const BASES = { wine: '#3a0f1c', ink: '#0d1220', cream: '#eee6d6' };

function envAt(stops, t, out) {
  t = clamp(t);
  let i = 0; while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
  const [t0, a] = stops[i], [t1, b] = stops[i + 1], k = (t - t0) / (t1 - t0);
  out[0] = a[0] + (b[0] - a[0]) * k; out[1] = a[1] + (b[1] - a[1]) * k; out[2] = a[2] + (b[2] - a[2]) * k;
}

export default still({
  id: 'gold-foil',
  name: 'Gold Foil',
  blurb: 'Metal foil stamped onto card where your picture is bright, crumpled into a thousand tiny mirrors.',
  maxSide: 1000,
  params: [
    { key: 'foil', label: 'Foil', type: 'select', default: 'gold', options: [['gold', 'Gold'], ['silver', 'Silver'], ['rose', 'Rose gold']] },
    { key: 'base', label: 'Card', type: 'select', default: 'wine', options: [['wine', 'Wine red'], ['ink', 'Midnight'], ['cream', 'Cream']] },
    { key: 'cover', label: 'Foil coverage', type: 'range', min: 10, max: 90, step: 1, default: 55 },
    { key: 'crumple', label: 'Crumple', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'facet', label: 'Facet size', type: 'range', min: 3, max: 20, step: 1, default: 8 },
    { key: 'invert', label: 'Foil on the dark parts', type: 'toggle', default: false },
    { key: 'seed', label: 'Re-crumple', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const N = W * H, sc = W / 800, Lb = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(2 * sc))), s = p.facet * sc * 3.4, cr = p.crumple / 100;
    const stops = FOILS[p.foil] || FOILS.gold, base = hexToRgb(BASES[p.base] || BASES.wine), t = 1 - p.cover / 100, e = [0, 0, 0];
    const seed = p.seed * 17 + 3, S = s / 3.4 / sc; // S is the facet size slider, 3 to 20
    // crumple: ridged noise at three scales gives sharp creases between smooth panels
    const hc = new Float32Array(N), ridged = (x, y, f, sd) => 1 - Math.abs(2 * vnoise(x * f, y * f, sd) - 1);
    const f0 = (S * 1.5) / W;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const wx = (vnoise(x * f0 * 0.5, y * f0 * 0.5, seed + 1) - 0.5) * 1.2 / f0, wy = (vnoise(x * f0 * 0.5 + 7, y * f0 * 0.5, seed + 2) - 0.5) * 1.2 / f0;
      hc[y * W + x] = ridged(x + wx, y + wy, f0, seed) * 0.6 + ridged(x - wy, y + wx, f0 * 2.3, seed + 3) * 0.3 + ridged(x, y, f0 * 5.1, seed + 4) * 0.1;
    }
    const { sx, sy } = slopes(hc, W, H, (0.7 * cr) / f0);
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, Lv = p.invert ? 1 - Lb[i] : Lb[i];
      // foil sticks where the picture is bright, with a ragged edge like a real stamp
      const rag = (vnoise(x * 0.22 / sc, y * 0.22 / sc, seed) - 0.5) * 0.1, cov = smoothstep(t - 0.05, t + 0.05, Lv + rag);
      let R, G, B;
      const g = 1 + (hash2(x, y, 5) - 0.5) * 0.08; R = base[0] * g; G = base[1] * g; B = base[2] * g;
      if (cov > 0) {
        let nx = sx[i], ny = sy[i]; const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= nl; ny *= nl;
        envAt(stops, 0.5 + ny * 1.25 + nx * 0.55 + (Lv - 0.5) * 0.28, e);
        const k = 0.8 + 0.2 * Lv;
        R = R * (1 - cov) + e[0] * k * cov; G = G * (1 - cov) + e[1] * k * cov; B = B * (1 - cov) + e[2] * k * cov;
        const rim = cov > 0.05 && cov < 0.7 ? 0.35 : 0; R += rim * 90; G += rim * 80; B += rim * 50;
      }
      o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
