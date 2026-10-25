// src/engine/styles/talavera.js
import { still, hexToRgb, clamp, hash2, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, leaf, starPoints, poly, vivid } from '../culture.js';

const GLAZE = '#f5f1e6', COBALT = '#1e48a6', YELLOW = '#f2b705', ORANGE = '#e2661b', GREEN = '#2a8f58', INK = '#143a8c';
// What the ground of a tile is, from dark to light, and the two colours painted on it.
const GROUNDS = [
  { bg: COBALT, fg: [YELLOW, GLAZE] },
  { bg: GREEN, fg: [YELLOW, GLAZE] },
  { bg: ORANGE, fg: [COBALT, YELLOW] },
  { bg: YELLOW, fg: [COBALT, ORANGE] },
  { bg: GLAZE, fg: [COBALT, ORANGE] },
];

function flower(c, u, fg1, fg2, ink) {
  c.lineWidth = Math.max(1, u * 0.035); c.strokeStyle = ink;
  for (let j = 0; j < 8; j++) {
    const a = (j / 8) * TAU; leaf(c, Math.cos(a) * u * 0.12, Math.sin(a) * u * 0.12, a, u * 0.5, u * 0.15); c.fillStyle = j % 2 ? fg2 : fg1; c.fill(); c.stroke();
  }
  c.beginPath(); c.arc(0, 0, u * 0.15, 0, TAU); c.fillStyle = fg2; c.fill(); c.stroke();
  c.beginPath(); c.arc(0, 0, u * 0.06, 0, TAU); c.fillStyle = fg1; c.fill();
}

export default still({
  id: 'talavera',
  name: 'Talavera',
  blurb: 'Hand-painted tin-glazed tiles from Puebla, Mexico. Each tile takes its ground from the light in your picture, from cobalt through green and orange to white, and carries a four-way flower in contrasting colours.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Tile size', type: 'range', min: 34, max: 130, step: 1, default: 62 },
    { key: 'motif', label: 'Motif', type: 'select', default: 'mixed', options: [['mixed', 'Mixed'], ['flower', 'Flowers'], ['star', 'Stars']] },
    { key: 'hand', label: 'Hand-painted wobble', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'grout', label: 'Grout', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'seed', label: 'New painting', type: 'shuffle', default: 5 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.3), hand = p.hand / 100, gr = (p.grout / 100) * 3.4 * sc + 0.8 * sc;
    ctx.fillStyle = '#b9b5a8'; ctx.fillRect(0, 0, W, H);
    const cols = Math.ceil(W / s), rows = Math.ceil(H / s), ox = (W - cols * s) / 2, oy = (H - rows * s) / 2, tmp = [0, 0, 0];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x0 = ox + c * s, y0 = oy + r * s, cx = x0 + s / 2, cy = y0 + s / 2, t = smp.tone(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1));
      const gi = Math.min(GROUNDS.length - 1, Math.floor(t * GROUNDS.length)), gd = GROUNDS[gi], h = hash2(c, r, p.seed), flip = h > 0.5;
      ctx.fillStyle = gd.bg; ctx.fillRect(x0 + gr / 2, y0 + gr / 2, s - gr, s - gr);
      // glaze shade and edge
      const g2 = ctx.createLinearGradient(x0, y0, x0 + s, y0 + s); g2.addColorStop(0, 'rgba(255,255,255,0.14)'); g2.addColorStop(0.5, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.12)');
      ctx.fillStyle = g2; ctx.fillRect(x0 + gr / 2, y0 + gr / 2, s - gr, s - gr);
      // the colour of the picture picks which of the two accent colours leads
      vivid(smp.rgb(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1)), 1.4, 0, tmp);
      const warm = tmp[0] > tmp[2], fg1 = warm ? gd.fg[0] : gd.fg[1], fg2 = warm ? gd.fg[1] : gd.fg[0], ink = gd.bg === COBALT ? '#0b2766' : INK;
      const wob = (a) => (hash2(c * 7 + a, r * 13 + 1, p.seed + 4) - 0.5) * s * 0.03 * hand * 2;
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + gr / 2, y0 + gr / 2, s - gr, s - gr); ctx.clip();
      ctx.translate(cx + wob(1), cy + wob(2)); ctx.rotate((hash2(c, r, 11) - 0.5) * 0.06 * hand);
      const kind = p.motif === 'mixed' ? ((c + r) % 2 ? 'flower' : 'star') : p.motif, u = s * 0.5;
      if (kind === 'flower') {
        flower(ctx, u * 1.0, fg1, fg2, ink);
        // leaves in each corner
        ctx.lineWidth = Math.max(1, u * 0.035); ctx.strokeStyle = ink;
        for (let j = 0; j < 4; j++) { const a = Math.PI / 4 + (j * Math.PI) / 2; leaf(ctx, Math.cos(a) * u * 1.0, Math.sin(a) * u * 1.0, a + Math.PI, u * 0.5, u * 0.14); ctx.fillStyle = gd.bg === GREEN ? fg1 : GREEN; ctx.fill(); ctx.stroke(); }
      } else {
        ctx.lineWidth = Math.max(1, u * 0.035); ctx.strokeStyle = ink;
        poly(ctx, starPoints(0, 0, u * 0.85, u * 0.42, 8, hash2(c, r, 2) > 0.5 ? 0 : Math.PI / 8)); ctx.fillStyle = fg1; ctx.fill(); ctx.stroke();
        poly(ctx, starPoints(0, 0, u * 0.5, u * 0.26, 8, 0)); ctx.fillStyle = fg2; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, u * 0.12, 0, TAU); ctx.fillStyle = fg1; ctx.fill(); ctx.stroke();
        for (let j = 0; j < 4; j++) { const a = Math.PI / 4 + (j * Math.PI) / 2; ctx.beginPath(); ctx.arc(Math.cos(a) * u * 1.02, Math.sin(a) * u * 1.02, u * 0.2, 0, TAU); ctx.fillStyle = fg2; ctx.fill(); ctx.stroke(); }
      }
      ctx.restore();
      // painted border line just inside the edge
      ctx.strokeStyle = gd.bg === GLAZE ? INK : 'rgba(245,241,230,0.75)'; ctx.lineWidth = Math.max(1, s * 0.012);
      ctx.strokeRect(x0 + gr / 2 + s * 0.04, y0 + gr / 2 + s * 0.04, s - gr - s * 0.08, s - gr - s * 0.08);
    }
    // glaze shine across everything
    const sh = ctx.createLinearGradient(0, 0, W, H); sh.addColorStop(0, 'rgba(255,255,255,0.1)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.12)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
  },
});
