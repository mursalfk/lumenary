// src/engine/styles/vaporwave.js
import { still, rng, TAU, hexToRgb } from '../utils.js';
import { pixels, paintPixels, ramp, label } from '../helpers.js';

const STOPS = [[22, 8, 60], [120, 40, 190], [255, 80, 215], [60, 232, 255], [255, 241, 251]];
// Latin letters as full-width forms, so "AESTHETIC" -> "ＡＥＳＴＨＥＴＩＣ"
const wide = (s) => s.replace(/[A-Za-z0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));

export default still({
  id: 'vaporwave',
  name: 'Vaporwave',
  blurb: 'Pink and cyan dusk, a striped sun, a perspective grid and wide-set type.',
  maxSide: 1000,
  params: [
    { key: 'sun', label: 'Striped sun', type: 'toggle', default: true },
    { key: 'grid', label: 'Floor grid', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'shift', label: 'Colour shift', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'scan', label: 'Scanlines', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'text', label: 'Caption', type: 'text', default: 'AESTHETIC', max: 12 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, u = Math.min(W, H) / 100, sh = Math.round(p.shift / 100 * u * 1.1);
    paintPixels(ctx, W, H, (x, y, o) => {
      // chromatic offset: red from the left neighbour, blue from the right
      const a = L[y * W + Math.max(0, x - sh)], b = L[y * W + Math.min(W - 1, x + sh)], c = L[y * W + x];
      ramp(STOPS, c, o);
      if (sh) { const ra = ramp(STOPS, a, [0, 0, 0]), rb = ramp(STOPS, b, [0, 0, 0]); o[0] = ra[0]; o[2] = rb[2]; }
    });
    const horizon = H * 0.68;
    if (p.sun) {
      const sx = W / 2, sy = H * 0.36, sr = u * 20;
      ctx.save();
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.clip();
      const g = ctx.createLinearGradient(0, sy - sr, 0, sy + sr);
      g.addColorStop(0, 'rgba(255,230,90,0.9)'); g.addColorStop(0.55, 'rgba(255,90,170,0.9)'); g.addColorStop(1, 'rgba(160,60,255,0.9)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 6; i++) { const y = sy + sr * (0.0 + i * 0.17), hgt = u * (0.4 + i * 0.35); ctx.fillStyle = '#000'; ctx.fillRect(sx - sr, y, sr * 2, hgt); }
      ctx.restore();
    }
    // floor
    if (p.grid > 0) {
      const a = p.grid / 100;
      const fg = ctx.createLinearGradient(0, horizon, 0, H);
      fg.addColorStop(0, `rgba(30,6,70,${0.55 * a + 0.2})`); fg.addColorStop(1, `rgba(12,2,40,${0.8 * a + 0.15})`);
      ctx.fillStyle = fg; ctx.fillRect(0, horizon, W, H - horizon);
      ctx.strokeStyle = '#3ce8ff'; ctx.shadowColor = '#3ce8ff'; ctx.shadowBlur = u * 0.8; ctx.lineWidth = Math.max(1, u * 0.18); ctx.globalAlpha = 0.9 * a + 0.1;
      const vx = W / 2;
      ctx.beginPath();
      for (let i = -14; i <= 14; i++) { ctx.moveTo(vx, horizon); ctx.lineTo(vx + i * W * 0.12, H); }
      for (let k = 1; k < 14; k++) { const t = Math.pow(k / 14, 2.1), y = horizon + (H - horizon) * t; ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      ctx.fillStyle = '#ff5fd7'; ctx.fillRect(0, horizon - 1, W, Math.max(2, u * 0.3));
    }
    if (p.scan > 0) { ctx.fillStyle = `rgba(0,0,0,${0.28 * p.scan / 100})`; for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1); }
    if (p.text) {
      ctx.save(); ctx.shadowColor = '#ff5fd7'; ctx.shadowBlur = u * 1.6;
      label(ctx, wide(p.text.toUpperCase()), W / 2, H * 0.1, `400 ${u * 4.4}px "Hanken Grotesk", sans-serif`, '#fff1fb');
      ctx.restore();
    }
  },
});
