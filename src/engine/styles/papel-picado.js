// src/engine/styles/papel-picado.js
import { still, hexToRgb, clamp, hash2, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, vivid, mix } from '../culture.js';

const SETS = {
  fiesta: ['#e6397a', '#f28c28', '#f5d130', '#2fa86a', '#1fb3c8', '#7e3fa8'],
  pastel: ['#f4a6c0', '#f7c78b', '#f6e48f', '#a6dcb4', '#9bd7e4', '#c4a6e0'],
  marigold: ['#f28c28', '#f5b82e', '#f7d65a', '#e8601c', '#d04a1a', '#f2a23a'],
};

// A hole centred on (x, y) with radius r, added to the current path.
function hole(ctx, kind, x, y, r) {
  if (kind === 'diamond') { ctx.moveTo(x, y - r * 1.2); ctx.lineTo(x + r * 1.2, y); ctx.lineTo(x, y + r * 1.2); ctx.lineTo(x - r * 1.2, y); ctx.closePath(); return; }
  if (kind === 'flower') {
    for (let j = 0; j < 4; j++) { const a = (j / 4) * TAU + Math.PI / 4; ctx.moveTo(x + Math.cos(a) * r * 0.7 + r * 0.55, y + Math.sin(a) * r * 0.7); ctx.arc(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, r * 0.55, 0, TAU); }
    ctx.moveTo(x + r * 0.35, y); ctx.arc(x, y, r * 0.35, 0, TAU); return;
  }
  ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
}

export default still({
  id: 'papel-picado',
  name: 'Papel Picado',
  blurb: 'Tissue-paper banners strung across a Mexican street, each one punched with holes. Your picture shows through the openings, which grow wider where the light is strong.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Banner width', type: 'range', min: 44, max: 150, step: 1, default: 84 },
    { key: 'holes', label: 'Hole size', type: 'range', min: 30, max: 100, step: 1, default: 72 },
    { key: 'shape', label: 'Holes', type: 'select', default: 'mixed', options: [['mixed', 'Mixed'], ['circle', 'Circles'], ['diamond', 'Diamonds'], ['flower', 'Flowers']] },
    { key: 'colour', label: 'Tissue', type: 'select', default: 'fiesta', options: [['fiesta', 'Fiesta'], ['pastel', 'Pastel'], ['marigold', 'Marigold'], ['picture', 'Colours of the picture']] },
    { key: 'tissue', label: 'See-through', type: 'range', min: 0, max: 100, step: 1, default: 25 },
    { key: 'backdrop', label: 'Behind', type: 'select', default: 'bright', options: [['bright', 'Daylight'], ['dusk', 'Dusk'], ['mono', 'Grey']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, fw = p.size * sc, fh = fw * 1.18, gap = fw * 0.1, pitchX = fw + gap, rowH = fh + fw * 0.16;
    const smp = sampler(cache, d, W, H, fw * 0.08), tmp = [0, 0, 0], hs = p.holes / 100;
    ctx.drawImage(work, 0, 0, W, H);
    if (p.backdrop === 'dusk') { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(120,130,200)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; } else if (p.backdrop === 'mono') { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, 0, W, H); }
    const layer = env.makeCanvas(W, H), lc = layer.getContext('2d'), set = (SETS[p.colour] || SETS.fiesta).map(hexToRgb);
    const strings = [];
    const rows = Math.ceil(H / rowH) + 1, cols = Math.ceil(W / pitchX) + 2, nc = 7, cell = (fw * 0.78) / nc;
    for (let r = 0; r < rows; r++) {
      const y0 = r * rowH + fw * 0.12;
      strings.push(y0);
      for (let c = -1; c < cols; c++) {
        const x0 = c * pitchX + (r % 2 ? pitchX * 0.5 : 0) + fw * 0.05, cx = x0 + fw / 2, cy = y0 + fh / 2, hsh = hash2(c, r, 7);
        let col;
        if (p.colour === 'picture') { const q = smp.rgb(clamp(cx, 0, W - 1), clamp(cy, 0, H - 1)); vivid(q, 1.5, 0.08, tmp); col = [tmp[0], tmp[1], tmp[2]]; } else col = set[(c * 3 + r * 5 + (hsh * 2 | 0) + 60) % set.length];
        lc.save(); lc.translate(cx, y0); lc.rotate((hsh - 0.5) * 0.05);
        lc.translate(-fw / 2, 0);
        lc.fillStyle = css(col);
        const zn = 7, zd = fh * 0.07;
        lc.beginPath(); lc.moveTo(0, 0); lc.lineTo(fw, 0); lc.lineTo(fw, fh - zd);
        for (let z = 0; z < zn; z++) { lc.lineTo(fw - ((z + 0.5) / zn) * fw, fh); lc.lineTo(fw - ((z + 1) / zn) * fw, fh - zd); }
        lc.closePath(); lc.fill();
        // fold at the top where the string runs through
        lc.fillStyle = 'rgba(0,0,0,0.16)'; lc.fillRect(0, 0, fw, fh * 0.07);
        // cuts
        lc.globalCompositeOperation = 'destination-out'; lc.fillStyle = '#000';
        lc.beginPath();
        const bx = fw * 0.07, by = fh * 0.1, fwI = fw * 0.86;
        // border of small holes just inside the edge
        const nb = 11; for (let j = 0; j < nb; j++) { const t = (j + 0.5) / nb; hole(lc, 'circle', bx + fwI * t, fh * 0.115, fw * 0.017); hole(lc, 'circle', bx + fwI * t, fh * 0.855, fw * 0.017); }
        const nv = 9; for (let j = 0; j < nv; j++) { const t = (j + 0.5) / nv; hole(lc, 'circle', fw * 0.055, by + fh * 0.76 * t + fh * 0.03, fw * 0.016); hole(lc, 'circle', fw * 0.945, by + fh * 0.76 * t + fh * 0.03, fw * 0.016); }
        // main lattice, hole size follows the picture
        const gx0 = fw / 2 - (nc / 2) * cell, gy0 = fh * 0.5 - (nc / 2) * cell * 1.1;
        for (let j = 0; j < nc; j++) for (let i = 0; i < nc; i++) {
          const hx = gx0 + (i + 0.5) * cell, hy = gy0 + (j + 0.5) * cell * 1.1, sx = clamp(x0 + hx, 0, W - 1), sy = clamp(y0 + hy, 0, H - 1), t = smp.tone(sx, sy);
          const rr = cell * 0.5 * (0.1 + 0.95 * Math.pow(t, 0.85)) * (0.5 + hs);
          if (rr < 0.9) continue;
          const kind = p.shape === 'mixed' ? ((i + j) % 2 ? 'circle' : (i % 2 ? 'diamond' : 'flower')) : p.shape;
          hole(lc, kind, hx, hy, Math.min(rr, cell * 0.62));
        }
        lc.fill();
        lc.restore();
      }
    }
    // the tissue lets some of the picture through
    if (p.tissue > 0) { lc.globalCompositeOperation = 'source-atop'; lc.globalAlpha = (p.tissue / 100) * 0.55; lc.drawImage(work, 0, 0, W, H); lc.globalAlpha = 1; lc.globalCompositeOperation = 'source-over'; }
    ctx.strokeStyle = 'rgba(40,30,20,0.7)'; ctx.lineWidth = 1.3 * sc;
    for (const y0 of strings) { ctx.beginPath(); ctx.moveTo(0, y0 + fh * 0.03); ctx.lineTo(W, y0 + fh * 0.03); ctx.stroke(); }
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 6 * sc; ctx.shadowOffsetY = 3 * sc; ctx.drawImage(layer, 0, 0); ctx.restore();
  },
});
