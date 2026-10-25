// src/engine/styles/quilt-patchwork.js
import { still, hash2, sampleImage, clamp, rgb2hsl, hsl2rgb, TAU } from '../utils.js';
import { kmeans, nearest, addGrain } from '../helpers.js';

const css = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const sh = ([r, g, b], k) => [clamp(r * k, 0, 255), clamp(g * k, 0, 255), clamp(b * k, 0, 255)];

export default still({
  id: 'quilt-patchwork',
  name: 'Quilt Patchwork',
  blurb: 'A quilt: your picture cut into squares or triangles of printed cotton, puffed by the wadding and held with running stitches.',
  maxSide: 1000,
  params: [
    { key: 'across', label: 'Patches across', type: 'range', min: 6, max: 30, step: 1, default: 13 },
    { key: 'shape', label: 'Patches', type: 'select', default: 'triangles', options: [['squares', 'Squares'], ['triangles', 'Triangles']] },
    { key: 'fabrics', label: 'Fabrics', type: 'range', min: 4, max: 12, step: 1, default: 8 },
    { key: 'prints', label: 'Printed fabrics', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'stitch', label: 'Running stitches', type: 'toggle', default: true },
    { key: 'seed', label: 'Re-cut', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    const n = p.across, s = W / n, rows = Math.ceil(H / s), tri = p.shape === 'triangles', img = sampleImage(env, work, n * 2, rows * 2), d = img.data, iw = img.width;
    const fabric = kmeans(d, p.fabrics, p.seed * 3 + 1, 10, 1).map(([r, g, b]) => { const [h, sa, l] = rgb2hsl(r, g, b); return hsl2rgb(h, clamp(sa * 0.92), clamp(l * 0.9 + 0.07)); });
    const at = (x, y) => { const sx = clamp(Math.floor((x / s) * 2), 0, iw - 1), sy = clamp(Math.floor((y / s) * 2), 0, rows * 2 - 1), o = (sy * iw + sx) * 4; return nearest(fabric, d[o], d[o + 1], d[o + 2]); };
    ctx.fillStyle = '#d9cfba'; ctx.fillRect(0, 0, W, H);
    const pr = p.prints / 100;
    const patch = (pts, ci, ix, iy, hash) => {
      const col = fabric[ci];
      ctx.save(); ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
      ctx.fillStyle = css(col); ctx.fillRect(ix - s, iy - s, s * 3, s * 3);
      // a printed pattern on some patches, in a lighter or darker shade of the same cloth
      const kind = hash < pr ? Math.floor((hash / Math.max(pr, 1e-6)) * 5) : -1, pc = css(sh(col, hash2(ix | 0, iy | 0, 3) < 0.5 ? 1.3 : 0.72), 0.7);
      ctx.fillStyle = pc; ctx.strokeStyle = pc; const u = s / 6;
      if (kind === 0) { for (let yy = iy; yy < iy + s * 1.2; yy += u * 1.6) for (let xx = ix + ((Math.round(yy / (u * 1.6)) & 1) ? u * 0.8 : 0); xx < ix + s * 1.2; xx += u * 1.6) { ctx.beginPath(); ctx.arc(xx, yy, u * 0.3, 0, TAU); ctx.fill(); } }
      else if (kind === 1) { ctx.lineWidth = u * 0.5; ctx.beginPath(); for (let xx = ix - s; xx < ix + s * 2; xx += u * 1.2) { ctx.moveTo(xx, iy - s); ctx.lineTo(xx, iy + s * 2); } ctx.stroke(); }
      else if (kind === 2) { ctx.lineWidth = u * 0.3; ctx.beginPath(); for (let xx = ix; xx < ix + s * 1.2; xx += u * 1.4) { ctx.moveTo(xx, iy - s); ctx.lineTo(xx, iy + s * 2); ctx.moveTo(ix - s, xx - ix + iy); ctx.lineTo(ix + s * 2, xx - ix + iy); } ctx.stroke(); }
      else if (kind === 3) { for (let yy = iy + u; yy < iy + s; yy += u * 2.4) for (let xx = ix + u; xx < ix + s; xx += u * 2.4) { for (let a = 0; a < 5; a++) { ctx.beginPath(); ctx.arc(xx + Math.cos((a / 5) * TAU) * u * 0.42, yy + Math.sin((a / 5) * TAU) * u * 0.42, u * 0.25, 0, TAU); ctx.fill(); } } }
      else if (kind === 4) { ctx.lineWidth = u * 0.28; ctx.beginPath(); for (let xx = ix - s; xx < ix + s * 2; xx += u * 1.5) { ctx.moveTo(xx, iy - s); ctx.lineTo(xx + s * 3, iy + s * 2); } ctx.stroke(); }
      // puffed by the wadding: bright in the middle, shadowed at the seams
      const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length, cy = pts.reduce((a, q) => a + q[1], 0) / pts.length, g = ctx.createRadialGradient(cx - s * 0.08, cy - s * 0.1, s * 0.05, cx, cy, s * 0.75);
      g.addColorStop(0, 'rgba(255,255,255,0.2)'); g.addColorStop(0.65, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = g; ctx.fillRect(ix - s, iy - s, s * 3, s * 3);
      ctx.restore();
      ctx.strokeStyle = 'rgba(30,20,10,0.35)'; ctx.lineWidth = Math.max(1, s * 0.022); ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
      if (p.stitch) {
        ctx.save(); ctx.setLineDash([s * 0.07, s * 0.06]); ctx.strokeStyle = 'rgba(245,238,220,0.8)'; ctx.lineWidth = Math.max(1, s * 0.025); ctx.lineCap = 'round';
        const k2 = 0.82; ctx.beginPath(); pts.forEach(([x, y], k) => { const xx = cx + (x - cx) * k2, yy = cy + (y - cy) * k2; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }); ctx.closePath(); ctx.stroke(); ctx.restore();
      }
    };
    for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
      const x0 = i * s, y0 = j * s, x1 = x0 + s, y1 = y0 + s, h = hash2(i, j, p.seed);
      if (!tri) patch([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], at(x0 + s / 2, y0 + s / 2), x0, y0, h);
      else {
        const diag = hash2(i, j, p.seed + 5) < 0.5;
        const A = diag ? [[x0, y0], [x1, y0], [x1, y1]] : [[x0, y0], [x1, y0], [x0, y1]], B = diag ? [[x0, y0], [x1, y1], [x0, y1]] : [[x1, y0], [x1, y1], [x0, y1]];
        for (const [T, hh] of [[A, h], [B, hash2(i, j, p.seed + 9)]]) { const mx = (T[0][0] + T[1][0] + T[2][0]) / 3, my = (T[0][1] + T[1][1] + T[2][1]) / 3; patch(T, at(mx, my), x0, y0, hh); }
      }
    }
    addGrain(ctx, W, H, 0.22, 4);
  },
});
