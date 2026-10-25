// src/engine/styles/makli-carving.js
import { still, clamp, hexToRgb, smoothstep, boxBlur, hash2 } from '../utils.js';
import { pixels, stretchedL, slopes, fbm } from '../helpers.js';
import { vivid } from '../culture.js';

const STONES = { sandstone: ['#c9a36c', '#a9824f'], limestone: ['#d3cbb8', '#a9a18e'], red: ['#b66a4a', '#8d4a31'] };
const fr = (v) => v - Math.floor(v);
const sm = (e, w) => smoothstep(-w, w, e);

// Raised pattern in a cell, u and v from -1 to 1. 0 is the cut-back ground, 1 the highest boss.
function carve(u, v, style) {
  const rho = Math.hypot(u, v), a = Math.atan2(v, u);
  if (style === 'lozenge') {
    const dd = Math.abs(u) + Math.abs(v);
    let h = 0.6 * sm(0.78 - dd, 0.05);
    h -= 0.28 * sm(0.04 - Math.abs(dd - 0.46), 0.025);
    h = Math.max(h, 0.95 * sm(0.14 - rho, 0.04));
    const dc = (1 - Math.abs(u)) + (1 - Math.abs(v));
    return Math.max(h, 0.55 * sm(0.3 - dc, 0.04));
  }
  const pr = 0.8 * (0.52 + 0.48 * Math.abs(Math.cos(4 * a)));
  let h = 0.62 * sm(pr - rho, 0.05);
  h -= 0.2 * sm(0.03 - Math.abs(rho - pr * 0.62), 0.02) * (rho < pr ? 1 : 0);
  h = Math.max(h, 0.95 * sm(0.2 - rho, 0.04), 0.5 * sm(0.06 - Math.abs(rho - 0.92), 0.03));
  const dc = (1 - Math.abs(u)) + (1 - Math.abs(v));
  return Math.max(h, 0.55 * sm(0.3 - dc, 0.04));
}

export default still({
  id: 'makli-carving',
  name: 'Makli Carving',
  blurb: 'Relief cut into the soft stone of the Makli hills near Thatta: rosettes and lozenges raised from the ground, worn by centuries of sun, rain and salt.',
  maxSide: 1100,
  params: [
    { key: 'pattern', label: 'Carving', type: 'select', default: 'rosette', options: [['rosette', 'Eight-petal rosette'], ['lozenge', 'Lozenge and boss']] },
    { key: 'size', label: 'Cell size', type: 'range', min: 40, max: 150, step: 1, default: 64 },
    { key: 'relief', label: 'Depth', type: 'range', min: 20, max: 100, step: 1, default: 60 },
    { key: 'light', label: 'Light direction', type: 'range', min: 0, max: 360, step: 5, default: 225, fmt: (v) => v + '°' },
    { key: 'tint', label: 'Picture in the stone', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'weather', label: 'Weathering', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'stone', label: 'Stone', type: 'select', default: 'sandstone', options: [['sandstone', 'Sandstone'], ['limestone', 'Limestone'], ['red', 'Red stone']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, L = stretchedL(cache);
    const T = boxBlur(boxBlur(L, W, H, Math.max(1, Math.round(2 * sc))), W, H, Math.max(1, Math.round(2 * sc))), Ts = boxBlur(boxBlur(L, W, H, Math.round(12 * sc)), W, H, Math.round(12 * sc));
    const key = [p.pattern, p.size, W, H].join('|');
    if (cache.mkk !== key) {
      const P = new Float32Array(W * H);
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) P[i] = carve((fr(x / s) - 0.5) * 2, (fr(y / s) - 0.5) * 2, p.pattern);
      cache.mkP = P; cache.mkk = key;
    }
    const P = cache.mkP, Hh = new Float32Array(W * H), rel = p.relief / 100;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) Hh[i] = P[i] * (0.12 + 1.15 * T[i] * T[i]) + 1.5 * Ts[i] * 0.6 + (fbm(x / (3 * sc), y / (3 * sc), 3, 2) - 0.5) * 0.05;
    const { sx, sy } = slopes(Hh, W, H, 70 * rel), Hb = boxBlur(Hh, W, H, Math.max(1, Math.round(3.5 * sc)));
    const a = (p.light * Math.PI) / 180, Lx = Math.cos(a), Ly = Math.sin(a), [s0, s1] = STONES[p.stone].map(hexToRgb), tint = p.tint / 100, wth = p.weather / 100, tmp = [0, 0, 0];
    const img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const m = fbm(x / (45 * sc), y / (45 * sc), 8, 3), g = 0.93 + 0.14 * hash2(x, y, 6);
      let r = (s0[0] + (s1[0] - s0[0]) * m) * g, gg = (s0[1] + (s1[1] - s0[1]) * m) * g, b = (s0[2] + (s1[2] - s0[2]) * m) * g;
      if (tint > 0.02) { vivid([d[k], d[k + 1], d[k + 2]], 1.1, 0, tmp); const t = tint * 0.55; r += (tmp[0] * 0.9 - r) * t; gg += (tmp[1] * 0.9 - gg) * t; b += (tmp[2] * 0.9 - b) * t; }
      const ao = clamp((Hb[i] - Hh[i]) * 2.4, 0, 0.55), sh = clamp(0.74 + (sx[i] * Lx + sy[i] * Ly) * 0.7, 0.3, 1.45) * (1 - ao);
      let f = sh;
      if (wth > 0.02) {
        const streak = fbm(x / (50 * sc), y / (280 * sc), 6, 3), lich = fbm(x / (16 * sc), y / (16 * sc), 9, 3);
        f *= 1 - 0.18 * wth * smoothstep(0.52, 0.7, streak);
        if (lich > 0.68) { const q = smoothstep(0.68, 0.78, lich) * 0.3 * wth; r += (118 - r) * q; gg += (134 - gg) * q; b += (92 - b) * q; }
      }
      o[k] = r * f; o[k + 1] = gg * f; o[k + 2] = b * f; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
