// src/engine/styles/pencil-hatching.js
import { still, vnoise, boxBlur, smoothstep, clamp, hash2, sobel } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const PAPERS = { white: [246, 245, 240], cream: [238, 231, 214], grey: [206, 205, 199] };
const LEADS = { graphite: [54, 58, 66], sepia: [84, 52, 30], blue: [26, 40, 84], red: [120, 36, 30] };
const ANG = [45, 135, 0, 90], TH = [0.16, 0.34, 0.54, 0.74];

export default still({
  id: 'pencil-hatching',
  name: 'Pencil Hatching',
  blurb: 'Tone built the way an illustrator does it: parallel strokes first, then a second set across them, darker passes where the shadows are deepest.',
  maxSide: 1100,
  params: [
    { key: 'space', label: 'Line spacing', type: 'range', min: 3, max: 12, step: 0.5, default: 5.5, fmt: (v) => v.toFixed(1) },
    { key: 'layers', label: 'Layers of hatching', type: 'range', min: 2, max: 4, step: 1, default: 4 },
    { key: 'angle', label: 'Turn the hatching', type: 'range', min: 0, max: 90, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'wobble', label: 'Hand wobble', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'outline', label: 'Soft outlines', type: 'toggle', default: true },
    { key: 'lead', label: 'Pencil', type: 'select', default: 'graphite', options: [['graphite', 'Graphite'], ['sepia', 'Sepia'], ['blue', 'Blue-black'], ['red', 'Red chalk']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['white', 'White'], ['cream', 'Cream'], ['grey', 'Grey']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, N = W * H;
    if (cache.key !== W) {
      const L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(1.5 * sc)));
      cache.L = L; cache.edge = sobel(boxBlur(L, W, H, Math.max(1, Math.round(1.5 * sc))), W, H, 1).mag; cache.key = W;
    }
    const { L, edge } = cache, paper = PAPERS[p.paper] || PAPERS.cream, lead = LEADS[p.lead] || LEADS.graphite;
    const sp = p.space * sc, wob = p.wobble / 100, off = (p.angle * Math.PI) / 180, nl = p.layers;
    const dirs = ANG.map((a) => { const t = (a * Math.PI) / 180 + off; return [Math.cos(t), Math.sin(t)]; });
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, dark = 1 - L[i];
      const tooth = 0.7 + 0.3 * (0.5 * hash2(x, y, 4) + 0.5 * vnoise(x * 0.5 / sc, y * 0.5 / sc, 2));
      let ink = 0;
      for (let k = 0; k < nl; k++) {
        const t = TH[k] * (nl === 2 ? 1.3 : 1);
        if (dark <= t) continue;
        const u = (x * dirs[k][0] + y * dirs[k][1]) / sp + (vnoise(x * 0.01 / sc + k * 7, y * 0.01 / sc, 8 + k) - 0.5) * 2.4 * wob;
        const f = u - Math.floor(u), dist = Math.abs(f - 0.5) * 2, idx = Math.floor(u);
        const w = clamp((dark - t) * 3.2 + 0.2, 0, 0.96) * (0.86 + 0.28 * hash2(idx, k, 3));
        const a = (1 - smoothstep(w - 0.28, w, dist)) * (0.62 + 0.38 * hash2(idx, k + 5, 9));
        ink = Math.max(ink, a * (0.78 + 0.22 * Math.min(1, (dark - t) * 3)));
      }
      if (p.outline) ink = Math.max(ink, smoothstep(0.05, 0.17, edge[i]) * 0.6);
      ink *= tooth;
      o4[o] = paper[0] * (1 - ink) + lead[0] * ink; o4[o + 1] = paper[1] * (1 - ink) + lead[1] * ink; o4[o + 2] = paper[2] * (1 - ink) + lead[2] * ink; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
