// src/engine/styles/indus-seal.js
import { still, clamp, hexToRgb, rng, smoothstep, boxBlur, sobel, TAU } from '../utils.js';
import { pixels, stretchedL, slopes, fbm } from '../helpers.js';

const fr = (v) => v - Math.floor(v);

// Sign shapes in a box of side u centred on (x, y); all are strokes, drawn with the current line width.
const SIGNS = [
  (c, x, y, u) => { c.beginPath(); c.ellipse(x - 0.05 * u, y, 0.3 * u, 0.16 * u, 0, 0, TAU); c.moveTo(x + 0.25 * u, y); c.lineTo(x + 0.42 * u, y - 0.17 * u); c.moveTo(x + 0.25 * u, y); c.lineTo(x + 0.42 * u, y + 0.17 * u); c.stroke(); c.beginPath(); c.arc(x - 0.22 * u, y - 0.03 * u, 0.025 * u, 0, TAU); c.fill(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.15 * u, y - 0.4 * u); c.lineTo(x - 0.15 * u, y - 0.2 * u); c.quadraticCurveTo(x - 0.42 * u, y, x - 0.3 * u, y + 0.3 * u); c.lineTo(x + 0.3 * u, y + 0.3 * u); c.quadraticCurveTo(x + 0.42 * u, y, x + 0.15 * u, y - 0.2 * u); c.lineTo(x + 0.15 * u, y - 0.4 * u); c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.36 * u, y - 0.15 * u); c.lineTo(x + 0.36 * u, y - 0.15 * u); for (let i = 0; i < 5; i++) { const xx = x - 0.36 * u + i * 0.18 * u; c.moveTo(xx, y - 0.15 * u); c.lineTo(xx, y + 0.35 * u); } c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.34 * u, y + 0.32 * u); c.lineTo(x + 0.2 * u, y - 0.24 * u); c.moveTo(x + 0.02 * u, y - 0.24 * u); c.lineTo(x + 0.2 * u, y - 0.24 * u); c.lineTo(x + 0.2 * u, y - 0.06 * u); c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.18 * u, y - 0.4 * u); c.lineTo(x - 0.18 * u, y + 0.4 * u); c.moveTo(x + 0.18 * u, y - 0.4 * u); c.lineTo(x + 0.18 * u, y + 0.4 * u); for (let i = 0; i < 4; i++) { const yy = y - 0.3 * u + i * 0.2 * u; c.moveTo(x - 0.18 * u, yy); c.lineTo(x + 0.18 * u, yy); } c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.arc(x, y, 0.3 * u, 0, TAU); c.moveTo(x - 0.3 * u, y); c.lineTo(x + 0.3 * u, y); c.moveTo(x, y - 0.3 * u); c.lineTo(x, y + 0.3 * u); c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.36 * u, y + 0.25 * u); for (let i = 0; i < 5; i++) c.lineTo(x - 0.36 * u + (i + 1) * 0.144 * u, y + (i % 2 ? 0.25 : -0.25) * u); c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.3 * u, y - 0.3 * u); c.lineTo(x - 0.3 * u, y + 0.1 * u); c.quadraticCurveTo(x, y + 0.5 * u, x + 0.3 * u, y + 0.1 * u); c.lineTo(x + 0.3 * u, y - 0.3 * u); c.moveTo(x, y - 0.3 * u); c.lineTo(x, y + 0.2 * u); c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x, y - 0.4 * u); c.lineTo(x, y + 0.4 * u); c.moveTo(x - 0.3 * u, y - 0.1 * u); c.lineTo(x + 0.3 * u, y - 0.1 * u); for (const dx of [-0.3, 0, 0.3]) { c.moveTo(x + dx * u, y - 0.1 * u); c.lineTo(x + dx * u, y + 0.2 * u); } c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.32 * u, y - 0.05 * u); c.lineTo(x, y - 0.4 * u); c.lineTo(x + 0.32 * u, y - 0.05 * u); c.moveTo(x - 0.32 * u, y + 0.25 * u); c.lineTo(x, y - 0.1 * u); c.lineTo(x + 0.32 * u, y + 0.25 * u); c.stroke(); },
  (c, x, y, u) => { c.beginPath(); c.moveTo(x - 0.3 * u, y - 0.3 * u); c.lineTo(x - 0.3 * u, y + 0.3 * u); c.lineTo(x, y - 0.05 * u); c.lineTo(x + 0.3 * u, y + 0.3 * u); c.lineTo(x + 0.3 * u, y - 0.3 * u); c.stroke(); },
];

export default still({
  id: 'indus-seal',
  name: 'Indus Seal',
  blurb: 'A stamp seal from Mohenjo-daro, about four thousand years old: a row of signs above a figure cut in lines. Your picture is the figure, and the signs read from right to left.',
  maxSide: 1100,
  params: [
    { key: 'mode', label: 'Show as', type: 'select', default: 'clay', options: [['clay', 'Impression in clay'], ['steatite', 'The steatite seal']] },
    { key: 'engrave', label: 'Engraving', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'relief', label: 'Depth', type: 'range', min: 20, max: 100, step: 1, default: 60 },
    { key: 'signs', label: 'Signs', type: 'range', min: 3, max: 8, step: 1, default: 5 },
    { key: 'seed', label: 'New signs', type: 'shuffle', default: 2 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, S = W * 0.8, x0 = (W - S) / 2, y0 = (H - S) / 2 + H * 0.02, band = S * 0.2, hp = 4.6 * sc;
    const L = stretchedL(cache), Lb = boxBlur(boxBlur(L, W, H, Math.max(1, Math.round(1.6 * sc))), W, H, Math.max(1, Math.round(1.6 * sc))), E = sobel(Lb, W, H, 1).mag, eg = p.engrave / 100;
    // the cut lines: signs, frame and the engraved figure, as a 0..1 map
    const cv = env.makeCanvas(W, H), cx = cv.getContext('2d'), r = rng(p.seed * 131 + 5);
    cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H);
    cx.strokeStyle = '#fff'; cx.fillStyle = '#fff'; cx.lineCap = 'round'; cx.lineJoin = 'round';
    cx.lineWidth = 5 * sc; cx.strokeRect(x0, y0, S, S);
    cx.lineWidth = 3.4 * sc; cx.beginPath(); cx.moveTo(x0, y0 + band); cx.lineTo(x0 + S, y0 + band); cx.stroke();
    const n = p.signs, cell = (S - 14 * sc) / n, order = SIGNS.map((_, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
    cx.lineWidth = 4.4 * sc;
    for (let i = 0; i < n; i++) SIGNS[order[i % order.length]](cx, x0 + S - 7 * sc - (i + 0.5) * cell, y0 + band / 2, Math.min(band * 0.72, cell * 0.8));
    const cd = cx.getImageData(0, 0, W, H).data, C = new Float32Array(W * H);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      let v = cd[i * 4] / 255;
      if (x > x0 + 5 * sc && x < x0 + S - 5 * sc && y > y0 + band + 4 * sc && y < y0 + S - 5 * sc && eg > 0.02) {
        const t = Lb[i], e = smoothstep(0.05, 0.15, E[i]) * (0.4 + 0.6 * eg), thick = clamp((0.6 - t) * 1.5, 0, 0.78) * eg;
        let h = fr(y / hp) < thick ? 1 : 0;
        if (t < 0.22 && fr((x + y) / (hp * 1.3)) < 0.28) h = 1;
        v = Math.max(v, e, h);
      }
      C[i] = v;
    }
    const Cs = boxBlur(C, W, H, Math.max(1, Math.round(0.9 * sc))), rel = p.relief / 100, clay = p.mode === 'clay';
    const inside = (x, y) => x > x0 && x < x0 + S && y > y0 && y < y0 + S;
    const Hh = new Float32Array(W * H);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) Hh[i] = (inside(x, y) ? (clay ? -0.24 : 0) : (clay ? 0 : -0.3)) + Cs[i] * (clay ? 0.34 : -0.3) + (fbm(x / (2.5 * sc), y / (2.5 * sc), 4, 2) - 0.5) * 0.02;
    const Hb = boxBlur(boxBlur(Hh, W, H, Math.max(1, Math.round(1.2 * sc))), W, H, Math.max(1, Math.round(1.2 * sc))), { sx, sy } = slopes(Hb, W, H, 60 * rel);
    const img = ctx.createImageData(W, H), o = img.data, [c1, c2] = (clay ? ['#b8683f', '#8c4a2c'] : ['#e9e2cf', '#c9c0a8']).map(hexToRgb), [w1, w2] = ['#34281f', '#1c1510'].map(hexToRgb);
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const m = fbm(x / (60 * sc), y / (60 * sc), 3, 3), g = 0.92 + 0.16 * fbm(x / (2.2 * sc), y / (2.2 * sc), 7, 2);
      const on = inside(x, y);
      let c = !clay && !on ? [w1[0] + (w2[0] - w1[0]) * m, w1[1] + (w2[1] - w1[1]) * m, w1[2] + (w2[2] - w1[2]) * m] : [c1[0] + (c2[0] - c1[0]) * m, c1[1] + (c2[1] - c1[1]) * m, c1[2] + (c2[2] - c1[2]) * m];
      let f = clamp(0.8 + (sx[i] * -0.7 + sy[i] * -0.7) * 0.8, 0.3, 1.4) * g;
      if (clay && Cs[i] > 0.3) { const q = (Cs[i] - 0.3) * 0.5; c = [c[0] + (222 - c[0]) * q, c[1] + (150 - c[1]) * q, c[2] + (108 - c[2]) * q]; }
      if (!clay && on && Cs[i] > 0.05) { const q = clamp(Cs[i] * 1.2, 0, 0.92); c = [c[0] + (46 - c[0]) * q, c[1] + (34 - c[1]) * q, c[2] + (22 - c[2]) * q]; }
      o[k] = c[0] * f; o[k + 1] = c[1] * f; o[k + 2] = c[2] * f; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
