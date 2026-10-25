// src/engine/styles/anaglyph-3d.js
import { still, clamp, boxBlur, lerp } from '../utils.js';
import { pixels, bilinearRGB, stretchedL } from '../helpers.js';

const GLASSES = {
  rc: { name: 'Red and cyan', left: [1, 0, 0] },
  mg: { name: 'Magenta and green', left: [1, 0, 1] },
  ab: { name: 'Amber and blue', left: [1, 1, 0] },
};
const SOURCES = [['bright', 'Bright is near'], ['dark', 'Dark is near'], ['ground', 'Ground plane'], ['mix', 'Mixed']];

export default still({
  id: 'anaglyph-3d',
  name: 'Anaglyph 3D',
  blurb: 'Two eyes, two colours: a guessed depth map pushes each eye’s view sideways, and a pair of coloured glasses puts them back together.',
  maxSide: 1000,
  params: [
    { key: 'depth', label: 'Depth', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'src', label: 'How depth is guessed', type: 'select', default: 'mix', options: SOURCES },
    { key: 'focus', label: 'Focus plane', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'glasses', label: 'Glasses', type: 'select', default: 'rc', options: Object.entries(GLASSES).map(([k, v]) => [k, v.name]) },
    { key: 'keep', label: 'Keep original colour', type: 'range', min: 0, max: 100, step: 1, default: 65 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const img = pixels(work, W, H, cache), d = img.data, sc = W / 800, N = W * H;
    if (cache.key !== W) { cache.Lb = boxBlur(boxBlur(stretchedL(cache), W, H, Math.round(6 * sc)), W, H, Math.round(6 * sc)); cache.key = W; }
    const Lb = cache.Lb, ma = (GLASSES[p.glasses] || GLASSES.rc).left, shift = (p.depth / 100) * 46 * sc, focus = p.focus / 100, keep = p.keep / 100;
    const depthAt = (i, y) => {
      const l = Lb[i], g = y / H;
      if (p.src === 'bright') return l;
      if (p.src === 'dark') return 1 - l;
      if (p.src === 'ground') return g;
      return 0.55 * l + 0.45 * g;
    };
    const out = ctx.createImageData(W, H), o4 = out.data, a = [0, 0, 0], b = [0, 0, 0];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, s = (depthAt(i, y) - focus) * shift;
      bilinearRGB(d, W, H, x - s, y, a); bilinearRGB(d, W, H, x + s, y, b);
      const la = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2], lb = 0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2];
      // the left eye feeds the filter's own colours, the right eye the rest. Colour is blended back in by `keep`.
      const A = [lerp(la, a[0], keep), lerp(la, a[1], keep), lerp(la, a[2], keep)], B = [lerp(lb, b[0], keep), lerp(lb, b[1], keep), lerp(lb, b[2], keep)];
      if (p.glasses === 'ab') { o4[o] = A[0]; o4[o + 1] = A[1] * 0.85 + B[1] * 0.15; o4[o + 2] = B[2]; }
      else if (p.glasses === 'mg') { o4[o] = A[0]; o4[o + 1] = B[1]; o4[o + 2] = A[2]; }
      else { o4[o] = A[0]; o4[o + 1] = B[1]; o4[o + 2] = B[2]; }
      o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
