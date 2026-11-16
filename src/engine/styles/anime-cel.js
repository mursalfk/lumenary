// src/engine/styles/anime-cel.js
import { still, clamp, lerp, smoothstep, rgb2hsl, hsl2rgb, blur2 } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';
import { flatten, darkLines, shapeLines, bloom } from '../toon.js';

const INKS = { dark: [24, 20, 34], brown: [66, 38, 30], blue: [30, 40, 92] };
const COOL = [72, 64, 150];

export default still({
  id: 'anime-cel',
  name: 'Anime Cel',
  blurb: 'A painted animation frame: flat colour in a handful of paints, one hard-edged shadow tone, thin ink lines and white shine on the brightest spots.',
  maxSide: 1000,
  params: [
    { key: 'colours', label: 'Paint colours', type: 'range', min: 6, max: 20, step: 1, default: 13 },
    { key: 'smooth', label: 'Shape smoothing', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'shade', label: 'Cel shadow', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'lines', label: 'Ink lines', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'vivid', label: 'Colour', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'shine', label: 'Shine', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'glow', label: 'Soft glow', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'ink', label: 'Line colour', type: 'select', default: 'tinted', options: [['tinted', 'Tinted by the paint'], ['dark', 'Black'], ['brown', 'Brown'], ['blue', 'Blue']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 900;
    const fk = p.colours + '|' + p.smooth;
    if (cache.fk !== fk) { cache.flat = flatten(d, W, H, p.colours, lerp(2, 7, p.smooth / 100) * sc, lerp(0, 2.6, p.smooth / 100) * sc, 5, cache); cache.fk = fk; }
    if (cache.dk !== fk) {
      // tone of the smoothed picture: lines drawn from it follow real outlines and skip skin texture and noise
      const ch = cache.flat.ch, T = new Float32Array(N);
      for (let i = 0; i < N; i++) T[i] = (0.2126 * ch[0][i] + 0.7152 * ch[1][i] + 0.0722 * ch[2][i]) / 255;
      cache.dog = darkLines(T, W, H, 0, Math.round(2.2 * sc));
      cache.rim = shapeLines(cache.flat.idx, cache.flat.pal, W, H);
      const Ls = stretchedL(cache);
      // small dark features the smoothing wipes out, such as eyes and mouths, are taken from the picture itself
      cache.fine = darkLines(Ls, W, H, 1, Math.round(3.4 * sc));
      cache.Lb = blur2(Ls, W, H, Math.max(1, Math.round(2.2 * sc)));
      cache.Lw = blur2(Ls, W, H, Math.max(2, Math.round(16 * sc)));
      cache.dk = fk;
    }
    const { idx, pal } = cache.flat, { dog, rim, fine, Lb, Lw } = cache, vivid = p.vivid / 100;
    // each paint is made richer; its shadow tone is darker and leans toward a cool violet, as cel painters mix it
    const paint = pal.map((c) => {
      const [h, s, l] = rgb2hsl(c[0], c[1], c[2]);
      return hsl2rgb(h, clamp(s * (1 + 0.7 * vivid) + 0.05 * vivid), clamp((l - 0.5) * (1 + 0.18 * vivid) + 0.52));
    });
    const dusk = paint.map((c) => [0, 1, 2].map((k) => lerp(c[k] * 0.74, COOL[k], 0.16)));
    const shade = p.shade / 100, st = lerp(0.12, 0.02, shade), lines = p.lines / 100, lo = lerp(0.05, 0.012, lines);
    const shine = p.shine / 100, ht = lerp(1.0, 0.88, shine), fixed = INKS[p.ink];
    const out = ctx.createImageData(W, H), o = out.data;
    for (let i = 0, k = 0; i < N; i++, k += 4) {
      const c = paint[idx[i]], q = dusk[idx[i]];
      // the shadow is one hard step, taken where the picture is darker than the area around it
      const s = shade > 0 ? smoothstep(st, st + 0.014, Lw[i] - Lb[i]) : 0;
      let r = c[0] + (q[0] - c[0]) * s, g = c[1] + (q[1] - c[1]) * s, b = c[2] + (q[2] - c[2]) * s;
      if (shine > 0) { const w = smoothstep(ht, ht + 0.02, Lb[i]) * smoothstep(0.1, 0.16, Lb[i] - Lw[i]) * 0.92; r += (255 - r) * w; g += (255 - g) * w; b += (255 - b) * w; }
      if (lines > 0) {
        const a = Math.max(smoothstep(lo, lo * 2.2, dog[i]), rim[i] * (0.35 + 0.65 * lines), smoothstep(0.1, 0.17, fine[i]) * 0.85) * (0.6 + 0.4 * lines);
        if (a > 0) {
          const ir = fixed ? fixed[0] : q[0] * 0.3, ig = fixed ? fixed[1] : q[1] * 0.28, ib = fixed ? fixed[2] : q[2] * 0.36;
          r += (ir - r) * a; g += (ig - g) * a; b += (ib - b) * a;
        }
      }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    bloom(env, ctx, W, H, (p.glow / 100) * 0.45);
  },
});
