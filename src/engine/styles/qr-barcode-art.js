// src/engine/styles/qr-barcode-art.js
import { still, rng } from '../utils.js';
import { pixels, label } from '../helpers.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export default still({
  id: 'qr-barcode-art',
  name: 'QR Barcode Art',
  blurb: 'Your picture as a QR-style square of black modules, or as the bar widths of a barcode.',
  maxSide: 1000,
  params: [
    { key: 'mode', label: 'Code', type: 'select', default: 'qr', options: [['qr', 'QR square'], ['bars', 'Barcode']] },
    { key: 'modules', label: 'Detail', type: 'range', min: 25, max: 97, step: 4, default: 53 },
    { key: 'bright', label: 'Brightness', type: 'range', min: -50, max: 50, step: 1, default: 0 },
    { key: 'dots', label: 'Round modules', type: 'toggle', default: false },
    { key: 'invert', label: 'White on black', type: 'toggle', default: false },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, u = Math.min(W, H) / 100, ink = p.invert ? '#f4f1ea' : '#0c0c0c', paper = p.invert ? '#0c0c0c' : '#f4f1ea', off = p.bright / 100;
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H); ctx.fillStyle = ink;
    const lumAt = (fx, fy, fw, fh) => { // mean luminance of a fractional rectangle of the source
      const x0 = Math.max(0, fx | 0), y0 = Math.max(0, fy | 0), x1 = Math.min(W, Math.max(x0 + 1, Math.ceil(fx + fw))), y1 = Math.min(H, Math.max(y0 + 1, Math.ceil(fy + fh)));
      let s = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += L[y * W + x]; n++; } return s / n; };
    if (p.mode === 'qr') {
      const n = p.modules, side = Math.min(W, H) * 0.86, cs = side / n, ox = (W - side) / 2, oy = (H - side) / 2;
      const bitsOf = (i, j) => { // 1 = ink
        // the three finder patterns and their quiet zones
        const f = (a, b) => { const m = Math.max(Math.abs(a - 3), Math.abs(b - 3)); return m === 3 || m <= 1 ? 1 : m === 2 ? 0 : -1; };
        if (i < 8 && j < 8) { const v = f(i, j); if (i < 7 && j < 7) return v; return 0; }
        if (i > n - 9 && j < 8) { if (i > n - 8 && j < 7) return f(i - (n - 7), j); return 0; }
        if (i < 8 && j > n - 9) { if (i < 7 && j > n - 8) return f(i, j - (n - 7)); return 0; }
        if (j === 6 && i > 7 && i < n - 8) return i % 2 === 0 ? 1 : 0;   // timing patterns
        if (i === 6 && j > 7 && j < n - 8) return j % 2 === 0 ? 1 : 0;
        const ax = n - 9, ay = n - 9;   // one alignment pattern
        if (Math.abs(i - ax) <= 2 && Math.abs(j - ay) <= 2) { const m = Math.max(Math.abs(i - ax), Math.abs(j - ay)); return m === 2 || m === 0 ? 1 : 0; }
        const v = lumAt(((i + 0.5) / n) * W - W / n / 2, ((j + 0.5) / n) * H - H / n / 2, W / n, H / n) + off;
        return v + (BAYER[(j % 4) * 4 + (i % 4)] - 0.5) * 0.9 < 0.5 ? 1 : 0;
      };
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        if (!bitsOf(i, j)) continue;
        if (p.dots) { ctx.beginPath(); ctx.arc(ox + (i + 0.5) * cs, oy + (j + 0.5) * cs, cs * 0.46, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(ox + i * cs - 0.3, oy + j * cs - 0.3, cs + 0.6, cs + 0.6);
      }
    } else {
      const side = W * 0.84, x0 = (W - side) / 2, y0 = H * 0.08, bandH = H * 0.76, bands = Math.round(p.modules * 0.55), unit = side / (p.modules * 1.9), bh = bandH / bands;
      for (let b = 0; b < bands; b++) {
        const y = y0 + b * bh;
        for (let x = 0; x < side; x += unit) {
          const v = clamp01(lumAt(((x + unit / 2) / side) * W - unit, ((b + 0.5) / bands) * H - bh, unit * 2, bh * 2) + off), w = unit * (0.12 + (1 - v) * 0.88);
          if (w > unit * 0.16) ctx.fillRect(x0 + x, y, w, bh + 0.5);
        }
      }
      const r = rng(7); let s = ''; for (let i = 0; i < 12; i++) s += (r() * 10) | 0;
      label(ctx, `${s[0]}  ${s.slice(1, 6)}  ${s.slice(6, 11)}  ${s[11]}`, W / 2, H * 0.91, `500 ${u * 3.6}px "JetBrains Mono", ui-monospace, Menlo, monospace`, ink);
    }
  },
});
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
