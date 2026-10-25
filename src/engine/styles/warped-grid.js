// src/engine/styles/warped-grid.js
import { still, clamp, lerp, smoothstep } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'warped-grid',
  name: 'Warped Grid',
  blurb: 'A plain grid, or a stack of horizontal ridges, pushed around by the light and shadow of your picture until the picture appears in the lines.',
  maxSide: 1100,
  params: [
    { key: 'mode', label: 'Pattern', type: 'select', default: 'grid', options: [['grid', 'Bent grid'], ['ridges', 'Ridges (hill lines)']] },
    { key: 'lines', label: 'Lines', type: 'range', min: 20, max: 140, step: 1, default: 56 },
    { key: 'warp', label: 'Strength', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'line', label: 'Line width', type: 'range', min: 0.4, max: 4, step: 0.1, default: 1.3, fmt: (v) => v.toFixed(1) },
    { key: 'up', label: 'Hills rise in', type: 'select', default: 'light', options: [['light', 'The light areas'], ['dark', 'The dark areas']] },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['mono', 'One colour']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'night', options: [['night', 'Night'], ['cream', 'Cream']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, night = p.paper === 'night', smp = sampler(cache, d, W, H, (p.mode === 'grid' ? 10 : 3) * sc), bgc = night ? '#0b0b10' : '#f3eddf';
    ctx.fillStyle = bgc; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const colour = (x, y, a) => {
      if (p.colour === 'mono') return night ? `rgba(238,234,222,${a})` : `rgba(28,26,32,${a})`;
      const c = smp.rgb(x, y), k = night ? 1.2 : 0.8; return `rgba(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0},${a})`;
    };
    const L = smp.L;
    if (p.mode === 'grid') {
      const n = p.lines, k = (p.warp / 100) * 90 * sc * 12;
      const disp = (x, y, out) => {
        const xi = clamp(x | 0, 2, W - 3), yi = clamp(y | 0, 2, H - 3), i = yi * W + xi;
        const gx = (L[i + 2] - L[i - 2]) / 4, gy = (L[i + 2 * W] - L[i - 2 * W]) / 4;
        out[0] = x - gx * k; out[1] = y - gy * k;
      };
      const q = [0, 0], step = 5 * sc;
      for (let dir = 0; dir < 2; dir++) {
        const cnt = dir ? Math.round(n * (W / H)) : n, span = dir ? W : H, len = dir ? H : W;
        for (let j = 0; j <= cnt; j++) {
          const base = (j / cnt) * span; let px = 0, py = 0, first = true;
          for (let s = 0; s <= len; s += step) {
            const x = dir ? base : s, y = dir ? s : base; disp(x, y, q);
            if (!first) {
              const tn = smp.tone((q[0] + px) / 2, (q[1] + py) / 2), heavy = night ? tn : 1 - tn;
              ctx.strokeStyle = colour((q[0] + px) / 2, (q[1] + py) / 2, 0.9); ctx.lineWidth = p.line * sc * (0.45 + 1.4 * heavy);
              ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(q[0], q[1]); ctx.stroke();
            }
            px = q[0]; py = q[1]; first = false;
          }
        }
      }
    } else {
      const n = p.lines, dy = (H * 0.9) / n, amp = (p.warp / 100) * dy * 5.2, top = H * 0.07, step = 3 * sc;
      for (let j = 0; j <= n; j++) {
        const y0 = top + j * dy, pts = [];
        for (let x = 0; x <= W + step; x += step) { const t = smp.tone(x, y0), v = p.up === 'light' ? t : 1 - t; pts.push([x, y0 - amp * Math.pow(v, 1.4) * (0.35 + 0.65 * smoothstep(0, 0.12, Math.min(x, W - x) / W))]); }
        ctx.beginPath(); ctx.moveTo(0, H + 4); for (const [x, y] of pts) ctx.lineTo(x, y); ctx.lineTo(W + step, H + 4); ctx.closePath(); ctx.fillStyle = bgc; ctx.fill();
        ctx.lineWidth = p.line * sc;
        for (let i = 1; i < pts.length; i++) { ctx.strokeStyle = colour(pts[i][0], y0, 0.95); ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
      }
    }
  },
});
