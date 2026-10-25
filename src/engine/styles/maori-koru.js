// src/engine/styles/maori-koru.js
import { still, hexToRgb, clamp, hash2, rng, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, vivid, ribbon, woodFill } from '../culture.js';

const GROUNDS = { black: ['#1b1815', '#0b0a09'], red: ['#8a2b1c', '#5a170d'], cream: ['#e8dcc0', '#d2c29c'] };
const RED = [176, 34, 26], WHITE = [238, 230, 210], BLACK = [22, 18, 16];

// The koru: an unfurling fern frond. A swelling stem that curls into a spiral and ends on a small bulb.
// Drawn with the spiral's centre at the origin and the stem arriving from the right.
function koru(ctx, x, y, R, rot, flip, fill, ink, line, sc) {
  const pts = [], N1 = 10, N2 = 44, turns = 1.2;
  for (let i = 0; i < N1; i++) { const q = i / N1; pts.push([1.2 * R * (1 - q), R + 0.5 * R * (1 - q) * (1 - q)]); }
  for (let i = 0; i <= N2; i++) { const q = i / N2, th = q * turns * TAU, r = R * (1 - 0.74 * q), ph = Math.PI / 2 + th; pts.push([Math.cos(ph) * r, Math.sin(ph) * r]); }
  const n = pts.length, split = N1 / n;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); if (flip) ctx.scale(1, -1);
  ribbon(ctx, pts, (t) => (t < split ? R * (0.22 + 0.14 * (t / split)) : R * (0.36 * Math.pow(1 - (t - split) / (1 - split), 0.9) + 0.13)));
  ctx.fillStyle = css(fill); ctx.fill(); ctx.strokeStyle = css(ink); ctx.lineWidth = Math.max(1, 1.8 * sc); ctx.lineJoin = 'round'; ctx.stroke();
  const e = pts[n - 1]; ctx.beginPath(); ctx.arc(e[0], e[1], R * 0.14, 0, TAU); ctx.fillStyle = css(fill); ctx.fill(); ctx.stroke();
  if (line) { ctx.strokeStyle = css(line); ctx.lineWidth = Math.max(1, R * 0.045); ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 3; i < n - 4; i++) { if (i === 3) ctx.moveTo(pts[i][0], pts[i][1]); else ctx.lineTo(pts[i][0], pts[i][1]); } ctx.stroke(); }
  ctx.restore();
}

export default still({
  id: 'maori-koru',
  name: 'Maori Koru',
  blurb: 'The koru, an unfurling silver fern frond, repeated in the way of kowhaiwhai rafter painting. Spirals grow larger and whiter in the light and fade to red and then to bare ground in the shade.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Spiral size', type: 'range', min: 30, max: 120, step: 1, default: 64 },
    { key: 'follow', label: 'Size follows light', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'turn', label: 'Direction', type: 'select', default: 'flow', options: [['flow', 'Flowing'], ['mirror', 'Mirrored'], ['ring', 'Around the centre']] },
    { key: 'colour', label: 'Paint', type: 'select', default: 'trad', options: [['trad', 'Red, white and black'], ['picture', 'Colours of the picture']] },
    { key: 'ground', label: 'Ground', type: 'select', default: 'black', options: [['black', 'Black'], ['red', 'Red ochre'], ['cream', 'Cream']] },
    { key: 'seed', label: 'New order', type: 'shuffle', default: 2 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, g = p.size * sc, smp = sampler(cache, d, W, H, g * 0.35), tmp = [0, 0, 0], r = rng(p.seed * 17 + 1), fol = p.follow / 100;
    const [ga, gb] = GROUNDS[p.ground].map(hexToRgb), pale = p.ground === 'cream', ink = pale ? BLACK : p.ground === 'red' ? [20, 10, 8] : [8, 7, 6];
    woodFill(ctx, W, H, ga, gb, sc, 3);
    const items = [], cx = W / 2, cy = H / 2;
    for (let y = g * 0.5, row = 0; y < H + g; y += g * 0.95, row++) for (let x = g * 0.5 + (row % 2) * g * 0.5; x < W + g; x += g * 1.25) {
      const px = x + (r() - 0.5) * g * 0.1, py = y + (r() - 0.5) * g * 0.1, qx = clamp(px, 0, W - 1), qy = clamp(py, 0, H - 1), t = smp.tone(qx, qy), v = pale ? 1 - t : t;
      if (v < 0.06) continue;
      const i = Math.round(x / (g * 1.25)), j = row;
      let rot, flip;
      if (p.turn === 'flow') { rot = ((i + j) % 2) * Math.PI + (j % 2 ? 0.3 : -0.3); flip = (i % 2) === 0; } else if (p.turn === 'mirror') { rot = (i % 2) * Math.PI; flip = j % 2 === 0; } else { rot = Math.atan2(py - cy, px - cx) + Math.PI / 2; flip = (i + j) % 2 === 0; }
      items.push({ x: px, y: py, v, rot, flip, R: g * 0.46 * (1 - fol * 0.6 + fol * 0.9 * v), c: [qx, qy] });
    }
    for (const it of items.sort((a, b) => a.R - b.R)) {
      let fill, line = null;
      if (p.colour === 'picture') { vivid(smp.rgb(it.c[0], it.c[1]), 1.5, 0, tmp); fill = [tmp[0], tmp[1], tmp[2]]; line = pale ? [30, 20, 14] : [250, 244, 232]; } else if (it.v > 0.55) { fill = pale ? BLACK : WHITE; line = pale ? WHITE : RED; } else { fill = RED; line = pale ? WHITE : BLACK; }
      koru(ctx, it.x, it.y, it.R, it.rot, it.flip, fill, ink, line, sc);
    }
  },
});
