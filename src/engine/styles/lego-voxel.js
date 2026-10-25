// src/engine/styles/lego-voxel.js
import { still, rgbCss, clamp } from '../utils.js';
import { pixels, rgbList, nearest } from '../helpers.js';

const PALETTES = {
  full: ['#f4f4f4', '#a0a5a9', '#6c6e68', '#1b2a34', '#c91a09', '#720e0f', '#fe8a18', '#f2cd37', '#e4cd9e', '#cc8e69', '#582a12', '#a5ca18', '#237841', '#184632', '#0055bf', '#36aebf', '#0a3463', '#e4adc8', '#81007b'],
  basic: ['#f4f4f4', '#6c6e68', '#1b2a34', '#c91a09', '#fe8a18', '#f2cd37', '#237841', '#0055bf', '#582a12'],
  greys: ['#f4f4f4', '#a0a5a9', '#6c6e68', '#3b3d3a', '#1b2a34'],
};
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const shade = (c, f) => `rgb(${clamp(c[0] * f, 0, 255) | 0},${clamp(c[1] * f, 0, 255) | 0},${clamp(c[2] * f, 0, 255) | 0})`;

export default still({
  id: 'lego-voxel',
  name: 'Lego Voxel',
  blurb: 'A mosaic of plastic bricks: every cell is one brick colour with a round stud on top.',
  maxSide: 1000,
  params: [
    { key: 'studs', label: 'Studs across', type: 'range', min: 16, max: 96, step: 1, default: 40 },
    { key: 'palette', label: 'Brick colours', type: 'select', default: 'full', options: [['full', 'Full set'], ['basic', 'Basic set'], ['greys', 'Greys']] },
    { key: 'dither', label: 'Dither tones', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'shine', label: 'Shine', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H) {
    const n = p.studs, cs = W / n, rows = Math.max(2, Math.round(H / cs)), ch = H / rows;
    const small = env.makeCanvas(n, rows), sx = small.getContext('2d'); sx.imageSmoothingEnabled = true; sx.drawImage(work, 0, 0, n, rows);
    const d = sx.getImageData(0, 0, n, rows).data, pal = rgbList(PALETTES[p.palette] || PALETTES.full), dith = (p.dither / 100) * 70;
    ctx.fillStyle = '#16181a'; ctx.fillRect(0, 0, W, H);
    const R = Math.min(cs, ch) * 0.335;
    for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
      const o = (j * n + i) * 4, t = BAYER[(j % 4) * 4 + (i % 4)] * dith, c = pal[nearest(pal, d[o] + t, d[o + 1] + t, d[o + 2] + t)];
      const x = i * cs, y = j * ch, cx = x + cs / 2, cy = y + ch / 2;
      ctx.fillStyle = shade(c, 1); ctx.fillRect(x, y, cs + 0.5, ch + 0.5);
      // brick edges: light top-left, dark bottom-right
      ctx.fillStyle = shade(c, 1.18); ctx.fillRect(x, y, cs, Math.max(1, ch * 0.06)); ctx.fillRect(x, y, Math.max(1, cs * 0.06), ch);
      ctx.fillStyle = shade(c, 0.7); ctx.fillRect(x, y + ch - Math.max(1, ch * 0.06), cs, Math.max(1, ch * 0.06)); ctx.fillRect(x + cs - Math.max(1, cs * 0.06), y, Math.max(1, cs * 0.06), ch);
      // stud: a short cylinder with its shadow
      ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.beginPath(); ctx.ellipse(cx + R * 0.22, cy + R * 0.3, R * 1.02, R * 0.98, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = shade(c, 0.74); ctx.beginPath(); ctx.arc(cx, cy + R * 0.16, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = shade(c, 1.07); ctx.beginPath(); ctx.arc(cx, cy - R * 0.04, R * 0.96, 0, Math.PI * 2); ctx.fill();
      if (p.shine) { ctx.strokeStyle = 'rgba(255,255,255,0.42)'; ctx.lineWidth = Math.max(1, R * 0.14); ctx.beginPath(); ctx.arc(cx, cy - R * 0.04, R * 0.7, Math.PI * 1.08, Math.PI * 1.55); ctx.stroke(); }
    }
  },
});
