// src/engine/styles/ink-wash.js
import { still, vnoise, boxBlur, smoothstep, clamp, hash2, sobel } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const PAPERS = { rice: [245, 240, 226], white: [250, 249, 244], tea: [234, 222, 196] };
const INKS = { black: [20, 20, 22], indigo: [20, 30, 66], sepia: [58, 36, 22] };

export default still({
  id: 'ink-wash',
  name: 'Ink Wash',
  blurb: 'Sumi-e: a few layers of diluted black ink, soft bleeds, one dry-brush stroke and a great deal of empty paper.',
  maxSide: 1100,
  params: [
    { key: 'amount', label: 'How much is inked', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'tones', label: 'Layers of ink', type: 'range', min: 2, max: 6, step: 1, default: 4 },
    { key: 'bleed', label: 'Bleed', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'dry', label: 'Dry brush', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'black', options: [['black', 'Black'], ['indigo', 'Indigo'], ['sepia', 'Sepia']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'rice', options: [['rice', 'Rice paper'], ['white', 'White'], ['tea', 'Tea stained']] },
    { key: 'seal', label: 'Red seal', type: 'toggle', default: true },
    { key: 'seed', label: 'New brushwork', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const N = W * H, sc = W / 800, seed = p.seed * 5 + 1, K = p.tones;
    const key = p.amount + '|' + p.tones + '|' + p.bleed + '|' + W;
    if (cache.key !== key) {
      const L = boxBlur(boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(3 * sc))), W, H, Math.max(1, Math.round(3 * sc))), v = new Float32Array(N), lo = 0.6 - (p.amount / 100) * 0.5;
      for (let i = 0; i < N; i++) {
        const t = smoothstep(lo, 1, 1 - L[i]) * K, f = Math.floor(t), fr = t - f;
        v[i] = Math.min(1, (f + smoothstep(0.55, 1, fr)) / K * 1.02);
      }
      const r = Math.max(1, Math.round((1 + (p.bleed / 100) * 6) * sc));
      cache.v = boxBlur(boxBlur(v, W, H, r), W, H, r);
      cache.rim = sobel(boxBlur(v, W, H, Math.max(1, Math.round(sc * 2))), W, H, 1).mag; cache.key = key;
    }
    const { v: V, rim } = cache, paper = PAPERS[p.paper] || PAPERS.rice, ink = INKS[p.ink] || INKS.black, dry = p.dry / 100, bl = p.bleed / 100;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      const fx = x + (vnoise(x * 0.03 / sc, y * 0.03 / sc, seed) - 0.5) * 5 * bl * sc, fy = y + (vnoise(x * 0.03 / sc + 9, y * 0.03 / sc, seed + 1) - 0.5) * 5 * bl * sc;
      let v = V[Math.min(H - 1, Math.max(0, fy | 0)) * W + Math.min(W - 1, Math.max(0, fx | 0))];
      v = Math.min(1, v * (1 + 0.5 * smoothstep(0.012, 0.07, rim[i]) * bl));
      const streak = vnoise((x + y * 0.35) * 0.008 / sc, y * 0.16 / sc, seed + 4);
      v *= 1 - dry * smoothstep(0.58, 0.85, streak) * smoothstep(0.35, 0.8, v) * 0.62;
      const fibre = 0.5 * vnoise(x * 0.5 / sc, y * 0.08 / sc, seed + 2) + 0.5 * hash2(x, y, 3);
      v = clamp(v * (0.9 + 0.2 * fibre));
      const k = 1 + (hash2(x >> 1, y >> 1, 8) - 0.5) * 0.03;
      o4[o] = (paper[0] * (1 - v) + ink[0] * v) * k; o4[o + 1] = (paper[1] * (1 - v) + ink[1] * v) * k; o4[o + 2] = (paper[2] * (1 - v) + ink[2] * v) * k; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    if (p.seal) {
      const s = Math.min(W, H) * 0.075, x0 = W - s * 1.9, y0 = H - s * 1.9;
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(176,34,28,0.93)'; ctx.fillRect(x0, y0, s, s);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgb(${paper[0]},${paper[1]},${paper[2]})`;
      const q = s * 0.14;
      ctx.fillRect(x0 + q, y0 + q, s * 0.34, q); ctx.fillRect(x0 + q, y0 + q, q, s * 0.34); ctx.fillRect(x0 + s * 0.58, y0 + q, s * 0.28, q * 1.2);
      ctx.fillRect(x0 + s * 0.72, y0 + q, q, s * 0.46); ctx.fillRect(x0 + q, y0 + s * 0.58, s * 0.4, q); ctx.fillRect(x0 + s * 0.52, y0 + s * 0.74, s * 0.34, q); ctx.fillRect(x0 + q, y0 + s * 0.74, q * 1.1, s * 0.12);
      ctx.restore();
    }
  },
});
