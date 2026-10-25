// src/engine/styles/low-poly.js
import { still, rng, boxBlur } from '../utils.js';
import { pixels } from '../helpers.js';

// Bowyer-Watson Delaunay triangulation. Returns triangles as index triples into `pts`.
function delaunay(pts) {
  const n = pts.length;
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const [x, y] of pts) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  const dm = Math.max(maxX - minX, maxY - minY) * 20, mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
  const v = pts.concat([[mx - dm, my - dm], [mx, my + dm], [mx + dm, my - dm]]), M = n + 3;
  const make = (a, b, c) => {
    const [ax, ay] = v[a], [bx, by] = v[b], [cx, cy] = v[c], d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (!d) return null;
    const a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
    const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d, uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
    return { a, b, c, x: ux, y: uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 };
  };
  let tris = [make(n, n + 1, n + 2)];
  for (let i = 0; i < n; i++) {
    const [px, py] = v[i], keep = [], edges = new Map();
    for (const t of tris) {
      if ((px - t.x) ** 2 + (py - t.y) ** 2 < t.r2) {
        for (const [a, b] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) { const k = a < b ? a * M + b : b * M + a; edges.set(k, edges.has(k) ? null : [a, b]); }
      } else keep.push(t);
    }
    for (const e of edges.values()) if (e) { const t = make(e[0], e[1], i); if (t) keep.push(t); }
    tris = keep;
  }
  return tris.filter((t) => t.a < n && t.b < n && t.c < n).map((t) => [t.a, t.b, t.c]);
}

export default still({
  id: 'low-poly',
  name: 'Low-poly',
  blurb: 'A mesh of flat-shaded triangles that gathers around the edges in your picture.',
  maxSide: 1000,
  params: [
    { key: 'points', label: 'Detail', type: 'range', min: 80, max: 1500, step: 10, default: 520 },
    { key: 'edges', label: 'Follow edges', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'shade', label: 'Facet shading', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'lines', label: 'Facet lines', type: 'toggle', default: false },
    { key: 'seed', label: 'Re-scatter', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, r = rng(p.seed * 31 + 5), bias = p.edges / 100;
    // edge strength from the blurred brightness, scaled to 0..1
    const Lb = boxBlur(cache.L, W, H, 2), grad = new Float32Array(W * H); let gmax = 1e-6;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, g = Math.abs(Lb[i + 1] - Lb[i - 1]) + Math.abs(Lb[i + W] - Lb[i - W]); grad[i] = g; if (g > gmax) gmax = g; }
    const base = Math.sqrt((W * H) / p.points), pts = [], cell = base * 0.45, gw = Math.ceil(W / cell), gh = Math.ceil(H / cell), occ = new Int32Array(gw * gh).fill(-1);
    const near = (x, y, rad) => { const cx = (x / cell) | 0, cy = (y / cell) | 0, rc = Math.ceil(rad / cell); for (let j = Math.max(0, cy - rc); j <= Math.min(gh - 1, cy + rc); j++) for (let i = Math.max(0, cx - rc); i <= Math.min(gw - 1, cx + rc); i++) { const q = occ[j * gw + i]; if (q >= 0 && (pts[q][0] - x) ** 2 + (pts[q][1] - y) ** 2 < rad * rad) return true; } return false; };
    const add = (x, y) => { pts.push([x, y]); occ[Math.min(gh - 1, (y / cell) | 0) * gw + Math.min(gw - 1, (x / cell) | 0)] = pts.length - 1; };
    // frame points so the mesh covers the whole picture
    const nx = Math.max(2, Math.round(W / base)), ny = Math.max(2, Math.round(H / base));
    for (let i = 0; i <= nx; i++) { add((i / nx) * (W - 1), 0); add((i / nx) * (W - 1), H - 1); }
    for (let j = 1; j < ny; j++) { add(0, (j / ny) * (H - 1)); add(W - 1, (j / ny) * (H - 1)); }
    const target = p.points, tries = target * 40;
    for (let t = 0; t < tries && pts.length < target; t++) {
      const x = 2 + r() * (W - 5), y = 2 + r() * (H - 5), e = Math.min(1, (grad[(y | 0) * W + (x | 0)] / gmax) * 3.2);
      const keepP = (1 - bias) * 0.55 + bias * (0.06 + e * 0.94);
      if (r() > keepP) continue;
      const rad = base * (0.95 - bias * 0.62 * e);
      if (!near(x, y, rad)) add(x, y);
    }
    const tris = delaunay(pts), sh = p.shade / 100;
    ctx.lineJoin = 'round';
    for (const [a, b, c] of tris) {
      const cx = (pts[a][0] + pts[b][0] + pts[c][0]) / 3, cy = (pts[a][1] + pts[b][1] + pts[c][1]) / 3;
      // average a few samples inside the facet for a steadier colour
      let R = 0, G = 0, B = 0;
      for (const [sx, sy] of [[cx, cy], [(cx + pts[a][0]) / 2, (cy + pts[a][1]) / 2], [(cx + pts[b][0]) / 2, (cy + pts[b][1]) / 2], [(cx + pts[c][0]) / 2, (cy + pts[c][1]) / 2]]) { const o = ((Math.min(H - 1, Math.max(0, sy | 0)) * W) + Math.min(W - 1, Math.max(0, sx | 0))) * 4; R += d[o]; G += d[o + 1]; B += d[o + 2]; }
      const f = 1 + (r() - 0.5) * 0.22 * sh * 2;
      const col = `rgb(${Math.min(255, (R / 4) * f) | 0},${Math.min(255, (G / 4) * f) | 0},${Math.min(255, (B / 4) * f) | 0})`;
      ctx.beginPath(); ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]); ctx.lineTo(pts[c][0], pts[c][1]); ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = p.lines ? 'rgba(255,255,255,0.28)' : col; ctx.lineWidth = p.lines ? 0.8 : 1; ctx.stroke();
    }
  },
});
