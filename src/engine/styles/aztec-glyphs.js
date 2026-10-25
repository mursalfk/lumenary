// src/engine/styles/aztec-glyphs.js
import { still, hexToRgb, clamp, boxBlur, hash2, TAU } from '../utils.js';
import { pixels, sampler, rrPath } from '../helpers.js';
import { vivid, starPoints, poly, carvedStone } from '../culture.js';

const STONES = { basalt: [[104, 104, 100], [70, 70, 68]], sandstone: [[196, 160, 108], [168, 130, 84]], limestone: [[214, 206, 186], [176, 168, 148]] };

// Day-sign style glyphs in a box of half-size u. The caller sets the fill and stroke colours.
const GLYPHS = [
  (c, u) => { c.lineWidth = u * 0.17; c.beginPath(); for (let t = 0; t < 3.1 * TAU; t += 0.2) { const r = u * 0.9 * (1 - t / (3.1 * TAU)) + u * 0.06, x = Math.cos(t) * r, y = Math.sin(t) * r; if (t === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); },
  (c, u) => { for (const [x, y] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5], [0, 0]]) { c.beginPath(); c.arc(x * u, y * u, u * (x || y ? 0.3 : 0.24), 0, TAU); c.fill(); } },
  (c, u) => { c.lineWidth = u * 0.2; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(-0.8 * u, 0.8 * u); c.lineTo(-0.8 * u, -0.8 * u); c.lineTo(0.8 * u, -0.8 * u); c.lineTo(0.8 * u, 0.4 * u); c.lineTo(-0.3 * u, 0.4 * u); c.lineTo(-0.3 * u, -0.3 * u); c.lineTo(0.3 * u, -0.3 * u); c.stroke(); },
  (c, u) => { c.beginPath(); c.arc(0, 0, u * 0.42, 0, TAU); c.fill(); for (let j = 0; j < 12; j++) { const a = (j / 12) * TAU; c.beginPath(); c.moveTo(Math.cos(a - 0.14) * u * 0.55, Math.sin(a - 0.14) * u * 0.55); c.lineTo(Math.cos(a) * u * 0.92, Math.sin(a) * u * 0.92); c.lineTo(Math.cos(a + 0.14) * u * 0.55, Math.sin(a + 0.14) * u * 0.55); c.fill(); } },
  (c, u) => { c.lineWidth = u * 0.3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-0.7 * u, 0.5 * u); c.bezierCurveTo(-0.2 * u, 0.9 * u, 0.1 * u, 0.2 * u, 0.1 * u, -0.1 * u); c.bezierCurveTo(0.1 * u, -0.5 * u, 0.6 * u, -0.5 * u, 0.6 * u, -0.8 * u); c.stroke(); c.beginPath(); c.arc(0.62 * u, -0.78 * u, u * 0.2, 0, TAU); c.fill(); },
  (c, u) => { for (let j = 0; j < 4; j++) { const a = (j / 4) * TAU; c.beginPath(); c.arc(Math.cos(a) * u * 0.46, Math.sin(a) * u * 0.46, u * 0.34, 0, TAU); c.fill(); } c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(0, 0, u * 0.2, 0, TAU); c.fill(); },
  (c, u) => { c.lineWidth = u * 0.17; c.lineCap = 'round'; for (const y of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(-0.8 * u, y * u); for (let i = 1; i <= 4; i++) c.quadraticCurveTo(-0.8 * u + (i - 0.5) * 0.4 * u, y * u + (i % 2 ? -0.22 : 0.22) * u, -0.8 * u + i * 0.4 * u, y * u); c.stroke(); } },
  (c, u) => { c.beginPath(); c.moveTo(0, -0.95 * u); c.lineTo(0.42 * u, 0); c.lineTo(0, 0.95 * u); c.lineTo(-0.42 * u, 0); c.closePath(); c.fill(); },
  (c, u) => { c.lineWidth = u * 0.17; c.beginPath(); c.moveTo(-0.7 * u, 0.8 * u); c.lineTo(-0.7 * u, -0.1 * u); c.lineTo(0, -0.8 * u); c.lineTo(0.7 * u, -0.1 * u); c.lineTo(0.7 * u, 0.8 * u); c.closePath(); c.stroke(); c.fillRect(-0.2 * u, 0.15 * u, 0.4 * u, 0.65 * u); },
  (c, u) => { c.lineWidth = u * 0.16; c.strokeRect(-0.75 * u, -0.85 * u, 1.5 * u, 1.7 * u); for (const x of [-0.35, 0.35]) { c.beginPath(); c.arc(x * u, -0.3 * u, u * 0.17, 0, TAU); c.fill(); } c.beginPath(); c.moveTo(-0.5 * u, 0.35 * u); for (let i = 0; i < 6; i++) c.lineTo((-0.5 + (i + 1) * (1 / 6)) * u, (i % 2 ? 0.35 : 0.62) * u); c.stroke(); },
  (c, u) => { poly(c, starPoints(0, 0, u * 0.9, u * 0.42, 8, -Math.PI / 2)); c.fill(); },
];

export default still({
  id: 'aztec-glyphs',
  name: 'Aztec Glyphs',
  blurb: 'A wall of carved stone tablets in the Mexica manner: a square plate for every glyph, the spiral of the wind, the sun, the flint, the serpent, still holding a trace of pigment. Brighter parts of your picture stand higher out of the stone.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Tablet size', type: 'range', min: 40, max: 130, step: 1, default: 72 },
    { key: 'relief', label: 'Depth', type: 'range', min: 20, max: 100, step: 1, default: 65 },
    { key: 'light', label: 'Light direction', type: 'range', min: 0, max: 360, step: 5, default: 225, fmt: (v) => v + '°' },
    { key: 'paint', label: 'Pigment', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'wear', label: 'Weathering', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'stone', label: 'Stone', type: 'select', default: 'basalt', options: [['basalt', 'Basalt'], ['sandstone', 'Sandstone'], ['limestone', 'Limestone']] },
    { key: 'seed', label: 'New glyphs', type: 'shuffle', default: 4 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.3), tmp = [0, 0, 0], rel = p.relief / 100;
    const hc = env.makeCanvas(W, H), h = hc.getContext('2d'), pc = env.makeCanvas(W, H), pg = pc.getContext('2d');
    h.fillStyle = '#000'; h.fillRect(0, 0, W, H); h.lineCap = 'round'; h.lineJoin = 'round'; pg.lineCap = 'round'; pg.lineJoin = 'round';
    if (p.paint > 0) { pg.globalAlpha = (p.paint / 100) * 0.62; pg.drawImage(work, 0, 0, W, H); pg.globalAlpha = 1; }
    const cols = Math.ceil(W / s), rows = Math.ceil(H / s), ox = (W - cols * s) / 2, oy = (H - rows * s) / 2, gap = s * 0.07;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x0 = ox + c * s, y0 = oy + r * s, cx = x0 + s / 2, cy = y0 + s / 2, t = smp.tone(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1)), plate = 0.18 + 0.4 * t, id = (hash2(c, r, p.seed) * GLYPHS.length) | 0, u = s * 0.3 * (0.7 + 0.3 * t);
      const g1 = Math.round(plate * 255), g2 = Math.round(Math.min(1, plate + 0.22) * 255), g3 = Math.round(Math.min(1, plate + 0.42) * 255);
      h.fillStyle = `rgb(${g1},${g1},${g1})`; rrPath(h, x0 + gap, y0 + gap, s - 2 * gap, s - 2 * gap, s * 0.08); h.fill();
      h.strokeStyle = `rgb(${g2},${g2},${g2})`; h.lineWidth = s * 0.05; rrPath(h, x0 + gap * 2.2, y0 + gap * 2.2, s - 4.4 * gap, s - 4.4 * gap, s * 0.05); h.stroke();
      h.save(); h.translate(cx, cy); h.fillStyle = `rgb(${g3},${g3},${g3})`; h.strokeStyle = h.fillStyle; GLYPHS[id](h, u); h.restore();
      if (p.paint > 0) {
        vivid(smp.rgb(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1)), 1.6, 0.04, tmp);
        pg.save(); pg.translate(cx, cy); pg.globalAlpha = (p.paint / 100) * 0.9; pg.fillStyle = `rgb(${tmp[0] | 0},${tmp[1] | 0},${tmp[2] | 0})`; pg.strokeStyle = pg.fillStyle; GLYPHS[id](pg, u); pg.restore();
      }
    }
    const hd = h.getImageData(0, 0, W, H).data, Hh = new Float32Array(W * H);
    const Ts = boxBlur(boxBlur(smp.L, W, H, Math.round(9 * sc)), W, H, Math.round(9 * sc));
    for (let i = 0; i < W * H; i++) Hh[i] = (hd[i * 4] / 255) * rel + 0.25 * Ts[i];
    const Hs = boxBlur(Hh, W, H, Math.max(1, Math.round(0.9 * sc))), [a, b] = STONES[p.stone];
    carvedStone(ctx, W, H, Hs, { a, b, sc, light: p.light, k: 22 + 70 * rel, wear: p.wear / 100, paint: p.paint > 0 ? pg.getImageData(0, 0, W, H) : null });
  },
});
