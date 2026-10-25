// src/engine/styles/handwritten.js
import { still, rng, boxBlur, TAU } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const INKS = { blue: '#1c3a94', black: '#16161a', sepia: '#5b3a22' };
const PAPERS = { lined: '#f6f1e3', grid: '#f4f4ee', plain: '#f2ece0' };

export default still({
  id: 'handwritten',
  name: 'Handwritten',
  blurb: 'Your picture written out by hand: a notebook page where the pen presses harder and writes bigger on the dark parts.',
  maxSide: 1000,
  params: [
    { key: 'text', label: 'Words', type: 'text', default: 'light falls on everything and nothing keeps it', max: 80 },
    { key: 'lines', label: 'Lines of writing', type: 'range', min: 22, max: 70, step: 1, default: 40 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'blue', options: [['blue', 'Blue'], ['black', 'Black'], ['sepia', 'Sepia']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'lined', options: [['lined', 'Lined'], ['grid', 'Squared'], ['plain', 'Plain']] },
    { key: 'press', label: 'Pen pressure', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'seed', label: 'Write again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const Lb = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(W / 300))), r = rng(p.seed * 37 + 3), u = Math.min(W, H) / 100;
    const ink = INKS[p.ink] || INKS.blue, n = p.lines, top = H * 0.07, step = (H * 0.9) / n, fs = step * 1.28;
    ctx.fillStyle = PAPERS[p.paper] || PAPERS.lined; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 700; i++) { ctx.fillStyle = `rgba(${r() < 0.5 ? '120,100,60' : '255,255,255'},${0.02 + r() * 0.05})`; ctx.fillRect(r() * W, r() * H, 1 + r() * 4, 1 + r() * 2); }
    // ruling
    ctx.strokeStyle = 'rgba(80,130,200,0.32)'; ctx.lineWidth = Math.max(1, u * 0.14);
    ctx.beginPath();
    if (p.paper === 'grid') { for (let x = 0; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = top - step * 0.1; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); } }
    else if (p.paper === 'lined') for (let i = 0; i <= n; i++) { const y = top + i * step; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    const mx = W * 0.1;
    if (p.paper === 'lined') { ctx.strokeStyle = 'rgba(210,70,70,0.45)'; ctx.lineWidth = Math.max(1, u * 0.2); ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.stroke(); }
    // binder holes
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(u * 3.2, H * (0.2 + i * 0.3), u * 1.5, 0, TAU); ctx.fill(); }

    // writing: letter by letter, left to right, wrapping the text round as often as needed
    const words = (p.text || 'light').replace(/\s+/g, ' ').trim() + '   ';
    const x0 = p.paper === 'lined' ? mx + u * 2 : u * 6, x1 = W - u * 4, press = p.press / 100;
    ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    let ci = 0, cur = '';
    const wc = new Map(), q = Math.max(0.5, fs * 0.04);
    const use = (f) => { if (f !== cur) { ctx.font = f; cur = f; } };
    const widthOf = (f, ch) => { const k = f + ch; let w = wc.get(k); if (w === undefined) { use(f); w = ctx.measureText(ch).width; wc.set(k, w); } return w; };
    for (let line = 0; line < n; line++) {
      const base = top + (line + 1) * step - step * 0.18;
      let x = x0 + (line % 2 ? 0 : r() * u * 2);
      while (x < x1) {
        const ch = words[ci++ % words.length];
        const sy = Math.min(H - 1, Math.max(0, (base - step * 0.3) | 0)), sx = Math.min(W - 1, x | 0), dark = 1 - Lb[sy * W + sx];
        const size = Math.round((fs * (0.62 + (0.55 + press * 0.35) * dark) * (0.94 + r() * 0.12)) / q) * q;
        const font = `${dark > 0.5 ? 700 : 500} ${size}px "Caveat", "Bradley Hand", cursive`, w = widthOf(font, ch);
        if (ch !== ' ' && dark > 0.07) {
          ctx.globalAlpha = Math.min(1, 0.16 + dark * (0.7 + press * 0.55)) * (0.9 + r() * 0.1);
          const an = (r() - 0.5) * 0.09, cs = Math.cos(an), sn = Math.sin(an);
          use(font); ctx.setTransform(cs, sn, -sn, cs, x, base + (r() - 0.5) * step * 0.07); ctx.fillText(ch, 0, 0);
        }
        x += w * 0.98 + (ch === ' ' ? fs * 0.1 : 0);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  },
});
