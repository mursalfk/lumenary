// src/engine/styles/newspaper.js
import { still, rng, TAU } from '../utils.js';
import { pixels, label } from '../helpers.js';

const PAPERS = { newsprint: '#e4dcc8', grey: '#d4d2cb', white: '#f1efe8' };
const INK = '#1d1b19';

export default still({
  id: 'newspaper',
  name: 'Newspaper',
  blurb: 'A front page: masthead, headline, columns of text and your picture as a coarse halftone photograph.',
  maxSide: 1000,
  params: [
    { key: 'masthead', label: 'Masthead', type: 'text', default: 'The Daily Lumenary', max: 24 },
    { key: 'headline', label: 'Headline', type: 'text', default: 'Picture Made Entirely Of Numbers, Experts Confirm', max: 60 },
    { key: 'dot', label: 'Dot size', type: 'range', min: 3, max: 12, step: 1, default: 6 },
    { key: 'paper', label: 'Paper', type: 'select', default: 'newsprint', options: [['newsprint', 'Newsprint'], ['grey', 'Grey'], ['white', 'White']] },
    { key: 'columns', label: 'Columns', type: 'range', min: 3, max: 5, step: 1, default: 4 },
    { key: 'seed', label: 'Re-set type', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, r = rng(p.seed * 29 + 5), u = Math.min(W, H) / 100;
    ctx.fillStyle = PAPERS[p.paper] || PAPERS.newsprint; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1500; i++) { ctx.fillStyle = `rgba(90,70,40,${0.015 + r() * 0.035})`; ctx.fillRect(r() * W, r() * H, 1 + r() * 5, 1); }
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, Math.max(W, H) * 0.8); vg.addColorStop(0, 'rgba(120,90,40,0)'); vg.addColorStop(1, 'rgba(120,90,40,0.28)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    const m = u * 4.5, cw = W - 2 * m, serif = '"Bodoni Moda", Didot, Georgia, serif';
    // masthead, fitted to the page
    const mast = (p.masthead || 'The News').toUpperCase();
    ctx.font = `600 100px ${serif}`;
    const fs = Math.min(u * 11, (cw / ctx.measureText(mast).width) * 100 * 0.98);
    ctx.fillStyle = INK; ctx.fillRect(m, m, cw, Math.max(2, u * 0.5));
    label(ctx, mast, W / 2, m + u * 1.4 + fs * 0.52, `600 ${fs}px ${serif}`, INK);
    const ruleY = m + u * 2.2 + fs;
    ctx.fillRect(m, ruleY, cw, Math.max(2, u * 0.4)); ctx.fillRect(m, ruleY + u * 0.9, cw, Math.max(1, u * 0.14));
    const small = `500 ${u * 1.5}px ${serif}`;
    label(ctx, 'VOL. XII  No. 43', m, ruleY + u * 2.8, small, INK, 'left'); label(ctx, 'EARLY EDITION  PRICE ONE PENNY', W / 2, ruleY + u * 2.8, small, INK); label(ctx, 'SUNDAY', W - m, ruleY + u * 2.8, small, INK, 'right');
    const y1 = ruleY + u * 4.2; ctx.fillRect(m, y1, cw, Math.max(1, u * 0.18));

    // headline, wrapped
    const words = (p.headline || '').split(' '); let size = u * 7.2, lines = [];
    const fit = () => { ctx.font = `600 ${size}px ${serif}`; lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > cw && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); };
    fit(); while (lines.length > 3 && size > u * 3) { size *= 0.92; fit(); }
    lines.forEach((ln, i) => label(ctx, ln, W / 2, y1 + u * 1.6 + size * (0.62 + i * 1.04), `600 ${size}px ${serif}`, INK));
    const y2 = y1 + u * 2.4 + size * 1.04 * lines.length; ctx.fillRect(m, y2, cw, Math.max(1, u * 0.18));

    // the photograph: dots on a 45 degree screen, size following darkness
    const colN = p.columns, gap = u * 1.4, colW = (cw - gap * (colN - 1)) / colN;
    const px = m + (colN > 3 ? colW + gap : 0), pw = colN > 3 ? cw - colW - gap : cw * 0.62, py = y2 + u * 1.6, ph = Math.min(H - py - m - u * 14, pw * 1.1);
    ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
    ctx.fillStyle = '#f0ecdf'; ctx.fillRect(px, py, pw, ph);
    const s = Math.max(2.5, p.dot * (W / 800)), c45 = Math.SQRT1_2;
    ctx.fillStyle = INK;
    for (let a = -ph; a < pw + ph; a += s) for (let b = -pw; b < pw + ph; b += s) {
      // rotate the lattice by 45 degrees around the photo's top-left corner
      const x = (a + b) * c45, y = (b - a) * c45 + ph * 0.0;
      if (x < -s || y < -s || x > pw + s || y > ph + s) continue;
      const sx = Math.min(W - 1, Math.max(0, (x / pw) * W | 0)), sy = Math.min(H - 1, Math.max(0, (y / ph) * H | 0)), dark = 1 - L[sy * W + sx];
      const rad = s * 0.62 * Math.sqrt(dark);
      if (rad > 0.35) { ctx.beginPath(); ctx.arc(px + x, py + y, rad, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, u * 0.25); ctx.strokeRect(px, py, pw, ph);
    // caption: two short lines
    ctx.fillStyle = INK; ctx.fillRect(px, py + ph + u * 0.9, pw * 0.8, u * 0.55); ctx.fillRect(px, py + ph + u * 2.2, pw * 0.5, u * 0.55);

    // greeked columns of text everywhere else
    const lineH = u * 1.15, textCol = (x, y0, w, y1c) => {
      ctx.fillStyle = INK; ctx.globalAlpha = 0.72;
      for (let y = y0; y < y1c; y += lineH) {
        if (r() < 0.07) { ctx.globalAlpha = 0.95; ctx.fillRect(x, y, w * (0.45 + r() * 0.3), u * 0.55); y += lineH * 0.6; ctx.globalAlpha = 0.72; continue; }
        const ww = w * (r() < 0.14 ? 0.35 + r() * 0.4 : 0.96 + r() * 0.04);
        ctx.fillRect(x, y, ww, Math.max(1, u * 0.34));
      }
      ctx.globalAlpha = 1;
    };
    const bottom = H - m;
    for (let c = 0; c < colN; c++) {
      const x = m + c * (colW + gap);
      const underPhoto = x + colW > px && x < px + pw;
      textCol(x, underPhoto ? py + ph + u * 4.2 : y2 + u * 1.6, colW, bottom);
      if (c) { ctx.fillStyle = INK; ctx.fillRect(x - gap / 2, y2 + u * 1.2, Math.max(1, u * 0.12), bottom - y2 - u * 1.2); }
    }
    ctx.fillStyle = INK; ctx.fillRect(m, H - m + u * 0.6, cw, Math.max(1, u * 0.2));
  },
});
