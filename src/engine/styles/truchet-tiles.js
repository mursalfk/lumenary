// src/engine/styles/truchet-tiles.js
import { still, hash2, clamp, lerp, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

const PAPERS = { cream: [243, 237, 222], white: [250, 250, 247], night: [18, 17, 22] };
const INKS = { ink: [26, 24, 30], blue: [24, 48, 120], red: [168, 36, 30] };

export default still({
  id: 'truchet-tiles',
  name: 'Truchet Tiles',
  blurb: 'One square tile, turned at random. Arcs join into tangles, and the weight of each line follows the light in your picture.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Tile size', type: 'range', min: 12, max: 64, step: 1, default: 28 },
    { key: 'tile', label: 'Tile', type: 'select', default: 'arcs', options: [['arcs', 'Curved lines'], ['quarter', 'Quarter discs'], ['diag', 'Diagonals']] },
    { key: 'weight', label: 'Picture shows through', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'multi', label: 'Smaller tiles in detail', type: 'toggle', default: true },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ink', 'Black ink'], ['blue', 'Blue ink'], ['red', 'Red ink']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['white', 'White'], ['night', 'Night']] },
    { key: 'seed', label: 'Turn the tiles again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s0 = p.size * sc, seed = p.seed * 13 + 3;
    const smp = sampler(cache, d, W, H, s0 * 0.45);
    const paper = PAPERS[p.paper] || PAPERS.cream, dark = p.paper === 'night', ink = INKS[p.colour];
    ctx.fillStyle = `rgb(${paper})`; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'butt';
    const w = p.weight / 100;
    const colourAt = (x, y, t) => {
      if (ink) return `rgb(${ink})`;
      const c = smp.rgb(x, y), k = dark ? 1.15 : 0.82 - 0.1 * t;
      return `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`;
    };
    const tile = (x, y, s, depth) => {
      const cx = x + s / 2, cy = y + s / 2;
      let t = smp.tone(cx, cy); t = dark ? t : 1 - t;               // 0 = nothing to draw, 1 = heavy
      const o = hash2((x / s0) | 0, (y / s0) | 0, seed + depth * 7) < 0.5 || (depth && hash2((x / s) | 0, (y / s) | 0, seed + 2) < 0.5 ? 1 : 0);
      const flip = hash2(Math.round(x * 10), Math.round(y * 10), seed + depth) < 0.5 ? 0 : 1;
      const amt = lerp(0.5, t, w);
      ctx.strokeStyle = ctx.fillStyle = colourAt(cx, cy, t);
      if (p.tile === 'arcs') {
        ctx.lineWidth = Math.max(0.7 * sc, s * (0.06 + 0.5 * amt));
        ctx.beginPath();
        if (flip) { ctx.arc(x, y, s / 2, 0, Math.PI / 2); ctx.moveTo(x + s, y + s / 2); ctx.arc(x + s, y + s, s / 2, Math.PI, Math.PI * 1.5); }
        else { ctx.moveTo(x + s / 2, y); ctx.arc(x + s, y, s / 2, Math.PI / 2 + 0.0, Math.PI, false); ctx.moveTo(x, y + s / 2); ctx.arc(x, y + s, s / 2, Math.PI * 1.5, TAU); }
        ctx.stroke();
      } else if (p.tile === 'quarter') {
        const r = s * (0.18 + 0.52 * amt);
        ctx.beginPath();
        if (flip) { ctx.moveTo(x, y); ctx.arc(x, y, r, 0, Math.PI / 2); ctx.closePath(); ctx.moveTo(x + s, y + s); ctx.arc(x + s, y + s, r, Math.PI, Math.PI * 1.5); ctx.closePath(); }
        else { ctx.moveTo(x + s, y); ctx.arc(x + s, y, r, Math.PI / 2, Math.PI); ctx.closePath(); ctx.moveTo(x, y + s); ctx.arc(x, y + s, r, Math.PI * 1.5, TAU); ctx.closePath(); }
        ctx.fill();
      } else {
        ctx.lineWidth = Math.max(0.7 * sc, s * (0.05 + 0.4 * amt)); ctx.lineCap = 'round';
        ctx.beginPath();
        if (flip) { ctx.moveTo(x, y); ctx.lineTo(x + s, y + s); } else { ctx.moveTo(x + s, y); ctx.lineTo(x, y + s); }
        ctx.stroke(); ctx.lineCap = 'butt';
      }
    };
    for (let y = 0; y < H; y += s0) for (let x = 0; x < W; x += s0) {
      let split = false;
      if (p.multi) {
        const h = s0 / 2, a = smp.tone(x + h / 2, y + h / 2), b = smp.tone(x + h * 1.5, y + h / 2), c = smp.tone(x + h / 2, y + h * 1.5), e = smp.tone(x + h * 1.5, y + h * 1.5);
        const m = (a + b + c + e) / 4, v = (a - m) ** 2 + (b - m) ** 2 + (c - m) ** 2 + (e - m) ** 2;
        split = v > 0.006;
      }
      if (split) { const h = s0 / 2; tile(x, y, h, 1); tile(x + h, y, h, 1); tile(x, y + h, h, 1); tile(x + h, y + h, h, 1); }
      else tile(x, y, s0, 0);
    }
  },
});
