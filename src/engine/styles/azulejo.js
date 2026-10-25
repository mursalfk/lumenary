// src/engine/styles/azulejo.js
import { still, hexToRgb, clamp, smoothstep, boxBlur, sobel, hash2, vnoise } from '../utils.js';
import { pixels, sampler, stretchedL, fbm, cellular, ramp } from '../helpers.js';

const fr = (v) => v - Math.floor(v);
const INKS = {
  cobalt: { stops: [[14, 28, 84], [40, 78, 176], [150, 176, 228], [244, 246, 248]], deep: [14, 28, 84] },
  manganese: { stops: [[40, 18, 66], [104, 62, 150], [196, 172, 220], [246, 244, 248]], deep: [40, 18, 66] },
  copper: { stops: [[10, 54, 50], [40, 128, 118], [160, 206, 196], [244, 248, 246]], deep: [10, 54, 50] },
};

// The pattern painted on every tile: a quarter rosette at each corner (four tiles together make a whole one) and a small
// flower in the middle. u and v run 0..1 across the tile; returns 1 inside the ornament.
function ornament(u, v) {
  const a = Math.min(u, 1 - u), b = Math.min(v, 1 - v), r = Math.hypot(a, b), th = Math.atan2(b, a);
  const petal = 0.3 * (0.56 + 0.44 * Math.abs(Math.cos(4 * th)));
  let m = r < petal ? 1 : 0;
  if (r < 0.07) m = 1 - m;
  if (Math.abs(r - 0.4) < 0.014) m = 1;
  if (Math.abs(a - b) < 0.008 && r > 0.42 && r < 0.6) m = 1;
  const cr = Math.hypot(u - 0.5, v - 0.5), ca = Math.atan2(v - 0.5, u - 0.5);
  if (cr < 0.13 * (0.7 + 0.3 * Math.abs(Math.cos(2 * ca)))) m = 1;
  if (cr < 0.045) m = 0;
  return m;
}

export default still({
  id: 'azulejo',
  name: 'Azulejo',
  blurb: 'The painted tiles of Portugal and Spain: cobalt on white glaze, one square at a time. Your picture is the wash, and a rosette is painted at every corner, so four tiles together make a whole flower.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Tile size', type: 'range', min: 40, max: 160, step: 1, default: 80 },
    { key: 'pattern', label: 'Painted pattern', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'line', label: 'Brush lines', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'crackle', label: 'Glaze crackle', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'ink', label: 'Pigment', type: 'select', default: 'cobalt', options: [['cobalt', 'Cobalt'], ['manganese', 'Manganese'], ['copper', 'Copper green']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, s = p.size * sc, ink = INKS[p.ink], L = stretchedL(cache), T = boxBlur(boxBlur(L, W, H, Math.max(1, Math.round(1.5 * sc))), W, H, Math.max(1, Math.round(1.5 * sc)));
    const E = sobel(boxBlur(L, W, H, Math.max(1, Math.round(1.3 * sc))), W, H, 1).mag, pt = p.pattern / 100, ln = p.line / 100, cr = p.crackle / 100, g = 1.2 * sc, bv = 3 * sc;
    const img = ctx.createImageData(W, H), o = img.data, col = [0, 0, 0], out = [0, 0, 0, 0, 0], cols = Math.ceil(W / s), rows = Math.ceil(H / s), ox = (W - cols * s) / 2, oy = (H - rows * s) / 2;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const tx = (x - ox) / s, ty = (y - oy) / s, ci = Math.floor(tx), ri = Math.floor(ty), u = tx - ci, v = ty - ri;
      const e = Math.min(u, 1 - u, v, 1 - v) * s, t = T[i], th = hash2(ci, ri, 5);
      // wash
      const streak = fbm(x / (90 * sc), y / (7 * sc), 3, 3), wash = clamp(t * (0.96 + 0.1 * streak) + (th - 0.5) * 0.04);
      ramp(ink.stops, wash, col);
      let r = col[0], gg = col[1], b = col[2];
      // painted pattern, in pigment on the light parts and in glaze on the dark parts
      if (pt > 0.02 && ornament(u, v)) {
        const lightPart = wash > 0.5, tgt = lightPart ? ink.deep : [246, 246, 248], q = 0.15 + 0.8 * pt;
        r += (tgt[0] - r) * q; gg += (tgt[1] - gg) * q; b += (tgt[2] - b) * q;
      }
      if (ln > 0.02) { const el = smoothstep(0.1, 0.3, E[i]) * ln * 0.75; r += (ink.deep[0] - r) * el; gg += (ink.deep[1] - gg) * el; b += (ink.deep[2] - b) * el; }
      // glaze: a faint tile-to-tile tint and a touch of sheen
      const tint = 0.97 + 0.05 * th; r *= tint; gg *= tint; b *= tint * 1.005;
      if (cr > 0.02) {
        cellular(x, y, 14 * sc, 3, out);
        const vein = out[1] - out[0];
        if (vein < 0.8 * sc && vnoise(x / (80 * sc), y / (80 * sc), 6) > 0.7 - 0.32 * cr) { const q = 0.35 * cr + 0.1; r *= 1 - q; gg *= 1 - q; b *= 1 - q * 0.8; }
      }
      // bevel and grout
      if (e < g) { r = 188; gg = 192; b = 198; } else if (e < g + bv) {
        const f = (e - g) / bv, up = (u < 0.5 && u * s < v * s ? 1 : 0) + (v < 0.5 && v * s < u * s ? 1 : 0), lit = up ? 1 : -1, k2 = (1 - f) * 0.18 * lit;
        r += (lit > 0 ? 255 - r : -r) * Math.abs(k2); gg += (lit > 0 ? 255 - gg : -gg) * Math.abs(k2); b += (lit > 0 ? 255 - b : -b) * Math.abs(k2);
      }
      o[k] = r; o[k + 1] = gg; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
