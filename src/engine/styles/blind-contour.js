// src/engine/styles/blind-contour.js
import { still, rng, vnoise, boxBlur, sobel, clamp, hexToRgb } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const INKS = { black: '#1b1a1d', blue: '#1d3a8a', red: '#a3231d', green: '#1f5b3f' };
const PAPERS = { white: '#f6f4ee', cream: '#eee6d2' };

export default still({
  id: 'blind-contour',
  name: 'Blind Contour',
  blurb: 'A drawing made without looking at the page: one wandering pen line follows the outlines of the picture and drifts a little off the edge.',
  maxSide: 1000,
  params: [
    { key: 'detail', label: 'How much is drawn', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'drift', label: 'Hand drift', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'weight', label: 'Line weight', type: 'range', min: 1, max: 10, step: 0.5, default: 3, fmt: (v) => v.toFixed(1) },
    { key: 'ink', label: 'Ink', type: 'select', default: 'black', options: [['black', 'Black'], ['blue', 'Blue'], ['red', 'Red'], ['green', 'Green']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['white', 'White'], ['cream', 'Cream']] },
    { key: 'seed', label: 'Draw again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, r = rng(p.seed * 17 + 3), seed = p.seed * 3 + 1;
    ctx.fillStyle = PAPERS[p.paper] || PAPERS.cream; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${r() < 0.5 ? '120,100,70' : '255,255,250'},${0.02 + r() * 0.04})`; ctx.fillRect(r() * W, r() * H, 1 + r() * 4, 1 + r() * 2); }
    if (cache.key !== W) { cache.edge = sobel(boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(2.5 * sc))), W, H, 1).mag; cache.key = W; }
    const E = cache.edge, g = Math.max(3, (6.5 - (p.detail / 100) * 3.2) * sc), thr = 0.1 - (p.detail / 100) * 0.07;
    const pts = [];
    for (let y0 = 0; y0 < H; y0 += g) for (let x0 = 0; x0 < W; x0 += g) {
      let bx = -1, by = 0, be = thr;
      for (let y = y0; y < Math.min(H, y0 + g); y += 2) for (let x = x0; x < Math.min(W, x0 + g); x += 2) { const e = E[y * W + x]; if (e > be) { be = e; bx = x; by = y; } }
      if (bx >= 0) pts.push([bx, by]);
    }
    const n = pts.length, cell = g * 3, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, grid = Array.from({ length: cols * rows }, () => []);
    pts.forEach((q, i) => grid[Math.floor(q[1] / cell) * cols + Math.floor(q[0] / cell)].push(i));
    const used = new Uint8Array(n);
    const take = (i) => { used[i] = 1; };
    const near = (x, y, maxR) => {
      let best = -1, bd = maxR * maxR;
      const cx = Math.floor(x / cell), cy = Math.floor(y / cell), R = Math.ceil(maxR / cell);
      for (let j = Math.max(0, cy - R); j <= Math.min(rows - 1, cy + R); j++) for (let i = Math.max(0, cx - R); i <= Math.min(cols - 1, cx + R); i++) {
        for (const k of grid[j * cols + i]) { if (used[k]) continue; const dd = (pts[k][0] - x) ** 2 + (pts[k][1] - y) ** 2; if (dd < bd) { bd = dd; best = k; } }
      }
      return best;
    };
    const strokes = []; let ptr = 0;
    while (ptr < n) {
      while (ptr < n && used[ptr]) ptr++;
      if (ptr >= n) break;
      let cur = ptr; const line = [];
      for (;;) { take(cur); line.push(pts[cur]); const nx = near(pts[cur][0], pts[cur][1], g * 2.6); if (nx < 0) break; cur = nx; }
      if (line.length > 3) strokes.push(line);
    }
    const A = (p.drift / 100) * 14 * sc, ink = INKS[p.ink] || INKS.black;
    ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let tpos = 0;
    for (const line of strokes) {
      ctx.lineWidth = p.weight * sc * (0.8 + r() * 0.5); ctx.globalAlpha = 0.88;
      ctx.beginPath();
      const P = line.map((q, i) => {
        const t = (tpos + i) * 0.0045;
        return [q[0] + (vnoise(t, 3, seed) - 0.5) * 2 * A + (r() - 0.5) * 0.35 * A, q[1] + (vnoise(t, 41, seed + 1) - 0.5) * 2 * A + (r() - 0.5) * 0.35 * A];
      });
      tpos += line.length;
      ctx.moveTo(P[0][0], P[0][1]);
      for (let i = 1; i < P.length - 1; i++) ctx.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2);
      ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
});
