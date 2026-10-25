// src/engine/styles/contour-lines.js
import { still, clamp, lerp } from '../utils.js';
import { pixels, sampler, marching, chainSegments, ramp } from '../helpers.js';

const TINT = [[58, 96, 74], [120, 142, 88], [196, 188, 120], [190, 148, 96], [140, 104, 84], [244, 240, 232]];

export default still({
  id: 'contour-lines',
  name: 'Contour Lines',
  blurb: 'Your picture read as a landscape, with brightness for height. Every line joins points of equal height, as on a survey map.',
  maxSide: 1100,
  params: [
    { key: 'levels', label: 'Heights', type: 'range', min: 5, max: 50, step: 1, default: 22 },
    { key: 'smooth', label: 'Smoothing', type: 'range', min: 1, max: 16, step: 0.5, default: 5, fmt: (v) => v.toFixed(1) },
    { key: 'line', label: 'Line width', type: 'range', min: 0.3, max: 3, step: 0.1, default: 1, fmt: (v) => v.toFixed(1) },
    { key: 'index', label: 'Heavier line every', type: 'range', min: 0, max: 10, step: 1, default: 5, fmt: (v) => (v ? v + 'th' : 'never') },
    { key: 'fill', label: 'Between the lines', type: 'select', default: 'tint', options: [['none', 'Plain paper'], ['tint', 'Map tints'], ['picture', 'Colours of the picture']] },
    { key: 'ink', label: 'Lines', type: 'select', default: 'brown', options: [['brown', 'Brown'], ['ink', 'Black'], ['picture', 'Colours of the picture']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, N = W * H, smp = sampler(cache, d, W, H, p.smooth * sc), F = smp.L, n = p.levels, ch = smp.ch;
    const out = ctx.createImageData(W, H), o4 = out.data, rgb = [0, 0, 0];
    for (let i = 0; i < N; i++) {
      const o = i * 4; let R = 244, G = 239, B = 226;
      if (p.fill !== 'none') {
        const band = (Math.floor(F[i] * n) + 0.5) / n;
        if (p.fill === 'tint') { ramp(TINT, band, rgb); R = rgb[0]; G = rgb[1]; B = rgb[2]; }
        else { const k = (0.55 + 0.6 * band) / (0.55 + 0.6 * F[i] + 1e-3); R = ch[0][i] * k * 0.92 + 14; G = ch[1][i] * k * 0.92 + 14; B = ch[2][i] * k * 0.92 + 14; }
        R = lerp(244, R, 0.8); G = lerp(239, G, 0.8); B = lerp(226, B, 0.8);
      }
      o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const step = Math.max(1, Math.round(1.5 * sc));
    for (let k = 1; k < n; k++) {
      const lines = chainSegments(marching(F, W, H, k / n, step)), heavy = p.index > 0 && k % p.index === 0;
      ctx.lineWidth = p.line * sc * (heavy ? 1.9 : 1);
      for (const ln of lines) {
        if (ln.length < 3) continue;
        if (p.ink === 'picture') { const m = ln[ln.length >> 1], c = smp.rgb(m[0], m[1]); ctx.strokeStyle = `rgb(${c[0] * 0.55 | 0},${c[1] * 0.55 | 0},${c[2] * 0.55 | 0})`; }
        else ctx.strokeStyle = p.ink === 'ink' ? 'rgba(24,22,28,0.9)' : heavy ? 'rgba(98,62,34,0.95)' : 'rgba(124,84,50,0.85)';
        ctx.beginPath(); ctx.moveTo(ln[0][0], ln[0][1]);
        for (let i = 1; i < ln.length - 1; i++) ctx.quadraticCurveTo(ln[i][0], ln[i][1], (ln[i][0] + ln[i + 1][0]) / 2, (ln[i][1] + ln[i + 1][1]) / 2);
        ctx.lineTo(ln[ln.length - 1][0], ln[ln.length - 1][1]); ctx.stroke();
      }
    }
  },
});
