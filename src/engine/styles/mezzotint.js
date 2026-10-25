// src/engine/styles/mezzotint.js
import { still, hash2, vnoise, boxBlur, hexToRgb, smoothstep } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const INKS = { black: '#15120e', sepia: '#3a2112', blue: '#14203a' };

export default still({
  id: 'mezzotint',
  name: 'Mezzotint',
  blurb: 'A copper plate roughened all over so it prints velvet black, then burnished smooth wherever the picture is light.',
  maxSide: 1100,
  params: [
    { key: 'grain', label: 'Grain size', type: 'range', min: 1, max: 4, step: 1, default: 1 },
    { key: 'burnish', label: 'Burnishing', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'black', options: [['black', 'Black'], ['sepia', 'Sepia'], ['blue', 'Blue-black']] },
    { key: 'plate', label: 'Plate mark', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(sc))), g = Math.max(1, Math.round(p.grain * sc)), b = p.burnish / 100;
    const ink = hexToRgb(INKS[p.ink] || INKS.black), paper = [239, 232, 215], m = p.plate ? Math.round(Math.min(W, H) * 0.06) : 0;
    const out = ctx.createImageData(W, H), d = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = (y * W + x) * 4;
      let R = paper[0], G = paper[1], B = paper[2];
      const inside = x >= m && x < W - m && y >= m && y < H - m;
      const fibre = 1 + (hash2(x >> 1, y, 8) - 0.5) * 0.04;
      if (inside) {
        // a rocked plate holds ink in a random pit pattern: compare the darkness with a noise value pixel by pixel
        const dark = Math.pow(1 - L[Math.min(H - 1, Math.max(0, y)) * W + x], 0.8 + 0.5 * b);
        const n = 0.62 * hash2((x / g) | 0, (y / g) | 0, 5) + 0.38 * vnoise(x / g / 1.7, y / g / 1.7, 4);
        const t = 0.5 + (n - 0.5) * (1.1 - b * 0.3), a = smoothstep(t - 0.1, t + 0.1, dark * 1.08);
        const k = a * 0.97;
        R = paper[0] * (1 - k) + ink[0] * k; G = paper[1] * (1 - k) + ink[1] * k; B = paper[2] * (1 - k) + ink[2] * k;
      }
      if (m) {
        // plate mark: a bevel where the copper edge pressed into the paper
        const dx = Math.min(x - m, W - 1 - m - x), dy = Math.min(y - m, H - 1 - m - y), e = Math.min(dx, dy);
        if (e > -7 * sc && e < 4 * sc) {
          const side = (x - m < 0 || y - m < 0) ? 1 : -1, k = (1 - Math.abs(e) / (6 * sc)) * 0.22;
          if (k > 0) { const s = e < 0 ? side * -1 : side; R *= 1 + s * k * 0.5; G *= 1 + s * k * 0.5; B *= 1 + s * k * 0.5; }
        }
      }
      d[o] = R * fibre; d[o + 1] = G * fibre; d[o + 2] = B * fibre; d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
