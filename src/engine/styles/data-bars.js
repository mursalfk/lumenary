// src/engine/styles/data-bars.js
import { still, clamp, lerp, sampleImage, lumOf, rgbCss } from '../utils.js';
import { ramp, rgbList } from '../helpers.js';
import { vivid } from '../culture.js';

const GOLD = rgbList(['#3a2408', '#8a5a12', '#d9a422', '#f7d774', '#fff6c8']);
const GROUNDS = { dark: ['#0b0d12', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.55)'], paper: ['#f4f1ea', 'rgba(20,20,30,0.12)', 'rgba(20,20,30,0.6)'], navy: ['#0d1730', 'rgba(160,190,255,0.14)', 'rgba(190,210,255,0.65)'] };

export default still({
  id: 'data-bars',
  name: 'Data Bars',
  blurb: 'The picture redrawn as rows of bar charts: every bar stands on its baseline, as tall as the picture is bright at that spot, in flat colour, in gold, or as blocks with a top and a side.',
  maxSide: 1100,
  params: [
    { key: 'bars', label: 'Bars across', type: 'range', min: 16, max: 96, step: 1, default: 48 },
    { key: 'rows', label: 'Row height', type: 'range', min: 100, max: 400, step: 10, default: 220, fmt: (v) => (v / 100).toFixed(1) + ' bars' },
    { key: 'look', label: 'Bars', type: 'select', default: 'flat', options: [['flat', 'Flat colour'], ['gold', 'Gold'], ['blocks', 'Blocks']] },
    { key: 'gap', label: 'Gap between bars', type: 'range', min: 0, max: 60, step: 1, default: 24, fmt: (v) => v + '%' },
    { key: 'tall', label: 'Tall where the picture is', type: 'select', default: 'light', options: [['light', 'Light'], ['dark', 'Dark']] },
    { key: 'ground', label: 'Ground', type: 'select', default: 'dark', options: [['dark', 'Black'], ['navy', 'Navy'], ['paper', 'Paper']] },
    { key: 'axis', label: 'Gridlines and scale', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H) {
    const [bg, rule, ink] = GROUNDS[p.ground] || GROUNDS.dark, sc = W / 1000, margin = p.axis ? Math.round(W * 0.055) : Math.round(W * 0.02);
    const cols = p.bars, cw = (W - margin - W * 0.02) / cols, rh = cw * (p.rows / 100), rows = Math.max(2, Math.round((H - margin) / rh)), top = (H - margin * 0.6 - rows * rh) / 2;
    const d = sampleImage(env, work, cols, rows).data, bw = cw * (1 - p.gap / 100), blocks = p.look === 'blocks', deep = blocks ? Math.min(cw - bw + bw * 0.3, cw * 0.4) : 0, tmp = [0, 0, 0], g = [0, 0, 0];
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.font = `500 ${Math.max(8, Math.round(10 * sc))}px "DM Mono", monospace`; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
    for (let j = 0; j < rows; j++) {
      const base = top + (j + 1) * rh - rh * 0.08, full = rh * 0.86 - deep * 0.5;
      if (p.axis) {
        ctx.fillStyle = rule; ctx.fillRect(margin, Math.round(base), W - margin - W * 0.02, Math.max(1, sc)); ctx.fillRect(margin, Math.round(base - full / 2), W - margin - W * 0.02, Math.max(1, sc * 0.6));
        // the scale is written once, on the first row; every row below it is read the same way
        if (j === 0) { ctx.fillStyle = ink; ctx.fillText('0', margin - 8 * sc, base); ctx.fillText('100', margin - 8 * sc, base - full); }
      }
      for (let i = 0; i < cols; i++) {
        const q = (j * cols + i) * 4, l = lumOf(d[q], d[q + 1], d[q + 2]), v = clamp(p.tall === 'dark' ? 1 - l : l), h = Math.max(1.5 * sc, full * (0.03 + 0.97 * v)), x = margin + i * cw + (cw - bw - deep) / 2, y = base - h;
        let c;
        if (p.look === 'gold') { ramp(GOLD, 0.2 + 0.8 * v, g); c = [g[0], g[1], g[2]]; } else { vivid([d[q], d[q + 1], d[q + 2]], 1.25, lerp(0.1, 0, v), tmp); c = [tmp[0], tmp[1], tmp[2]]; }
        if (blocks) {
          // the side and the top of the block: two parallelograms, one darker and one lighter than its face
          ctx.fillStyle = rgbCss(c[0] * 0.55, c[1] * 0.55, c[2] * 0.6); ctx.beginPath(); ctx.moveTo(x + bw, y); ctx.lineTo(x + bw + deep, y - deep * 0.5); ctx.lineTo(x + bw + deep, base - deep * 0.5); ctx.lineTo(x + bw, base); ctx.closePath(); ctx.fill();
          ctx.fillStyle = rgbCss(Math.min(255, c[0] * 1.2 + 26), Math.min(255, c[1] * 1.2 + 26), Math.min(255, c[2] * 1.2 + 26)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + deep, y - deep * 0.5); ctx.lineTo(x + bw + deep, y - deep * 0.5); ctx.lineTo(x + bw, y); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = rgbCss(c[0], c[1], c[2]); ctx.fillRect(x, y, bw, h);
        if (p.look === 'gold' && bw > 3) { ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(x + bw * 0.16, y, Math.max(1, bw * 0.16), h); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + bw * 0.78, y, bw * 0.22, h); }
        else if (p.look === 'flat' && bw > 3) { ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x, y, bw, Math.max(1, 2 * sc)); }
      }
    }
    if (p.axis) {
      ctx.fillStyle = ink; ctx.fillRect(margin, top, Math.max(1, sc), rows * rh);
      ctx.textAlign = 'left'; ctx.fillText(`${cols} columns   ${rows} rows   height = ${p.tall === 'dark' ? 'darkness' : 'brightness'}`, margin, H - margin * 0.45);
    }
  },
});
