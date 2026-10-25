// src/engine/styles/night-vision.js
import { still, hash2, clamp, TAU } from '../utils.js';
import { pixels, paintPixels, ramp, blurredL, label, vignette } from '../helpers.js';

const TINTS = {
  green: [[0, 12, 0], [14, 96, 22], [110, 232, 105], [226, 255, 214]],
  white: [[6, 8, 10], [70, 78, 84], [180, 190, 196], [250, 252, 252]],
};

export default still({
  id: 'night-vision',
  name: 'Night Vision',
  blurb: 'An image-intensifier view: green phosphor, amplified noise, a lens mask and a HUD.',
  maxSide: 1000,
  params: [
    { key: 'gain', label: 'Gain', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'noise', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'view', label: 'View', type: 'select', default: 'circle', options: [['circle', 'Monocular'], ['binocular', 'Binocular'], ['none', 'Full frame']] },
    { key: 'tint', label: 'Phosphor', type: 'select', default: 'green', options: [['green', 'Green'], ['white', 'White']] },
    { key: 'hud', label: 'HUD', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, bl = blurredL(cache, W, H, Math.max(2, Math.round(Math.min(W, H) / 60))), g = p.gain / 100, nz = p.noise / 100, u = Math.min(W, H) / 100;
    const stops = TINTS[p.tint] || TINTS.green, pw = 1 - g * 0.5, mul = 1 + g * 0.9;
    paintPixels(ctx, W, H, (x, y, o) => {
      const i = y * W + x;
      let v = Math.pow(L[i], pw) * mul + bl[i] * 0.35 * g;
      v += (hash2(x, y, 3) - 0.5) * nz * 0.55;
      if (nz > 0 && hash2(x, y, 41) > 1 - nz * 0.012) v += 0.55;   // bright speckle
      ramp(stops, clamp(v), o);
      if (y % 3 === 0) { o[0] *= 0.85; o[1] *= 0.85; o[2] *= 0.85; }
    });
    // lens mask
    if (p.view !== 'none') {
      const m = env.makeCanvas(W, H), mx = m.getContext('2d');
      mx.fillStyle = '#000'; mx.fillRect(0, 0, W, H); mx.globalCompositeOperation = 'destination-out'; mx.fillStyle = '#fff';
      const R = Math.min(W, H) * (p.view === 'circle' ? 0.46 : 0.36);
      if (p.view === 'circle') { mx.beginPath(); mx.arc(W / 2, H / 2, R, 0, TAU); mx.fill(); }
      else { const dx = Math.min(W * 0.17, R * 0.62); for (const s of [-1, 1]) { mx.beginPath(); mx.arc(W / 2 + s * dx, H / 2, R, 0, TAU); mx.fill(); } }
      ctx.drawImage(m, 0, 0);
      // soft rim inside the lens
      const rim = ctx.createRadialGradient(W / 2, H / 2, R * 0.6, W / 2, H / 2, R * 1.05);
      rim.addColorStop(0, 'rgba(0,10,0,0)'); rim.addColorStop(1, 'rgba(0,10,0,0.55)'); ctx.fillStyle = rim; ctx.fillRect(0, 0, W, H);
    } else vignette(ctx, W, H, 0.55, '0,10,0');
    if (p.hud) {
      const c = p.tint === 'white' ? '#e8f0f2' : '#9dff8f', f = `500 ${u * 2.3}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
      ctx.strokeStyle = c; ctx.globalAlpha = 0.85; ctx.lineWidth = Math.max(1, u * 0.25);
      const cx = W / 2, cy = H / 2, a = u * 3;
      ctx.beginPath(); ctx.moveTo(cx - a * 2, cy); ctx.lineTo(cx - a * 0.6, cy); ctx.moveTo(cx + a * 0.6, cy); ctx.lineTo(cx + a * 2, cy); ctx.moveTo(cx, cy - a * 2); ctx.lineTo(cx, cy - a * 0.6); ctx.moveTo(cx, cy + a * 0.6); ctx.lineTo(cx, cy + a * 2); ctx.stroke();
      label(ctx, `GAIN ${p.gain}%`, W * 0.08, H * 0.08, f, c, 'left'); label(ctx, 'NVG-3', W * 0.92, H * 0.08, f, c, 'right');
      label(ctx, 'IR ON', W * 0.08, H * 0.93, f, c, 'left'); label(ctx, 'BAT ▮▮▮▯', W * 0.92, H * 0.93, f, c, 'right');
      ctx.globalAlpha = 1;
    }
  },
});
