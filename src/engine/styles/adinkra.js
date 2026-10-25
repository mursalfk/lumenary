// src/engine/styles/adinkra.js
import { still, hexToRgb, clamp, hash2, TAU } from '../utils.js';
import { pixels, sampler, fbm } from '../helpers.js';
import { css, vivid, clothFill, starPoints, poly } from '../culture.js';

const CLOTH = { cream: ['#e8dcc0', '#d3c4a0'], indigo: ['#1c2658', '#121a3e'], red: ['#8a1d1a', '#5e1210'], ochre: ['#c58a2e', '#a56e1e'] };

// Stamps drawn in a box of half-size u. Strokes use the current width; `cut` removes paper from what is drawn.
function spiral(ctx, cx, cy, r0, dir, turns) {
  ctx.beginPath();
  for (let t = 0; t <= turns * TAU; t += 0.2) { const r = r0 * (1 - t / (turns * TAU) * 0.82), a = dir * t - Math.PI / 2; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
}
function heart(ctx, u) {
  ctx.beginPath(); ctx.moveTo(0, 0.85 * u);
  ctx.bezierCurveTo(-1.1 * u, 0.1 * u, -0.95 * u, -0.85 * u, -0.4 * u, -0.85 * u);
  ctx.bezierCurveTo(-0.15 * u, -0.85 * u, 0, -0.6 * u, 0, -0.45 * u);
  ctx.bezierCurveTo(0, -0.6 * u, 0.15 * u, -0.85 * u, 0.4 * u, -0.85 * u);
  ctx.bezierCurveTo(0.95 * u, -0.85 * u, 1.1 * u, 0.1 * u, 0, 0.85 * u); ctx.closePath();
}
const STAMPS = [
  // adinkrahene: rings of leadership
  (c, u) => { c.lineWidth = u * 0.16; for (const r of [0.88, 0.58]) { c.beginPath(); c.arc(0, 0, r * u, 0, TAU); c.stroke(); } c.beginPath(); c.arc(0, 0, 0.28 * u, 0, TAU); c.fill(); },
  // akoma: the heart
  (c, u) => { heart(c, u); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = u * 0.1; c.beginPath(); c.moveTo(0, 0.5 * u); c.bezierCurveTo(-0.6 * u, 0.1 * u, -0.5 * u, -0.45 * u, -0.28 * u, -0.45 * u); c.stroke(); c.globalCompositeOperation = 'source-over'; },
  // sankofa: look back and fetch it
  (c, u) => { heart(c, u); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = u * 0.1; spiral(c, -0.42 * u, -0.3 * u, 0.3 * u, 1, 1.4); spiral(c, 0.42 * u, -0.3 * u, 0.3 * u, -1, 1.4); c.globalCompositeOperation = 'source-over'; },
  // dwennimmen: the ram's horns
  (c, u) => { c.lineWidth = u * 0.2; spiral(c, -0.45 * u, 0.1 * u, 0.52 * u, 1, 1.3); spiral(c, 0.45 * u, 0.1 * u, 0.52 * u, -1, 1.3); c.fillRect(-0.9 * u, 0.62 * u, 1.8 * u, 0.22 * u); c.beginPath(); c.moveTo(0, -0.3 * u); c.lineTo(0, 0.62 * u); c.stroke(); },
  // nsoromma: child of the heavens
  (c, u) => { poly(c, starPoints(0, 0, 0.95 * u, 0.4 * u, 8, -Math.PI / 2)); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(0, 0, 0.22 * u, 0, TAU); c.fill(); c.globalCompositeOperation = 'source-over'; },
  // aya: the fern
  (c, u) => { c.lineWidth = u * 0.15; c.beginPath(); c.moveTo(0, 0.95 * u); c.lineTo(0, -0.95 * u); for (let j = 0; j < 4; j++) { const y = 0.6 * u - j * 0.38 * u; c.moveTo(0, y); c.lineTo(-0.55 * u, y - 0.34 * u); c.moveTo(0, y); c.lineTo(0.55 * u, y - 0.34 * u); } c.stroke(); },
  // nkyinkyim: twisting, toughness
  (c, u) => { c.lineWidth = u * 0.22; c.beginPath(); c.moveTo(-0.6 * u, -0.9 * u); c.lineTo(0.6 * u, -0.45 * u); c.lineTo(-0.6 * u, 0); c.lineTo(0.6 * u, 0.45 * u); c.lineTo(-0.6 * u, 0.9 * u); c.stroke(); },
  // duafe: the comb
  (c, u) => { c.lineWidth = u * 0.2; c.fillRect(-0.85 * u, 0.15 * u, 1.7 * u, 0.7 * u); c.beginPath(); for (let j = 0; j < 4; j++) { const x = -0.65 * u + j * 0.43 * u; c.moveTo(x, 0.2 * u); c.lineTo(x, -0.9 * u); } c.stroke(); },
  // epa: the handcuffs
  (c, u) => { c.lineWidth = u * 0.2; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 0.38 * u, 0, 0.5 * u, 0, TAU); c.stroke(); } c.fillRect(-0.2 * u, -0.1 * u, 0.4 * u, 0.2 * u); },
  // nyame dua: the altar tree
  (c, u) => { c.lineWidth = u * 0.18; c.beginPath(); c.moveTo(0, 0.95 * u); c.lineTo(0, -0.1 * u); c.moveTo(0, 0.1 * u); c.lineTo(-0.7 * u, -0.8 * u); c.moveTo(0, 0.1 * u); c.lineTo(0.7 * u, -0.8 * u); c.moveTo(-0.45 * u, 0.5 * u); c.lineTo(0.45 * u, 0.5 * u); c.stroke(); },
];

export default still({
  id: 'adinkra',
  name: 'Adinkra',
  blurb: 'Symbols of the Akan people of Ghana, stamped in dark ink on cloth. Each one carries a saying, such as the heart, the fern, the ram’s horns. They grow larger and heavier where your picture is dark.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Stamp size', type: 'range', min: 30, max: 100, step: 1, default: 56 },
    { key: 'follow', label: 'Size follows shade', type: 'range', min: 0, max: 100, step: 1, default: 80 },
    { key: 'tint', label: 'Picture in the cloth', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'rules', label: 'Printed rules', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'cream', options: [['cream', 'Natural cotton'], ['indigo', 'Indigo'], ['red', 'Red'], ['ochre', 'Ochre']] },
    { key: 'ink', label: 'Ink', type: 'select', default: 'bark', options: [['bark', 'Bark ink'], ['picture', 'Colours of the picture'], ['gold', 'Gold']] },
    { key: 'seed', label: 'New order', type: 'shuffle', default: 3 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.35), tmp = [0, 0, 0], fol = p.follow / 100;
    const [a, b] = CLOTH[p.cloth].map(hexToRgb), dark = p.cloth === 'indigo' || p.cloth === 'red';
    clothFill(ctx, W, H, a, b, sc, 5, 0.07);
    if (p.tint > 0) { ctx.save(); ctx.globalCompositeOperation = dark ? 'screen' : 'multiply'; ctx.globalAlpha = (p.tint / 100) * (dark ? 0.35 : 0.7); ctx.drawImage(work, 0, 0, W, H); ctx.restore(); }
    const layer = env.makeCanvas(W, H), lc = layer.getContext('2d');
    const inkOf = (x, y) => {
      if (p.ink === 'gold') return [214, 170, 70];
      if (p.ink === 'picture') { const c = smp.rgb(clamp(x, 0, W - 1), clamp(y, 0, H - 1)); vivid(c, 1.5, dark ? 0.18 : -0.16, tmp); return [tmp[0], tmp[1], tmp[2]]; }
      return dark ? [235, 224, 196] : [44, 27, 16];
    };
    const cols = Math.ceil(W / s), rows = Math.ceil(H / s), ox = (W - cols * s) / 2, oy = (H - rows * s) / 2;
    lc.lineCap = 'round'; lc.lineJoin = 'round';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = ox + (c + 0.5) * s, cy = oy + (r + 0.5) * s, t = smp.tone(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1)), v = dark ? t : 1 - t;
      if (v < 0.12) continue;
      const u = s * 0.5 * (1 - fol + fol * (0.3 + 0.7 * v)) * 0.9, id = (hash2(c, r, p.seed) * STAMPS.length) | 0, ink = css(inkOf(cx, cy));
      lc.save(); lc.translate(cx + (hash2(c, r, 3) - 0.5) * s * 0.06, cy + (hash2(c, r, 4) - 0.5) * s * 0.06); lc.rotate((hash2(c, r, 5) - 0.5) * 0.08);
      lc.fillStyle = ink; lc.strokeStyle = ink; STAMPS[id](lc, u);
      lc.restore();
    }
    // printed rules between the rows and columns: three lines drawn with a comb
    if (p.rules > 0) {
      const ra = p.rules / 100; lc.strokeStyle = dark ? `rgba(235,224,196,${0.8 * ra})` : `rgba(44,27,16,${0.8 * ra})`; lc.lineWidth = 1.4 * sc;
      for (let r = 0; r <= rows; r++) for (let j = -1; j <= 1; j++) { const y = oy + r * s + j * 3.2 * sc; lc.beginPath(); lc.moveTo(0, y); lc.lineTo(W, y); lc.stroke(); }
      for (let c = 0; c <= cols; c++) for (let j = -1; j <= 1; j++) { const x = ox + c * s + j * 3.2 * sc; lc.beginPath(); lc.moveTo(x, 0); lc.lineTo(x, H); lc.stroke(); }
    }
    // the stamp never inks evenly
    const im = lc.getImageData(0, 0, W, H), od = im.data;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) { if (od[k + 3]) { const n = fbm(x / (5 * sc), y / (5 * sc), 6, 3); od[k + 3] *= clamp(0.55 + 0.9 * n); } }
    lc.putImageData(im, 0, 0);
    ctx.drawImage(layer, 0, 0);
  },
});
