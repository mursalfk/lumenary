// src/engine/styles/sindhi-topi.js
import { still, hexToRgb, TAU } from '../utils.js';
import { pixels, sampler, nearest } from '../helpers.js';
import { css, vivid, clothFill, leaf } from '../culture.js';

const TOPI = ['#c62828', '#f9a825', '#2e7d32', '#1565c0', '#7b1fa2', '#ec407a', '#f5f0e1', '#171717'].map(hexToRgb);
const CLOTH = { black: ['#1d1514', '#0f0a09'], maroon: ['#4d1217', '#2b090d'] };
const TYPES = ['tri', 'dia', 'zig', 'mir'];

export default still({
  id: 'sindhi-topi',
  name: 'Sindhi Topi',
  blurb: 'The embroidered cap of Sindh seen from above: rings of triangles, diamonds and tiny mirrors around a central disc, each stitched in a colour taken from your picture.',
  maxSide: 1100,
  params: [
    { key: 'rings', label: 'Rings', type: 'range', min: 3, max: 10, step: 1, default: 6 },
    { key: 'cap', label: 'Size of the cap', type: 'range', min: 60, max: 140, step: 1, default: 105, fmt: (v) => v + '%' },
    { key: 'cut', label: 'Cell shape', type: 'range', min: 70, max: 150, step: 1, default: 100, fmt: (v) => v + '%' },
    { key: 'mirrors', label: 'Mirrors', type: 'toggle', default: true },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'black', options: [['black', 'Black'], ['maroon', 'Maroon']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, cx = W / 2, cy = H / 2, R = W * 0.48 * (p.cap / 100), K = p.rings;
    const smp = sampler(cache, d, W, H, R * 0.05), tmp = [0, 0, 0];
    const [c0, c1] = CLOTH[p.cloth].map(hexToRgb);
    clothFill(ctx, W, H, c0, c1, sc, 5, 0.08);
    const pol = (r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const pick = (x, y) => {
      const cc = smp.rgb(Math.min(W - 1, Math.max(0, x)), Math.min(H - 1, Math.max(0, y)));
      vivid(cc, 1.5, 0.04, tmp);
      return TOPI[nearest(TOPI, tmp[0], tmp[1], tmp[2])];
    };
    const mirror = (x, y, r) => {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      const half = r * 3.2; ctx.translate(x, y); ctx.scale(-1, 1);
      ctx.drawImage(work, Math.max(0, Math.min(W - 2, x - half)), Math.max(0, Math.min(H - 2, y - half)), Math.min(2 * half, W), Math.min(2 * half, H), -r, -r, 2 * r, 2 * r);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const gr = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(15,25,45,0.4)');
      ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
      ctx.strokeStyle = 'rgba(10,8,8,0.9)'; ctx.lineWidth = 1.6 * sc; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    };
    const r0 = R * 0.11, h = (R * 0.96 - r0) / K;
    for (let k = 0; k < K; k++) {
      const inner = r0 + k * h, outer = inner + h, mid = (inner + outer) / 2, type = TYPES[k % TYPES.length];
      let n = Math.max(8, Math.round((TAU * mid) / (h * (p.cut / 100)))); n += n % 2;
      ctx.beginPath(); ctx.arc(cx, cy, outer, 0, TAU); ctx.arc(cx, cy, inner, 0, TAU, true);
      ctx.fillStyle = k % 2 ? css(TOPI[6]) : css(TOPI[7]); ctx.fill('evenodd');
      const rot = (k % 2) * (Math.PI / n);
      for (let j = 0; j < n; j++) {
        const a0 = rot + (j / n) * TAU, a1 = rot + ((j + 1) / n) * TAU, am = (a0 + a1) / 2, [gx, gy] = pol(mid, am), col = pick(gx, gy), cs = css(col);
        ctx.fillStyle = cs; ctx.strokeStyle = cs;
        if (type === 'tri') {
          const A = j % 2 ? [pol(outer, a0), pol(outer, a1), pol(inner, am)] : [pol(inner, a0), pol(inner, a1), pol(outer, am)];
          ctx.beginPath(); ctx.moveTo(A[0][0], A[0][1]); ctx.lineTo(A[1][0], A[1][1]); ctx.lineTo(A[2][0], A[2][1]); ctx.closePath(); ctx.fill();
        } else if (type === 'dia') {
          const A = [pol(inner + h * 0.04, am), pol(mid, a0 + (a1 - a0) * 0.04), pol(outer - h * 0.04, am), pol(mid, a1 - (a1 - a0) * 0.04)];
          ctx.beginPath(); ctx.moveTo(A[0][0], A[0][1]); for (let q = 1; q < 4; q++) ctx.lineTo(A[q][0], A[q][1]); ctx.closePath(); ctx.fill();
          ctx.fillStyle = css(k % 2 ? TOPI[7] : TOPI[6]); ctx.beginPath(); ctx.arc(gx, gy, h * 0.1, 0, TAU); ctx.fill();
        } else if (type === 'zig') {
          ctx.lineWidth = h * 0.17; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
          for (const f of [0.28, 0.72]) { const rr = inner + h * f; ctx.beginPath(); const P0 = pol(rr - h * 0.2, a0), P1 = pol(rr + h * 0.2, am), P2 = pol(rr - h * 0.2, a1); ctx.moveTo(P0[0], P0[1]); ctx.lineTo(P1[0], P1[1]); ctx.lineTo(P2[0], P2[1]); ctx.stroke(); }
        } else if (p.mirrors) {
          ctx.lineWidth = 1.8 * sc; ctx.lineCap = 'round';
          for (let q = 0; q < 14; q++) { const an = (q / 14) * TAU; ctx.beginPath(); ctx.moveTo(gx + Math.cos(an) * h * 0.27, gy + Math.sin(an) * h * 0.27); ctx.lineTo(gx + Math.cos(an) * h * 0.42, gy + Math.sin(an) * h * 0.42); ctx.stroke(); }
          mirror(gx, gy, h * 0.24);
        } else {
          ctx.beginPath(); ctx.arc(gx, gy, h * 0.3, 0, TAU); ctx.fill();
        }
      }
      ctx.strokeStyle = 'rgba(245,240,225,0.8)'; ctx.lineWidth = 1.2 * sc; ctx.setLineDash([4 * sc, 3 * sc]);
      ctx.beginPath(); ctx.arc(cx, cy, outer, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    // the crown: a large mirror in a star of petals
    const cc = pick(cx, cy);
    for (let q = 0; q < 12; q++) { const an = (q / 12) * TAU; leaf(ctx, cx + Math.cos(an) * r0 * 0.75, cy + Math.sin(an) * r0 * 0.75, an, r0 * 0.6, r0 * 0.2); ctx.fillStyle = css(q % 2 ? TOPI[1] : cc); ctx.fill(); }
    mirror(cx, cy, r0 * 0.7);
    // scalloped rim
    const ns = Math.round((TAU * R * 0.99) / (h * 0.9));
    for (let j = 0; j < ns; j++) { const an = ((j + 0.5) / ns) * TAU, [x, y] = pol(R * 0.985, an); ctx.beginPath(); ctx.arc(x, y, (TAU * R * 0.99) / ns / 2.2, 0, TAU); ctx.fillStyle = css(pick(x, y)); ctx.fill(); }
  },
});
