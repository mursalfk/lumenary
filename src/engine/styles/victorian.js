// src/engine/styles/victorian.js
import { still, rng, TAU } from '../utils.js';
import { pixels, label } from '../helpers.js';

const INKS = { sepia: '#4a3022', black: '#171513', blue: '#1d2f4d' };

export default still({
  id: 'victorian',
  name: 'Victorian',
  blurb: 'A steel-engraved portrait: hand-cut lines in an oval cameo with an ornate frame.',
  maxSide: 1000,
  params: [
    { key: 'ink', label: 'Ink', type: 'select', default: 'sepia', options: [['sepia', 'Sepia'], ['black', 'Black'], ['blue', 'Prussian blue']] },
    { key: 'lines', label: 'Engraved lines', type: 'range', min: 50, max: 180, step: 1, default: 110 },
    { key: 'cross', label: 'Cross-hatching', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'oval', label: 'Oval cameo', type: 'toggle', default: true },
    { key: 'caption', label: 'Caption', type: 'text', default: 'A VIEW OF THE ROOM', max: 26 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, ink = INKS[p.ink] || INKS.sepia, u = Math.min(W, H) / 100, r = rng(3);
    ctx.fillStyle = '#eee3c9'; ctx.fillRect(0, 0, W, H);
    // paper fibres
    ctx.strokeStyle = 'rgba(120,90,50,0.07)'; ctx.lineWidth = 1;
    for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, a = r() * TAU, l = 4 + r() * 12; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }

    const cx = W / 2, cy = H * 0.46, rw = W * 0.37, rh = H * 0.36;
    const x0 = cx - rw, y0 = cy - rh, w = rw * 2, h = rh * 2;
    ctx.save();
    ctx.beginPath();
    if (p.oval) ctx.ellipse(cx, cy, rw, rh, 0, 0, TAU); else ctx.rect(x0, y0, w, h);
    ctx.clip();
    ctx.fillStyle = '#f3ead2'; ctx.fillRect(x0, y0, w, h);
    ctx.strokeStyle = ink; ctx.lineCap = 'butt';
    const sample = (x, y) => L[Math.min(H - 1, Math.max(0, (((y - y0) / h) * H) | 0)) * W + Math.min(W - 1, Math.max(0, (((x - x0) / w) * W) | 0))];
    const step = h / p.lines, cross = p.cross / 100;
    // layer one: wavering horizontal lines, thicker where it is darker
    for (let li = 0; li < p.lines; li++) {
      const yc = y0 + (li + 0.5) * step;
      for (let x = x0; x < x0 + w; x += 2) {
        const wob = Math.sin(x * 0.045 + li * 0.7) * step * 0.18, v = sample(x, yc), dark = 1 - v;
        const t = Math.max(0, dark * step * 1.05);
        if (t > 0.25) { ctx.fillStyle = ink; ctx.fillRect(x, yc + wob - t / 2, 2.1, t); }
      }
    }
    // layer two: diagonal hatching in the darkest places
    if (cross > 0) {
      ctx.lineWidth = Math.max(0.8, step * 0.22); ctx.globalAlpha = 0.85;
      for (let d = -h; d < w; d += step * 1.35) {
        ctx.beginPath(); let pen = false;
        for (let t = 0; t <= h; t += 2) {
          const x = x0 + d + t, y = y0 + t, v = sample(x, y);
          if (v < 0.4 * cross + 0.05) { if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y); } else pen = false;
        }
        ctx.stroke();
      }
    }
    ctx.restore();

    // double rule around the cameo with a ring of beads
    ctx.strokeStyle = ink; ctx.fillStyle = ink;
    const rule = (m, lw) => { ctx.lineWidth = lw; ctx.beginPath(); if (p.oval) ctx.ellipse(cx, cy, rw + m, rh + m, 0, 0, TAU); else ctx.rect(x0 - m, y0 - m, w + 2 * m, h + 2 * m); ctx.stroke(); };
    rule(u * 0.6, u * 0.45); rule(u * 1.5, u * 0.18);
    const beads = 72;
    for (let i = 0; i < beads; i++) {
      const a = (i / beads) * TAU;
      const bx = p.oval ? cx + Math.cos(a) * (rw + u * 2.6) : cx + Math.max(-1, Math.min(1, Math.cos(a) * 1.5)) * (rw + u * 2.6);
      const by = p.oval ? cy + Math.sin(a) * (rh + u * 2.6) : cy + Math.max(-1, Math.min(1, Math.sin(a) * 1.5)) * (rh + u * 2.6);
      ctx.beginPath(); ctx.arc(bx, by, u * 0.45, 0, TAU); ctx.fill();
    }
    // page border with corner rosettes
    ctx.lineWidth = u * 0.5; ctx.strokeRect(u * 3, u * 3, W - u * 6, H - u * 6);
    ctx.lineWidth = u * 0.18; ctx.strokeRect(u * 4.2, u * 4.2, W - u * 8.4, H - u * 8.4);
    for (const [x, y] of [[u * 6.2, u * 6.2], [W - u * 6.2, u * 6.2], [u * 6.2, H - u * 6.2], [W - u * 6.2, H - u * 6.2]]) {
      ctx.fillStyle = '#eee3c9'; ctx.beginPath(); ctx.arc(x, y, u * 2.2, 0, TAU); ctx.fill();
      ctx.lineWidth = u * 0.2; ctx.beginPath(); ctx.arc(x, y, u * 2.2, 0, TAU); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * u * 1.1, y + Math.sin(a) * u * 1.1, u * 0.7, u * 0.28, a, 0, TAU); ctx.stroke(); }
    }
    // caption plate
    const capY = H * 0.9;
    ctx.lineWidth = u * 0.18;
    ctx.beginPath(); ctx.moveTo(W * 0.18, capY - u * 3.6); ctx.lineTo(W * 0.82, capY - u * 3.6); ctx.moveTo(W * 0.18, capY + u * 3.6); ctx.lineTo(W * 0.82, capY + u * 3.6); ctx.stroke();
    label(ctx, p.caption || '', W / 2, capY, `400 ${u * 3}px "Bodoni Moda", Didot, Georgia, serif`, ink);
  },
});
