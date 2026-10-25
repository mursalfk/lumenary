// src/engine/styles/cyanotype.js
import { still, vnoise, hash2, boxBlur, clamp, smoothstep } from '../utils.js';
import { pixels, stretchedL, ramp, contrast } from '../helpers.js';

const TONES = {
  classic: [[4, 18, 52], [14, 58, 118], [58, 124, 178], [166, 206, 226], [240, 247, 248]],
  tea: [[38, 24, 18], [92, 64, 46], [160, 124, 94], [214, 192, 164], [246, 240, 228]],
  green: [[6, 34, 38], [16, 84, 82], [76, 142, 124], [180, 212, 190], [243, 247, 238]],
};

export default still({
  id: 'cyanotype',
  name: 'Cyanotype',
  blurb: 'A sun print on hand-coated paper: Prussian blue where the light struck, bare paper where it did not, with a brushed edge.',
  maxSide: 1100,
  params: [
    { key: 'tone', label: 'Chemistry', type: 'select', default: 'classic', options: [['classic', 'Prussian blue'], ['tea', 'Tea toned'], ['green', 'Green toned']] },
    { key: 'exposure', label: 'Exposure', type: 'range', min: -40, max: 40, step: 1, default: 0 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -30, max: 80, step: 1, default: 20 },
    { key: 'uneven', label: 'Uneven coating', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'brush', label: 'Brushed edge', type: 'toggle', default: true },
    { key: 'seed', label: 'Recoat', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(sc))), stops = TONES[p.tone] || TONES.classic, seed = p.seed * 9 + 1;
    const ex = p.exposure / 100, ct = p.contrast / 100, un = p.uneven / 100, margin = p.brush ? Math.min(W, H) * 0.055 : -1, col = [0, 0, 0];
    const out = ctx.createImageData(W, H), d = out.data, paper = [247, 243, 232];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      // the chemistry never coats evenly: slow patches and fine brush streaks change how dark the print gets
      const patch = (vnoise(x * 0.006 / sc, y * 0.006 / sc, seed) - 0.5) * 0.28 * un + (vnoise(x * 0.012 / sc, y * 0.5 / sc, seed + 2) - 0.5) * 0.12 * un;
      let t = clamp(contrast(L[i] + ex * 0.4 + patch, ct)); // 0 is the deepest blue, 1 is bare paper
      ramp(stops, t, col);
      let R = col[0], G = col[1], B = col[2];
      if (margin >= 0) {
        // coating edge: ragged, with bristle streaks, and a darker pooled line where the liquid stopped
        const e = Math.min(x, W - 1 - x, y, H - 1 - y), rag = (vnoise(x * 0.05 / sc, y * 0.05 / sc, seed + 5) - 0.5) * margin * 0.7 + (vnoise(x * 0.4 / sc, y * 0.02 / sc, seed + 6) - 0.5) * margin * 0.3;
        const dd = e - margin + rag, coat = smoothstep(-2 * sc, 2 * sc, dd), pool = (1 - smoothstep(0, 9 * sc, dd)) * coat * 0.22;
        R = (R * (1 - pool * 0.8)) * coat + paper[0] * (1 - coat); G = (G * (1 - pool * 0.8)) * coat + paper[1] * (1 - coat); B = (B * (1 - pool * 0.8)) * coat + paper[2] * (1 - coat);
      }
      const fibre = 1 + (hash2(x >> 1, y, 8) - 0.5) * 0.05 + (vnoise(x * 0.3 / sc, y * 0.3 / sc, 3) - 0.5) * 0.04;
      d[o] = R * fibre; d[o + 1] = G * fibre; d[o + 2] = B * fibre; d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
