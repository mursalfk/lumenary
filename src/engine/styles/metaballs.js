// src/engine/styles/metaballs.js
import { still, rng, clamp, smoothstep, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'metaballs',
  name: 'Metaballs',
  blurb: 'Soft balls whose fields add together. Close neighbours bridge into one body, and the colours underneath come from your picture.',
  maxSide: 900,
  params: [
    { key: 'count', label: 'Balls', type: 'range', min: 30, max: 900, step: 10, default: 420 },
    { key: 'size', label: 'Size', type: 'range', min: 6, max: 50, step: 1, default: 15 },
    { key: 'goo', label: 'How readily they merge', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'where', label: 'Balls gather in', type: 'select', default: 'even', options: [['light', 'The light areas'], ['dark', 'The dark areas'], ['even', 'Everywhere']] },
    { key: 'gloss', label: 'Gloss', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'ghost', label: 'Faint picture behind', type: 'range', min: 0, max: 100, step: 1, default: 15 },
    { key: 'seed', label: 'New arrangement', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, N = W * H, r = rng(p.seed * 43 + 1), smp = sampler(cache, d, W, H, 5 * sc);
    const key = [p.count, p.size, p.where, p.seed, W].join('|');
    if (cache.key !== key) {
      const F = new Float32Array(N), s0 = p.size * sc;
      for (let b = 0, tries = 0; b < p.count && tries < p.count * 60; tries++) {
        const x = r() * W, y = r() * H, t = smp.tone(x, y), want = p.where === 'light' ? t : p.where === 'dark' ? 1 - t : 1;
        if (r() > 0.04 + 0.96 * Math.pow(want, 1.3)) continue;
        b++;
        const rad = s0 * (0.45 + r() * 0.9) * (0.7 + 0.6 * want), R = rad * 2.6, x0 = Math.max(0, Math.floor(x - R)), x1 = Math.min(W - 1, Math.ceil(x + R)), y0 = Math.max(0, Math.floor(y - R)), y1 = Math.min(H - 1, Math.ceil(y + R)), R2 = R * R;
        for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) { const dx = xx - x, dy = yy - y, q = 1 - (dx * dx + dy * dy) / R2; if (q > 0) F[yy * W + xx] += q * q * q; }
      }
      cache.F = F; cache.key = key;
    }
    const F = cache.F, level = lerp(0.95, 0.28, p.goo / 100), gloss = p.gloss / 100, ghost = (p.ghost / 100) * 0.4, out = ctx.createImageData(W, H), o4 = out.data, ch = smp.ch;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, f = F[i];
      let R = 10 + d[o] * ghost, G = 10 + d[o + 1] * ghost, B = 14 + d[o + 2] * ghost;
      const a = smoothstep(level - 0.03, level + 0.03, f);
      if (a > 0) {
        const gx = (x + 1 < W ? F[i + 1] : f) - (x > 0 ? F[i - 1] : f), gy = (y + 1 < H ? F[i + W] : f) - (y > 0 ? F[i - W] : f), nz = 0.22 / (0.3 + level), nl = Math.hypot(gx, gy, nz) + 1e-9;
        const nx = -gx / nl, ny = -gy / nl, nzz = nz / nl, lam = clamp(nx * -0.45 + ny * -0.6 + nzz * 0.66), spec = Math.pow(clamp(nx * -0.3 + ny * -0.45 + nzz * 0.84), 22) * gloss;
        const pr = ch[0][i], pg = ch[1][i], pb = ch[2][i], k = 0.45 + 0.7 * lam;
        const rr = pr * k + 255 * spec * 0.7, gg = pg * k + 255 * spec * 0.7, bb = pb * k + 255 * spec * 0.7;
        R = lerp(R, rr, a); G = lerp(G, gg, a); B = lerp(B, bb, a);
      }
      o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
