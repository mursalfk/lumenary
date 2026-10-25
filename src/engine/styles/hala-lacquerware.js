// src/engine/styles/hala-lacquerware.js
import { still, clamp, hexToRgb, smoothstep, boxBlur, sobel } from '../utils.js';
import { pixels, sampler, stretchedL, fbm, nearest } from '../helpers.js';
import { vivid } from '../culture.js';

// Lac sticks are pressed onto the turning wood in these colours.
const LAC = ['#b3261e', '#e8b923', '#1f6b3a', '#1b3d7a', '#15110f', '#f2e8cf', '#d9701f'].map(hexToRgb);
const GOLD = [230, 196, 106];

// Half-width of the turned vessel at height t (0 top, 1 bottom), in pixels. Zero outside the piece.
function halfWidth(t, shape, W) {
  if (t < 0.06 || t > 0.95) return 0;
  const u = (t - 0.06) / 0.89;
  if (shape === 'cylinder') return W * 0.33;
  if (shape === 'egg') return W * 0.45 * Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * u)), 0.55);
  return W * (0.17 + 0.27 * smoothstep(0.1, 0.5, u) - 0.12 * smoothstep(0.62, 1, u) + 0.03 * smoothstep(0.08, 0, u));
}

export default still({
  id: 'hala-lacquerware',
  name: 'Hala Lacquerware',
  blurb: 'Wood turned on a lathe and coated in lac, the way it is done in Hala. Bands of colour wind around the piece, and fine lines are scratched through to the layer beneath.',
  maxSide: 1100,
  params: [
    { key: 'shape', label: 'Piece', type: 'select', default: 'vase', options: [['vase', 'Vase'], ['cylinder', 'Cylinder'], ['egg', 'Jar']] },
    { key: 'band', label: 'Band width', type: 'range', min: 2, max: 14, step: 1, default: 6 },
    { key: 'detail', label: 'Colour follows picture', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'scratch', label: 'Scratched lines', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'polish', label: 'Polish', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'wrap', label: 'Wrap the picture round', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, smp = sampler(cache, d, W, H, 2 * sc), bh = Math.max(2, Math.round(p.band * sc * 1.3));
    if (cache.lkW !== W) {
      const row = new Float32Array(H * 3);
      for (let y = 0; y < H; y++) { let r = 0, g = 0, b = 0; for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; r += d[k]; g += d[k + 1]; b += d[k + 2]; } row[y * 3] = r / W; row[y * 3 + 1] = g / W; row[y * 3 + 2] = b / W; }
      cache.lkRow = row; cache.lkE = sobel(boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(1.5 * sc))), W, H, 1).mag; cache.lkW = W;
    }
    const row = cache.lkRow, E = cache.lkE, tmp = [0, 0, 0], stripe = [], det = p.detail / 100, sa = p.scratch / 100, pol = p.polish / 100, cx = W / 2, shape = p.shape;
    for (let b = 0; b * bh < H; b++) {
      let r = 0, g = 0, bl = 0, n = 0;
      for (let y = b * bh; y < Math.min(H, (b + 1) * bh); y++) { r += row[y * 3]; g += row[y * 3 + 1]; bl += row[y * 3 + 2]; n++; }
      vivid([r / n, g / n, bl / n], 1.6, 0.02, tmp); stripe.push([tmp[0], tmp[1], tmp[2]]);
    }
    const img = ctx.createImageData(W, H), o = img.data, mix = [0, 0, 0];
    for (let y = 0, k = 0; y < H; y++) {
      const t = y / H, rr = halfWidth(t, shape, W), sb = stripe[(y / bh) | 0], lathe = y % bh < 0.8 * sc ? 0.8 : 1;
      for (let x = 0; x < W; x++, k += 4) {
        // the dark room behind the piece
        const gy = y / H, bgA = 40 - 28 * gy, glow = Math.exp(-(((x - cx) / (W * 0.5)) ** 2 + ((y - H * 0.5) / (H * 0.6)) ** 2) * 2.2) * 22;
        let br = bgA + glow, bg2 = (bgA + glow) * 0.82, bb = (bgA + glow) * 0.72;
        const dx = x - cx, cov = rr > 0 ? clamp(rr - Math.abs(dx) + 0.5, 0, 1) : 0;
        // a soft shadow where the piece stands
        if (!cov && y > H * 0.9 && y < H * 0.99) { const sh = Math.exp(-((dx / (rr || W * 0.3 + 1)) ** 2)) * 0.5 * smoothstep(H * 0.9, H * 0.95, y); br *= 1 - sh * 0.8; bg2 *= 1 - sh * 0.8; bb *= 1 - sh * 0.8; }
        if (cov <= 0) { o[k] = br; o[k + 1] = bg2; o[k + 2] = bb; o[k + 3] = 255; continue; }
        const u = clamp(dx / rr, -1, 1), phi = Math.asin(u), cs = Math.cos(phi), xs = p.wrap ? clamp(W * (0.5 + phi / Math.PI), 0, W - 1) : clamp(x, 0, W - 1);
        const loc = smp.rgb(xs, y);
        mix[0] = sb[0] + (loc[0] - sb[0]) * det; mix[1] = sb[1] + (loc[1] - sb[1]) * det; mix[2] = sb[2] + (loc[2] - sb[2]) * det;
        vivid(mix, 1.3, 0, tmp);
        const c = LAC[nearest(LAC, tmp[0], tmp[1], tmp[2])];
        let r = c[0] * lathe, g = c[1] * lathe, b = c[2] * lathe;
        const e = smoothstep(0.06, 0.16, E[y * W + (xs | 0)]) * sa;
        if (e > 0) { r += (GOLD[0] - r) * e * 0.9; g += (GOLD[1] - g) * e * 0.9; b += (GOLD[2] - b) * e * 0.9; }
        const dif = 0.3 + 0.7 * cs, rim = 1 - 0.45 * smoothstep(0.82, 1, Math.abs(u)), grain = 0.97 + 0.06 * fbm(x / (3 * sc), y / (60 * sc), 4, 2);
        const spec = (Math.exp(-(((u + 0.42) / 0.16) ** 2)) * 0.75 + Math.exp(-(((u - 0.68) / 0.07) ** 2)) * 0.3) * pol * 255;
        const f = dif * rim * grain;
        o[k] = r * f + spec * 0.9 + (br - r * f - spec * 0.9) * (1 - cov); o[k + 1] = g * f + spec * 0.9 + (bg2 - g * f - spec * 0.9) * (1 - cov); o[k + 2] = b * f + spec * 0.85 + (bb - b * f - spec * 0.85) * (1 - cov); o[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  },
});
