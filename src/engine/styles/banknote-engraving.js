// src/engine/styles/banknote-engraving.js
import { still, vnoise, boxBlur, hexToRgb, clamp, TAU } from '../utils.js';
import { pixels, stretchedL, label, rrPath, contrast } from '../helpers.js';

const INKS = { green: ['#1f5a3c', '#e4eddc'], blue: ['#1b3f78', '#e2e9f0'], brown: ['#5a3519', '#efe5d0'], violet: ['#4a2a72', '#ece6ee'] };
const serif = '"Bodoni Moda", Didot, Georgia, serif';

export default still({
  id: 'banknote-engraving',
  name: 'Banknote Engraving',
  blurb: 'A portrait in engraved lines, as on a banknote: each line swells where the picture is dark, framed by guilloche rosettes.',
  maxSide: 1100,
  params: [
    { key: 'title', label: 'Title', type: 'text', default: 'NOTE OF LIGHT', max: 22 },
    { key: 'value', label: 'Value', type: 'text', default: '100', max: 5 },
    { key: 'lines', label: 'Engraved lines', type: 'range', min: 40, max: 140, step: 1, default: 84 },
    { key: 'swing', label: 'Line swing', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'green', options: [['green', 'Green'], ['blue', 'Blue'], ['brown', 'Brown'], ['violet', 'Violet']] },
    { key: 'rosettes', label: 'Rosettes', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const u = Math.min(W, H) / 100, sc = W / 800, [inkHex, paperHex] = INKS[p.ink] || INKS.green, ink = hexToRgb(inkHex);
    const L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(1.5 * sc))), rgba = (a) => `rgba(${ink[0]},${ink[1]},${ink[2]},${a})`;
    ctx.fillStyle = paperHex; ctx.fillRect(0, 0, W, H);
    // a pale, wavering tint of fine lines over the whole note
    ctx.strokeStyle = rgba(0.12); ctx.lineWidth = Math.max(0.6, u * 0.12);
    for (let y = 0; y < H; y += u * 0.85) { ctx.beginPath(); for (let x = 0; x <= W; x += 10) { const yy = y + Math.sin(x * 0.02 + y * 0.05) * u * 0.35; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
    // frame
    const m = u * 3.2; ctx.strokeStyle = rgba(0.9); ctx.lineWidth = u * 0.5; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.lineWidth = u * 0.16; ctx.strokeRect(m + u * 1.1, m + u * 1.1, W - 2 * (m + u * 1.1), H - 2 * (m + u * 1.1));
    // guilloche rosette: a hypotrochoid drawn several times with a shifting phase
    const rosette = (cx, cy, R, alpha) => {
      ctx.strokeStyle = rgba(alpha); ctx.lineWidth = Math.max(0.5, u * 0.09);
      const rr = R * 0.34, dd = R * 0.78;
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        for (let s = 0; s <= 900; s++) { const t = (s / 900) * TAU * 8, a = (R - rr) * Math.cos(t) + (dd + k * R * 0.02) * Math.cos(((R - rr) / rr) * t), b = (R - rr) * Math.sin(t) - (dd + k * R * 0.02) * Math.sin(((R - rr) / rr) * t); s ? ctx.lineTo(cx + a * 0.62, cy + b * 0.62) : ctx.moveTo(cx + a * 0.62, cy + b * 0.62); }
        ctx.stroke();
      }
    };
    if (p.rosettes) {
      const r1 = u * 9, off = m + u * 1.1 + r1 * 0.72;
      for (const [cx, cy] of [[off, off], [W - off, off], [off, H - off], [W - off, H - off]]) rosette(cx, cy, r1, 0.55);
      rosette(W / 2, H - m - u * 1.1 - u * 5, u * 8, 0.4);
    }
    // the portrait: engraved lines inside a rounded window
    const px = W * 0.14, py = H * 0.2, pw = W * 0.72, ph = H * 0.6, n = p.lines, pitch = ph / n, swing = p.swing / 100;
    ctx.save(); ctx.beginPath(); rrPath(ctx, px, py, pw, ph, u * 3); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = rgba(0.94);
    const step = Math.max(2, Math.round(2 * sc)), at = (x, y) => { const sx = clamp(Math.floor(((x - px) / pw) * W), 0, W - 1), sy = clamp(Math.floor(((y - py) / ph) * H), 0, H - 1); return 1 - contrast(L[sy * W + sx], 0.2); };
    for (let i = 0; i <= n; i++) {
      const top = [], bot = [];
      for (let x = px - step; x <= px + pw + step; x += step) {
        const yc = py + i * pitch, dk = at(x, yc), shift = (0.5 - dk) * pitch * 1.4 * swing + Math.sin(x * 0.018 + i * 0.45) * pitch * 0.35 * swing;
        const half = Math.min(pitch * 0.5, pitch * 0.52 * Math.pow(dk, 0.9) + 0.18 * sc);
        top.push([x, yc + shift - half]); bot.push([x, yc + shift + half]);
      }
      ctx.beginPath(); top.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); for (let k = bot.length - 1; k >= 0; k--) ctx.lineTo(bot[k][0], bot[k][1]); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = rgba(0.95); ctx.lineWidth = u * 0.45; ctx.beginPath(); rrPath(ctx, px, py, pw, ph, u * 3); ctx.stroke();
    // lettering
    const ttl = (p.title || '').toUpperCase(), val = p.value || '';
    ctx.font = `600 100px ${serif}`;
    const fs = Math.min(u * 6.2, ((W * 0.62) / Math.max(1, ctx.measureText(ttl).width)) * 100);
    label(ctx, ttl, W / 2, H * 0.115, `600 ${fs}px ${serif}`, inkHex);
    label(ctx, val, W * 0.8, H * 0.885, `600 ${u * 8}px ${serif}`, inkHex, 'right');
    label(ctx, 'AB 0417 2613 C', W * 0.2, H * 0.885, `500 ${u * 2.3}px ${serif}`, inkHex, 'left');
    label(ctx, 'PAYABLE IN LIGHT TO THE BEARER', W / 2, H * 0.835, `500 ${u * 2}px ${serif}`, inkHex);
  },
});
