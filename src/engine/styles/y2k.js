// src/engine/styles/y2k.js
import { still, rng, TAU, hexToRgb } from '../utils.js';
import { pixels, paintPixels, ramp, rrPath, label } from '../helpers.js';

const SCHEMES = {
  aqua: [[20, 40, 140], [60, 150, 255], [170, 225, 255], [255, 205, 240], [255, 255, 255]],
  candy: [[90, 20, 130], [255, 70, 190], [255, 170, 225], [190, 230, 255], [255, 255, 255]],
  chrome: [[18, 22, 40], [90, 105, 140], [190, 200, 220], [235, 240, 250], [255, 255, 255]],
};

function sparkle(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU - Math.PI / 2, rr = i % 2 ? r * 0.2 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

export default still({
  id: 'y2k',
  name: 'Y2K',
  blurb: 'Early-2000s gloss: aqua and candy colour, chrome bevels, sparkles and a window frame.',
  maxSide: 1000,
  params: [
    { key: 'scheme', label: 'Colour', type: 'select', default: 'aqua', options: [['aqua', 'Aqua'], ['candy', 'Candy'], ['chrome', 'Chrome']] },
    { key: 'gloss', label: 'Gloss', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'sparkles', label: 'Sparkles', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'window', label: 'Window frame', type: 'toggle', default: true },
    { key: 'title', label: 'Window title', type: 'text', default: 'my_photo.jpg', max: 22 },
    { key: 'seed', label: 'Scatter again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, stops = SCHEMES[p.scheme] || SCHEMES.aqua, u = Math.min(W, H) / 100;
    paintPixels(ctx, W, H, (x, y, o) => ramp(stops, Math.pow(L[y * W + x], 0.85), o));

    const inset = p.window ? u * 7 : 0;
    // gloss: a pale curved highlight over the upper half
    if (p.gloss > 0) {
      ctx.save();
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.55);
      g.addColorStop(0, `rgba(255,255,255,${0.55 * p.gloss / 100})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, inset); ctx.lineTo(W, inset); ctx.lineTo(W, H * 0.32 + inset);
      ctx.quadraticCurveTo(W / 2, H * 0.5 + inset, 0, H * 0.32 + inset); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // sparkles on the bright spots
    const r = rng(p.seed * 31 + 7), cells = 22, cw = W / cells, ch = H / cells;
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = u * 1.4;
    const want = Math.round(p.sparkles / 100 * 24);
    let placed = 0;
    for (let tries = 0; tries < 500 && placed < want; tries++) {
      const x = r() * W, y = r() * H;
      if (L[(y | 0) * W + (x | 0)] > 0.62 + r() * 0.25) { ctx.globalAlpha = 0.75 + r() * 0.25; sparkle(ctx, x, y, u * (1.2 + r() * 2.8)); placed++; }
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    if (p.window) {
      const bar = u * 6.5, m = u * 1.6;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H); rrPath(ctx, m, bar, W - 2 * m, H - bar - m, u * 1.2); ctx.clip('evenodd');
      const fg = ctx.createLinearGradient(0, 0, 0, H);
      fg.addColorStop(0, '#f4f6fb'); fg.addColorStop(0.5, '#aab4c8'); fg.addColorStop(1, '#e9edf5');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      const tg = ctx.createLinearGradient(0, 0, W, 0);
      tg.addColorStop(0, `rgb(${stops[1].join(',')})`); tg.addColorStop(1, `rgb(${stops[3].join(',')})`);
      ctx.fillStyle = tg; ctx.fillRect(m, m * 0.6, W - 2 * m, bar - m * 1.1);
      label(ctx, p.title || '', m + u * 2, bar / 2, `700 ${u * 2.6}px "Hanken Grotesk", system-ui, sans-serif`, '#fff', 'left');
      [['#ffd24a', 0], ['#7cf08b', 1], ['#ff6b8a', 2]].forEach(([c, i]) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(W - m - u * (2.4 + i * 3.4), bar / 2, u * 1.15, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = u * 0.2; ctx.stroke();
      });
    }
  },
});
