// src/engine/styles/phyllotaxis.js
import { still, clamp, lerp, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'phyllotaxis',
  name: 'Phyllotaxis',
  blurb: 'The pattern of a sunflower head: each seed sits a golden angle round from the last, and spirals appear in both directions.',
  maxSide: 1100,
  params: [
    { key: 'dots', label: 'Seeds', type: 'range', min: 500, max: 18000, step: 100, default: 7000 },
    { key: 'angle', label: 'Turn between seeds', type: 'range', min: 130, max: 145, step: 0.01, default: 137.51, fmt: (v) => v.toFixed(2) + '°' },
    { key: 'size', label: 'Seed size', type: 'range', min: 20, max: 120, step: 1, default: 70, fmt: (v) => v + '%' },
    { key: 'follow', label: 'Size follows the picture', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'shape', label: 'Seed shape', type: 'select', default: 'disc', options: [['disc', 'Disc'], ['petal', 'Petal'], ['square', 'Square']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'night', options: [['night', 'Night'], ['cream', 'Cream']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, night = p.paper === 'night', n = p.dots, golden = (p.angle * Math.PI) / 180;
    const R = Math.hypot(W, H) / 2 * 1.02, c = R / Math.sqrt(n), spacing = c * Math.sqrt(Math.PI), smp = sampler(cache, d, W, H, Math.max(1.5, spacing * 0.6));
    ctx.fillStyle = night ? '#0b0b10' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    const fol = p.follow / 100;
    for (let i = 0; i < n; i++) {
      const a = i * golden, rad = c * Math.sqrt(i + 0.5), x = W / 2 + Math.cos(a) * rad, y = H / 2 + Math.sin(a) * rad;
      if (x < -spacing || y < -spacing || x > W + spacing || y > H + spacing) continue;
      const tn = smp.tone(x, y), heavy = night ? tn : 1 - tn, f = lerp(1, 0.15 + 1.0 * heavy, fol), rr = spacing * 0.5 * (p.size / 100) * 1.35 * f;
      if (rr < 0.35) continue;
      const col = smp.rgb(x, y), k = night ? 1.15 : 0.85;
      ctx.fillStyle = `rgb(${Math.min(255, col[0] * k) | 0},${Math.min(255, col[1] * k) | 0},${Math.min(255, col[2] * k) | 0})`;
      ctx.beginPath();
      if (p.shape === 'disc') ctx.arc(x, y, rr, 0, TAU);
      else if (p.shape === 'square') { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.rect(-rr, -rr, rr * 2, rr * 2); ctx.restore(); }
      else { ctx.ellipse(x, y, rr * 1.5, rr * 0.7, a, 0, TAU); }
      ctx.fill();
    }
  },
});
