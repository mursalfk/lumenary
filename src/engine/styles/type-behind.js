// src/engine/styles/type-behind.js
import { still, clamp } from '../utils.js';
import { subjectState } from '../subject/segment.js';
import { cutout, waitNote } from '../subject/cutout.js';

const FONTS = {
  serif: (s) => `600 ${s}px "Bodoni Moda", Didot, Georgia, serif`,
  sans: (s) => `900 ${s}px "Hanken Grotesk", system-ui, sans-serif`,
  hand: (s) => `700 ${s}px "Caveat", cursive`,
  mono: (s) => `500 ${s}px "DM Mono", ui-monospace, monospace`,
};

export default still({
  id: 'type-behind',
  name: 'Type Behind',
  blurb: 'Giant lettering set behind the subject of your picture, so the person or object stands in front of the words. The subject is found on your own device, and nothing is uploaded.',
  maxSide: 1100,
  params: [
    { key: 'text', label: 'Words', type: 'text', default: 'DREAM', max: 18 },
    { key: 'font', label: 'Lettering', type: 'select', default: 'sans', options: [['sans', 'Heavy sans'], ['serif', 'Bodoni serif'], ['hand', 'Handwritten'], ['mono', 'Typewriter']] },
    { key: 'rows', label: 'Rows', type: 'range', min: 1, max: 5, step: 1, default: 2 },
    { key: 'width', label: 'Width of the words', type: 'range', min: 40, max: 100, step: 1, default: 92, fmt: (v) => v + '%' },
    { key: 'height', label: 'How high', type: 'range', min: 0, max: 100, step: 1, default: 42 },
    { key: 'look', label: 'Letters', type: 'select', default: 'alternate', options: [['fill', 'Solid'], ['outline', 'Outline'], ['alternate', 'Solid and outline']] },
    { key: 'color', label: 'Colour', type: 'color', default: '#f5f5f5' },
    { key: 'dim', label: 'Darken the picture', type: 'range', min: 0, max: 70, step: 1, default: 25 },
    { key: 'edge', label: 'Soft edge', type: 'range', min: 0, max: 100, step: 1, default: 35 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    ctx.drawImage(work, 0, 0, W, H);
    const st = subjectState(env, work, cache);
    if (!st.mask) { waitNote(ctx, W, H, st.note); return; }
    if (p.dim) { ctx.fillStyle = `rgba(0,0,0,${p.dim / 100})`; ctx.fillRect(0, 0, W, H); }

    // the words: as large as the width allows, stacked tightly, and kept inside the picture
    const text = (p.text || ' ').trim() || ' ', rows = Math.round(p.rows), font = FONTS[p.font] || FONTS.sans;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = font(100);
    let fs = (100 * (W * p.width) / 100) / Math.max(1, ctx.measureText(text).width);
    const lead = 0.86, block = (rows - 1) * lead + 0.72;
    if (fs * block > H * 0.94) fs = (H * 0.94) / block;
    ctx.font = font(fs);
    const mid = H * (0.12 + 0.76 * (p.height / 100)), line = Math.max(2, fs * 0.022);
    ctx.fillStyle = ctx.strokeStyle = p.color;
    ctx.lineWidth = line;
    ctx.lineJoin = 'round';
    for (let i = 0; i < rows; i++) {
      const y = mid + (i - (rows - 1) / 2) * fs * lead;
      const solid = p.look === 'fill' || (p.look === 'alternate' && i % 2 === 0);
      if (solid) ctx.fillText(text, W / 2, y); else ctx.strokeText(text, W / 2, y);
    }
    ctx.restore();

    // the subject goes back on top
    const key = String(p.edge);
    if (!cache.cut || cache.cutKey !== key) { cache.cut = cutout(env, work, st.mask, clamp(p.edge / 100)); cache.cutKey = key; }
    ctx.drawImage(cache.cut, 0, 0, W, H);
  },
});
