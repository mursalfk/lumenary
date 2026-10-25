// src/engine/styles/l-system-trees.js
import { still, rng, clamp, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

export default still({
  id: 'l-system-trees',
  name: 'L-system Trees',
  blurb: 'A trunk splits, each branch splits again, and the same rule runs until the twigs end in leaves. The leaves take their colour from the picture.',
  maxSide: 1100,
  params: [
    { key: 'trees', label: 'Trees', type: 'range', min: 1, max: 6, step: 1, default: 3 },
    { key: 'depth', label: 'Generations', type: 'range', min: 6, max: 13, step: 1, default: 10 },
    { key: 'spread', label: 'Spread of the branches', type: 'range', min: 10, max: 60, step: 1, default: 28, fmt: (v) => v + '°' },
    { key: 'decay', label: 'Branches shorten by', type: 'range', min: 60, max: 90, step: 1, default: 76, fmt: (v) => (100 - v) + '%' },
    { key: 'wind', label: 'Wind', type: 'range', min: -30, max: 30, step: 1, default: 6, fmt: (v) => v + '°' },
    { key: 'leaf', label: 'Leaf size', type: 'range', min: 1, max: 12, step: 0.5, default: 4.5, fmt: (v) => v.toFixed(1) },
    { key: 'wash', label: 'Faint picture behind', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'seed', label: 'Grow again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, r = rng(p.seed * 61 + 7), smp = sampler(cache, d, W, H, 6 * sc);
    ctx.fillStyle = '#f4efe3'; ctx.fillRect(0, 0, W, H);
    if (p.wash > 0) {
      const c = env.makeCanvas(Math.max(4, W >> 4), Math.max(4, H >> 4)), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, c.width, c.height);
      ctx.save(); ctx.globalAlpha = (p.wash / 100) * 0.55; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(c, 0, 0, W, H); ctx.restore();
    }
    const leaves = [], spread = (p.spread * Math.PI) / 180, wind = (p.wind * Math.PI) / 180, decay = p.decay / 100;
    ctx.lineCap = 'round';
    const grow = (x, y, a, len, w, depth) => {
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      ctx.lineWidth = Math.max(0.6 * sc, w); ctx.strokeStyle = depth > p.depth - 3 ? '#4a3a2c' : '#5a4636';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
      if (depth <= 1 || len < 3 * sc) { leaves.push([x2, y2]); return; }
      const kids = depth > 2 && r() < 0.14 ? 3 : 2;
      for (let k = 0; k < kids; k++) {
        const side = kids === 2 ? (k ? 1 : -1) : k - 1, da = side * spread * (0.6 + r() * 0.8) + wind * 0.35 + (r() - 0.5) * 0.18;
        grow(x2, y2, a + da, len * decay * (0.82 + r() * 0.36), w * 0.72, depth - 1);
        if (depth < p.depth - 4 && r() < 0.05) leaves.push([x2, y2]);
      }
    };
    const T = p.trees;
    for (let t = 0; t < T; t++) {
      const x = ((t + 0.5) / T) * W + (r() - 0.5) * (W / T) * 0.4, scale = (T === 1 ? 1 : 0.62 + r() * 0.38), len = H * 0.17 * scale * (1 - T * 0.045);
      grow(x, H * 0.99, -Math.PI / 2 + (r() - 0.5) * 0.1 + wind * 0.2, len, 11 * sc * scale * (1.4 - T * 0.06), p.depth);
    }
    for (let i = leaves.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [leaves[i], leaves[j]] = [leaves[j], leaves[i]]; }
    const ls = p.leaf * sc;
    for (const [x, y] of leaves) {
      const c = smp.rgb(x, y), rr = ls * (0.7 + r() * 0.8);
      ctx.fillStyle = `rgba(${Math.min(255, c[0] * 0.95) | 0},${Math.min(255, c[1] * 0.95) | 0},${Math.min(255, c[2] * 0.95) | 0},0.82)`;
      ctx.beginPath(); ctx.arc(x + (r() - 0.5) * ls, y + (r() - 0.5) * ls, rr, 0, Math.PI * 2); ctx.fill();
    }
  },
});
