// src/engine/styles/poisson-stippling.js
import { still, rng, clamp, lerp, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'poisson-stippling',
  name: 'Poisson Stippling',
  blurb: 'Dots placed no closer than a set distance, the distance shrinking in the shadows. The result is even in texture and dense where it is dark.',
  maxSide: 1000,
  params: [
    { key: 'fine', label: 'Finest spacing', type: 'range', min: 1.5, max: 8, step: 0.1, default: 3, fmt: (v) => v.toFixed(1) },
    { key: 'range', label: 'Spacing in the lights', type: 'range', min: 2, max: 10, step: 0.5, default: 5, fmt: (v) => v.toFixed(1) + 'x' },
    { key: 'gamma', label: 'Contrast', type: 'range', min: 40, max: 200, step: 1, default: 100 },
    { key: 'dot', label: 'Dot size', type: 'range', min: 15, max: 70, step: 1, default: 38, fmt: (v) => v + '%' },
    { key: 'colour', label: 'Ink', type: 'select', default: 'ink', options: [['ink', 'Black ink'], ['sepia', 'Sepia'], ['picture', 'Colours of the picture']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['night', 'Night']] },
    { key: 'seed', label: 'Scatter again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, night = p.paper === 'night', smp = sampler(cache, d, W, H, 2 * sc);
    const key = [p.fine, p.range, p.gamma, p.seed, p.paper, W].join('|');
    if (cache.key !== key) {
      const rand = rng(p.seed * 47 + 9), rmin = p.fine * sc, rmax = rmin * p.range, g = p.gamma / 100, cs = rmax, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1, cells = Array.from({ length: gw * gh }, () => []);
      const px = [], py = [], pr = [], attempts = Math.min(900000, Math.round((W * H) / (rmin * rmin) * 4.5));
      for (let a = 0; a < attempts; a++) {
        const x = rand() * W, y = rand() * H, t = smp.tone(x, y), heavy = night ? t : 1 - t, rad = lerp(rmax, rmin, Math.pow(clamp(heavy), g));
        const cx = (x / cs) | 0, cy = (y / cs) | 0; let ok = true;
        for (let j = Math.max(0, cy - 1); j <= Math.min(gh - 1, cy + 1) && ok; j++) for (let i = Math.max(0, cx - 1); i <= Math.min(gw - 1, cx + 1) && ok; i++) {
          for (const k of cells[j * gw + i]) { const dx = px[k] - x, dy = py[k] - y, m = (rad + pr[k]) / 2; if (dx * dx + dy * dy < m * m) { ok = false; break; } }
        }
        if (!ok) continue;
        cells[cy * gw + cx].push(px.length); px.push(x); py.push(y); pr.push(rad);
      }
      cache.px = px; cache.py = py; cache.pr = pr; cache.key = key;
    }
    const { px, py, pr } = cache;
    ctx.fillStyle = night ? '#0b0b10' : '#f4efe3'; ctx.fillRect(0, 0, W, H);
    const k = p.dot / 100, rminPx = p.fine * sc, rmaxPx = rminPx * p.range;
    for (let i = 0; i < px.length; i++) {
      const heavyAt = clamp((rmaxPx - pr[i]) / (rmaxPx - rminPx + 1e-6)), rr = Math.max(0.7 * sc, pr[i] * k * (1 + 0.95 * heavyAt * heavyAt));
      if (p.colour === 'picture') { const c = smp.rgb(px[i], py[i]), m = night ? 1.2 : 0.78; ctx.fillStyle = `rgb(${Math.min(255, c[0] * m) | 0},${Math.min(255, c[1] * m) | 0},${Math.min(255, c[2] * m) | 0})`; }
      else ctx.fillStyle = night ? '#efe9da' : p.colour === 'sepia' ? '#4a2f1c' : '#1b1a1f';
      ctx.beginPath(); ctx.arc(px[i], py[i], rr, 0, TAU); ctx.fill();
    }
  },
});
