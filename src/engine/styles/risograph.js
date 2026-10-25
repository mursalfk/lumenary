// src/engine/styles/risograph.js
import { still, hash2, vnoise, boxBlur, hexToRgb, clamp, smoothstep } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const PAIRS = {
  'blue-pink': ['#2748b4', '#ff5fa2'],
  'teal-orange': ['#008c9a', '#ff7a2f'],
  'green-red': ['#1f9a56', '#e63946'],
  'purple-yellow': ['#5a3dae', '#ffd23f'],
  'black-red': ['#1b1b1f', '#ff4b3e'],
};
const PAPERS = { cream: [243, 236, 220], white: [250, 249, 245], grey: [226, 226, 222] };

export default still({
  id: 'risograph',
  name: 'Risograph',
  blurb: 'Two spot-colour inks printed one after the other, slightly off register, with the grainy fill of a stencil duplicator.',
  maxSide: 1100,
  params: [
    { key: 'pair', label: 'Inks', type: 'select', default: 'blue-pink', options: [['blue-pink', 'Blue and pink'], ['teal-orange', 'Teal and orange'], ['green-red', 'Green and red'], ['purple-yellow', 'Purple and yellow'], ['black-red', 'Black and red']] },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'miss', label: 'Misregistration', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'density', label: 'Ink density', type: 'range', min: 40, max: 130, step: 1, default: 90 },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['white', 'White'], ['grey', 'Recycled grey']] },
    { key: 'seed', label: 'Reprint', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(sc))), seed = p.seed * 7 + 1;
    const [i1, i2] = (PAIRS[p.pair] || PAIRS['blue-pink']).map(hexToRgb), paper = PAPERS[p.paper] || PAPERS.cream;
    const G = 0.25 + (p.grain / 100) * 1.3, dens = p.density / 100, mx = (p.miss / 100) * 7 * sc, my = (p.miss / 100) * -4.5 * sc;
    const out = ctx.createImageData(W, H), d = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      // plate one prints the shadows; plate two prints almost everything and is shifted a few pixels
      const x2 = Math.min(W - 1, Math.max(0, Math.round(x + mx))), y2 = Math.min(H - 1, Math.max(0, Math.round(y + my)));
      const a1 = Math.pow(1 - L[i], 1.35), a2 = Math.pow(1 - L[y2 * W + x2], 0.75) * 0.92;
      // a stencil duplicator lays ink as a random grain, with big patches thicker or thinner
      const th1 = 0.5 + (0.55 * hash2(x, y, seed) + 0.45 * vnoise(x * 0.7 / sc, y * 0.7 / sc, seed + 1) - 0.5) * G;
      const th2 = 0.5 + (0.55 * hash2(x, y, seed + 9) + 0.45 * vnoise(x * 0.7 / sc + 40, y * 0.7 / sc, seed + 2) - 0.5) * G;
      const pat = 0.9 + 0.1 * vnoise(x * 0.01 / sc, y * 0.01 / sc, seed + 3) + (hash2(x, y, 4) - 0.5) * 0.06;
      const c1 = smoothstep(th1 - 0.09, th1 + 0.09, a1) * dens * pat, c2 = smoothstep(th2 - 0.09, th2 + 0.09, a2) * dens * pat;
      const fibre = 1 + (hash2(x >> 1, y, 8) - 0.5) * 0.05;
      for (let c = 0; c < 3; c++) {
        const k1 = 1 - Math.min(1, c1) * (1 - i1[c] / 255), k2 = 1 - Math.min(1, c2) * (1 - i2[c] / 255);
        d[o + c] = paper[c] * k1 * k2 * fibre;
      }
      d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
