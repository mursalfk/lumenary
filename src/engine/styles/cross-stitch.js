// src/engine/styles/cross-stitch.js
import { still, sampleImage, lumOf, clamp, hexToRgb, rgb2hsl, hsl2rgb } from '../utils.js';
import { kmeans, nearest } from '../helpers.js';

const CLOTHS = { cream: '#efe6d0', white: '#f6f4ee', black: '#1b1a1c', blue: '#b9c9dc' };
const shade = ([r, g, b], k) => [clamp(r * k, 0, 255), clamp(g * k, 0, 255), clamp(b * k, 0, 255)];
const css = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;

export default still({
  id: 'cross-stitch',
  name: 'Cross-stitch',
  blurb: 'A sampler: your picture counted out in coloured thread, one X per square of the cloth, using a limited box of flosses.',
  maxSide: 1000,
  params: [
    { key: 'across', label: 'Stitches across', type: 'range', min: 30, max: 140, step: 1, default: 68 },
    { key: 'flosses', label: 'Colours of thread', type: 'range', min: 3, max: 14, step: 1, default: 8 },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'cream', options: [['cream', 'Cream aida'], ['white', 'White aida'], ['black', 'Black aida'], ['blue', 'Blue linen']] },
    { key: 'bare', label: 'Leave light areas bare', type: 'toggle', default: false },
    { key: 'seed', label: 'Different flosses', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    const n = p.across, s = W / n, rows = Math.ceil(H / s), img = sampleImage(env, work, n, rows), d = img.data;
    const flo = kmeans(d, p.flosses, p.seed * 3 + 1, 10, 1).map(([r, g, b]) => { const [h, sa, l] = rgb2hsl(r, g, b); return hsl2rgb(h, clamp(sa * 1.1), clamp(l)); });
    const cloth = CLOTHS[p.cloth] || CLOTHS.cream;
    ctx.fillStyle = cloth; ctx.fillRect(0, 0, W, H);
    // the cloth: a grid of tiny holes at every corner and faint horizontal and vertical threads
    const dark = p.cloth === 'black';
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(80,60,30,0.09)'; ctx.lineWidth = Math.max(0.6, s * 0.06); ctx.beginPath();
    for (let j = 0; j <= rows; j++) { ctx.moveTo(0, j * s); ctx.lineTo(W, j * s); }
    for (let i = 0; i <= n; i++) { ctx.moveTo(i * s, 0); ctx.lineTo(i * s, H); }
    ctx.stroke();
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.6)' : 'rgba(60,45,25,0.28)'; ctx.beginPath();
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= n; i++) { ctx.moveTo(i * s + s * 0.1, j * s); ctx.arc(i * s, j * s, s * 0.1, 0, Math.PI * 2); }
    ctx.fill();
    // each cell gets the nearest floss
    const cells = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
      const o = (j * n + i) * 4, r = d[o], g = d[o + 1], b = d[o + 2];
      if (p.bare && lumOf(r, g, b) > 0.86) continue;
      cells.push([i, j, flo[nearest(flo, r, g, b)]]);
    }
    const byColour = new Map();
    for (const c of cells) { const k = c[2].join(','); if (!byColour.has(k)) byColour.set(k, []); byColour.get(k).push(c); }
    const a = 0.15 * s, w = s * 0.34;
    ctx.lineCap = 'round';
    // pass 1 the backslash under each X (with its shadow), pass 2 the slash on top, pass 3 a thin highlight on the top thread
    for (const pass of [0, 1, 2]) for (const [, list] of byColour) {
      const col = list[0][2];
      ctx.beginPath();
      for (const [i, j] of list) {
        const x = i * s, y = j * s;
        if (pass === 0) { ctx.moveTo(x + a, y + a); ctx.lineTo(x + s - a, y + s - a); }
        else { ctx.moveTo(x + s - a, y + a); ctx.lineTo(x + a, y + s - a); }
      }
      if (pass === 0) { ctx.strokeStyle = css(shade(col, 0.82)); ctx.lineWidth = w; }
      else if (pass === 1) { ctx.save(); ctx.translate(s * 0.05, s * 0.07); ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = w; ctx.stroke(); ctx.restore(); ctx.strokeStyle = css(shade(col, 1.0)); ctx.lineWidth = w; }
      else { ctx.strokeStyle = css(shade(col, 1.35), 0.55); ctx.lineWidth = w * 0.28; }
      ctx.stroke();
    }
  },
});
