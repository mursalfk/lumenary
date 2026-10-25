// src/engine/styles/hexagon-mosaic.js
import { still, clamp, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

const BACK = { night: '#0e0e13', cream: '#f2ecdc', grout: '#2a2623' };
const SQ3 = Math.sqrt(3);

export default still({
  id: 'hexagon-mosaic',
  name: 'Hexagon Mosaic',
  blurb: 'A honeycomb of tiles. Each cell takes the average colour beneath it, as flat glazed tiles, shrinking cells or tumbling blocks.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Cell size', type: 'range', min: 5, max: 40, step: 1, default: 15 },
    { key: 'mode', label: 'Cells as', type: 'select', default: 'flat', options: [['flat', 'Glazed tiles'], ['size', 'Cells that swell with tone'], ['cubes', 'Tumbling blocks']] },
    { key: 'gap', label: 'Gap between cells', type: 'range', min: 0, max: 30, step: 1, default: 8, fmt: (v) => v + '%' },
    { key: 'shine', label: 'Glaze', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'back', label: 'Behind the tiles', type: 'select', default: 'grout', options: [['grout', 'Dark grout'], ['night', 'Night'], ['cream', 'Cream']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.75);
    ctx.fillStyle = BACK[p.back] || BACK.grout; ctx.fillRect(0, 0, W, H);
    const gap = 1 - p.gap / 100, hw = s * SQ3, vh = s * 1.5, shine = p.shine / 100, cream = p.back === 'cream';
    const hexPath = (cx, cy, rr) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.closePath();
    };
    const css = (c, k, a = 1) => `rgba(${clamp(c[0] * k, 0, 255) | 0},${clamp(c[1] * k, 0, 255) | 0},${clamp(c[2] * k, 0, 255) | 0},${a})`;
    for (let row = -1; row * vh < H + s * 2; row++) for (let col = -1; col * hw < W + hw; col++) {
      const cx = col * hw + (row & 1 ? hw / 2 : 0), cy = row * vh + s * 0.2, c = smp.rgb(cx, cy).slice(), tone = smp.tone(cx, cy);
      if (p.mode === 'cubes') {
        const rr = s * gap * 1.02, pts = [0, 1, 2, 3, 4, 5, 6].map((i) => { const a = -Math.PI / 2 + (i * Math.PI) / 3; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
        const faces = [[[cx, cy], pts[0], pts[1], pts[2]], [[cx, cy], pts[2], pts[3], pts[4]], [[cx, cy], pts[4], pts[5], pts[6]]], ks = [1.14, 0.86, 0.62];
        faces.forEach((f, i) => { ctx.beginPath(); ctx.moveTo(f[0][0], f[0][1]); for (let j = 1; j < 4; j++) ctx.lineTo(f[j][0], f[j][1]); ctx.closePath(); ctx.fillStyle = css(c, ks[i]); ctx.fill(); });
        continue;
      }
      let rr = s * gap;
      if (p.mode === 'size') rr *= cream ? 0.25 + 0.85 * (1 - tone) : 0.25 + 0.85 * tone;
      hexPath(cx, cy, rr);
      if (shine > 0 && rr > 2) {
        const g = ctx.createLinearGradient(cx - rr, cy - rr, cx + rr, cy + rr);
        g.addColorStop(0, css(c, 1 + 0.2 * shine)); g.addColorStop(0.5, css(c, 1)); g.addColorStop(1, css(c, 1 - 0.22 * shine));
        ctx.fillStyle = g;
      } else ctx.fillStyle = css(c, 1);
      ctx.fill();
      if (shine > 0.3 && rr > 6) { ctx.strokeStyle = `rgba(255,255,255,${0.14 * shine})`; ctx.lineWidth = Math.max(0.6, sc * 0.8); hexPath(cx, cy, rr * 0.9); ctx.stroke(); }
    }
  },
});
