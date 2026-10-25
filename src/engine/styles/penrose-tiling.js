// src/engine/styles/penrose-tiling.js
import { still, clamp, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

const PHI = (1 + Math.sqrt(5)) / 2;

// Robinson triangles: [kind, A, B, C], each point a [x, y]. Kind 0 halves a thin rhombus, kind 1 a thick one.
function deflate(tris) {
  const out = [];
  for (const [k, A, B, C] of tris) {
    if (k === 0) {
      const P = [A[0] + (B[0] - A[0]) / PHI, A[1] + (B[1] - A[1]) / PHI];
      out.push([0, C, P, B], [1, P, C, A]);
    } else {
      const Q = [B[0] + (A[0] - B[0]) / PHI, B[1] + (A[1] - B[1]) / PHI], R = [B[0] + (C[0] - B[0]) / PHI, B[1] + (C[1] - B[1]) / PHI];
      out.push([1, R, C, A], [1, Q, R, B], [0, R, Q, A]);
    }
  }
  return out;
}

export default still({
  id: 'penrose-tiling',
  name: 'Penrose Tiling',
  blurb: 'Two rhombus shapes that fill the plane without ever repeating, with five-fold symmetry that no ordinary tiling can have.',
  maxSide: 1100,
  params: [
    { key: 'depth', label: 'Subdivisions', type: 'range', min: 3, max: 8, step: 1, default: 6 },
    { key: 'mode', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['duo', 'Two tones by shape'], ['mixed', 'Both']] },
    { key: 'line', label: 'Line width', type: 'range', min: 0, max: 4, step: 0.1, default: 1.2, fmt: (v) => v.toFixed(1) },
    { key: 'turn', label: 'Turn the pattern', type: 'range', min: 0, max: 36, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'lineCol', label: 'Lines', type: 'select', default: 'dark', options: [['dark', 'Dark'], ['light', 'Light'], ['gold', 'Gold']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800;
    const key = p.depth + '|' + p.turn + '|' + W + '|' + H;
    if (cache.key !== key) {
      const R = Math.hypot(W, H) * 0.52, rot = (p.turn * Math.PI) / 180;
      let tris = [];
      for (let i = 0; i < 10; i++) {
        let B = [Math.cos(rot + ((2 * i - 1) * Math.PI) / 10) * R, Math.sin(rot + ((2 * i - 1) * Math.PI) / 10) * R], C = [Math.cos(rot + ((2 * i + 1) * Math.PI) / 10) * R, Math.sin(rot + ((2 * i + 1) * Math.PI) / 10) * R];
        if (i % 2 === 0) [B, C] = [C, B];
        tris.push([0, [0, 0], B, C]);
      }
      for (let k = 0; k < p.depth; k++) tris = deflate(tris);
      cache.tris = tris; cache.key = key;
    }
    const tris = cache.tris, edge = Math.hypot(tris[0][1][0] - tris[0][2][0], tris[0][1][1] - tris[0][2][1]), smp = sampler(cache, d, W, H, edge * 0.45), cx = W / 2, cy = H / 2;
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
    const duo = [[226, 176, 74], [38, 104, 118]];
    ctx.save(); ctx.translate(cx, cy);
    for (const [k, A, B, C] of tris) {
      const gx = (A[0] + B[0] + C[0]) / 3 + cx, gy = (A[1] + B[1] + C[1]) / 3 + cy;
      let c;
      if (p.mode === 'duo') { c = duo[k].slice(); const t = smp.tone(gx, gy); const f = 0.65 + 0.5 * t; c = c.map((v) => v * f); }
      else if (p.mode === 'mixed') { const pc = smp.rgb(gx, gy); c = [lerp(pc[0], duo[k][0], 0.4), lerp(pc[1], duo[k][1], 0.4), lerp(pc[2], duo[k][2], 0.4)]; }
      else { const pc = smp.rgb(gx, gy); const f = k ? 1.04 : 0.94; c = [pc[0] * f, pc[1] * f, pc[2] * f]; }
      ctx.fillStyle = `rgb(${clamp(c[0], 0, 255) | 0},${clamp(c[1], 0, 255) | 0},${clamp(c[2], 0, 255) | 0})`;
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath(); ctx.fill();
      if (p.line < 0.1) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); }
    }
    if (p.line >= 0.1) {
      ctx.strokeStyle = p.lineCol === 'light' ? 'rgba(250,246,236,0.9)' : p.lineCol === 'gold' ? 'rgba(214,170,78,0.95)' : 'rgba(18,16,16,0.88)';
      ctx.lineWidth = p.line * sc; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      for (const [, A, B, C] of tris) { ctx.moveTo(C[0], C[1]); ctx.lineTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); }
      ctx.stroke();
    }
    ctx.restore();
  },
});
