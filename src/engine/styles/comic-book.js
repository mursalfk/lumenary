import { still, clamp, lumArray, boxBlur, sobel, smoothstep, lerp } from '../utils.js';

export default still({
  id: 'comic-book',
  number: 12,
  name: 'Comic book',
  blurb: 'Flat inked color, hard outlines and printed dots in the shadows.',
  maxSide: 1100,
  params: [
    { key: 'levels', label: 'Color steps', type: 'range', min: 2, max: 8, step: 1, default: 4 },
    { key: 'pop', label: 'Color pop', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'ink', label: 'Ink lines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'thick', label: 'Line weight', type: 'range', min: 1, max: 4, step: 1, default: 2 },
    { key: 'dots', label: 'Print dots', type: 'toggle', default: true },
    { key: 'dotSize', label: 'Dot size', type: 'range', min: 40, max: 160, step: 1, default: 90, fmt: (v) => 'W/' + v },
  ],
  render(ctx, work, p, env, W, H, cache) {
    if (cache.key !== 'src') {
      cache.data = work.getContext('2d').getImageData(0, 0, W, H);
      cache.L = lumArray(cache.data); cache.key = 'src';
    }
    const src = cache.data.data, L = cache.L;
    const Lb = boxBlur(L, W, H, Math.max(1, Math.round(W / 500)));
    const { mag } = sobel(Lb, W, H, Math.max(1, Math.round((W / 700) * p.thick)));
    const th = lerp(0.32, 0.05, p.ink / 100);
    const lv = p.levels, sat = 1 + p.pop / 55;
    const sp = W / p.dotSize, ca = Math.SQRT1_2;
    const img = ctx.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x, o = i * 4;
        const l = L[i], q = Math.round(l * (lv - 1)) / (lv - 1);
        const k = (q + 0.06) / (l + 0.06);
        let r = src[o] * k, g = src[o + 1] * k, b = src[o + 2] * k;
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; b = gray + (b - gray) * sat;
        if (p.dots && q > 0.02 && q < 0.62) {
          const u = (x + y) * ca / sp, v = (y - x) * ca / sp;
          const fu = u - Math.round(u), fv = v - Math.round(v);
          const rad = 0.18 + 0.32 * (1 - q / 0.62);
          if (Math.hypot(fu, fv) < rad) { r *= 0.5; g *= 0.5; b *= 0.55; }
        }
        const e = p.ink > 0 ? smoothstep(th, th * 1.35, mag[i]) : 0;
        d[o] = clamp(r * (1 - e), 0, 255); d[o + 1] = clamp(g * (1 - e), 0, 255); d[o + 2] = clamp(b * (1 - e), 0, 255); d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  },
});
