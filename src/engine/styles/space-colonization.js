// src/engine/styles/space-colonization.js
import { still, rng, clamp, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'space-colonization',
  name: 'Space Colonization',
  blurb: 'A scatter of seeds of food, and a branch that grows toward whichever ones are closest. When a branch reaches a seed, the seed is eaten. Trees and leaf veins grow this way.',
  maxSide: 1000,
  params: [
    { key: 'density', label: 'Food', type: 'range', min: 20, max: 150, step: 1, default: 60 },
    { key: 'reach', label: 'How far a branch can sense', type: 'range', min: 5, max: 40, step: 1, default: 9, fmt: (v) => v + '%' },
    { key: 'step', label: 'Growth step', type: 'range', min: 2, max: 9, step: 0.5, default: 5, fmt: (v) => v.toFixed(1) },
    { key: 'follow', label: 'Picture decides where food is', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'root', label: 'Roots', type: 'select', default: 'centre', options: [['bottom', 'Along the bottom'], ['centre', 'One in the middle'], ['edges', 'All round the edge']] },
    { key: 'thick', label: 'Trunk thickness', type: 'range', min: 1, max: 14, step: 0.5, default: 6, fmt: (v) => v.toFixed(1) },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['night', 'Night']] },
    { key: 'seed', label: 'Grow again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, night = p.paper === 'night', smp = sampler(cache, d, W, H, 5 * sc);
    const key = [p.density, p.reach, p.step, p.follow, p.root, p.seed, p.paper, W].join('|');
    if (cache.key !== key) {
      const rand = rng(p.seed * 59 + 3), D = p.step * sc, dI = (p.reach / 100) * W, dk = D * 2.4, na = p.density * 90, follow = p.follow / 100;
      const ax = [], ay = [];
      for (let t = 0; t < na * 40 && ax.length < na; t++) {
        const x = rand() * W, y = rand() * H, tone = smp.tone(x, y), heavy = night ? tone : 1 - tone;
        if (rand() < lerp(1, 0.03 + 0.97 * Math.pow(heavy, 1.4), follow)) { ax.push(x); ay.push(y); }
      }
      const nx = [], ny = [], par = [];
      const root = (x, y) => { nx.push(x); ny.push(y); par.push(-1); };
      if (p.root === 'bottom') for (let i = 0; i < 6; i++) root(((i + 0.5) / 6) * W, H - 2);
      else if (p.root === 'centre') root(W / 2, H / 2);
      else for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, e = Math.min(W, H) * 0.49; root(W / 2 + Math.cos(a) * W * 0.49, H / 2 + Math.sin(a) * H * 0.49); }
      const cs = dI, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1, grid = Array.from({ length: gw * gh }, () => []);
      for (let i = 0; i < nx.length; i++) grid[((ny[i] / cs) | 0) * gw + ((nx[i] / cs) | 0)].push(i);
      let alive = ax.map((_, i) => i);
      for (let it = 0; it < 900 && alive.length && nx.length < 40000; it++) {
        const sx = new Map(), sy = new Map(), keep = [];
        for (const a of alive) {
          const x = ax[a], y = ay[a], cx = (x / cs) | 0, cy = (y / cs) | 0; let best = -1, bd = dI * dI;
          for (let j = Math.max(0, cy - 1); j <= Math.min(gh - 1, cy + 1); j++) for (let i = Math.max(0, cx - 1); i <= Math.min(gw - 1, cx + 1); i++) for (const k of grid[j * gw + i]) { const dd = (nx[k] - x) ** 2 + (ny[k] - y) ** 2; if (dd < bd) { bd = dd; best = k; } }
          if (best < 0) { keep.push(a); continue; }
          if (bd < dk * dk) continue;
          const dist = Math.sqrt(bd); sx.set(best, (sx.get(best) || 0) + (x - nx[best]) / dist); sy.set(best, (sy.get(best) || 0) + (y - ny[best]) / dist); keep.push(a);
        }
        if (!sx.size) break;
        for (const [k, vx] of sx) {
          const vy = sy.get(k), l = Math.hypot(vx, vy) + 1e-9, x = nx[k] + (vx / l) * D + (rand() - 0.5) * D * 0.15, y = ny[k] + (vy / l) * D + (rand() - 0.5) * D * 0.15;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const id = nx.length; nx.push(x); ny.push(y); par.push(k); grid[((y / cs) | 0) * gw + ((x / cs) | 0)].push(id);
        }
        alive = keep;
      }
      const cnt = new Float32Array(nx.length).fill(1);
      for (let i = nx.length - 1; i >= 0; i--) if (par[i] >= 0) cnt[par[i]] += cnt[i];
      cache.tree = { nx, ny, par, cnt }; cache.key = key;
    }
    const { nx, ny, par, cnt } = cache.tree; let mx = 1; for (let i = 0; i < cnt.length; i++) if (cnt[i] > mx) mx = cnt[i];
    ctx.fillStyle = night ? '#0b0b10' : '#f4efe3'; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round';
    const order = Array.from({ length: nx.length }, (_, i) => i).sort((a, b) => cnt[b] - cnt[a]);
    for (const i of order) {
      if (par[i] < 0) continue;
      const q = par[i], w = Math.max(0.6 * sc, p.thick * sc * Math.sqrt(cnt[i] / mx) * 1.5), c = smp.rgb(nx[i], ny[i]), k = night ? 1.2 : 0.78;
      ctx.strokeStyle = `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(nx[q], ny[q]); ctx.lineTo(nx[i], ny[i]); ctx.stroke();
    }
  },
});
