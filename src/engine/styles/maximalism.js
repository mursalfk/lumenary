// src/engine/styles/maximalism.js
import { still, clamp, hsl2rgb, TAU } from '../utils.js';
import { pixels, paintPixels, contrast } from '../helpers.js';

// Every tonal band gets its own colour and its own pattern. Nothing is left plain.
const PATTERNS = [
  () => 1,
  (x, y, s) => (((x + y) / s) | 0) % 2,
  (x, y, s) => { const a = (x % s) - s / 2, b = (y % s) - s / 2; return a * a + b * b < s * s * 0.14 ? 1 : 0; },
  (x, y, s) => ((((x / s) | 0) + ((y / s) | 0)) % 2),
  (x, y, s) => (Math.sin(x / s * 2.2) * s * 0.5 + (y % (s * 2)) > s ? 1 : 0),
  (x, y, s) => (((x - y) / s) | 0) % 2,
  (x, y, s) => (Math.abs(((x % (s * 2)) - s)) + Math.abs(((y % (s * 2)) - s)) < s ? 1 : 0),
];

export default still({
  id: 'maximalism',
  name: 'Maximalism',
  blurb: 'More is more: every tone gets a loud colour, a pattern and an ornate border.',
  maxSide: 1000,
  params: [
    { key: 'bands', label: 'Bands', type: 'range', min: 3, max: 7, step: 1, default: 6 },
    { key: 'scale', label: 'Pattern size', type: 'range', min: 6, max: 40, step: 1, default: 22 },
    { key: 'hue', label: 'Hue turn', type: 'range', min: 0, max: 360, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'punch', label: 'Colour punch', type: 'range', min: 40, max: 100, step: 1, default: 85, fmt: (v) => v + '%' },
    { key: 'border', label: 'Ornate border', type: 'toggle', default: true },
    { key: 'seed', label: 'Remix', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, n = p.bands, s = Math.max(4, p.scale * W / 1000);
    // Colours per band: spread round the colour wheel, moved by the seed so Remix changes them.
    const cols = [];
    for (let i = 0; i < n; i++) {
      const h = (p.hue / 360 + (i / n) * 0.92 + p.seed * 0.137) % 1;
      cols.push(hsl2rgb(h, p.punch / 100, 0.22 + 0.4 * (i / (n - 1))), hsl2rgb(h + 0.38, p.punch / 100, 0.5 + 0.22 * (i / (n - 1))));
    }
    const pat = (i) => PATTERNS[(i * 2 + p.seed) % PATTERNS.length];
    const fns = Array.from({ length: n }, (_, i) => pat(i));
    paintPixels(ctx, W, H, (x, y, o) => {
      const v = contrast(L[y * W + x], 0.25), b = Math.min(n - 1, (v * n) | 0);
      const c = cols[b * 2 + (fns[b](x, y, s) ? 0 : 1)];
      o[0] = c[0]; o[1] = c[1]; o[2] = c[2];
    });

    if (p.border) {
      const bw = Math.round(Math.min(W, H) * 0.07);
      const c1 = hsl2rgb(p.hue / 360 + 0.08, 0.9, 0.5), c2 = hsl2rgb(p.hue / 360 + 0.55, 0.9, 0.55);
      const css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H); ctx.rect(bw, bw, W - 2 * bw, H - 2 * bw);
      ctx.clip('evenodd');
      ctx.fillStyle = '#12091f'; ctx.fillRect(0, 0, W, H);
      const r = bw * 0.46, step = bw * 0.92;
      const ring = (x, y, i) => {
        ctx.fillStyle = i % 2 ? css(c1) : css(c2); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, TAU); ctx.fill();
      };
      for (let i = 0, x = bw / 2; x < W; x += step, i++) { ring(x, bw / 2, i); ring(x, H - bw / 2, i + 1); }
      for (let i = 0, y = bw / 2; y < H; y += step, i++) { ring(bw / 2, y, i + 1); ring(W - bw / 2, y, i); }
      ctx.restore();
      ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = Math.max(2, bw * 0.06);
      ctx.strokeRect(bw, bw, W - 2 * bw, H - 2 * bw);
    }
  },
});
