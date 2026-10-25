// src/engine/styles/spirograph.js
import { still, rng, clamp, lerp, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

const RATIOS = [[2, 5], [3, 7], [3, 8], [4, 9], [3, 5], [4, 11], [2, 7], [5, 13], [5, 8], [3, 11], [5, 12], [4, 7]];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export default still({
  id: 'spirograph',
  name: 'Spirograph',
  blurb: 'A small wheel rolling inside a larger ring, with a pen through one of its holes. The picture colours every line.',
  maxSide: 1100,
  params: [
    { key: 'mode', label: 'Layout', type: 'select', default: 'rosettes', options: [['rosettes', 'A rosette in every cell'], ['one', 'One long curve']] },
    { key: 'cells', label: 'Rosettes across', type: 'range', min: 3, max: 16, step: 1, default: 11 },
    { key: 'teeth', label: 'Gear teeth (ring has 144)', type: 'range', min: 21, max: 131, step: 1, default: 59 },
    { key: 'hole', label: 'Pen hole', type: 'range', min: 20, max: 140, step: 1, default: 80 },
    { key: 'line', label: 'Line width', type: 'range', min: 0.4, max: 3, step: 0.1, default: 1, fmt: (v) => v.toFixed(1) },
    { key: 'size', label: 'Size follows the picture', type: 'toggle', default: true },
    { key: 'paper', label: 'Paper', type: 'select', default: 'night', options: [['night', 'Night'], ['cream', 'Cream']] },
    { key: 'seed', label: 'New wheels', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, r = rng(p.seed * 29 + 5), night = p.paper === 'night';
    ctx.fillStyle = night ? '#0d0d12' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const colour = (c, t) => {
      const k = night ? 1.12 : 0.8, m = night ? 0.1 : 0;
      return `rgba(${Math.min(255, c[0] * k + m * 255) | 0},${Math.min(255, c[1] * k + m * 255) | 0},${Math.min(255, c[2] * k + m * 255) | 0},${t})`;
    };
    if (p.mode === 'rosettes') {
      const cs = W / p.cells, smp = sampler(cache, d, W, H, cs * 0.3), rows = Math.ceil(H / cs);
      for (let j = 0; j < rows; j++) for (let i = 0; i < p.cells; i++) {
        const cx = (i + 0.5) * cs, cy = (j + 0.5) * cs, tone = smp.tone(cx, cy), c = smp.rgb(cx, cy);
        const [a, b] = RATIOS[(r() * RATIOS.length) | 0], k = a / b, hole = k * lerp(0.45, 1.35, r());
        const f = p.size ? (night ? 0.42 + 0.58 * tone : 0.42 + 0.58 * (1 - tone)) : 1, ext = (1 - k) + hole, R = cs * 0.5 * f / ext, turns = b, steps = turns * 160;
        ctx.strokeStyle = colour(c, 0.82); ctx.lineWidth = p.line * sc * (0.7 + 0.6 * f);
        ctx.beginPath();
        for (let n = 0; n <= steps; n++) {
          const t = (n / steps) * TAU * turns, x = (1 - k) * Math.cos(t) + hole * Math.cos(((1 - k) / k) * t), y = (1 - k) * Math.sin(t) - hole * Math.sin(((1 - k) / k) * t);
          if (n) ctx.lineTo(cx + x * R, cy + y * R); else ctx.moveTo(cx + x * R, cy + y * R);
        }
        ctx.stroke();
      }
    } else {
      const smp = sampler(cache, d, W, H, 3 * sc), ring = 144, teeth = p.teeth, k = teeth / ring, q = ring / gcd(teeth, ring), hole = k * (p.hole / 100) * 1.6, ext = (1 - k) + hole, steps = q * 220;
      ctx.lineWidth = p.line * sc * 0.8;
      let px = 0, py = 0;
      for (let n = 0; n <= steps; n++) {
        const t = (n / steps) * TAU * q, X = (1 - k) * Math.cos(t) + hole * Math.cos(((1 - k) / k) * t), Y = (1 - k) * Math.sin(t) - hole * Math.sin(((1 - k) / k) * t);
        const x = W / 2 + (X / ext) * (W / 2) * 0.985, y = H / 2 + (Y / ext) * (H / 2) * 0.985;
        if (n) { const c = smp.rgb((x + px) / 2, (y + py) / 2); ctx.strokeStyle = colour(c, 0.62); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); }
        px = x; py = y;
      }
    }
  },
});
