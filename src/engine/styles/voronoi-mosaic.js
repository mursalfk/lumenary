// src/engine/styles/voronoi-mosaic.js
import { still, rng, clamp, lerp, boxBlur, sobel, smoothstep } from '../utils.js';
import { pixels, stretchedL, voronoiLabels } from '../helpers.js';

export default still({
  id: 'voronoi-mosaic',
  name: 'Voronoi Mosaic',
  blurb: 'Scatter points, give every pixel to its nearest one, and paint each cell its average colour. More points gather where the picture has detail.',
  maxSide: 900,
  params: [
    { key: 'cells', label: 'Cells', type: 'range', min: 60, max: 3000, step: 10, default: 700 },
    { key: 'detail', label: 'Gather in detail', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'relax', label: 'Even out the cells', type: 'range', min: 0, max: 3, step: 1, default: 1 },
    { key: 'edge', label: 'Cell borders', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'bevel', label: 'Faceting', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'seed', label: 'Scatter again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800, r = rng(p.seed * 37 + 9), n = p.cells;
    const key = [n, p.detail, p.relax, p.seed, W].join('|');
    if (cache.key !== key) {
      const L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(1.5 * sc))), e = sobel(L, W, H, 1).mag, imp = new Float32Array(N), det = p.detail / 100;
      let mx = 1e-6; for (let i = 0; i < N; i++) if (e[i] > mx) mx = e[i];
      for (let i = 0; i < N; i++) imp[i] = lerp(1, 0.06 + 0.94 * Math.min(1, (e[i] / mx) * 2.2), det);
      let sx = new Float32Array(n), sy = new Float32Array(n);
      for (let i = 0, tries = 0; i < n && tries < n * 80; tries++) { const x = r() * W, y = r() * H; if (r() < imp[(y | 0) * W + (x | 0)]) { sx[i] = x; sy[i] = y; i++; } else if (tries > n * 70) { sx[i] = x; sy[i] = y; i++; } }
      let lab = voronoiLabels(sx, sy, W, H);
      for (let it = 0; it < p.relax; it++) {
        const ax = new Float64Array(n), ay = new Float64Array(n), aw = new Float64Array(n);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, l = lab[i], w = imp[i] * imp[i] + 0.002; ax[l] += x * w; ay[l] += y * w; aw[l] += w; }
        for (let l = 0; l < n; l++) if (aw[l] > 0) { sx[l] = ax[l] / aw[l]; sy[l] = ay[l] / aw[l]; }
        lab = voronoiLabels(sx, sy, W, H);
      }
      const sr = new Float64Array(n), sg = new Float64Array(n), sb = new Float64Array(n), cnt = new Float64Array(n);
      for (let i = 0; i < N; i++) { const l = lab[i]; sr[l] += d[i * 4]; sg[l] += d[i * 4 + 1]; sb[l] += d[i * 4 + 2]; cnt[l]++; }
      cache.lab = lab; cache.sx = sx; cache.sy = sy; cache.cnt = cnt; cache.col = [sr, sg, sb]; cache.key = key;
    }
    const { lab, sx, sy, cnt, col } = cache, edge = p.edge / 100, bevel = p.bevel / 100;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, l = lab[i], c = cnt[l] || 1;
      let R = col[0][l] / c, G = col[1][l] / c, B = col[2][l] / c, k = 1;
      if (bevel > 0) { const rad = Math.sqrt(c / Math.PI), dd = Math.hypot(x - sx[l], y - sy[l]) / (rad * 1.2 + 1), dx = x - sx[l], dy = y - sy[l]; k = 1 + bevel * (0.2 * (1 - dd) - 0.3 * dd * dd + 0.0004 * (-dx - dy) / (rad + 1) * 60); }
      if (edge > 0 && ((x + 1 < W && lab[i + 1] !== l) || (y + 1 < H && lab[i + W] !== l))) k *= 1 - 0.55 * edge;
      o4[o] = R * k; o4[o + 1] = G * k; o4[o + 2] = B * k; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
