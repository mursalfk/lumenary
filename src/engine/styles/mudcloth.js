// src/engine/styles/mudcloth.js
import { still, hexToRgb, clamp, smoothstep, hash2, vnoise } from '../utils.js';
import { pixels, sampler, fbm } from '../helpers.js';
import { modeFilter, edgeMask } from '../culture.js';

const fr = (v) => v - Math.floor(v);
const CLOTHS = { cream: ['#e8dcc0', '#2e2118'], ochre: ['#d6b878', '#33261a'], rust: ['#b35a35', '#241812'] };

// How much mud a motif lays down at a point, by darkness level 0..4. Returns 1 where there is mud.
function mud(level, x, y, q) {
  switch (level) {
    case 0: return 0;
    case 1: { const row = Math.floor(y / q), u = fr(x / q + 0.5 * (row % 2)) - 0.5, v = fr(y / q) - 0.5; return Math.hypot(u, v) < 0.15 ? 1 : 0; }
    case 2: { const tw = Math.abs(fr(x / q) - 0.5) * 2; return Math.abs(fr((y + tw * q * 0.5) / q) - 0.5) < 0.13 ? 1 : 0; }
    case 3: { const u = Math.abs(fr(x / q) - 0.5), v = Math.abs(fr(y / q) - 0.5); return (u < 0.15 && v < 0.42) || (v < 0.15 && u < 0.42) ? 1 : 0; }
    default: { const u = fr(x / q) - 0.5, v = fr(y / q) - 0.5; return Math.hypot(u, v) < 0.12 ? 0 : 1; }
  }
}

export default still({
  id: 'mudcloth',
  name: 'Mudcloth',
  blurb: 'Bogolan from Mali. Hand-woven cotton is painted with fermented river mud, which stains it black. Each shade of your picture is given its own motif, from bare cloth to dots, zigzags and crosses to solid mud.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Motif size', type: 'range', min: 6, max: 24, step: 1, default: 12 },
    { key: 'smooth', label: 'Simplify', type: 'range', min: 1, max: 10, step: 1, default: 5 },
    { key: 'outline', label: 'Outlines', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'hand', label: 'Hand-painted wobble', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'strips', label: 'Strip seams', type: 'toggle', default: true },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['ochre', 'Ochre'], ['rust', 'Rust']] },
    { key: 'invert', label: 'Mud on the light', type: 'toggle', default: false },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, smp = sampler(cache, d, W, H, p.smooth * sc * 1.1), q = p.size * sc * 1.8, hand = p.hand / 100;
    const key = p.smooth + '|' + p.invert + '|' + W;
    if (cache.mck !== key) {
      const lv = new Uint8Array(W * H), T = smp.L;
      for (let i = 0; i < W * H; i++) { const v = p.invert ? T[i] : 1 - T[i]; lv[i] = Math.min(4, Math.floor(clamp(v) * 5)); }
      cache.mcLv = modeFilter(lv, W, H, 5, Math.max(2, Math.round(3 * sc)), 2); cache.mck = key;
    }
    const lv = cache.mcLv, thin = edgeMask(lv, W, H, Math.max(0, Math.round(0.9 * sc))), halo = edgeMask(lv, W, H, Math.max(1, Math.round(3.4 * sc)));
    const [c0, m0] = CLOTHS[p.cloth].map(hexToRgb), sw = 96 * sc, ol = p.outline / 100;
    const img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const s = (x / sw) | 0, wx = x + (vnoise(x / (26 * sc), y / (26 * sc), 2) - 0.5) * 5 * sc * hand + hash2(s, 0, 4) * q, wy = y + (vnoise(x / (31 * sc), y / (31 * sc), 9) - 0.5) * 5 * sc * hand;
      let m = mud(lv[i], wx, wy, q);
      if (halo[i] && ol > 0.02) m = 0;
      if (thin[i] && ol > 0.02) m = 1;
      const edge = fbm(x / (3 * sc), y / (3 * sc), 5, 2);
      const mudCov = m ? clamp(0.82 + 0.35 * edge - 0.25 * (1 - ol) * 0, 0, 1) : 0, cl = 0.97 + 0.04 * Math.sin(x * Math.PI / (1.8 * sc)) * Math.sin(y * Math.PI / (1.8 * sc)) + (hash2(x, y, 2) - 0.5) * 0.06;
      const cn = fbm(x / (90 * sc), y / (90 * sc), 6, 3), mn = 0.8 + 0.4 * fbm(x / (14 * sc), y / (14 * sc), 8, 3);
      let r = (c0[0] * (0.93 + 0.12 * cn)) * cl, g = (c0[1] * (0.93 + 0.12 * cn)) * cl, b = (c0[2] * (0.93 + 0.12 * cn)) * cl;
      if (mudCov > 0.02) { r += (m0[0] * mn - r) * mudCov; g += (m0[1] * mn - g) * mudCov; b += (m0[2] * mn - b) * mudCov; }
      if (p.strips) { const lx = x - s * sw; if (lx < 1.5 * sc) { const f = 0.55 + 0.2 * hash2(x, y, 6); r *= f; g *= f; b *= f; } else if (lx < 3.2 * sc && ((y / (3.4 * sc)) | 0) % 2 === 0) { r *= 0.86; g *= 0.86; b *= 0.86; } }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
