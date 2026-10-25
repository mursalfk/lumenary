// src/engine/styles/swiss-design.js
import { still } from '../utils.js';
import { pixels, label } from '../helpers.js';

export default still({
  id: 'swiss-design',
  name: 'Swiss Design',
  blurb: 'International style: a strict grid, a line-screen photograph, one red shape and bold sans type.',
  maxSide: 1100,
  params: [
    { key: 'title', label: 'Title', type: 'text', default: 'Form', max: 14 },
    { key: 'sub', label: 'Subtitle', type: 'text', default: 'Image study no. 1', max: 28 },
    { key: 'lines', label: 'Line density', type: 'range', min: 40, max: 160, step: 1, default: 90 },
    { key: 'shape', label: 'Red shape', type: 'select', default: 'circle', options: [['circle', 'Circle'], ['square', 'Square'], ['none', 'None']] },
    { key: 'accent', label: 'Red', type: 'color', default: '#e4261f' },
    { key: 'invert', label: 'Black ground', type: 'toggle', default: false },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, u = Math.min(W, H) / 100;
    const paper = p.invert ? '#0c0c0c' : '#f1f0ec', ink = p.invert ? '#f1f0ec' : '#0c0c0c';
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
    const m = u * 6;                       // outer margin
    const col = (W - 2 * m) / 6;           // six-column grid
    // photograph occupies columns 2..6, top 62% of the page
    const ix = m + col, iw = W - m - ix, iy = m, ih = H * 0.62 - m;
    const step = ih / p.lines;
    ctx.fillStyle = ink;
    for (let ly = 0; ly < p.lines; ly++) {
      const yc = iy + (ly + 0.5) * step, sy = Math.min(H - 1, (((yc - iy) / ih) * H) | 0);
      for (let x = 0; x < iw; x += 2) {
        const sx = Math.min(W - 1, ((x / iw) * W) | 0);
        const dark = 1 - L[sy * W + sx];
        const h = dark * step * 0.98;
        if (h > 0.3) ctx.fillRect(ix + x, yc - h / 2, 2.2, h);
      }
    }
    // red shape straddles the image edge
    ctx.fillStyle = p.accent;
    const sz = col * 1.6;
    if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(m + col * 0.5, iy + ih - sz * 0.1, sz / 2, 0, Math.PI * 2); ctx.fill(); }
    else if (p.shape === 'square') ctx.fillRect(m, iy + ih - sz * 0.6, sz, sz);
    // type
    const base = H - m;
    ctx.font = '900 100px "Hanken Grotesk", Helvetica, Arial, sans-serif';
    const fs = Math.min(u * 24, ((iw + col) * 0.98 / ctx.measureText(p.title || 'Form').width) * 100);
    label(ctx, p.title || '', m - u * 0.4, base - u * 6, `900 ${fs}px "Hanken Grotesk", Helvetica, Arial, sans-serif`, p.invert ? '#f1f0ec' : '#0c0c0c', 'left', 'alphabetic');
    label(ctx, p.sub || '', m, base, `500 ${u * 2.2}px "Hanken Grotesk", Helvetica, Arial, sans-serif`, ink, 'left', 'alphabetic');
    // small set text lines, flush left on the grid
    ctx.fillStyle = ink;
    for (let i = 0; i < 4; i++) ctx.fillRect(ix, H * 0.66 + i * u * 1.9, iw * (i === 3 ? 0.4 : 0.9 - i * 0.07), Math.max(1, u * 0.28));
    ctx.fillRect(ix, base - u * 1.2, iw, Math.max(1, u * 0.28));
    label(ctx, '01', W - m, base, `700 ${u * 2.2}px "Hanken Grotesk", Helvetica, Arial, sans-serif`, ink, 'right', 'alphabetic');
  },
});
