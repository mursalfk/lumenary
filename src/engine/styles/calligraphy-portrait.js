// src/engine/styles/calligraphy-portrait.js
import { still, rng, boxBlur, TAU } from '../utils.js';
import { pixels, label, rrPath, stretchedL } from '../helpers.js';

const INKS = { black: [14, 12, 12], sepia: [70, 42, 24], indigo: [24, 30, 86] };

export default still({
  id: 'calligraphy-portrait',
  name: 'Calligraphy Portrait',
  blurb: 'Flowing script in layers: the letters grow large and overlap on the dark parts, so the ink builds the tones.',
  maxSide: 1000,
  params: [
    { key: 'text', label: 'Words', type: 'text', default: 'every picture is a letter written in light', max: 70 },
    { key: 'lines', label: 'Lines', type: 'range', min: 12, max: 40, step: 1, default: 26 },
    { key: 'slant', label: 'Slant', type: 'range', min: -14, max: 14, step: 1, default: -5 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'black', options: [['black', 'Black'], ['sepia', 'Sepia'], ['indigo', 'Indigo']] },
    { key: 'seal', label: 'Red seal', type: 'toggle', default: true },
    { key: 'seed', label: 'Re-letter', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const Lb = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(W / 220))), r = rng(p.seed * 41 + 7), u = Math.min(W, H) / 100;
    const [ir, ig, ib] = INKS[p.ink] || INKS.black, ink = `rgb(${ir},${ig},${ib})`;
    // parchment
    const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.1, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, '#f1e7cf'); g.addColorStop(1, '#d9c6a0'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(130,95,45,${0.02 + r() * 0.04})`; ctx.beginPath(); ctx.ellipse(r() * W, r() * H, u * (2 + r() * 12), u * (2 + r() * 8), r() * 3, 0, TAU); ctx.fill(); }
    // border
    const m = u * 4; ctx.strokeStyle = `rgba(${ir},${ig},${ib},0.65)`; ctx.lineWidth = Math.max(1, u * 0.35); ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.lineWidth = Math.max(1, u * 0.14); ctx.strokeRect(m + u * 1.1, m + u * 1.1, W - 2 * m - u * 2.2, H - 2 * m - u * 2.2);

    // text, laid on lines that slope slightly; size and weight follow the darkness underneath
    const words = (p.text || 'light').replace(/\s+/g, ' ').trim() + '   ', n = p.lines, slope = Math.tan((p.slant * Math.PI) / 180) * 0.35;
    const top = H * 0.1, step = (H * 0.8) / n, base = step * 1.7, x0 = m + u * 3, x1 = W - m - u * 3;
    ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    let ci = 0, cur = '';
    const wc = new Map(), q = Math.max(0.5, base * 0.03);
    const use = (f) => { if (f !== cur) { ctx.font = f; cur = f; } };
    for (let line = 0; line < n; line++) {
      let x = x0 - r() * u * 3;
      while (x < x1) {
        const ch = words[ci++ % words.length], by = top + (line + 1) * step + (x - W / 2) * slope;
        const sy = Math.min(H - 1, Math.max(0, (by - step * 0.4) | 0)), sx = Math.min(W - 1, Math.max(0, x | 0)), dark = 1 - Lb[sy * W + sx];
        const size = Math.round((base * (0.3 + 1.45 * Math.pow(dark, 1.15))) / q) * q, font = `400 ${size}px "Pinyon Script", "Snell Roundhand", cursive`, k = font + ch;
        let w = wc.get(k); if (w === undefined) { use(font); w = ctx.measureText(ch).width; wc.set(k, w); }
        if (ch !== ' ' && dark > 0.06) {
          const an = Math.atan(slope) + (r() - 0.5) * 0.05, cs = Math.cos(an), sn = Math.sin(an);
          ctx.globalAlpha = 0.3 + 0.55 * dark; use(font); ctx.setTransform(cs, sn, -sn, cs, x, by); ctx.fillText(ch, 0, 0);
        }
        x += ch === ' ' ? size * 0.3 : Math.max(size * 0.12, w * 0.62);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    if (p.seal) {
      const sx = W - m - u * 9, sy = H - m - u * 9, s = u * 6.4;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.08);
      ctx.fillStyle = 'rgba(176,32,32,0.9)'; ctx.beginPath(); rrPath(ctx, -s / 2, -s / 2, s, s, s * 0.14); ctx.fill();
      ctx.strokeStyle = 'rgba(240,225,200,0.75)'; ctx.lineWidth = Math.max(1, u * 0.25); ctx.strokeRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
      label(ctx, 'L', 0, s * 0.04, `400 ${s * 0.78}px "Bodoni Moda", Georgia, serif`, 'rgba(244,232,210,0.92)');
      ctx.restore();
    }
  },
});
