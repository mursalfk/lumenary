// src/engine/styles/crayon-cartoon.js
import { still, clamp, lerp, smoothstep, hash2, vnoise } from '../utils.js';
import { pixels, rgbList, nearest } from '../helpers.js';
import { vivid, dilate, modeFilter } from '../culture.js';
import { flatten } from '../toon.js';

const BOX = rgbList(['#e3342f', '#f6821f', '#fcd116', '#9bd13c', '#2fa84f', '#1fa7a0', '#48b5e8', '#2a62c9', '#7b4bc4', '#f07ab0', '#f7c59f', '#d9a35c', '#8a5a2b', '#9a9a9a', '#f7f4ea', '#2e2a2a']);
const PAPERS = { white: [250, 248, 242], cream: [244, 236, 214], sugar: [206, 200, 190], black: [34, 32, 36] };

export default still({
  id: 'crayon-cartoon',
  name: 'Crayon Cartoon',
  blurb: 'A page from a picture book: thick wobbly outlines, a few bright colours from the crayon box, and waxy strokes that never quite fill the shape.',
  maxSide: 1000,
  params: [
    { key: 'colours', label: 'Colours', type: 'range', min: 4, max: 10, step: 1, default: 7 },
    { key: 'simple', label: 'Simple shapes', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'outline', label: 'Outline', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'wobble', label: 'Wobble', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'wax', label: 'Crayon pressure', type: 'range', min: 10, max: 100, step: 1, default: 62 },
    { key: 'box', label: 'Crayons', type: 'select', default: 'box', options: [['box', 'Box of sixteen'], ['own', 'The picture’s own colours']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'white', options: [['white', 'White'], ['cream', 'Cream'], ['sugar', 'Sugar paper'], ['black', 'Black']] },
    { key: 'seed', label: 'Colour it again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 900, seed = p.seed * 11 + 5;
    const fk = p.colours + '|' + p.simple;
    if (cache.fk !== fk) { cache.flat = flatten(d, W, H, p.colours, lerp(4, 10, p.simple / 100) * sc, 0, 9, cache); cache.flat.idx = modeFilter(cache.flat.idx, W, H, p.colours, Math.max(1, Math.round(lerp(1, 5, p.simple / 100) * sc)), 2); cache.fk = fk; }
    const { idx, pal } = cache.flat, tmp = [0, 0, 0], paper = PAPERS[p.paper] || PAPERS.white, dark = p.paper === 'black';
    // Several paints can land on the same crayon. They then count as one colour, with no outline between them.
    const cols = [], ids = pal.map((c) => {
      vivid(c, 1.5, 0.03, tmp);
      const col = p.box === 'own' ? [tmp[0], tmp[1], tmp[2]] : BOX[nearest(BOX, tmp[0], tmp[1], tmp[2])];
      let at = cols.indexOf(col);
      if (at < 0) { cols.push(col); at = cols.length - 1; }
      return at;
    });
    // every shape is pushed about by slow noise, so no edge is ruler-straight
    const amp = (p.wobble / 100) * 7 * sc, f = 0.011 / sc, wob = new Uint8Array(N);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      const sx = clamp(Math.round(x + (vnoise(x * f, y * f, seed) - 0.5) * 2 * amp), 0, W - 1), sy = clamp(Math.round(y + (vnoise(x * f + 31, y * f + 17, seed) - 0.5) * 2 * amp), 0, H - 1);
      wob[i] = ids[idx[sy * W + sx]];
    }
    const edge = new Uint8Array(N);
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) { const i = y * W + x; if (wob[i] !== wob[i + 1] || wob[i] !== wob[i + W]) edge[i] = 1; }
    const lw = Math.round(lerp(1, 3.4, p.outline / 100) * sc), line = p.outline > 0 ? dilate(edge, W, H, lw) : edge, gap = dilate(edge, W, H, lw + Math.round(3 * sc));
    const wax = p.wax / 100, ink = dark ? [244, 240, 228] : [44, 38, 40], out = ctx.createImageData(W, H), o = out.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const id = wob[i], c = cols[id];
      // each colour is laid in one direction, as a child fills a shape without turning the page
      const a = hash2(id, 7, seed) * Math.PI, ca = Math.cos(a), sa = Math.sin(a), u = (x * ca + y * sa) / sc, v = (-x * sa + y * ca) / sc;
      const stroke = vnoise(v * 0.42, u * 0.022, seed + id), tooth = 0.6 * vnoise(x * 0.7 / sc, y * 0.7 / sc, seed + 3) + 0.4 * hash2(x, y, seed);
      // the crayon skips the hollows of the paper, and is lifted before it reaches the outline
      let cov = smoothstep(0.82 - wax * 0.75, 1.05 - wax * 0.55, stroke * 0.62 + tooth * 0.5);
      if (gap[i] && !line[i]) cov *= 0.45 + 0.4 * tooth;
      const grainy = 1 + (tooth - 0.5) * 0.08;
      let r = paper[0] * grainy, g = paper[1] * grainy, b = paper[2] * grainy;
      const k2 = cov * (0.86 + 0.14 * stroke);
      r += (c[0] - r) * k2; g += (c[1] - g) * k2; b += (c[2] - b) * k2;
      if (p.outline > 0 && line[i]) { const la = 0.55 + 0.45 * smoothstep(0.25, 0.6, tooth + stroke * 0.3); r += (ink[0] - r) * la; g += (ink[1] - g) * la; b += (ink[2] - b) * la; }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
