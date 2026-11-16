// src/engine/styles/felt-story.js
import { still, clamp, lerp, smoothstep, blur2, hash2, vnoise, rgb2hsl, hsl2rgb } from '../utils.js';
import { pixels, rgbList } from '../helpers.js';
import { vivid, modeFilter } from '../culture.js';
import { flatten, dress } from '../toon.js';

const SETS = {
  nursery: rgbList(['#f6e7c8', '#f2a7a0', '#e8695c', '#f4c95d', '#8fc7a4', '#4e9a8a', '#8fb7e0', '#4a6fa5', '#b58fc9', '#8a5a44', '#f7f3ea', '#3d3a44']),
  autumn: rgbList(['#f1e3c6', '#e9b44c', '#d9762b', '#b5462f', '#7a2e2a', '#8a8f3c', '#4f6b3a', '#2f4a44', '#c9a37a', '#6b4a35', '#f6efe2', '#2c2623']),
};

export default still({
  id: 'felt-story',
  name: 'Felt Story',
  blurb: 'A picture for a felt board: a few soft colours cut from wool felt, fuzzy at the edges, laid one over another with small shadows and sewn down with running stitch.',
  maxSide: 1000,
  params: [
    { key: 'colours', label: 'Pieces of felt', type: 'range', min: 4, max: 10, step: 1, default: 7 },
    { key: 'simple', label: 'Simple shapes', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'fuzz', label: 'Fuzz', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'stitch', label: 'Stitching', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'shadow', label: 'Layer shadow', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'set', label: 'Felt', type: 'select', default: 'own', options: [['own', 'The picture’s own colours'], ['nursery', 'Nursery box'], ['autumn', 'Autumn box']] },
    { key: 'seed', label: 'Cut again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 900, seed = p.seed * 15 + 2;
    const fk = p.colours + '|' + p.simple;
    if (cache.fk !== fk) {
      const flat = flatten(d, W, H, p.colours, lerp(5, 10, p.simple / 100) * sc, 0, 8, cache);
      flat.idx = modeFilter(flat.idx, W, H, p.colours, Math.max(1, Math.round(lerp(1.5, 5, p.simple / 100) * sc)), 2);
      cache.flat = flat; cache.fk = fk; cache.ek = '';
    }
    const { idx, pal } = cache.flat, tmp = [0, 0, 0], set = SETS[p.set];
    // felt is dyed wool: strong colour, but never glossy and never quite pure
    const cols = set ? dress(pal, set) : pal.map((c) => {
      vivid(c, 1.2, 0, tmp);
      const [h, s, l] = rgb2hsl(tmp[0], tmp[1], tmp[2]);
      return hsl2rgb(h, clamp(s * 0.85), clamp(0.14 + l * 0.74));
    });
    // scissors do not cut felt cleanly: the edge of every piece is nudged by fine noise
    const fz = (p.fuzz / 100) * 2.6 * sc, cut = new Uint8Array(N);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      const sx = clamp(Math.round(x + (vnoise(x * 0.5 / sc, y * 0.5 / sc, seed) - 0.5) * 2 * fz + (vnoise(x * 0.02 / sc, y * 0.02 / sc, seed + 1) - 0.5) * 5 * sc), 0, W - 1);
      const sy = clamp(Math.round(y + (vnoise(x * 0.5 / sc + 9, y * 0.5 / sc + 4, seed) - 0.5) * 2 * fz + (vnoise(x * 0.02 / sc + 5, y * 0.02 / sc + 8, seed + 1) - 0.5) * 5 * sc), 0, H - 1);
      cut[i] = idx[sy * W + sx];
    }
    // How near each pixel is to the edge of its piece: 1 on the edge, falling to 0 a few pixels in. A one-pixel
    // outline blurred twice with a box of radius r becomes a ridge r wide; times its width, the ridge peaks at 1.
    const edge = new Float32Array(N), under = new Float32Array(N), off = Math.max(1, Math.round(3 * sc));
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) { const i = y * W + x; if (cut[i] !== cut[i + 1] || cut[i] !== cut[i + W]) edge[i] = 1; }
    // a pixel lies in shadow when the felt a few pixels up and to the left is a different piece
    for (let y = off; y < H; y++) for (let x = off; x < W; x++) { const i = y * W + x; if (cut[i] !== cut[i - off * W - off]) under[i] = 1; }
    const rr = Math.max(2, Math.round(5 * sc)), near = blur2(edge, W, H, rr), drop = blur2(under, W, H, Math.max(1, Math.round(1.2 * sc))), wide = 2 * rr + 1;
    const stitch = p.stitch / 100, shadow = p.shadow / 100, dash = lerp(15, 9, stitch) * sc, at = 1 - (6.5 * sc) / wide, half = (1.1 * sc) / wide;
    const out = ctx.createImageData(W, H), o = out.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const c = cols[cut[i]];
      // the nap: matted fibres lying every way, plus the odd lighter or darker hair
      const nap = (vnoise(x * 0.9 / sc, y * 0.9 / sc, seed + 2) - 0.5) * 0.12 + (vnoise(x * 0.22 / sc, y * 0.22 / sc, seed + 3) - 0.5) * 0.1 + (hash2(x, y, seed) - 0.5) * 0.09;
      const hair = hash2(x >> 1, (y + (x >> 3)) >> 1, seed + 4) > 0.985 ? 0.12 : 0;
      let f = 1 + nap + hair;
      // the piece on top is thick enough to shade the one beneath, on the side away from the light
      const n = clamp(near[i] * wide);
      f *= 1 - shadow * 0.36 * drop[i];
      f *= 1 - 0.1 * smoothstep(0.55, 1, n);
      let r = c[0] * f, g = c[1] * f, b = c[2] * f;
      if (stitch > 0 && x > 0 && y > 0 && x < W - 1 && y < H - 1) {
        // running stitch: a dashed line a little way in from the edge, following it
        const band = 1 - smoothstep(half, half * 2.2, Math.abs(n - at));
        if (band > 0) {
          const gx = near[i + 1] - near[i - 1], gy = near[i + W] - near[i - W], along = Math.abs(gx) > Math.abs(gy) ? y : x, on = ((along / dash) % 1) < 0.58 ? 1 : 0, a = band * on * (0.65 + 0.35 * stitch);
          // light thread on dark felt, dark thread on light felt
          const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2], t = l > 130 ? [70, 56, 52] : [246, 238, 220];
          r += (t[0] - r) * a; g += (t[1] - g) * a; b += (t[2] - b) * a;
        }
      }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
