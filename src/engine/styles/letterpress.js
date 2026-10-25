// src/engine/styles/letterpress.js
import { still, rng, hash2, boxBlur, sobel, hexToRgb, TAU } from '../utils.js';
import { pixels, label } from '../helpers.js';

const INKS = { black: '#15151a', navy: '#16264f', oxblood: '#6a1420', forest: '#1c4430' };
const PAPERS = { cotton: [246, 243, 236], cream: [240, 230, 210], grey: [222, 222, 218] };

export default still({
  id: 'letterpress',
  name: 'Letterpress',
  blurb: 'One colour of ink pressed deep into thick cotton paper: a halftone, a title and the shadow of the impression.',
  maxSide: 1000,
  params: [
    { key: 'title', label: 'Title', type: 'text', default: 'Seen Differently', max: 26 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'black', options: [['black', 'Black'], ['navy', 'Navy'], ['oxblood', 'Oxblood'], ['forest', 'Forest']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cotton', options: [['cotton', 'Cotton white'], ['cream', 'Cream'], ['grey', 'Grey']] },
    { key: 'dot', label: 'Dot size', type: 'range', min: 4, max: 16, step: 1, default: 8 },
    { key: 'depth', label: 'Impression', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'wear', label: 'Ink wear', type: 'range', min: 0, max: 100, step: 1, default: 25 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, u = Math.min(W, H) / 100, r = rng(5);
    // 1. the printing plate: black on transparent
    const plate = env.makeCanvas(W, H), px = plate.getContext('2d');
    px.fillStyle = '#000';
    const m = u * 8, pw = W - 2 * m, ph = H * 0.7, py = m;
    const s = Math.max(3, p.dot * (W / 900)), c45 = Math.SQRT1_2;
    px.save(); px.beginPath(); px.rect(m, py, pw, ph); px.clip();
    for (let a = -ph; a < pw + ph; a += s) for (let b = -pw; b < pw + ph; b += s) {
      const x = (a + b) * c45, y = (b - a) * c45;
      if (x < -s || y < -s || x > pw + s || y > ph + s) continue;
      const sx = Math.min(W - 1, Math.max(0, (x / pw) * W | 0)), sy = Math.min(H - 1, Math.max(0, (y / ph) * H | 0)), dark = 1 - L[sy * W + sx];
      const rad = s * 0.72 * Math.sqrt(dark);
      if (rad > 0.4) { px.beginPath(); px.arc(m + x, py + y, rad, 0, TAU); px.fill(); }
    }
    px.restore();
    px.fillRect(m, py - u * 1.6, pw, Math.max(2, u * 0.45)); px.fillRect(m, py + ph + u * 1.2, pw, Math.max(2, u * 0.45));
    const serif = '"Bodoni Moda", Didot, Georgia, serif';
    ctx.font = `600 100px ${serif}`;
    const ts = Math.min(u * 10, ((pw * 0.96) / Math.max(1, ctx.measureText(p.title || 'Title').width)) * 100);
    label(px, p.title || '', W / 2, py + ph + u * 1.2 + (H - (py + ph)) * 0.42, `600 ${ts}px ${serif}`, '#000');
    label(px, 'SET IN BODONI  PRINTED BY HAND IN ONE COLOUR', W / 2, H - u * 4.6, `500 ${u * 1.8}px ${serif}`, '#000');
    const A = px.getImageData(0, 0, W, H).data, ink = new Float32Array(W * H);
    for (let i = 0; i < ink.length; i++) ink[i] = A[i * 4 + 3] / 255;

    // 2. the paper: a height field. The plate presses ink areas down, softened by the paper's give.
    const soft = boxBlur(boxBlur(ink, W, H, 1), W, H, 1), { gx, gy } = sobel(soft, W, H, 1);
    const paper = PAPERS[p.paper] || PAPERS.cotton, inkRgb = hexToRgb(INKS[p.ink] || INKS.black), depth = p.depth / 100, wear = p.wear / 100;
    const out = ctx.createImageData(W, H), d = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, n = hash2(x, y, 4), fibre = hash2(x >> 1, y >> 3, 9);
      // light from the top left: the lower-right wall of a pressed area is lit, the upper-left wall is in shadow
      const lit = -(gx[i] + gy[i]) * 5.2 * depth;
      let v = 1 + lit + (n - 0.5) * 0.05 + (fibre - 0.5) * 0.03 - soft[i] * 0.07 * depth;
      let R = paper[0] * v, G = paper[1] * v, B = paper[2] * v;
      const a = ink[i];
      if (a > 0.02) {
        // ink: a little darker at the rim (it squashes outward) and speckled where the plate was worn
        const rim = Math.min(1, (a - soft[i] + 0.5)), holes = hash2(x, y, 31) < wear * 0.16 ? 0.55 : 0, k = Math.max(0, a * (1 - holes));
        const shade = 0.82 + 0.3 * hash2(x >> 2, y >> 2, 17) * wear + 0.08 * (1 - rim);
        R += (inkRgb[0] * shade * v - R) * k; G += (inkRgb[1] * shade * v - G) * k; B += (inkRgb[2] * shade * v - B) * k;
      }
      const o = i * 4; d[o] = R; d[o + 1] = G; d[o + 2] = B; d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
