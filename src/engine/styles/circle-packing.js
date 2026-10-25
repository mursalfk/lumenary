// src/engine/styles/circle-packing.js
import { still, rng, clamp, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'circle-packing',
  name: 'Circle Packing',
  blurb: 'Circles that never overlap, each as large as the room allows. The picture decides how big they may grow and what colour they take.',
  maxSide: 1000,
  params: [
    { key: 'max', label: 'Largest circle', type: 'range', min: 14, max: 120, step: 1, default: 46 },
    { key: 'min', label: 'Smallest circle', type: 'range', min: 1.5, max: 10, step: 0.5, default: 3, fmt: (v) => v.toFixed(1) },
    { key: 'gap', label: 'Space between', type: 'range', min: 0, max: 6, step: 0.5, default: 1.5, fmt: (v) => v.toFixed(1) },
    { key: 'size', label: 'Size follows the picture', type: 'select', default: 'dark', options: [['dark', 'Darker is larger'], ['light', 'Lighter is larger'], ['none', 'Not at all']] },
    { key: 'look', label: 'Circles as', type: 'select', default: 'glossy', options: [['flat', 'Flat discs'], ['glossy', 'Glossy beads'], ['ring', 'Rings']] },
    { key: 'back', label: 'Behind', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['night', 'Night']] },
    { key: 'seed', label: 'Pack again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, r = rng(p.seed * 19 + 5), rmax = p.max * sc, rmin = Math.min(p.min * sc, rmax * 0.5), gap = p.gap * sc;
    const smp = sampler(cache, d, W, H, 3 * sc), night = p.back === 'night';
    ctx.fillStyle = night ? '#0c0c11' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    const cs = rmax * 2 + gap, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1, cells = Array.from({ length: gw * gh }, () => []);
    const cx = [], cy = [], cr = [];
    const attempts = Math.round(Math.min(260000, (W * H) / (rmin * rmin) * 0.16 + 40000));
    for (let a = 0; a < attempts; a++) {
      const x = r() * W, y = r() * H;
      let want = rmax;
      if (p.size !== 'none') { const t = smp.tone(x, y), f = p.size === 'dark' ? 1 - t : t; want = lerp(rmin * 1.6, rmax, Math.pow(f, 0.9)); }
      let allow = Math.min(want, x, W - x, y, H - y);
      if (allow < rmin) continue;
      const gx = (x / cs) | 0, gy = (y / cs) | 0;
      for (let j = Math.max(0, gy - 1); j <= Math.min(gh - 1, gy + 1) && allow >= rmin; j++) for (let i = Math.max(0, gx - 1); i <= Math.min(gw - 1, gx + 1); i++) {
        for (const k of cells[j * gw + i]) { const dd = Math.hypot(cx[k] - x, cy[k] - y) - cr[k] - gap; if (dd < allow) allow = dd; }
        if (allow < rmin) break;
      }
      if (allow < rmin) continue;
      const id = cx.length; cx.push(x); cy.push(y); cr.push(allow); cells[gy * gw + gx].push(id);
    }
    for (let i = 0; i < cx.length; i++) {
      const x = cx[i], y = cy[i], rr = cr[i], c = smp.rgb(x, y), R = c[0] | 0, G = c[1] | 0, B = c[2] | 0;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2);
      if (p.look === 'ring') { ctx.strokeStyle = `rgb(${R},${G},${B})`; ctx.lineWidth = Math.max(1, rr * 0.28); ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, rr - ctx.lineWidth / 2), 0, Math.PI * 2); ctx.stroke(); }
      else if (p.look === 'glossy' && rr > 3) {
        const g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.38, rr * 0.05, x, y, rr);
        g.addColorStop(0, `rgb(${Math.min(255, R * 1.4 + 50) | 0},${Math.min(255, G * 1.4 + 50) | 0},${Math.min(255, B * 1.4 + 50) | 0})`); g.addColorStop(0.5, `rgb(${R},${G},${B})`); g.addColorStop(1, `rgb(${R * 0.62 | 0},${G * 0.62 | 0},${B * 0.62 | 0})`);
        ctx.fillStyle = g; ctx.fill();
      } else { ctx.fillStyle = `rgb(${R},${G},${B})`; ctx.fill(); }
    }
  },
});
