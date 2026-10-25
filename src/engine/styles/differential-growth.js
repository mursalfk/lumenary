// src/engine/styles/differential-growth.js
import { still, rng, clamp, lerp, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'differential-growth',
  name: 'Differential Growth',
  blurb: 'A closed loop that keeps adding points. Neighbours pull together, strangers push apart, and the line folds into coral. Shadows fold tighter than lights.',
  maxSide: 900,
  params: [
    { key: 'edge', label: 'Fold size', type: 'range', min: 3, max: 14, step: 0.5, default: 6, fmt: (v) => v.toFixed(1) },
    { key: 'grow', label: 'How far it grows', type: 'range', min: 20, max: 100, step: 1, default: 70 },
    { key: 'seeds', label: 'Starting loops', type: 'range', min: 1, max: 6, step: 1, default: 4 },
    { key: 'follow', label: 'Picture sets the tightness', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'line', label: 'Line width', type: 'range', min: 0.5, max: 4, step: 0.1, default: 1.5, fmt: (v) => v.toFixed(1) },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ink', 'One ink']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['night', 'Night']] },
    { key: 'seed', label: 'Grow again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, night = p.paper === 'night', smp = sampler(cache, d, W, H, 7 * sc);
    const key = [p.edge, p.grow, p.seeds, p.follow, p.seed, p.paper, W].join('|');
    if (cache.key !== key) {
      const r = rng(p.seed * 83 + 5), L0 = p.edge * sc, follow = p.follow / 100, cap = Math.round(3000 + (p.grow / 100) * 11000), maxIt = Math.round(180 + (p.grow / 100) * 360);
      const lenAt = (x, y) => { const t = smp.tone(x, y), heavy = night ? t : 1 - t; return L0 * lerp(1, 0.55 + 1.0 * (1 - heavy), follow); };
      let loops = [];
      for (let s = 0; s < p.seeds; s++) {
        const cx = W * (0.2 + 0.6 * r()), cy = H * (0.2 + 0.6 * r()), rad = L0 * 3.2, m = 14, pts = [];
        for (let i = 0; i < m; i++) { const a = (i / m) * TAU; pts.push([cx + Math.cos(a) * rad * (0.9 + 0.2 * r()), cy + Math.sin(a) * rad * (0.9 + 0.2 * r())]); }
        loops.push(pts);
      }
      const margin = L0 * 2;
      for (let it = 0; it < maxIt; it++) {
        // flatten
        const X = [], Y = [], PR = [], NX = [], LN = []; let off = 0;
        for (const pts of loops) { const m = pts.length; for (let i = 0; i < m; i++) { X.push(pts[i][0]); Y.push(pts[i][1]); PR.push(off + ((i + m - 1) % m)); NX.push(off + ((i + 1) % m)); LN.push(lenAt(pts[i][0], pts[i][1])); } off += m; }
        const n = X.length; if (n > cap) break;
        const Rmax = L0 * 2.8, cs = Rmax, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1, head = new Int32Array(gw * gh).fill(-1), next = new Int32Array(n);
        for (let i = 0; i < n; i++) { const c = ((Y[i] / cs) | 0) * gw + ((X[i] / cs) | 0); if (c >= 0 && c < head.length) { next[i] = head[c]; head[c] = i; } }
        const FX = new Float32Array(n), FY = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const x = X[i], y = Y[i], pr = PR[i], nx = NX[i];
          for (const q of [pr, nx]) { const dx = X[q] - x, dy = Y[q] - y, dd = Math.hypot(dx, dy) + 1e-6, f = (dd - LN[i]) * 0.22 / dd; FX[i] += dx * f; FY[i] += dy * f; }
          FX[i] += ((X[pr] + X[nx]) / 2 - x) * 0.06; FY[i] += ((Y[pr] + Y[nx]) / 2 - y) * 0.06;
          const Ri = LN[i] * 2.6, cx = (x / cs) | 0, cy = (y / cs) | 0;
          for (let j = Math.max(0, cy - 1); j <= Math.min(gh - 1, cy + 1); j++) for (let k = Math.max(0, cx - 1); k <= Math.min(gw - 1, cx + 1); k++) {
            for (let q = head[j * gw + k]; q >= 0; q = next[q]) {
              if (q === i || q === pr || q === nx) continue;
              const dx = x - X[q], dy = y - Y[q], d2 = dx * dx + dy * dy, R = (Ri + LN[q] * 2.6) / 2;
              if (d2 < R * R && d2 > 1e-6) { const dd = Math.sqrt(d2), f = (1 - dd / R); FX[i] += (dx / dd) * f * f * LN[i] * 0.5; FY[i] += (dy / dd) * f * f * LN[i] * 0.5; }
            }
          }
          if (x < margin) FX[i] += (margin - x) * 0.3; if (x > W - margin) FX[i] -= (x - (W - margin)) * 0.3; if (y < margin) FY[i] += (margin - y) * 0.3; if (y > H - margin) FY[i] -= (y - (H - margin)) * 0.3;
          FX[i] += (r() - 0.5) * L0 * 0.04; FY[i] += (r() - 0.5) * L0 * 0.04;
        }
        const nl = []; off = 0;
        for (const pts of loops) {
          const m = pts.length, np = [];
          for (let i = 0; i < m; i++) {
            const g = off + i, nx = NX[g], fm = Math.hypot(FX[g], FY[g]), cl = fm > LN[g] * 0.5 ? (LN[g] * 0.5) / fm : 1, fn = Math.hypot(FX[nx], FY[nx]), cn = fn > LN[nx] * 0.5 ? (LN[nx] * 0.5) / fn : 1, x = X[g] + FX[g] * cl, y = Y[g] + FY[g] * cl, ex = X[nx] + FX[nx] * cn, ey = Y[nx] + FY[nx] * cn;
            np.push([x, y]);
            const dist = Math.hypot(ex - x, ey - y);
            if (dist > LN[g] * 1.55 || (dist > LN[g] * 0.7 && r() < 0.035)) np.push([(x + ex) / 2 + (r() - 0.5) * 0.4, (y + ey) / 2 + (r() - 0.5) * 0.4]);
          }
          off += m; nl.push(np);
        }
        loops = nl;
      }
      cache.loops = loops; cache.key = key;
    }
    ctx.fillStyle = night ? '#0b0b10' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const pts of cache.loops) {
      const m = pts.length;
      for (let i = 0; i < m; i++) {
        const a = pts[i], b = pts[(i + 1) % m], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, tn = smp.tone(mx, my), heavy = night ? tn : 1 - tn;
        if (p.colour === 'ink') ctx.strokeStyle = night ? '#ece8dc' : '#1c1a20';
        else { const c = smp.rgb(mx, my), k = night ? 1.2 : 0.8; ctx.strokeStyle = `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`; }
        ctx.lineWidth = p.line * sc * (0.55 + 1.1 * heavy);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    }
  },
});
