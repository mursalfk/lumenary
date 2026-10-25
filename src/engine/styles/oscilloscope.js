// src/engine/styles/oscilloscope.js
import { still, rng, boxBlur, TAU } from '../utils.js';
import { pixels, label, rrPath } from '../helpers.js';

const PHOSPHOR = { green: ['#6dff8a', '#04100a', 'rgba(80,255,140,0.16)'], amber: ['#ffb43a', '#120a02', 'rgba(255,170,60,0.16)'], cyan: ['#6fe8ff', '#020d12', 'rgba(90,220,255,0.16)'], white: ['#f2f6f4', '#080a0a', 'rgba(230,240,240,0.14)'] };

export default still({
  id: 'oscilloscope',
  name: 'Oscilloscope',
  blurb: 'Your picture drawn as stacked phosphor waveforms on a graticule, brighter pixels, taller peaks.',
  maxSide: 1000,
  params: [
    { key: 'lines', label: 'Traces', type: 'range', min: 20, max: 130, step: 1, default: 62 },
    { key: 'amp', label: 'Amplitude', type: 'range', min: 10, max: 100, step: 1, default: 62 },
    { key: 'phosphor', label: 'Phosphor', type: 'select', default: 'green', options: [['green', 'Green'], ['amber', 'Amber'], ['cyan', 'Cyan'], ['white', 'White']] },
    { key: 'hidden', label: 'Hide lines behind', type: 'toggle', default: true },
    { key: 'grid', label: 'Graticule', type: 'toggle', default: true },
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 55 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const [fg, bg, gridCol] = PHOSPHOR[p.phosphor] || PHOSPHOR.green, u = Math.min(W, H) / 100, Ls = boxBlur(cache.L, W, H, 1);
    ctx.fillStyle = '#0a0b0a'; ctx.fillRect(0, 0, W, H);
    const m = u * 6, sx = m, sy = m * 1.5, sw = W - m * 2, sh = H - m * 3.1;
    ctx.save(); ctx.beginPath(); rrPath(ctx, sx, sy, sw, sh, u * 3); ctx.clip();
    ctx.fillStyle = bg; ctx.fillRect(sx, sy, sw, sh);
    if (p.grid) {
      ctx.strokeStyle = gridCol; ctx.lineWidth = Math.max(1, u * 0.18); ctx.beginPath();
      for (let i = 1; i < 8; i++) { const x = sx + (sw * i) / 8; ctx.moveTo(x, sy); ctx.lineTo(x, sy + sh); }
      for (let j = 1; j < 10; j++) { const y = sy + (sh * j) / 10; ctx.moveTo(sx, y); ctx.lineTo(sx + sw, y); }
      ctx.stroke(); ctx.lineWidth = Math.max(1, u * 0.3); ctx.globalAlpha = 2; ctx.beginPath(); ctx.moveTo(sx + sw / 2, sy); ctx.lineTo(sx + sw / 2, sy + sh); ctx.moveTo(sx, sy + sh / 2); ctx.lineTo(sx + sw, sy + sh / 2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(1, u * 0.2); ctx.beginPath();   // minor ticks on the centre axes
      for (let i = 0; i <= 40; i++) { const x = sx + (sw * i) / 40, y = sy + sh / 2; ctx.moveTo(x, y - u * 0.6); ctx.lineTo(x, y + u * 0.6); }
      for (let j = 0; j <= 50; j++) { const y = sy + (sh * j) / 50, x = sx + sw / 2; ctx.moveTo(x - u * 0.6, y); ctx.lineTo(x + u * 0.6, y); }
      ctx.stroke();
    }
    // waveforms: back (top) to front (bottom), each one fills below itself to hide the ones behind
    const n = p.lines, step = sh / (n + 1.5), amp = step * (1.2 + (p.amp / 100) * 4.2), pts = 120;
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1.2, u * 0.34); ctx.strokeStyle = fg;
    for (let i = 0; i < n; i++) {
      const yb = sy + step * (i + 1.5), row = Math.min(H - 1, Math.max(0, Math.round(((yb - sy) / sh) * H)));
      ctx.beginPath();
      for (let k = 0; k <= pts; k++) {
        const t = k / pts, ix = Math.min(W - 1, Math.round(t * (W - 1))), v = Ls[row * W + ix];
        const edge = Math.min(1, Math.min(t, 1 - t) * 14);   // flatten the ends so lines meet the frame
        const x = sx + t * sw, y = yb - Math.pow(v, 1.5) * amp * edge;
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      if (p.hidden) { ctx.save(); ctx.lineTo(sx + sw, sy + sh + 4); ctx.lineTo(sx, sy + sh + 4); ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
        // stroke the top edge only
        ctx.beginPath();
        for (let k = 0; k <= pts; k++) { const t = k / pts, ix = Math.min(W - 1, Math.round(t * (W - 1))), v = Ls[row * W + ix], edge = Math.min(1, Math.min(t, 1 - t) * 14), x = sx + t * sw, y = yb - Math.pow(v, 1.5) * amp * edge; if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } }
      ctx.stroke();
    }
    // glow
    if (p.glow > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (const div of [3, 8]) { const s = env.makeCanvas(Math.max(2, (W / div) | 0), Math.max(2, (H / div) | 0)); s.getContext('2d').drawImage(ctx.canvas, 0, 0, s.width, s.height); ctx.globalAlpha = (p.glow / 100) * 0.55; ctx.drawImage(s, 0, 0, W, H); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    ctx.lineWidth = u * 0.8; ctx.strokeStyle = '#000'; ctx.beginPath(); rrPath(ctx, sx, sy, sw, sh, u * 3); ctx.stroke();
    const f = `500 ${u * 2.3}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
    label(ctx, 'CH1  2.00 V', sx, sy - m * 0.55, f, fg, 'left'); label(ctx, 'LUMENARY-2000', sx + sw, sy - m * 0.55, f, fg, 'right');
    label(ctx, 'M 5.00 ms', sx, sy + sh + m * 0.9, f, fg, 'left'); label(ctx, 'AUTO  ↑  1.0 kHz', sx + sw, sy + sh + m * 0.9, f, fg, 'right');
  },
});
