// src/engine/styles/mughal-jali.js
import { still, clamp, hexToRgb, smoothstep, boxBlur, hash2, TAU } from '../utils.js';
import { pixels, slopes, fbm } from '../helpers.js';
import { starRadius } from '../culture.js';

const STONES = { marble: '#efe9dc', sandstone: '#c98a5c', blush: '#e6cdc3' };
const S3 = Math.sqrt(3);

// How far inside an opening a point lies, in pixels (negative in the stone). Three carved patterns.
function margin(pattern, x, y, s, hf) {
  if (pattern === 'star6') {
    const sz = s * 0.62, q = ((S3 / 3) * x - y / 3) / sz, r = ((2 / 3) * y) / sz;
    let rx = Math.round(q), rz = Math.round(r), ry = Math.round(-q - r);
    const dx = Math.abs(rx - q), dy = Math.abs(ry - (-q - r)), dz = Math.abs(rz - r);
    if (dx > dy && dx > dz) rx = -ry - rz; else if (dy > dz) ry = -rx - rz; else rz = -rx - ry;
    const lx = x - sz * S3 * (rx + rz / 2), ly = y - sz * 1.5 * rz, rho = Math.hypot(lx, ly) / sz, a = Math.atan2(ly, lx);
    const m1 = starRadius(a - Math.PI / 6, 6, 0.9 * hf, 0.48 * hf) - rho;
    const k = Math.round((a - Math.PI / 6) / (Math.PI / 3)), vx = Math.cos(Math.PI / 6 + (k * Math.PI) / 3), vy = Math.sin(Math.PI / 6 + (k * Math.PI) / 3);
    const m2 = 0.17 * hf - Math.hypot(lx / sz - vx, ly / sz - vy);
    return Math.max(m1, m2) * sz;
  }
  const u = (x / s - Math.floor(x / s) - 0.5) * 2, v = (y / s - Math.floor(y / s) - 0.5) * 2;
  if (pattern === 'lotus') {
    const rl = 0.5 * hf, c = 0.42;
    const m1 = Math.max(rl - Math.hypot(u - c, v), rl - Math.hypot(u + c, v), rl - Math.hypot(u, v - c), rl - Math.hypot(u, v + c));
    const m2 = 0.36 * hf - ((1 - Math.abs(u)) + (1 - Math.abs(v)));
    return Math.max(m1, m2) * (s / 2);
  }
  const rho = Math.hypot(u, v), a = Math.atan2(v, u);
  const m1 = starRadius(a, 8, 0.92 * hf, 0.5 * hf) - rho;
  const m2 = 0.34 * hf - ((1 - Math.abs(u)) + (1 - Math.abs(v)));
  return Math.max(m1, m2) * (s / 2);
}

export default still({
  id: 'mughal-jali',
  name: 'Mughal Jali',
  blurb: 'A pierced marble screen, as in the tombs and forts of the Mughals. Your picture is the view behind it, and the stone throws its shadow across the scene.',
  maxSide: 1100,
  params: [
    { key: 'pattern', label: 'Carving', type: 'select', default: 'star8', options: [['star8', 'Eight-point star'], ['star6', 'Six-point star'], ['lotus', 'Lotus and lozenge']] },
    { key: 'cells', label: 'Cells across', type: 'range', min: 3, max: 16, step: 1, default: 7 },
    { key: 'hole', label: 'Opening', type: 'range', min: 30, max: 100, step: 1, default: 78 },
    { key: 'depth', label: 'Thickness of the stone', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'light', label: 'Sun direction', type: 'range', min: 0, max: 360, step: 5, default: 225, fmt: (v) => v + '°' },
    { key: 'glow', label: 'Light on the view', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'stone', label: 'Stone', type: 'select', default: 'marble', options: [['marble', 'White marble'], ['sandstone', 'Red sandstone'], ['blush', 'Pink marble']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = W / p.cells, hf = 0.45 + 0.55 * (p.hole / 100);
    const key = [p.pattern, p.cells, p.hole, W, H].join('|');
    if (cache.jk !== key) {
      const M = new Float32Array(W * H), aa = 0.9;
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) M[i] = smoothstep(-aa, aa, margin(p.pattern, x, y, s, hf));
      cache.jM = M; cache.jk = key;
    }
    const M = cache.jM, Mb = boxBlur(boxBlur(M, W, H, Math.max(1, Math.round(2.4 * sc))), W, H, Math.max(1, Math.round(2.4 * sc)));
    const Mh = boxBlur(boxBlur(M, W, H, Math.round(7 * sc)), W, H, Math.round(7 * sc));
    const { sx, sy } = slopes(Mb, W, H, 38);
    const a = (p.light * Math.PI) / 180, Lx = Math.cos(a), Ly = Math.sin(a), dep = (p.depth / 100) * 26 * sc, gl = p.glow / 100;
    const base = hexToRgb(STONES[p.stone]), img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const hm = M[i];
      // stone: marble veins, fine grain, a bevelled edge facing the sun, and light spilling from the openings
      const wv = fbm(x / (150 * sc) + 3, y / (150 * sc), 11, 3), vein = 1 - smoothstep(0, 0.035, Math.abs(wv - 0.5));
      const gr = (hash2(x, y, 5) - 0.5) * 0.05, bev = clamp((sx[i] * Lx + sy[i] * Ly) * 0.9, -0.55, 0.55);
      let sf = 0.86 + gr + bev - vein * 0.1 + Mh[i] * gl * 0.2;
      let sr = base[0] * sf, sg = base[1] * sf, sb = base[2] * sf;
      sr += Mh[i] * gl * 30; sg += Mh[i] * gl * 20; sb += Mh[i] * gl * 8;
      if (hm <= 0.001) { o[k] = clamp(sr, 0, 255); o[k + 1] = clamp(sg, 0, 255); o[k + 2] = clamp(sb, 0, 255); o[k + 3] = 255; continue; }
      // the view behind: lit only where the sun passes through an opening
      const xi = clamp(Math.round(x + Lx * dep), 0, W - 1), yi = clamp(Math.round(y + Ly * dep), 0, H - 1), lit = Mb[yi * W + xi];
      const f = (0.38 + 0.9 * gl) * (0.42 + 0.7 * lit);
      const vr = d[k] * f + 20 * lit * gl, vg = d[k + 1] * f + 14 * lit * gl, vb = d[k + 2] * f;
      o[k] = clamp(sr + (vr - sr) * hm, 0, 255); o[k + 1] = clamp(sg + (vg - sg) * hm, 0, 255); o[k + 2] = clamp(sb + (vb - sb) * hm, 0, 255); o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
