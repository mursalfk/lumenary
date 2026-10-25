// src/engine/styles/hilbert-curve.js
import { still, clamp, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

// Position of step d along a Hilbert curve of side n (a power of two).
function d2xy(n, d) {
  let x = 0, y = 0, t = d;
  for (let s = 1; s < n; s *= 2) {
    const rx = 1 & (t >> 1), ry = 1 & (t ^ rx);
    if (ry === 0) { if (rx === 1) { x = s - 1 - x; y = s - 1 - y; } const tmp = x; x = y; y = tmp; }
    x += s * rx; y += s * ry; t >>= 2;
  }
  return [x, y];
}

export default still({
  id: 'hilbert-curve',
  name: 'Hilbert Curve',
  blurb: 'One unbroken line that visits every cell of a square grid and never crosses itself. Each turn of the line takes the colour beneath it.',
  maxSide: 1100,
  params: [
    { key: 'order', label: 'Order', type: 'range', min: 3, max: 8, step: 1, default: 6 },
    { key: 'line', label: 'Line weight', type: 'range', min: 0.2, max: 1.2, step: 0.02, default: 0.62, fmt: (v) => v.toFixed(2) },
    { key: 'follow', label: 'Weight follows the picture', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'cap', label: 'Corners', type: 'select', default: 'round', options: [['round', 'Round'], ['butt', 'Square']] },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ink', 'One ink']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'night', options: [['night', 'Night'], ['cream', 'Cream']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, n = 1 << p.order, night = p.paper === 'night', cw = W / n, ch = H / n;
    const smp = sampler(cache, d, W, H, Math.max(1.5, Math.min(cw, ch) * 0.6));
    ctx.fillStyle = night ? '#0b0b10' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = p.cap; ctx.lineJoin = p.cap === 'round' ? 'round' : 'miter';
    const total = n * n, f = p.follow / 100; let px = 0, py = 0;
    for (let i = 0; i < total; i++) {
      const [gx, gy] = d2xy(n, i), x = (gx + 0.5) * cw, y = (gy + 0.5) * ch;
      if (i) {
        const mx = (x + px) / 2, my = (y + py) / 2, tn = smp.tone(mx, my), heavy = night ? tn : 1 - tn;
        ctx.lineWidth = Math.min(cw, ch) * p.line * lerp(1, 0.2 + 1.1 * heavy, f);
        if (p.colour === 'ink') ctx.strokeStyle = night ? '#ece8dc' : '#1c1a20';
        else { const c = smp.rgb(mx, my), k = night ? 1.15 : 0.82; ctx.strokeStyle = `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`; }
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      }
      px = x; py = y;
    }
  },
});
