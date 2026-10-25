// src/engine/styles/mandala.js
import { still, hexToRgb, clamp, hash2, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, vivid, starPoints, poly } from '../culture.js';

const GROUNDS = { night: '#140c1e', indigo: '#0e1a3a', maroon: '#2a0d14' };
const GOLD = 'rgb(236,192,98)';

export default still({
  id: 'mandala',
  name: 'Mandala',
  blurb: 'A sacred circle in the Buddhist and Hindu tradition: rings built outward from a centre, each with its own repeating shape, picked out in gold line. The colours of every petal come from your picture.',
  maxSide: 1100,
  params: [
    { key: 'rings', label: 'Rings', type: 'range', min: 6, max: 20, step: 1, default: 12 },
    { key: 'fold', label: 'Symmetry', type: 'select', default: '12', options: [['8', 'Eightfold'], ['12', 'Twelvefold'], ['16', 'Sixteenfold'], ['24', 'Twenty-fourfold']] },
    { key: 'line', label: 'Gold line', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'mirror', label: 'Mirror the colours', type: 'toggle', default: false },
    { key: 'ground', label: 'Ground', type: 'select', default: 'night', options: [['night', 'Night violet'], ['indigo', 'Indigo'], ['maroon', 'Maroon']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, cx = W / 2, cy = H / 2, Rmax = Math.hypot(W, H) / 2, n0 = +p.fold, K = p.rings, dr = Rmax / (K + 0.7), tmp = [0, 0, 0];
    const smp = sampler(cache, d, W, H, dr * 0.22), lw = (0.5 + (p.line / 100) * 2.2) * sc;
    ctx.fillStyle = GROUNDS[p.ground]; ctx.fillRect(0, 0, W, H);
    const colAt = (r, a, lift) => {
      let x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (p.mirror) { const sec = TAU / n0; let t = ((a + Math.PI / 2) % sec + sec) % sec; if (t > sec / 2) t = sec - t; const aa = -Math.PI / 2 + t; x = cx + Math.cos(aa) * r; y = cy + Math.sin(aa) * r; }
      x = clamp(x, 0, W - 1); y = clamp(y, 0, H - 1);
      vivid(smp.rgb(x, y), 1.45, lift, tmp); const t = smp.tone(x, y);
      return [tmp[0] * (0.62 + 0.55 * t), tmp[1] * (0.62 + 0.55 * t), tmp[2] * (0.62 + 0.55 * t)];
    };
    ctx.save();
    if (p.glow > 0) { ctx.shadowColor = 'rgba(255,200,110,0.8)'; ctx.shadowBlur = (p.glow / 100) * 7 * sc; }
    ctx.strokeStyle = GOLD; ctx.lineWidth = lw; ctx.lineJoin = 'round';
    for (let k = 0; k < K; k++) {
      const ro = Rmax - k * dr, ri = ro - dr, rm = (ro + ri) / 2, n = n0 * Math.max(1, Math.round((TAU * rm) / (n0 * dr * 1.15))), da = TAU / n, kind = (K - k) % 6, off = (k % 2) * da * 0.5;
      if (ri < dr * 0.3) break;
      // ring floor
      ctx.beginPath(); ctx.arc(cx, cy, ro, 0, TAU); ctx.arc(cx, cy, ri, 0, TAU, true); ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fill();
      for (let j = 0; j < n; j++) {
        const a = j * da + off, c1 = colAt(rm, a, 0.02), c2 = colAt(rm, a, 0.2);
        if (kind === 0) {
          // lotus petals pointing outward
          const w = da * 0.48, ap = a;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - w) * ri, cy + Math.sin(a - w) * ri);
          ctx.quadraticCurveTo(cx + Math.cos(a - w * 1.1) * (rm + dr * 0.15), cy + Math.sin(a - w * 1.1) * (rm + dr * 0.15), cx + Math.cos(ap) * ro, cy + Math.sin(ap) * ro);
          ctx.quadraticCurveTo(cx + Math.cos(a + w * 1.1) * (rm + dr * 0.15), cy + Math.sin(a + w * 1.1) * (rm + dr * 0.15), cx + Math.cos(a + w) * ri, cy + Math.sin(a + w) * ri);
          ctx.closePath(); ctx.fillStyle = css(c1); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - w * 0.45) * ri, cy + Math.sin(a - w * 0.45) * ri); ctx.quadraticCurveTo(cx + Math.cos(a) * (ro - dr * 0.1), cy + Math.sin(a) * (ro - dr * 0.1), cx + Math.cos(a + w * 0.45) * ri, cy + Math.sin(a + w * 0.45) * ri); ctx.closePath(); ctx.fillStyle = css(c2); ctx.fill();
        } else if (kind === 1) {
          // beads
          const rad = Math.min(dr * 0.34, rm * da * 0.4);
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rm, cy + Math.sin(a) * rm, rad, 0, TAU); ctx.fillStyle = css(c1); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rm - rad * 0.25, cy + Math.sin(a) * rm - rad * 0.25, rad * 0.35, 0, TAU); ctx.fillStyle = css(c2, 0.8); ctx.fill();
        } else if (kind === 2) {
          // triangles, alternately pointing in and out
          const w = da * 0.5, up = j % 2 === 0;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - w) * (up ? ri : ro), cy + Math.sin(a - w) * (up ? ri : ro)); ctx.lineTo(cx + Math.cos(a + w) * (up ? ri : ro), cy + Math.sin(a + w) * (up ? ri : ro)); ctx.lineTo(cx + Math.cos(a) * (up ? ro : ri), cy + Math.sin(a) * (up ? ro : ri)); ctx.closePath();
          ctx.fillStyle = css(up ? c1 : c2); ctx.fill(); ctx.stroke();
        } else if (kind === 3) {
          // scallops: round petals that overlap
          const rad = Math.min(dr * 0.62, rm * da * 0.62);
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (ri + rad * 0.55), cy + Math.sin(a) * (ri + rad * 0.55), rad, 0, TAU); ctx.fillStyle = css(c1); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (ri + rad * 0.55), cy + Math.sin(a) * (ri + rad * 0.55), rad * 0.5, 0, TAU); ctx.fillStyle = css(c2); ctx.fill();
        } else if (kind === 4) {
          // diamonds
          const w = da * 0.46;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri); ctx.lineTo(cx + Math.cos(a + w) * rm, cy + Math.sin(a + w) * rm); ctx.lineTo(cx + Math.cos(a) * ro, cy + Math.sin(a) * ro); ctx.lineTo(cx + Math.cos(a - w) * rm, cy + Math.sin(a - w) * rm); ctx.closePath();
          ctx.fillStyle = css(c1); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rm, cy + Math.sin(a) * rm, dr * 0.1, 0, TAU); ctx.fillStyle = css(c2); ctx.fill();
        } else {
          // leaf pairs leaning to either side
          for (const sgn of [-1, 1]) {
            const a0 = a, a1 = a + sgn * da * 0.4, x0 = cx + Math.cos(a0) * ri, y0 = cy + Math.sin(a0) * ri, x1 = cx + Math.cos(a1) * ro, y1 = cy + Math.sin(a1) * ro;
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx + Math.cos(a0 + sgn * da * 0.38) * rm, cy + Math.sin(a0 + sgn * da * 0.38) * rm, x1, y1); ctx.quadraticCurveTo(cx + Math.cos(a0 - sgn * da * 0.02) * rm, cy + Math.sin(a0 - sgn * da * 0.02) * rm, x0, y0); ctx.closePath();
            ctx.fillStyle = css(sgn > 0 ? c1 : c2); ctx.fill(); ctx.stroke();
          }
        }
      }
      ctx.beginPath(); ctx.arc(cx, cy, ro, 0, TAU); ctx.stroke();
    }
    // the heart of the mandala
    const rc = dr * 1.1;
    ctx.beginPath(); ctx.arc(cx, cy, rc, 0, TAU); ctx.fillStyle = GROUNDS[p.ground]; ctx.fill(); ctx.stroke();
    poly(ctx, starPoints(cx, cy, rc * 0.92, rc * 0.5, n0, -Math.PI / 2)); ctx.fillStyle = css(colAt(rc * 0.6, 0.3, 0.1)); ctx.fill(); ctx.stroke();
    poly(ctx, starPoints(cx, cy, rc * 0.5, rc * 0.28, n0, -Math.PI / 2 + Math.PI / n0)); ctx.fillStyle = css(colAt(rc * 0.3, 1.2, 0.25)); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rc * 0.16, 0, TAU); ctx.fillStyle = GOLD; ctx.fill();
    ctx.restore();
    void hash2; void hexToRgb;
  },
});
