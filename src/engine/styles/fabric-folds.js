// src/engine/styles/fabric-folds.js
import { still, vnoise, boxBlur, hexToRgb, rgb2hsl, hsl2rgb, clamp, TAU } from '../utils.js';
import { pixels, stretchedL, slopes } from '../helpers.js';

const CLOTHS = { wine: '#7a1830', navy: '#1a2a5c', emerald: '#0f6a4c', ivory: '#e7dfcf', gold: '#b88a2a' };

export default still({
  id: 'fabric-folds',
  name: 'Fabric Folds',
  blurb: 'Cloth hung in soft folds, the folds bent into the shape of your picture. Printed or plain, with a woven grain.',
  maxSide: 1000,
  params: [
    { key: 'folds', label: 'Folds', type: 'range', min: 3, max: 22, step: 1, default: 9 },
    { key: 'warp', label: 'Picture bends the folds', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'depth', label: 'Depth', type: 'range', min: 5, max: 100, step: 1, default: 55 },
    { key: 'angle', label: 'Direction of hang', type: 'range', min: 0, max: 180, step: 1, default: 80, fmt: (v) => v + '°' },
    { key: 'sheen', label: 'Sheen', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'print', options: [['print', 'Printed with the picture'], ['wine', 'Wine silk'], ['navy', 'Navy silk'], ['emerald', 'Emerald silk'], ['ivory', 'Ivory linen'], ['gold', 'Gold satin']] },
    { key: 'weave', label: 'Woven grain', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const src = pixels(work, W, H, cache).data, N = W * H, sc = W / 800;
    const Lb = boxBlur(boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(4 * sc))), W, H, Math.max(1, Math.round(4 * sc)));
    const th = (p.angle * Math.PI) / 180, cs = Math.cos(th), sn = Math.sin(th), f = p.folds, wp = (p.warp / 100) * 1.6;
    const hgt = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, u = (x * cs + y * sn) / W + (vnoise(x * 0.006 / sc, y * 0.006 / sc, 5) - 0.5) * 0.22 / Math.max(1, f / 9), ph = TAU * (f * u + wp * Lb[i]);
      hgt[i] = 0.62 * Math.sin(ph) + 0.22 * Math.sin(2.3 * ph + 1.3 + Lb[i] * 2) + 0.35 * Lb[i];
    }
    const { sx, sy } = slopes(hgt, W, H, (0.4 + p.depth / 100 * 2.6) * 6 * sc * 2.4 / Math.max(1, f / 6));
    const cloth = p.cloth === 'print' ? null : hexToRgb(CLOTHS[p.cloth] || CLOTHS.wine), sheen = p.sheen / 100;
    const lx = -0.45, ly = -0.55, lz = 0.7, hx = lx, hy = ly, hz = lz + 1, hn = Math.hypot(hx, hy, hz), st = 2.2 * sc + 1.6;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      let nx = sx[i], ny = sy[i]; const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= nl; ny *= nl; const nz = nl;
      const diff = Math.max(0, nx * lx + ny * ly + nz * lz), spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hn), 18) * sheen * 0.45;
      // cloth fibres lit from behind at the grazing angles: a soft rim of light
      const rim = Math.pow(1 - nz, 2) * sheen * 0.35;
      let R, G, B;
      if (cloth) { R = cloth[0]; G = cloth[1]; B = cloth[2]; }
      else {
        const [h, s, l] = rgb2hsl(src[o], src[o + 1], src[o + 2]);
        [R, G, B] = hsl2rgb(h, clamp(s * 0.85), clamp(l * 0.85 + 0.08));
      }
      let shade = 0.28 + 0.82 * diff;
      if (p.weave) shade *= 0.93 + 0.07 * Math.cos((x * TAU) / st) * Math.cos((y * TAU) / st) + 0.02 * Math.sin((x + y) * 0.7);
      o4[o] = R * shade + (spec + rim) * 255 * (cloth ? 1 : 0.8); o4[o + 1] = G * shade + (spec + rim) * 245; o4[o + 2] = B * shade + (spec + rim) * 230; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
