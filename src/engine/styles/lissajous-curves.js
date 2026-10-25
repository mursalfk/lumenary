// src/engine/styles/lissajous-curves.js
import { still, clamp, lerp, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'lissajous-curves',
  name: 'Lissajous Curves',
  blurb: 'The path of a point swinging sideways at one frequency and up and down at another. Ratios of whole numbers close into loops and knots.',
  maxSide: 1100,
  params: [
    { key: 'mode', label: 'Layout', type: 'select', default: 'knot', options: [['knot', 'One woven knot'], ['table', 'A table of ratios']] },
    { key: 'a', label: 'Horizontal frequency', type: 'range', min: 1, max: 14, step: 1, default: 7 },
    { key: 'b', label: 'Vertical frequency', type: 'range', min: 1, max: 14, step: 1, default: 9 },
    { key: 'phase', label: 'Phase', type: 'range', min: 0, max: 180, step: 1, default: 40, fmt: (v) => v + '°' },
    { key: 'ribbons', label: 'Ribbons', type: 'range', min: 1, max: 6, step: 1, default: 3 },
    { key: 'cells', label: 'Columns in the table', type: 'range', min: 3, max: 9, step: 1, default: 5 },
    { key: 'line', label: 'Line width', type: 'range', min: 0.5, max: 5, step: 0.1, default: 1.6, fmt: (v) => v.toFixed(1) },
    { key: 'paper', label: 'Paper', type: 'select', default: 'night', options: [['night', 'Night'], ['cream', 'Cream']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, night = p.paper === 'night', smp = sampler(cache, d, W, H, (p.mode === 'knot' ? 4 : 22) * sc);
    ctx.fillStyle = night ? '#0c0c12' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const col = (c, a) => { const k = night ? 1.0 : 0.82, o = night ? 70 : 0; return `rgba(${Math.min(255, c[0] * k + o) | 0},${Math.min(255, c[1] * k + o) | 0},${Math.min(255, c[2] * k + o) | 0},${a})`; };
    const ph = (p.phase * Math.PI) / 180;
    if (p.mode === 'knot') {
      const steps = 2600, ax = W * 0.47, ay = H * 0.47;
      for (let k = 0; k < p.ribbons; k++) {
        const phk = ph + k * 0.22; let px = 0, py = 0;
        for (let n = 0; n <= steps; n++) {
          const t = (n / steps) * TAU, x = W / 2 + Math.sin(p.a * t + phk) * ax, y = H / 2 + Math.sin(p.b * t) * ay;
          if (n) {
            const c = smp.rgb((x + px) / 2, (y + py) / 2), tn = smp.tone((x + px) / 2, (y + py) / 2), heavy = night ? tn : 1 - tn;
            ctx.strokeStyle = col(c, 0.78); ctx.lineWidth = p.line * sc * (0.5 + 1.5 * heavy) * (1 - k * 0.1);
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          }
          px = x; py = y;
        }
      }
    } else {
      const cols = p.cells, cs = W / cols, rows = Math.ceil(H / cs);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const cx = (i + 0.5) * cs, cy = (j + 0.5) * cs, fa = i + 1, fb = j + 1, c = smp.rgb(cx, cy), tn = smp.tone(cx, cy), heavy = night ? tn : 1 - tn, R = cs * 0.42 * (0.55 + 0.45 * Math.sqrt(0.2 + heavy));
        ctx.strokeStyle = col(c, 0.9); ctx.lineWidth = p.line * sc * (0.6 + 1.2 * heavy);
        ctx.beginPath();
        const steps = 360;
        for (let n = 0; n <= steps; n++) { const t = (n / steps) * TAU, x = cx + Math.sin(fa * t + ph) * R, y = cy + Math.sin(fb * t) * R; if (n) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.stroke();
      }
    }
  },
});
