// src/engine/styles/hieroglyphs.js
import { still, clamp, boxBlur, hash2, TAU } from '../utils.js';
import { pixels, sampler, nearest } from '../helpers.js';
import { vivid, carvedStone } from '../culture.js';
import { hexToRgb } from '../utils.js';

const STONES = { limestone: [[216, 205, 178], [186, 172, 142]], sandstone: [[204, 168, 112], [176, 138, 86]], granite: [[148, 118, 112], [112, 88, 84]] };
// Lapis, red ochre, malachite, yellow ochre, black.
const PIGMENT = ['#2a5d9f', '#b0452e', '#2f8a6a', '#d9a93a', '#1a1613'].map(hexToRgb);

// Signs drawn in a box of half-size u; fill and stroke colours are set by the caller.
const SIGNS = [
  (c, u) => { c.lineWidth = u * 0.2; c.beginPath(); c.ellipse(0, -0.45 * u, 0.3 * u, 0.4 * u, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(0, -0.05 * u); c.lineTo(0, 0.95 * u); c.moveTo(-0.5 * u, 0.3 * u); c.lineTo(0.5 * u, 0.3 * u); c.stroke(); },
  (c, u) => { c.lineWidth = u * 0.14; c.beginPath(); c.moveTo(-0.9 * u, 0); c.quadraticCurveTo(0, -0.7 * u, 0.9 * u, 0); c.quadraticCurveTo(0, 0.55 * u, -0.9 * u, 0); c.closePath(); c.stroke(); c.beginPath(); c.arc(0.05 * u, -0.02 * u, 0.26 * u, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-0.8 * u, -0.5 * u); c.quadraticCurveTo(0, -1.0 * u, 0.8 * u, -0.5 * u); c.stroke(); c.beginPath(); c.moveTo(-0.1 * u, 0.5 * u); c.quadraticCurveTo(-0.2 * u, 0.8 * u, -0.5 * u, 0.85 * u); c.stroke(); },
  (c, u) => { c.lineWidth = u * 0.17; c.lineJoin = 'miter'; for (const y of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(-0.85 * u, y * u + 0.15 * u); for (let i = 0; i < 4; i++) c.lineTo((-0.85 + (i + 1) * 0.425) * u, y * u + (i % 2 ? 0.15 : -0.15) * u); c.stroke(); } },
  (c, u) => { c.lineWidth = u * 0.13; c.beginPath(); c.moveTo(0, 0.95 * u); c.lineTo(0, -0.95 * u); c.stroke(); for (let i = 0; i < 5; i++) { const y = -0.7 * u + i * 0.32 * u; c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(0.4 * u, y - 0.25 * u, 0.55 * u, y + 0.15 * u); c.moveTo(0, y); c.quadraticCurveTo(-0.4 * u, y - 0.25 * u, -0.55 * u, y + 0.15 * u); c.stroke(); } },
  (c, u) => { c.lineWidth = u * 0.14; c.beginPath(); c.arc(0, 0, u * 0.62, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, u * 0.17, 0, TAU); c.fill(); },
  (c, u) => { c.lineWidth = u * 0.22; c.lineCap = 'butt'; c.beginPath(); c.moveTo(0, 0.95 * u); c.lineTo(0, -0.95 * u); c.stroke(); for (const y of [-0.85, -0.55, -0.25, 0.05]) { c.beginPath(); c.moveTo(-0.5 * u, y * u); c.lineTo(0.5 * u, y * u); c.stroke(); } },
  (c, u) => { c.lineWidth = u * 0.17; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0.7 * u); c.lineTo(0, -0.6 * u); c.quadraticCurveTo(0, -0.95 * u, 0.4 * u, -0.85 * u); c.moveTo(0, 0.7 * u); c.lineTo(-0.3 * u, 0.95 * u); c.moveTo(0, 0.7 * u); c.lineTo(0.3 * u, 0.95 * u); c.stroke(); },
  (c, u) => { c.lineWidth = u * 0.22; c.lineCap = 'round'; c.beginPath(); c.moveTo(-0.9 * u, 0.1 * u); c.bezierCurveTo(-0.5 * u, -0.6 * u, -0.2 * u, 0.6 * u, 0.2 * u, 0); c.bezierCurveTo(0.5 * u, -0.4 * u, 0.7 * u, -0.1 * u, 0.85 * u, -0.1 * u); c.stroke(); c.beginPath(); c.arc(0.88 * u, -0.1 * u, u * 0.16, 0, TAU); c.fill(); },
  (c, u) => { c.lineWidth = u * 0.13; c.beginPath(); c.ellipse(-0.1 * u, 0.15 * u, 0.55 * u, 0.36 * u, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(0.35 * u, 0.05 * u); c.quadraticCurveTo(0.7 * u, -0.1 * u, 0.62 * u, -0.5 * u); c.stroke(); c.beginPath(); c.arc(0.65 * u, -0.6 * u, u * 0.17, 0, TAU); c.fill(); c.beginPath(); c.moveTo(0.78 * u, -0.62 * u); c.lineTo(0.98 * u, -0.55 * u); c.lineTo(0.78 * u, -0.5 * u); c.fill(); c.beginPath(); c.moveTo(-0.1 * u, 0.5 * u); c.lineTo(-0.1 * u, 0.9 * u); c.moveTo(0.1 * u, 0.5 * u); c.lineTo(0.1 * u, 0.9 * u); c.stroke(); },
  (c, u) => { c.lineWidth = u * 0.14; c.beginPath(); c.ellipse(0, 0.12 * u, 0.5 * u, 0.55 * u, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -0.55 * u, u * 0.22, 0, TAU); c.fill(); c.beginPath(); c.moveTo(0, -0.3 * u); c.lineTo(0, 0.7 * u); c.moveTo(-0.9 * u, -0.1 * u); c.quadraticCurveTo(-0.4 * u, -0.5 * u, -0.45 * u, 0.2 * u); c.moveTo(0.9 * u, -0.1 * u); c.quadraticCurveTo(0.4 * u, -0.5 * u, 0.45 * u, 0.2 * u); c.stroke(); },
  (c, u) => { c.lineWidth = u * 0.13; c.lineCap = 'round'; for (const [dx, a] of [[-0.45, -0.25], [0, 0], [0.45, 0.25]]) { c.beginPath(); c.moveTo(dx * u, 0.7 * u); c.quadraticCurveTo(dx * u + a * u * 1.5, 0, dx * u + a * u, -0.65 * u); c.quadraticCurveTo(dx * u + a * u * 0.1, -0.1 * u, dx * u, 0.7 * u); c.fill(); c.stroke(); } c.beginPath(); c.moveTo(-0.7 * u, 0.82 * u); c.lineTo(0.7 * u, 0.82 * u); c.stroke(); },
  (c, u) => { c.lineWidth = u * 0.17; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0.1 * u, 0.6 * u, 0, Math.PI); c.stroke(); c.beginPath(); c.moveTo(-0.7 * u, 0.1 * u); c.lineTo(0.7 * u, 0.1 * u); c.stroke(); },
];

export default still({
  id: 'hieroglyphs',
  name: 'Hieroglyphs',
  blurb: 'Sunk relief as it was cut in the temples of the Nile: signs incised into columns of limestone and then painted in lapis, ochre and malachite. The signs grow fuller and the pigment stronger where your picture is bright.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Sign size', type: 'range', min: 24, max: 90, step: 1, default: 48 },
    { key: 'relief', label: 'Depth', type: 'range', min: 20, max: 100, step: 1, default: 65 },
    { key: 'paint', label: 'Paint', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'light', label: 'Light direction', type: 'range', min: 0, max: 360, step: 5, default: 225, fmt: (v) => v + '°' },
    { key: 'wear', label: 'Weathering', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'stone', label: 'Stone', type: 'select', default: 'limestone', options: [['limestone', 'Limestone'], ['sandstone', 'Sandstone'], ['granite', 'Red granite']] },
    { key: 'seed', label: 'New text', type: 'shuffle', default: 6 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.4), tmp = [0, 0, 0], rel = p.relief / 100;
    const hc = env.makeCanvas(W, H), h = hc.getContext('2d'), pc = env.makeCanvas(W, H), pg = pc.getContext('2d');
    h.fillStyle = 'rgb(150,150,150)'; h.fillRect(0, 0, W, H); h.lineCap = 'round'; h.lineJoin = 'round'; pg.lineCap = 'round'; pg.lineJoin = 'round';
    if (p.paint > 0) { pg.globalAlpha = (p.paint / 100) * 0.6; pg.drawImage(work, 0, 0, W, H); pg.globalAlpha = 1; }
    const cols = Math.floor(W / (s * 1.25)), colW = W / cols, rowH = s * 1.2, rows = Math.ceil(H / rowH), reg = 6;
    // column rules and the lines that divide the register
    h.fillStyle = 'rgb(210,210,210)';
    for (let c = 0; c <= cols; c++) { const x = c * colW; if (c % 2 === 0) { h.fillRect(x - 3 * sc, 0, 2.4 * sc, H); h.fillRect(x + 1 * sc, 0, 2.4 * sc, H); } }
    for (let r = 0; r <= rows; r += reg) { h.fillRect(0, r * rowH - 3 * sc, W, 2.4 * sc); h.fillRect(0, r * rowH + 1 * sc, W, 2.4 * sc); }
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const cx = (c + 0.5) * colW, cy = (r + 0.5) * rowH, t = smp.tone(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1)), id = (hash2(c, r, p.seed) * SIGNS.length) | 0, u = s * 0.5 * (0.5 + 0.5 * t);
      if (u < 1.6) continue;
      const mirror = (c % 2) ? -1 : 1;
      // the sign is cut in: dark inside, a lighter bottom to round it
      h.save(); h.translate(cx, cy); h.scale(mirror, 1); h.strokeStyle = 'rgb(25,25,25)'; h.fillStyle = 'rgb(25,25,25)'; SIGNS[id](h, u); h.restore();
      if (p.paint > 0) {
        const q = vivid(smp.rgb(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1)), 1.6, 0, tmp), col = PIGMENT[nearest(PIGMENT, q[0], q[1], q[2])];
        pg.save(); pg.translate(cx, cy); pg.scale(mirror, 1); pg.globalAlpha = (p.paint / 100) * (0.55 + 0.4 * t); pg.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; pg.strokeStyle = pg.fillStyle; SIGNS[id](pg, u); pg.restore();
      }
    }
    const hd = h.getImageData(0, 0, W, H).data, Hh = new Float32Array(W * H), Ts = boxBlur(boxBlur(smp.L, W, H, Math.round(10 * sc)), W, H, Math.round(10 * sc));
    for (let i = 0; i < W * H; i++) Hh[i] = (hd[i * 4] / 255) * rel + 0.18 * Ts[i];
    const Hs = boxBlur(Hh, W, H, Math.max(1, Math.round(1.1 * sc))), [a, b] = STONES[p.stone];
    carvedStone(ctx, W, H, Hs, { a, b, sc, light: p.light, k: 24 + 80 * rel, wear: p.wear / 100, paint: p.paint > 0 ? pg.getImageData(0, 0, W, H) : null });
  },
});
