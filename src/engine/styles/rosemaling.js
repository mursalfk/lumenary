// src/engine/styles/rosemaling.js
import { still, hexToRgb, clamp, hash2, rng, TAU } from '../utils.js';
import { pixels, sampler, nearest } from '../helpers.js';
import { css, vivid, mix, clothFill, ribbon, leaf } from '../culture.js';

// The paints of a Norwegian painter: red, ochre, green, blue, cream, brick.
const FOLK = ['#b3392c', '#d9a441', '#3f7f5a', '#2f6fa8', '#efe6cf', '#8a4a38'].map(hexToRgb);
const PAIR = [4, 0, 1, 4, 1, 1];
const GROUNDS = { teal: ['#1d3a47', '#12262f'], black: ['#1b1917', '#0c0b0a'], green: ['#20402f', '#122a1f'], cream: ['#e4d8b8', '#d3c49c'] };
const lighter = (c, k = 0.45) => [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k];

// A teardrop petal from (x, y) pointing along angle a.
function petal(ctx, x, y, a, L, w) {
  ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5, L * 0.5, w, a, 0, TAU);
}
function flowerAt(ctx, x, y, R, c1, c2, ink, sc, n) {
  const hl = lighter(c1);
  for (let j = 0; j < n; j++) {
    const a = (j / n) * TAU - Math.PI / 2;
    petal(ctx, x + Math.cos(a) * R * 0.18, y + Math.sin(a) * R * 0.18, a, R * 0.86, R * 0.27);
    ctx.fillStyle = css(c1); ctx.fill(); ctx.strokeStyle = css(ink); ctx.lineWidth = Math.max(1, 1.4 * sc); ctx.stroke();
    petal(ctx, x + Math.cos(a) * R * 0.4, y + Math.sin(a) * R * 0.4, a, R * 0.38, R * 0.1); ctx.fillStyle = css(hl, 0.8); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(x, y, R * 0.28, 0, TAU); ctx.fillStyle = css(c2); ctx.fill(); ctx.strokeStyle = css(ink); ctx.lineWidth = Math.max(1, 1.4 * sc); ctx.stroke();
  ctx.fillStyle = css(lighter(c2, 0.6), 0.85);
  for (let j = 0; j < 5; j++) { const a = (j / 5) * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(a) * R * 0.15, y + Math.sin(a) * R * 0.15, R * 0.035, 0, TAU); ctx.fill(); }
}
function scrollAt(ctx, x, y, R, dir, rot, col, ink, sc) {
  const pts = [], turns = 1.35, N = 28;
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = rot + dir * t * turns * TAU, r = R * (1 - 0.78 * t);
    pts.push([x + Math.cos(a) * r - Math.cos(rot) * R * 0.0, y + Math.sin(a) * r]);
  }
  ribbon(ctx, pts, (t) => R * 0.34 * Math.pow(1 - t, 0.8) + R * 0.05);
  ctx.fillStyle = css(col); ctx.fill(); ctx.strokeStyle = css(ink); ctx.lineWidth = Math.max(1, 1.3 * sc); ctx.stroke();
  ctx.strokeStyle = css(lighter(col, 0.5), 0.7); ctx.lineWidth = Math.max(1, R * 0.045); ctx.beginPath();
  for (let i = 2; i < N - 4; i++) { if (i === 2) ctx.moveTo(pts[i][0], pts[i][1]); else ctx.lineTo(pts[i][0], pts[i][1]); }
  ctx.stroke();
}

export default still({
  id: 'rosemaling',
  name: 'Rosemaling',
  blurb: 'Rose painting, the folk art of Norway. Scrolls, leaves and flowers are painted with loaded brushes onto a dark ground. Where your picture is bright the flowers bloom, and in the shadows only the scrolls and leaves remain.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Motif size', type: 'range', min: 36, max: 130, step: 1, default: 70 },
    { key: 'petals', label: 'Petals', type: 'range', min: 4, max: 9, step: 1, default: 6 },
    { key: 'density', label: 'How much is painted', type: 'range', min: 20, max: 100, step: 1, default: 75 },
    { key: 'colour', label: 'Paint', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['classic', 'Red and ochre']] },
    { key: 'ground', label: 'Ground', type: 'select', default: 'teal', options: [['teal', 'Blue-green'], ['black', 'Black'], ['green', 'Forest'], ['cream', 'Cream']] },
    { key: 'seed', label: 'New painting', type: 'shuffle', default: 3 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, g = p.size * sc, smp = sampler(cache, d, W, H, g * 0.3), tmp = [0, 0, 0], r = rng(p.seed * 71 + 5);
    const [ga, gb] = GROUNDS[p.ground].map(hexToRgb), pale = p.ground === 'cream', ink = pale ? [58, 38, 30] : [14, 12, 12], dens = p.density / 100;
    clothFill(ctx, W, H, ga, gb, sc, 6, 0.02);
    const items = [];
    for (let y = -g * 0.3, row = 0; y < H + g * 0.5; y += g * 0.82, row++) for (let x = -g * 0.2 + (row % 2) * g * 0.5; x < W + g * 0.5; x += g) {
      const px = x + (r() - 0.5) * g * 0.35, py = y + (r() - 0.5) * g * 0.3, cx = clamp(px, 0, W - 1), cy = clamp(py, 0, H - 1), t = smp.tone(cx, cy), v = pale ? 1 - t : t;
      if (v < 0.07 * (1.4 - dens)) continue;
      let pi;
      if (p.colour === 'classic') pi = v > 0.55 ? 0 : 2; else { vivid(smp.rgb(cx, cy), 1.5, pale ? -0.05 : 0.04, tmp); pi = nearest(FOLK, tmp[0], tmp[1], tmp[2]); if (pale && pi === 4) pi = 3; if (!pale && pi === 5) pi = 1; }
      const kind = v > 0.62 ? 0 : v > 0.32 ? 1 : 2;
      items.push({ x: px, y: py, v, pi, kind, R: g * (0.3 + 0.34 * v) * (0.92 + 0.16 * r()), rot: r() * TAU, dir: r() < 0.5 ? 1 : -1 });
    }
    // scrolls first, then leaf sprays, then the flowers on top
    for (const kind of [1, 2, 0]) for (const it of items.filter((q) => q.kind === kind).sort((a, b) => a.R - b.R)) {
      const c1 = FOLK[it.pi], c2 = FOLK[PAIR[it.pi]];
      if (kind === 1) {
        const col = it.pi === 2 ? FOLK[0] : c1;
        scrollAt(ctx, it.x, it.y, it.R * 0.92, it.dir, it.rot, col, ink, sc);
        scrollAt(ctx, it.x, it.y, it.R * 0.92, -it.dir, it.rot + Math.PI, mix(col, FOLK[PAIR[it.pi]], 0.35), ink, sc);
      } else if (kind === 2) {
        const gcol = FOLK[2];
        for (let j = -1; j <= 1; j++) {
          const a = it.rot + j * 0.55; leaf(ctx, it.x, it.y, a, it.R * 1.0, it.R * 0.2);
          ctx.fillStyle = css(j === 0 ? mix(gcol, FOLK[1], 0.3) : gcol); ctx.fill(); ctx.strokeStyle = css(ink); ctx.lineWidth = Math.max(1, 1.2 * sc); ctx.stroke();
          ctx.strokeStyle = css(lighter(gcol, 0.5), 0.6); ctx.lineWidth = Math.max(1, it.R * 0.03); ctx.beginPath(); ctx.moveTo(it.x + Math.cos(a) * it.R * 0.15, it.y + Math.sin(a) * it.R * 0.15); ctx.lineTo(it.x + Math.cos(a) * it.R * 0.75, it.y + Math.sin(a) * it.R * 0.75); ctx.stroke();
        }
      } else flowerAt(ctx, it.x, it.y, it.R, c1, c2, ink, sc, p.petals);
    }
  },
});
