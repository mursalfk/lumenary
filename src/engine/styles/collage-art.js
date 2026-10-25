// src/engine/styles/collage-art.js
import { still, rng, TAU } from '../utils.js';
import { pixels } from '../helpers.js';

const PAPERS = ['#e8dcc4', '#d8c7a3', '#c9573f', '#2e4a62', '#e6b94a', '#f1ebe0', '#7a8f6a'];

export default still({
  id: 'collage-art',
  name: 'Collage Art',
  blurb: 'Your picture torn into pieces and pasted back over scraps of coloured paper.',
  maxSide: 1000,
  params: [
    { key: 'pieces', label: 'Pieces', type: 'range', min: 6, max: 40, step: 1, default: 20 },
    { key: 'tear', label: 'Torn edges', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'scatter', label: 'Scatter', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'tape', label: 'Tape', type: 'toggle', default: true },
    { key: 'seed', label: 'Re-tear', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const r = rng(p.seed * 41 + 7), u = Math.min(W, H) / 100, tear = (p.tear / 100) * u * 0.9;
    // desk
    ctx.fillStyle = '#d7c9ab'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1100; i++) { ctx.fillStyle = `rgba(${r() > 0.5 ? '80,60,30' : '255,255,255'},${0.02 + r() * 0.04})`; ctx.fillRect(r() * W, r() * H, 2 + r() * 10, 1 + r() * 4); }

    // a ragged polygon: a jittered rectangle with a wobbly outline
    const rag = (cx, cy, w, h, rot) => {
      const pts = [], n = 4 * 7;
      for (let i = 0; i < n; i++) {
        const side = (i / 7) | 0, t = (i % 7) / 7;
        let x, y;
        if (side === 0) { x = -w / 2 + t * w; y = -h / 2; } else if (side === 1) { x = w / 2; y = -h / 2 + t * h; } else if (side === 2) { x = w / 2 - t * w; y = h / 2; } else { x = -w / 2; y = h / 2 - t * h; }
        pts.push([x + (r() - 0.5) * tear * 2.2, y + (r() - 0.5) * tear * 2.2]);
      }
      return { pts, cx, cy, rot };
    };
    const trace = (c, q) => { c.beginPath(); q.pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
    const paste = (q, draw) => {
      ctx.save(); ctx.translate(q.cx, q.cy); ctx.rotate(q.rot);
      ctx.shadowColor = 'rgba(40,25,10,0.38)'; ctx.shadowBlur = u * 1.1; ctx.shadowOffsetX = u * 0.35; ctx.shadowOffsetY = u * 0.6;
      trace(ctx, q); ctx.fillStyle = '#f4efe3'; ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.save(); trace(ctx, q); ctx.clip(); draw(); ctx.restore();
      // paper edge: pale rim
      ctx.lineWidth = Math.max(1, u * 0.35); ctx.strokeStyle = 'rgba(255,250,240,0.85)'; trace(ctx, q); ctx.stroke();
      ctx.restore();
    };

    // background scraps of plain colour
    for (let i = 0; i < 9; i++) {
      const q = rag(r() * W, r() * H, u * (22 + r() * 30), u * (16 + r() * 28), (r() - 0.5) * 0.9);
      paste(q, () => { ctx.fillStyle = PAPERS[(r() * PAPERS.length) | 0]; ctx.fillRect(-W, -H, W * 2, H * 2); });
    }
    // the photo, in a grid of torn pieces
    const cols = Math.max(2, Math.round(Math.sqrt(p.pieces * W / H))), rows = Math.max(2, Math.round(p.pieces / cols));
    const cw = (W * 0.86) / cols, ch = (H * 0.86) / rows, x0 = W * 0.07, y0 = H * 0.07, sc = p.scatter / 100;
    const pieces = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) pieces.push({ i, j, z: r() });
    pieces.sort((a, b) => a.z - b.z);
    for (const { i, j } of pieces) {
      const cx = x0 + (i + 0.5) * cw + (r() - 0.5) * cw * sc * 0.9, cy = y0 + (j + 0.5) * ch + (r() - 0.5) * ch * sc * 0.9, rot = (r() - 0.5) * sc * 0.7;
      const q = rag(cx, cy, cw * 1.06, ch * 1.06, rot);
      paste(q, () => {
        // each piece shows its own cell of the picture (with a little overlap), centred in the piece
        const k = 0.86, sw = (cw * 1.06) / k, sh = (ch * 1.06) / k;
        ctx.drawImage(work, ((i + 0.5) * cw) / k - sw / 2, ((j + 0.5) * ch) / k - sh / 2, sw, sh, -cw * 0.53, -ch * 0.53, cw * 1.06, ch * 1.06);
        ctx.fillStyle = `rgba(120,90,40,${0.02 + r() * 0.05})`; ctx.fillRect(-cw, -ch, cw * 2, ch * 2);
      });
      if (p.tape && r() < 0.16) {
        ctx.save(); ctx.translate(cx, cy - ch * 0.5); ctx.rotate(rot + (r() - 0.5) * 0.7);
        ctx.fillStyle = 'rgba(235,222,160,0.62)'; ctx.fillRect(-u * 4.5, -u * 1.6, u * 9, u * 3.2);
        ctx.strokeStyle = 'rgba(150,130,70,0.25)'; ctx.lineWidth = 1; ctx.strokeRect(-u * 4.5, -u * 1.6, u * 9, u * 3.2);
        ctx.restore();
      }
    }
  },
});
