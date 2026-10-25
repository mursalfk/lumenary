// src/engine/styles/charcoal-sketch.js
import { still, vnoise, boxBlur, smoothstep, clamp, hash2, sobel, hexToRgb } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const PAPERS = { white: [240, 238, 232], cream: [234, 226, 207], grey: [190, 188, 182] };
const MEDIA = { charcoal: [26, 25, 27], conte: [72, 36, 22], sanguine: [128, 52, 36], graphite: [58, 62, 70] };

export default still({
  id: 'charcoal-sketch',
  name: 'Charcoal Sketch',
  blurb: 'A quick study in charcoal: dark tones catch on the tooth of the paper, thumbs smudge them, and the outlines are drawn twice.',
  maxSide: 1100,
  params: [
    { key: 'pressure', label: 'Pressure', type: 'range', min: 20, max: 100, step: 1, default: 65 },
    { key: 'smudge', label: 'Smudging', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'lines', label: 'Sketchy outlines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'medium', label: 'Medium', type: 'select', default: 'charcoal', options: [['charcoal', 'Charcoal'], ['conte', 'Conté brown'], ['sanguine', 'Sanguine red'], ['graphite', 'Graphite']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['white', 'White'], ['cream', 'Cream'], ['grey', 'Grey sugar paper']] },
    { key: 'seed', label: 'Redraw', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const N = W * H, sc = W / 800, seed = p.seed * 5 + 1;
    if (cache.key !== W) {
      const L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(1.5 * sc)));
      cache.L = L; cache.sm = boxBlur(boxBlur(L, W, H, Math.max(2, Math.round(7 * sc))), W, H, Math.max(2, Math.round(7 * sc)));
      cache.edge = sobel(boxBlur(L, W, H, Math.max(1, Math.round(2 * sc))), W, H, 1).mag; cache.key = W;
    }
    const { L, sm, edge } = cache, paper = PAPERS[p.paper] || PAPERS.cream, ink = MEDIA[p.medium] || MEDIA.charcoal;
    const press = 0.55 + (p.pressure / 100) * 0.95, smu = p.smudge / 100, sk = p.lines / 100, amp = (2 + sk * 10) * sc;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, dark = 1 - L[i];
      const tooth = 0.55 * vnoise(x * 0.4 / sc, y * 0.4 / sc, seed) + 0.45 * hash2(x, y, seed + 2);
      const u = (x + y) * 0.7071, v = (x - y) * 0.7071, streak = vnoise(u * 0.025 / sc, v * 0.45 / sc, seed + 4);
      let amt = clamp(dark * press * (0.78 + 0.44 * streak)) * (1 - 0.75 * smoothstep(0.72, 0.95, L[i]) * (0.4 + 0.6 * streak));
      const cov = smoothstep(tooth * 0.6 - 0.25, tooth * 0.6 + 0.35, amt), soft = Math.pow(amt, 1.15) * (0.82 + 0.18 * streak);
      let line = 0;
      if (sk > 0) {
        for (let k = 0; k < 3; k++) {
          const dx = Math.round((vnoise(x * 0.012 / sc + k * 13, y * 0.012 / sc, seed + k) - 0.5) * 2 * amp), dy = Math.round((vnoise(x * 0.012 / sc + 7, y * 0.012 / sc + k * 11, seed + k + 9) - 0.5) * 2 * amp);
          const e = edge[Math.min(H - 1, Math.max(0, y + dy)) * W + Math.min(W - 1, Math.max(0, x + dx))];
          line = Math.max(line, smoothstep(0.045, 0.16, e) * (0.55 + 0.45 * hash2(x >> 2, y >> 2, k)));
        }
        line *= 0.55 + 0.45 * sk;
      }
      const wash = smu * (1 - sm[i]) * 0.5 * (0.7 + 0.3 * streak);
      let a = Math.max((0.42 * soft + 0.52 * cov) * (0.9 + 0.1 * tooth), line * (0.55 + 0.4 * tooth));
      const pw = 1 - wash * 0.55;
      for (let c = 0; c < 3; c++) {
        const base = paper[c] * pw;
        o4[o + c] = base * (1 - a) + ink[c] * a;
      }
      o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
