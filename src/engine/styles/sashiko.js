// src/engine/styles/sashiko.js
import { still, hexToRgb, clamp, hash2, rng, boxBlur } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, vivid, clothFill } from '../culture.js';

const CLOTH = { indigo: ['#1b2a5c', '#0f1a3d'], black: ['#1a1818', '#0c0b0b'], madder: ['#8a2a22', '#5a1712'] };

// The phase (0 or 1) of the stitching on each row and each column. The pattern that appears is decided entirely by these.
function bits(kind, n, seed, axis) {
  const r = rng(seed * 31 + axis * 7 + 1), out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (kind === 'random') out[i] = r() < 0.5 ? 1 : 0;
    else if (kind === 'diamonds') out[i] = i % 2;
    else if (kind === 'waves') out[i] = Math.sin(i * (axis ? 0.45 : 0.3) + axis) > 0 ? 1 : 0;
    else out[i] = (i >> (1 + axis)) % 2;
  }
  return out;
}

export default still({
  id: 'sashiko',
  name: 'Sashiko',
  blurb: 'Japanese running stitch on indigo cloth, in the hitomezashi style. Rows and columns of stitches start on or off the beat, and a lattice of squares, diamonds and crosses appears from nothing. Thread is thicker and brighter in the light.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Stitch length', type: 'range', min: 5, max: 26, step: 1, default: 13 },
    { key: 'pattern', label: 'Pattern', type: 'select', default: 'random', options: [['random', 'Random'], ['diamonds', 'Diamonds'], ['waves', 'Waves'], ['steps', 'Steps']] },
    { key: 'weight', label: 'Thread weight', type: 'range', min: 20, max: 100, step: 1, default: 65 },
    { key: 'tint', label: 'Thread colour', type: 'select', default: 'white', options: [['white', 'White'], ['picture', 'Colours of the picture'], ['gold', 'Gold']] },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'indigo', options: [['indigo', 'Indigo'], ['black', 'Black'], ['madder', 'Madder red']] },
    { key: 'seed', label: 'New pattern', type: 'shuffle', default: 3 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.8), tmp = [0, 0, 0];
    const [a, b] = CLOTH[p.cloth].map(hexToRgb);
    clothFill(ctx, W, H, a, b, sc, 7, 0.14);
    const cols = Math.floor(W / s), rows = Math.floor(H / s), ox = (W - cols * s) / 2, oy = (H - rows * s) / 2, rb = bits(p.pattern, rows + 1, p.seed, 0), cb = bits(p.pattern, cols + 1, p.seed, 1);
    const colourAt = (x, y, t) => {
      if (p.tint === 'gold') return [236 * (0.35 + 0.65 * t), 190 * (0.35 + 0.65 * t), 96 * (0.35 + 0.65 * t)];
      if (p.tint === 'picture') { vivid(smp.rgb(clamp(x, 0, W - 1), clamp(y, 0, H - 1)), 1.4, 0.2, tmp); return [tmp[0], tmp[1], tmp[2]]; }
      const k = 0.3 + 0.7 * t; return [244 * k, 240 * k, 230 * k];
    };
    const stitch = (x0, y0, x1, y1) => {
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, t = smp.tone(clamp(mx, 0, W - 1), clamp(my, 0, H - 1)), w = s * (0.05 + 0.34 * (p.weight / 100) * Math.pow(t, 1.4)), c = colourAt(mx, my, t);
      const g = 0.9 * s * 0.5, dx = x1 - x0, dy = y1 - y0, m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m, ax = mx - ux * (m / 2 - 0.5 * w * 0.15), ay = my - uy * (m / 2 - 0.5 * w * 0.15), bx = mx + ux * (m / 2 - 0.5 * w * 0.15), by = my + uy * (m / 2 - 0.5 * w * 0.15);
      void g;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.38)'; ctx.lineWidth = w * 1.15; ctx.beginPath(); ctx.moveTo(ax + 0.7 * sc, ay + 1 * sc); ctx.lineTo(bx + 0.7 * sc, by + 1 * sc); ctx.stroke();
      ctx.strokeStyle = css(c); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = w * 0.3; ctx.beginPath(); ctx.moveTo(ax - 0.3 * sc, ay - 0.4 * sc); ctx.lineTo(bx - 0.3 * sc, by - 0.4 * sc); ctx.stroke();
    };
    for (let j = 0; j <= rows; j++) for (let i = 0; i < cols; i++) if ((i + rb[j]) % 2 === 0) stitch(ox + i * s + s * 0.04, oy + j * s, ox + (i + 1) * s - s * 0.04, oy + j * s);
    for (let i = 0; i <= cols; i++) for (let j = 0; j < rows; j++) if ((j + cb[i]) % 2 === 0) stitch(ox + i * s, oy + j * s + s * 0.04, ox + i * s, oy + (j + 1) * s - s * 0.04);
  },
});
