// src/engine/styles/girih.js
import { still, clamp, hexToRgb, rng, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, vivid, mix } from '../culture.js';

const E = [0, 1, 2, 3, 4].map((k) => [Math.cos((TAU * k) / 5), Math.sin((TAU * k) / 5)]);

// The Penrose rhombs inside a disc of radius Rz (in the pentagrid plane), by de Bruijn's pentagrid method.
// Each rhomb is { p: four corners, k: 0 for the wide rhomb, 1 for the narrow one }.
function rhombs(Rz, g) {
  const out = [], N = Math.ceil(Rz) + 3;
  for (let r = 0; r < 5; r++) for (let s = r + 1; s < 5; s++) {
    const er = E[r], es = E[s], det = er[0] * es[1] - er[1] * es[0];
    for (let kr = -N; kr <= N; kr++) for (let ks = -N; ks <= N; ks++) {
      const a = kr - g[r], b = ks - g[s], zx = (a * es[1] - b * er[1]) / det, zy = (er[0] * b - es[0] * a) / det;
      if (zx * zx + zy * zy > Rz * Rz) continue;
      const K = [0, 1, 2, 3, 4].map((i) => Math.ceil(zx * E[i][0] + zy * E[i][1] + g[i]));
      const vert = (dr, ds) => {
        let x = 0, y = 0;
        for (let i = 0; i < 5; i++) { const q = i === r ? kr + dr : i === s ? ks + ds : K[i]; x += q * E[i][0]; y += q * E[i][1]; }
        return [x, y];
      };
      const dlt = s - r;
      out.push({ p: [vert(0, 0), vert(1, 0), vert(1, 1), vert(0, 1)], k: dlt === 1 || dlt === 4 ? 0 : 1 });
    }
  }
  return out;
}

// Hankin's "polygons in contact": from every edge midpoint two lines leave at `th` to the edge, and meet their neighbours.
// Returns the midpoints M and the meeting points P (P[i] sits near the corner between edge i and edge i + 1).
function strap(P, th) {
  const n = P.length, M = [], Q = [];
  let area = 0;
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const V = area < 0 ? P.slice().reverse() : P;
  for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n]; M.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); }
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  for (let i = 0; i < n; i++) {
    const a = V[i], b = V[(i + 1) % n], c = V[(i + 2) % n];
    const e1 = rot(b[0] - a[0], b[1] - a[1], th), e2 = rot(b[0] - c[0], b[1] - c[1], -th);
    const m1 = M[i], m2 = M[(i + 1) % n], den = e1[0] * e2[1] - e1[1] * e2[0];
    let q = [(m1[0] + m2[0]) / 2, (m1[1] + m2[1]) / 2];
    if (Math.abs(den) > 1e-9) {
      const t = ((m2[0] - m1[0]) * e2[1] - (m2[1] - m1[1]) * e2[0]) / den, u = ((m2[0] - m1[0]) * e1[1] - (m2[1] - m1[1]) * e1[0]) / den;
      if (t > 0 && u > 0) q = [m1[0] + e1[0] * t, m1[1] + e1[1] * t];
    }
    Q.push(q);
  }
  return { V, M, Q };
}

export default still({
  id: 'girih',
  name: 'Girih',
  blurb: 'The strapwork of Islamic architecture. Every edge of a tiling sends two lines inward at a fixed angle, and the lines weave stars out of rhombs.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Tile size', type: 'range', min: 26, max: 100, step: 1, default: 58 },
    { key: 'angle', label: 'Contact angle', type: 'range', min: 25, max: 80, step: 1, default: 54, fmt: (v) => v + '°' },
    { key: 'line', label: 'Strap width', type: 'range', min: 0.5, max: 5, step: 0.1, default: 2.4, fmt: (v) => v.toFixed(1) },
    { key: 'colour', label: 'Colour', type: 'select', default: 'both', options: [['picture', 'Colours of the picture'], ['classic', 'Lapis, turquoise and ivory'], ['both', 'Both']] },
    { key: 'turn', label: 'Turn', type: 'range', min: 0, max: 36, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'seed', label: 'Patch of the tiling', type: 'shuffle', default: 3 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, edge = p.size * sc, cx = W / 2, cy = H / 2;
    const key = [p.size, p.seed, W, H].join('|');
    if (cache.gk !== key) {
      const r = rng(p.seed * 977 + 13), g = [0, 1, 2, 3].map(() => (r() - 0.5) * 0.9);
      g.push(-g.reduce((a, b) => a + b, 0));
      cache.rh = rhombs(Math.hypot(W, H) / 2 / edge / 2.5 + 2.2, g); cache.gk = key;
    }
    const smp = sampler(cache, d, W, H, edge * 0.5), th = (p.angle * Math.PI) / 180, rot = (p.turn * Math.PI) / 180, cr = Math.cos(rot), sr = Math.sin(rot);
    const T = (q) => [cx + (q[0] * cr - q[1] * sr) * edge, cy + (q[0] * sr + q[1] * cr) * edge];
    const classic = [[[31, 63, 143], [239, 230, 205]], [[44, 154, 163], [240, 232, 206]]].map((a) => a.map((c) => c.slice()));
    ctx.fillStyle = '#12100e'; ctx.fillRect(0, 0, W, H);
    const tmp = [0, 0, 0], paths = [];
    const colour = (px, py, k, centre) => {
      const pc = smp.rgb(px, py), t = smp.tone(px, py);
      vivid(pc, 1.25, 0, tmp);
      const pic = tmp.slice(), cl = centre ? classic[k][1] : classic[k][0], f = 0.55 + 0.7 * t;
      const base = p.colour === 'picture' ? pic : p.colour === 'classic' ? cl : mix(pic, cl, 0.45);
      return [base[0] * f, base[1] * f, base[2] * f];
    };
    for (const { p: quad, k } of cache.rh) {
      const P = quad.map(T);
      const bx = P.map((q) => q[0]), by = P.map((q) => q[1]);
      if (Math.max(...bx) < -edge || Math.min(...bx) > W + edge || Math.max(...by) < -edge || Math.min(...by) > H + edge) continue;
      const { V, M, Q } = strap(P, th), n = V.length;
      for (let i = 0; i < n; i++) {
        const v = V[(i + 1) % n], kite = [M[i], v, M[(i + 1) % n], Q[i]];
        const gx = (kite[0][0] + kite[1][0] + kite[2][0] + kite[3][0]) / 4, gy = (kite[0][1] + kite[1][1] + kite[2][1] + kite[3][1]) / 4;
        ctx.fillStyle = css(colour(gx, gy, k, false));
        ctx.beginPath(); ctx.moveTo(kite[0][0], kite[0][1]); for (let j = 1; j < 4; j++) ctx.lineTo(kite[j][0], kite[j][1]); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
      }
      const mx = (V[0][0] + V[2][0]) / 2, my = (V[0][1] + V[2][1]) / 2;
      ctx.fillStyle = css(colour(mx, my, k, true));
      ctx.beginPath(); ctx.moveTo(M[0][0], M[0][1]);
      for (let i = 0; i < n; i++) { ctx.lineTo(Q[i][0], Q[i][1]); ctx.lineTo(M[(i + 1) % n][0], M[(i + 1) % n][1]); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
      const seg = [];
      for (let i = 0; i < n; i++) seg.push(M[i], Q[i], M[(i + 1) % n]);
      paths.push(seg);
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const w = p.line * sc;
    for (const [wid, col] of [[w * 1.9 + 1.5 * sc, '#14100b'], [w * 1.25, '#d9b25c'], [Math.max(0.5, w * 0.35), '#fff3c9']]) {
      ctx.strokeStyle = col; ctx.lineWidth = wid; ctx.beginPath();
      for (const seg of paths) for (let i = 0; i < seg.length; i += 3) { ctx.moveTo(seg[i][0], seg[i][1]); ctx.lineTo(seg[i + 1][0], seg[i + 1][1]); ctx.lineTo(seg[i + 2][0], seg[i + 2][1]); }
      ctx.stroke();
    }
  },
});
