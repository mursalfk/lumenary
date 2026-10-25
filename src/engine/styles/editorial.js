// src/engine/styles/editorial.js
import { still, rng, clamp } from '../utils.js';
import { label } from '../helpers.js';

export default still({
  id: 'editorial',
  name: 'Editorial',
  blurb: 'A magazine cover: masthead, cover lines, issue line and a barcode.',
  maxSide: 1100,
  params: [
    { key: 'masthead', label: 'Masthead', type: 'text', default: 'LUMENARY', max: 12 },
    { key: 'headline', label: 'Headline', type: 'text', default: 'The way you see', max: 28 },
    { key: 'issue', label: 'Issue line', type: 'text', default: 'Issue 01  October', max: 28 },
    { key: 'tone', label: 'Photograph', type: 'select', default: 'colour', options: [['colour', 'Colour'], ['mono', 'Black and white'], ['warm', 'Warm']] },
    { key: 'lines', label: 'Cover lines', type: 'toggle', default: true },
    { key: 'barcode', label: 'Barcode', type: 'toggle', default: true },
    { key: 'accent', label: 'Accent', type: 'color', default: '#e63b2e' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const u = Math.min(W, H) / 100;
    ctx.drawImage(work, 0, 0, W, H);
    // tone in plain JS: canvas `filter` is not available in every browser (Safari), pixel maths always is
    if (p.tone !== 'colour') {
      const img = ctx.getImageData(0, 0, W, H), d = img.data, mono = p.tone === 'mono';
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (mono) {
          const v = clamp(((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 - 0.5) * 1.12 + 0.5) * 255;
          d[i] = d[i + 1] = d[i + 2] = v;
        } else {
          const sr = 0.393 * r + 0.769 * g + 0.189 * b, sg = 0.349 * r + 0.686 * g + 0.168 * b, sb = 0.272 * r + 0.534 * g + 0.131 * b;
          d[i] = clamp((r + (sr - r) * 0.45 - 128) * 1.05 + 128, 0, 255);
          d[i + 1] = clamp((g + (sg - g) * 0.45 - 128) * 1.05 + 128, 0, 255);
          d[i + 2] = clamp((b + (sb - b) * 0.45 - 128) * 1.05 + 128, 0, 255);
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    // darken top and bottom so type always reads
    let g = ctx.createLinearGradient(0, 0, 0, H * 0.28);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.28);
    g = ctx.createLinearGradient(0, H * 0.6, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.6, W, H * 0.4);

    // masthead: scaled so it spans the page
    const mast = (p.masthead || 'MAG').toUpperCase();
    ctx.font = '400 100px "Bodoni Moda", Didot, Georgia, serif';
    const fs = Math.min(u * 19, (W * 0.88 / ctx.measureText(mast).width) * 100);
    label(ctx, mast, W / 2, u * 4 + fs * 0.45, `400 ${fs}px "Bodoni Moda", Didot, Georgia, serif`, '#fff');
    const sans = `500 ${u * 1.6}px "Hanken Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = p.accent; ctx.fillRect(u * 4, u * 4 + fs * 0.98, W - u * 8, Math.max(1, u * 0.18));
    label(ctx, (p.issue || '').toUpperCase(), u * 4, u * 4 + fs * 0.98 + u * 2.3, sans, '#fff', 'left');

    if (p.lines) {
      const items = [['Seen differently', 'Every way into one picture'], ['The grid', 'Why every photo is a number'], ['Ink, light and glass', 'A field guide']];
      items.forEach(([a, b], i) => {
        const y = H * 0.3 + i * u * 8.2;
        ctx.fillStyle = p.accent; ctx.fillRect(u * 4, y - u * 1.6, u * 0.5, u * 5.4);
        label(ctx, a, u * 5.6, y, `700 ${u * 2.3}px "Hanken Grotesk", system-ui, sans-serif`, '#fff', 'left', 'top');
        label(ctx, b, u * 5.6, y + u * 3, `400 ${u * 1.7}px "Hanken Grotesk", system-ui, sans-serif`, 'rgba(255,255,255,0.85)', 'left', 'top');
      });
    }
    // main headline, wrapped on spaces
    const words = (p.headline || '').split(' '), maxW = W - u * 12;
    let size = u * 9, lines = [];
    const fit = () => {
      ctx.font = `italic 400 ${size}px "Bodoni Moda", Didot, Georgia, serif`;
      lines = []; let cur = '';
      for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
      if (cur) lines.push(cur);
    };
    fit();
    while (lines.length > 3 && size > u * 4) { size *= 0.9; fit(); }
    const base = H - u * (p.barcode ? 13 : 7);
    lines.forEach((ln, i) => label(ctx, ln, u * 4, base - (lines.length - 1 - i) * size * 1.02, `italic 400 ${size}px "Bodoni Moda", Didot, Georgia, serif`, '#fff', 'left', 'alphabetic'));

    if (p.barcode) {
      const bw = u * 22, bh = u * 8, x = W - u * 4 - bw, y = H - u * 4 - bh, r = rng(41);
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = '#000';
      for (let bx = x + u * 1.2; bx < x + bw - u * 1.2;) { const w = u * (0.2 + r() * 0.5); ctx.fillRect(bx, y + u * 0.9, w, bh - u * 2.8); bx += w + u * (0.2 + r() * 0.4); }
      label(ctx, '9 771234 567003', x + bw / 2, y + bh - u * 1, `400 ${u * 0.9}px "DM Mono", monospace`, '#000');
    }
  },
});
