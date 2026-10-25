// src/engine/styles/mondrian.js
import { still, rng } from '../utils.js';
import { pixels, blurredL } from '../helpers.js';

const PRIMARY = { red: '#d4231f', blue: '#1f4fa8', yellow: '#f3c613' };

export default still({
  id: 'mondrian',
  name: 'Mondrian',
  blurb: 'De Stijl: black grid lines that follow your edges, with primary colour blocks in the busiest cells.',
  maxSide: 1000,
  params: [
    { key: 'cells', label: 'Divisions', type: 'range', min: 4, max: 24, step: 1, default: 12 },
    { key: 'color', label: 'Colour blocks', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'line', label: 'Line weight', type: 'range', min: 1, max: 14, step: 1, default: 6 },
    { key: 'seed', label: 'Reshuffle', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, r = rng(p.seed * 17 + 3), lw = Math.max(2, p.line * Math.min(W, H) / 400);
    // summed-area tables of brightness and its square give the variance of any rectangle in O(1)
    const sat = new Float64Array((W + 1) * (H + 1)), sat2 = new Float64Array((W + 1) * (H + 1));
    for (let y = 0; y < H; y++) { let row = 0, row2 = 0; for (let x = 0; x < W; x++) { const v = L[y * W + x]; row += v; row2 += v * v; sat[(y + 1) * (W + 1) + x + 1] = sat[y * (W + 1) + x + 1] + row; sat2[(y + 1) * (W + 1) + x + 1] = sat2[y * (W + 1) + x + 1] + row2; } }
    const sum = (a, x0, y0, x1, y1) => a[y1 * (W + 1) + x1] - a[y0 * (W + 1) + x1] - a[y1 * (W + 1) + x0] + a[y0 * (W + 1) + x0];
    const stats = (x0, y0, x1, y1) => { const n = (x1 - x0) * (y1 - y0), m = sum(sat, x0, y0, x1, y1) / n; return { m, v: sum(sat2, x0, y0, x1, y1) / n - m * m, n }; };
    // split the busiest rectangle at the column or row where the brightness changes most
    let rects = [{ x0: 0, y0: 0, x1: W, y1: H }];
    const minSide = Math.round(Math.min(W, H) * 0.05);   // whole pixels: the summed-area table is indexed by them
    for (let k = 1; k < p.cells; k++) {
      let best = -1, bi = -1;
      rects.forEach((q, i) => { if (q.x1 - q.x0 < minSide * 2 || q.y1 - q.y0 < minSide * 2) return; const s = stats(q.x0, q.y0, q.x1, q.y1), sc = s.v * Math.sqrt(s.n) * (0.85 + r() * 0.3); if (sc > best) { best = sc; bi = i; } });
      if (bi < 0) break;
      const q = rects[bi], vertical = q.x1 - q.x0 >= q.y1 - q.y0;
      let cut = -1, gain = -1;
      const lo = vertical ? q.x0 + minSide : q.y0 + minSide, hi = vertical ? q.x1 - minSide : q.y1 - minSide, st = Math.max(2, ((hi - lo) / 40) | 0);
      for (let c = lo; c <= hi; c += st) {   // lo and hi are whole numbers, so c is too
        const a = vertical ? stats(q.x0, q.y0, c, q.y1) : stats(q.x0, q.y0, q.x1, c), b = vertical ? stats(c, q.y0, q.x1, q.y1) : stats(q.x0, c, q.x1, q.y1);
        const g = Math.abs(a.m - b.m) * Math.sqrt(Math.min(a.n, b.n)) * (0.9 + r() * 0.2);
        if (g > gain) { gain = g; cut = c; }
      }
      if (cut < 0) break;
      rects.splice(bi, 1, vertical ? { ...q, x1: cut } : { ...q, y1: cut }, vertical ? { ...q, x0: cut } : { ...q, y0: cut });
    }
    ctx.fillStyle = '#f4f1e8'; ctx.fillRect(0, 0, W, H);
    // colour the cells with the most contrast to their surroundings: darkest red, lightest blue/yellow, rest stay white or black
    const info = rects.map((q) => ({ q, ...stats(q.x0, q.y0, q.x1, q.y1) }));
    const ranked = [...info].sort((a, b) => a.m - b.m);
    const nCol = Math.round(info.length * p.color / 100 * 0.45);
    const fill = new Map();
    const picks = [];
    for (let i = 0; i < nCol; i++) picks.push(i % 3 === 0 ? ranked[i] : i % 3 === 1 ? ranked[ranked.length - 1 - (i - 1) / 3 * 1 | 0] : ranked[(ranked.length / 2 + i) | 0]);
    const palette = [PRIMARY.red, PRIMARY.yellow, PRIMARY.blue];
    picks.forEach((c, i) => { if (c) fill.set(c, palette[(i + ((r() * 3) | 0)) % 3]); });
    // a couple of dark cells in solid black, as Mondrian sometimes did
    ranked.slice(0, Math.max(1, (info.length * 0.08) | 0)).forEach((c) => { if (!fill.has(c)) fill.set(c, '#151515'); });
    info.forEach((c) => { ctx.fillStyle = fill.get(c) || '#f4f1e8'; ctx.fillRect(c.q.x0, c.q.y0, c.q.x1 - c.q.x0, c.q.y1 - c.q.y0); });
    // lines, never on the outer border
    ctx.fillStyle = '#151515';
    info.forEach(({ q }) => {
      if (q.x0 > 0) ctx.fillRect(q.x0 - lw / 2, q.y0, lw, q.y1 - q.y0);
      if (q.y0 > 0) ctx.fillRect(q.x0, q.y0 - lw / 2, q.x1 - q.x0, lw);
    });
  },
});
