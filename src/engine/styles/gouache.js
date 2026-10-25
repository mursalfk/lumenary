// src/engine/styles/gouache.js
import { still, vnoise, boxBlur, smoothstep, clamp, hash2, rgb2hsl, hsl2rgb } from '../utils.js';
import { pixels, blurRGB, kmeans, nearest } from '../helpers.js';

export default still({
  id: 'gouache',
  name: 'Gouache',
  blurb: 'Flat, opaque, matte paint in a handful of colours, with hand-wobbled edges, thin gaps of bare paper and the drag of a wide brush.',
  maxSide: 1000,
  params: [
    { key: 'colours', label: 'Colours of paint', type: 'range', min: 3, max: 10, step: 1, default: 6 },
    { key: 'smooth', label: 'Smoothness of shapes', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'wobble', label: 'Hand-wobbled edges', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'gaps', label: 'Gaps of bare paper', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'streaks', label: 'Brush drag', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'seed', label: 'New palette', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800;
    const key = p.colours + '|' + p.smooth + '|' + p.seed + '|' + W;
    if (cache.key !== key) {
      const pal = kmeans(d, p.colours, p.seed * 5 + 2, 9, 9).map(([r, g, b]) => { const [h, s, l] = rgb2hsl(r, g, b); return hsl2rgb(h, clamp(s * 0.95 + 0.02), clamp(l * 0.86 + 0.08, 0.1, 0.9)); });
      const ch = blurRGB(d, W, H, Math.max(1, Math.round((1.5 + (p.smooth / 100) * 7) * sc)), 2);
      let lab = new Uint8Array(N);
      for (let i = 0; i < N; i++) lab[i] = nearest(pal, ch[0][i], ch[1][i], ch[2][i]);
      const R = Math.max(1, Math.round((1 + (p.smooth / 100) * 3) * sc));
      for (let pass = 0; pass < 2; pass++) {
        const next = lab.slice(), cnt = new Uint8Array(pal.length);
        for (let y = R; y < H - R; y++) for (let x = R; x < W - R; x++) {
          cnt.fill(0);
          for (let j = -R; j <= R; j += R) for (let i = -R; i <= R; i += R) cnt[lab[(y + j) * W + x + i]]++;
          let b = 0; for (let c = 1; c < pal.length; c++) if (cnt[c] > cnt[b]) b = c;
          next[y * W + x] = b;
        }
        lab = next;
      }
      cache.pal = pal; cache.lab = lab; cache.key = key;
    }
    const { pal, lab } = cache, wob = (p.wobble / 100) * 5 * sc, gap = (p.gaps / 100) * 2.6 * sc, st = p.streaks / 100, paper = [246, 241, 229], seed = p.seed * 3 + 1;
    const out = ctx.createImageData(W, H), o4 = out.data;
    const at = (x, y) => lab[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      const wx = x + (vnoise(x * 0.04 / sc, y * 0.04 / sc, seed) - 0.5) * 2 * wob, wy = y + (vnoise(x * 0.04 / sc + 19, y * 0.04 / sc, seed + 1) - 0.5) * 2 * wob;
      const l = at(wx, wy);
      let k = 1 + st * ((vnoise(x * 0.008 / sc, y * 0.12 / sc, seed + 2) - 0.5) * 0.12 + (vnoise(x * 0.02 / sc, y * 0.35 / sc, seed + 3) - 0.5) * 0.05);
      let paperShow = 0;
      if (gap > 0.2) {
        const g = Math.ceil(gap);
        if (at(wx + g, wy) !== l || at(wx - g, wy) !== l || at(wx, wy + g) !== l || at(wx, wy - g) !== l) paperShow = 0.9 * (0.6 + 0.4 * vnoise(x * 0.2, y * 0.2, seed + 6));
      }
      const dry = st > 0 && vnoise(x * 0.012 / sc, y * 0.25 / sc, seed + 7) > 0.84 && hash2(x, y, 3) < 0.22 * st ? 0.4 : 0;
      const c = pal[l], a = Math.min(1, paperShow + dry), fibre = 1 + (hash2(x >> 1, y >> 1, 6) - 0.5) * 0.03;
      o4[o] = (c[0] * k * (1 - a) + paper[0] * a) * fibre; o4[o + 1] = (c[1] * k * (1 - a) + paper[1] * a) * fibre; o4[o + 2] = (c[2] * k * (1 - a) + paper[2] * a) * fibre; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
