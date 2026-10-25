// src/engine/styles/warli.js
import { still, clamp, hexToRgb, hash2, rng, TAU } from '../utils.js';
import { pixels, sampler, fbm } from '../helpers.js';
import { css, mix, grain } from '../culture.js';

const WALLS = {
  terracotta: ['#b4552f', '#85391f'],
  ochre: ['#c8873a', '#95602a'],
  night: ['#4d2b21', '#2e1913'],
};
const WHITE = 'rgba(246,238,222,0.96)';

// Motifs are drawn around (x, y) in units of u. `j` jitters every vertex a little so no two look machine-made.
function figure(ctx, x, y, u, pose, j) {
  const w = 0.27 * u, h = 0.5 * u, J = (v, a = 1) => v + (j() - 0.5) * 0.05 * u * a;
  ctx.beginPath(); ctx.moveTo(J(x - w), J(y - h * 0.9)); ctx.lineTo(J(x + w), J(y - h * 0.9)); ctx.lineTo(x, y - h * 0.04); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y + h * 0.04); ctx.lineTo(J(x - w), J(y + h * 0.95)); ctx.lineTo(J(x + w), J(y + h * 0.95)); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - h * 0.9 - 0.2 * u, 0.15 * u, 0, TAU); ctx.fill();
  const ay = y - h * 0.8, arm = [[-0.42, -0.34], [-0.45, 0.28], [0.42, -0.34], [0.45, 0.28]];
  const L = pose === 0 ? [0, 2] : pose === 1 ? [1, 3] : [0, 3];
  ctx.beginPath();
  for (const a of [L[0], L[1]]) { const [dx, dy] = arm[a]; ctx.moveTo(x + (dx < 0 ? -w * 0.8 : w * 0.8), ay); ctx.lineTo(x + (dx < 0 ? -w * 0.8 : w * 0.8) + dx * u, ay + dy * u); }
  const sp = pose === 1 ? 0.1 : 0.22;
  ctx.moveTo(x - w * 0.6, y + h * 0.95); ctx.lineTo(x - w * 0.6 - sp * u, y + h * 0.95 + 0.42 * u);
  ctx.moveTo(x + w * 0.6, y + h * 0.95); ctx.lineTo(x + w * 0.6 + sp * u, y + h * 0.95 + 0.42 * u);
  ctx.stroke();
}
function tree(ctx, x, y, u) {
  ctx.beginPath(); ctx.moveTo(x, y + 0.6 * u); ctx.lineTo(x, y - 0.7 * u);
  for (let i = 0; i < 5; i++) { const by = y + 0.35 * u - i * 0.26 * u, l = (0.4 - i * 0.06) * u; ctx.moveTo(x, by); ctx.lineTo(x - l, by - 0.2 * u); ctx.moveTo(x, by); ctx.lineTo(x + l, by - 0.2 * u); }
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y - 0.78 * u, 0.09 * u, 0, TAU); ctx.fill();
}
function bird(ctx, x, y, u) {
  ctx.beginPath(); ctx.ellipse(x, y, 0.2 * u, 0.1 * u, -0.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 0.05 * u, y - 0.02 * u); ctx.lineTo(x - 0.2 * u, y - 0.32 * u); ctx.moveTo(x + 0.02 * u, y - 0.04 * u); ctx.lineTo(x + 0.12 * u, y - 0.34 * u);
  ctx.moveTo(x + 0.18 * u, y - 0.04 * u); ctx.lineTo(x + 0.34 * u, y - 0.14 * u); ctx.moveTo(x - 0.2 * u, y + 0.04 * u); ctx.lineTo(x - 0.4 * u, y + 0.14 * u); ctx.stroke();
}
function hut(ctx, x, y, u) {
  ctx.beginPath(); ctx.moveTo(x - 0.4 * u, y - 0.05 * u); ctx.lineTo(x, y - 0.5 * u); ctx.lineTo(x + 0.4 * u, y - 0.05 * u); ctx.closePath(); ctx.fill();
  ctx.strokeRect(x - 0.3 * u, y - 0.05 * u, 0.6 * u, 0.45 * u);
}
function sun(ctx, x, y, u) {
  ctx.beginPath(); ctx.arc(x, y, 0.2 * u, 0, TAU); ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.moveTo(x + Math.cos(a) * 0.3 * u, y + Math.sin(a) * 0.3 * u); ctx.lineTo(x + Math.cos(a) * 0.44 * u, y + Math.sin(a) * 0.44 * u); }
  ctx.stroke();
}

export default still({
  id: 'warli',
  name: 'Warli',
  blurb: 'White rice-paste drawings on a mud wall, from Maharashtra: triangles for bodies, circles for heads, and a crowd that gathers where your picture is darkest.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Figure size', type: 'range', min: 14, max: 46, step: 1, default: 26 },
    { key: 'crowd', label: 'Crowd', type: 'range', min: 20, max: 100, step: 1, default: 72 },
    { key: 'wall', label: 'Wall', type: 'select', default: 'terracotta', options: [['terracotta', 'Terracotta'], ['ochre', 'Ochre'], ['night', 'Dark earth']] },
    { key: 'border', label: 'Border', type: 'toggle', default: true },
    { key: 'seed', label: 'New crowd', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, u = p.size * sc, smp = sampler(cache, d, W, H, u * 0.5);
    const [c1, c2] = WALLS[p.wall].map(hexToRgb), img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      const t = fbm(x / (90 * sc), y / (90 * sc), 5, 3), f = 0.9 + 0.2 * fbm(x / (5 * sc), y / (5 * sc), 9, 2);
      o[k] = (c1[0] + (c2[0] - c1[0]) * t) * f; o[k + 1] = (c1[1] + (c2[1] - c1[1]) * t) * f; o[k + 2] = (c1[2] + (c2[2] - c1[2]) * t) * f; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const m = p.border ? Math.round(u * 0.9) : 0, st = u * 0.82, r = rng(p.seed * 31 + 7), dens = p.crowd / 100;
    ctx.fillStyle = WHITE; ctx.strokeStyle = WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1.2, u * 0.07);
    const items = [];
    for (let gy = m + st * 0.6, j = 0; gy < H - m; gy += st, j++) for (let gx = m + st * 0.6 + (j % 2) * st * 0.5, i = 0; gx < W - m; gx += st, i++) {
      const x = gx + (hash2(i, j, p.seed) - 0.5) * st * 0.5, y = gy + (hash2(i, j, p.seed + 9) - 0.5) * st * 0.4, t = smp.tone(x, y);
      if (hash2(i, j, p.seed + 3) > Math.pow(1 - t, 1.5) * dens * 1.15) continue;
      items.push([x, y, t, hash2(i, j, p.seed + 5)]);
    }
    items.sort((a, b) => a[1] - b[1]);
    for (const [x, y, t, h] of items) {
      const s = u * (0.8 + 0.4 * (1 - t));
      if (h < 0.6) figure(ctx, x, y, s, (h * 100) % 3 | 0, r);
      else if (h < 0.76) tree(ctx, x, y, s);
      else if (h < 0.86) bird(ctx, x, y, s);
      else if (h < 0.96) hut(ctx, x, y, s);
      else sun(ctx, x, y, s);
    }
    if (m) {
      ctx.lineWidth = Math.max(1.2, u * 0.06);
      ctx.strokeRect(m * 0.22, m * 0.22, W - m * 0.44, H - m * 0.44); ctx.strokeRect(m * 0.8, m * 0.8, W - m * 1.6, H - m * 1.6);
      const tw = m * 0.42;
      for (let x = m; x < W - m; x += tw) for (const yy of [m * 0.5, H - m * 0.5]) { ctx.beginPath(); ctx.moveTo(x, yy + tw * 0.3); ctx.lineTo(x + tw / 2, yy - tw * 0.3); ctx.lineTo(x + tw, yy + tw * 0.3); ctx.closePath(); ctx.fill(); }
      for (let y = m; y < H - m; y += tw) for (const xx of [m * 0.5, W - m * 0.5]) { ctx.beginPath(); ctx.moveTo(xx + tw * 0.3, y); ctx.lineTo(xx - tw * 0.3, y + tw / 2); ctx.lineTo(xx + tw * 0.3, y + tw); ctx.closePath(); ctx.fill(); }
    }
    grain(ctx, W, H, 0.05, 6, sc);
  },
});
