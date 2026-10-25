// src/engine/styles/greek-meander.js
import { still, hexToRgb, clamp, hash2 } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { clothFill, css } from '../culture.js';

const FIGURES = {
  black: { ground: ['#c8693a', '#a8502a'], paint: [24, 17, 14], dark: true },
  red: { ground: ['#1e1815', '#0e0b0a'], paint: [200, 105, 58], dark: false },
  white: { ground: ['#eadfc4', '#d6c8a4'], paint: [34, 24, 20], dark: true },
};
// One hook of the key pattern, in units; the band is 6 units high and a hook repeats every 8.
const HOOK = [[0, 6, 0, 0], [0, 0, 5, 0], [5, 0, 5, 4], [5, 4, 2, 4], [2, 4, 2, 2], [2, 2, 3.5, 2]];

export default still({
  id: 'greek-meander',
  name: 'Greek Meander',
  blurb: 'The key pattern painted around Athenian pots. Rows of unbroken fret run across the clay, and the line is drawn thicker where your picture is darker and thinner where it is light.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Key size', type: 'range', min: 24, max: 90, step: 1, default: 46 },
    { key: 'weight', label: 'Line weight', type: 'range', min: 20, max: 100, step: 1, default: 70 },
    { key: 'follow', label: 'Weight follows picture', type: 'range', min: 0, max: 100, step: 1, default: 85 },
    { key: 'tint', label: 'Picture in the clay', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'rules', label: 'Rule lines', type: 'toggle', default: true },
    { key: 'figure', label: 'Style', type: 'select', default: 'black', options: [['black', 'Black-figure'], ['red', 'Red-figure'], ['white', 'White-ground']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, u = (p.size * sc) / 6, smp = sampler(cache, d, W, H, u * 2.2), fig = FIGURES[p.figure], fol = p.follow / 100, base = p.weight / 100;
    const [a, b] = fig.ground.map(hexToRgb);
    clothFill(ctx, W, H, a, b, sc, 8, 0.03);
    if (p.tint > 0) { ctx.save(); ctx.globalCompositeOperation = fig.dark ? 'multiply' : 'screen'; ctx.globalAlpha = (p.tint / 100) * (fig.dark ? 0.8 : 0.3); ctx.drawImage(work, 0, 0, W, H); ctx.restore(); }
    const bandH = 6 * u, pitch = bandH + 3 * u, period = 8 * u, rows = Math.ceil(H / pitch) + 1, cols = Math.ceil(W / period) + 2;
    ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
    const wAt = (x, y) => {
      const t = smp.tone(clamp(x, 0, W - 1), clamp(y, 0, H - 1)), v = fig.dark ? 1 - t : t;
      return u * (0.18 + 1.0 * base * (1 - fol + fol * Math.pow(v, 0.9)));
    };
    const paint = (x0, y0, x1, y1) => {
      const w = wAt((x0 + x1) / 2, (y0 + y1) / 2);
      ctx.lineWidth = w; ctx.strokeStyle = css(fig.paint); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.lineWidth = Math.max(0.8, w * 0.16); ctx.strokeStyle = fig.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(x0 - w * 0.2, y0 - w * 0.2); ctx.lineTo(x1 - w * 0.2, y1 - w * 0.2); ctx.stroke();
    };
    for (let r = 0; r < rows; r++) {
      const y0 = r * pitch + u * 1.5, mirror = r % 2 === 1;
      if (p.rules) { for (const yy of [y0 - 1.3 * u, y0 + 7.3 * u]) paint(0, yy, W, yy); }
      for (let c = -1; c < cols; c++) {
        const x0 = c * period + (mirror ? period / 2 : 0);
        // the rule the hooks stand on
        paint(x0, y0 + 6 * u, x0 + period, y0 + 6 * u);
        for (const [ax, ay, bx, by] of HOOK) paint(x0 + (mirror ? 8 - ax : ax) * u, y0 + ay * u, x0 + (mirror ? 8 - bx : bx) * u, y0 + by * u);
      }
    }
    void hash2;
  },
});
