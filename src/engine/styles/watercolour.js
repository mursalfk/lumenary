// src/engine/styles/watercolour.js
import { still, vnoise, boxBlur, smoothstep, clamp, hash2, sobel } from '../utils.js';
import { pixels, blurRGB } from '../helpers.js';

const PAPERS = { cream: [247, 242, 229], white: [251, 250, 246], rough: [240, 233, 217] };

export default still({
  id: 'watercolour',
  name: 'Watercolour',
  blurb: 'Thin washes of pigment on rough paper: soft bleeds, darker rims where the colour dried, and a little granulation.',
  maxSide: 1000,
  params: [
    { key: 'bleed', label: 'Bleed', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'wash', label: 'Colour strength', type: 'range', min: 20, max: 100, step: 1, default: 70 },
    { key: 'rim', label: 'Dark rims', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'grain', label: 'Paper grain', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['white', 'White'], ['rough', 'Rough, toned']] },
    { key: 'margin', label: 'Unpainted border', type: 'toggle', default: true },
    { key: 'seed', label: 'New washes', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800, seed = p.seed * 7 + 1;
    const r1 = Math.max(1, Math.round((2 + (p.bleed / 100) * 9) * sc)), key = r1 + '|' + W;
    if (cache.key !== key) {
      const ch = blurRGB(d, W, H, r1, 2), Lb = new Float32Array(N);
      for (let i = 0; i < N; i++) Lb[i] = (0.2126 * ch[0][i] + 0.7152 * ch[1][i] + 0.0722 * ch[2][i]) / 255;
      cache.ch = ch; cache.Lb = Lb; cache.edge = sobel(boxBlur(Lb, W, H, Math.max(1, Math.round(sc * 2))), W, H, 2).mag; cache.key = key;
    }
    const { ch, Lb, edge } = cache, paper = PAPERS[p.paper] || PAPERS.cream;
    const strength = 0.45 + (p.wash / 100) * 0.75, rim = p.rim / 100, gr = p.grain / 100;
    const m = p.margin ? Math.min(W, H) * 0.06 : -1, K = 7;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      const wx = Math.round((vnoise(x * 0.05 / sc, y * 0.05 / sc, seed) - 0.5) * 7 * sc), wy = Math.round((vnoise(x * 0.05 / sc + 31, y * 0.05 / sc, seed + 1) - 0.5) * 7 * sc);
      const j = Math.min(H - 1, Math.max(0, y + wy)) * W + Math.min(W - 1, Math.max(0, x + wx));
      const lift = 1 - smoothstep(0.8, 0.97, Lb[j]);
      const bloom = 1 + (vnoise(x * 0.007 / sc, y * 0.007 / sc, seed + 3) - 0.5) * 0.42;
      const gran = 1 + ((vnoise(x * 0.5 / sc, y * 0.5 / sc, seed + 5) - 0.5) * 0.5 + (hash2(x, y, seed) - 0.5) * 0.5) * 0.7 * gr;
      const pool = 1 + rim * 1.1 * smoothstep(0.015, 0.09, edge[j]);
      let R = 0, G = 0, B = 0;
      for (let c = 0; c < 3; c++) {
        const v = ch[c][j] / 255, q = Math.floor(v * K + 0.5) / K, flat = v + (q - v) * 0.55;
        const pig = clamp((1 - flat) * strength * lift * bloom * gran * pool, 0, 1);
        const col = paper[c] * (1 - pig * 0.94);
        if (c === 0) R = col; else if (c === 1) G = col; else B = col;
      }
      if (m >= 0) {
        const e = Math.min(x, W - 1 - x, y, H - 1 - y), rag = (vnoise(x * 0.06 / sc, y * 0.06 / sc, seed + 9) - 0.5) * m * 0.8;
        const dd = e - m + rag, coat = smoothstep(-1.5 * sc, 1.5 * sc, dd), edgeDark = 1 - 0.22 * (1 - smoothstep(0, 7 * sc, dd)) * coat;
        R = (R * edgeDark) * coat + paper[0] * (1 - coat); G = (G * edgeDark) * coat + paper[1] * (1 - coat); B = (B * edgeDark) * coat + paper[2] * (1 - coat);
      }
      const fibre = 1 + (hash2(x >> 1, y >> 1, 4) - 0.5) * 0.035 * (0.4 + gr) + (vnoise(x * 0.3 / sc, y * 0.3 / sc, seed + 7) - 0.5) * 0.03 * gr;
      o4[o] = R * fibre; o4[o + 1] = G * fibre; o4[o + 2] = B * fibre; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
