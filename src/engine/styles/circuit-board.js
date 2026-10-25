// src/engine/styles/circuit-board.js
import { still, rng, boxBlur, sobel, hexToRgb, TAU } from '../utils.js';
import { pixels, paintPixels, ramp, label } from '../helpers.js';

const BOARDS = {
  green: { lo: [8, 44, 28], hi: [30, 128, 76], metal: '#e2a93f', metalDark: '#7c5712', edge: '#04170d', silk: 'rgba(245,245,235,0.9)' },
  black: { lo: [8, 8, 9], hi: [54, 56, 60], metal: '#d9b45a', metalDark: '#6e5421', edge: '#000', silk: 'rgba(235,235,235,0.85)' },
  blue: { lo: [6, 22, 66], hi: [26, 86, 168], metal: '#dfe6ec', metalDark: '#687682', edge: '#020a22', silk: 'rgba(250,250,250,0.9)' },
};
const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1]];   // a line through the centre of a cell, 45 degrees apart

export default still({
  id: 'circuit-board',
  name: 'Circuit Board',
  blurb: 'A printed circuit board: copper traces on 45 degree angles follow your edges, with pads, vias and chips.',
  maxSide: 1000,
  params: [
    { key: 'board', label: 'Board', type: 'select', default: 'green', options: [['green', 'Green'], ['black', 'Black'], ['blue', 'Blue']] },
    { key: 'density', label: 'Trace grid', type: 'range', min: 24, max: 90, step: 1, default: 52 },
    { key: 'thresh', label: 'Edge threshold', type: 'range', min: 0, max: 100, step: 1, default: 16 },
    { key: 'chips', label: 'Chips', type: 'toggle', default: true },
    { key: 'pads', label: 'Pads and vias', type: 'toggle', default: true },
    { key: 'seed', label: 'Re-route', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const B = BOARDS[p.board] || BOARDS.green, r = rng(p.seed * 23 + 3), L = cache.L, u = Math.min(W, H) / 100;
    const sm = boxBlur(L, W, H, 2);
    // soldermask: the picture's own tones, tinted
    // copper pour (fine diagonal hatching) fills the darkest areas, like a ground plane
    const metal = hexToRgb(B.metal), hatch = Math.max(4, Math.round(W / 130));
    paintPixels(ctx, W, H, (x, y, o) => {
      const v = sm[y * W + x]; ramp([B.lo, B.hi], Math.pow(Math.min(1, v * 1.15), 1.05), o);
      const n = (((x * 73856093) ^ (y * 19349663)) & 255) / 255; o[0] += n * 4; o[1] += n * 4; o[2] += n * 4;
      if (v < 0.24 && (x + y) % hatch < hatch * 0.34) { const a = 0.32 * (1 - v / 0.24) + 0.1; o[0] += (metal[0] - o[0]) * a; o[1] += (metal[1] - o[1]) * a; o[2] += (metal[2] - o[2]) * a; }
    });
    const cs = W / p.density, cols = Math.ceil(W / cs), rows = Math.ceil(H / cs);
    const { mag, gx, gy } = sobel(boxBlur(L, W, H, Math.max(1, Math.round(cs / 3))), W, H, Math.max(1, Math.round(cs / 4)));
    let mmax = 1e-6; for (let i = 0; i < mag.length; i += 3) if (mag[i] > mmax) mmax = mag[i];
    const thr = (p.thresh / 100) * 0.4 + 0.02, cell = [];
    ctx.lineCap = 'round';
    const traceW = cs * 0.3;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const cx = (i + 0.5) * cs, cy = (j + 0.5) * cs, k = Math.min(H - 1, cy | 0) * W + Math.min(W - 1, cx | 0), m = mag[k] / mmax;
      cell.push(m);
      if (m < thr) continue;
      // tangent to the edge, snapped to the nearest of four directions
      const ang = Math.atan2(gy[k], gx[k]) + Math.PI / 2, q = ((Math.round(ang / (Math.PI / 4)) % 4) + 4) % 4, [dx, dy] = DIRS[q], hx = (dx * cs) / 2, hy = (dy * cs) / 2;
      const lw = traceW * (0.55 + Math.min(1, m * 1.6) * 0.75);
      ctx.strokeStyle = B.edge; ctx.lineWidth = lw + cs * 0.14; ctx.beginPath(); ctx.moveTo(cx - hx, cy - hy); ctx.lineTo(cx + hx, cy + hy); ctx.stroke();
      ctx.strokeStyle = B.metal; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(cx - hx, cy - hy); ctx.lineTo(cx + hx, cy + hy); ctx.stroke();
    }
    const edgeAt = (i, j) => (i < 0 || j < 0 || i >= cols || j >= rows ? 0 : cell[j * cols + i]);
    // pads where traces are busiest, vias along them
    if (p.pads) {
      for (let j = 1; j < rows - 1; j++) for (let i = 1; i < cols - 1; i++) {
        const m = edgeAt(i, j); if (m < thr * 1.3) continue;
        const dens = edgeAt(i - 1, j) + edgeAt(i + 1, j) + edgeAt(i, j - 1) + edgeAt(i, j + 1) + edgeAt(i - 1, j - 1) + edgeAt(i + 1, j + 1);
        const cx = (i + 0.5) * cs, cy = (j + 0.5) * cs, pr = r();
        if (pr < 0.055 + dens * 0.012) {
          const R = cs * (0.34 + r() * 0.12);
          ctx.fillStyle = B.edge; ctx.beginPath(); ctx.arc(cx, cy, R + cs * 0.06, 0, TAU); ctx.fill();
          ctx.fillStyle = B.metal; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
          ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.42, 0, TAU); ctx.fill();
        } else if (pr < 0.1 + dens * 0.02) {
          ctx.fillStyle = B.metalDark; ctx.beginPath(); ctx.arc(cx, cy, cs * 0.2, 0, TAU); ctx.fill();
          ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.arc(cx, cy, cs * 0.09, 0, TAU); ctx.fill();
        }
      }
    }
    // chips sit on calm areas, never on top of each other
    if (p.chips) {
      const placed = [], names = ['U', 'U', 'IC', 'Q'];
      for (let t = 0; t < 80 && placed.length < 6; t++) {
        const w = 5 + ((r() * 5) | 0), h = 3 + ((r() * 4) | 0), i0 = 1 + ((r() * (cols - w - 2)) | 0), j0 = 1 + ((r() * (rows - h - 2)) | 0);
        if (placed.some((c) => i0 < c.i + c.w + 1 && i0 + w + 1 > c.i && j0 < c.j + c.h + 1 && j0 + h + 1 > c.j)) continue;
        let busy = 0; for (let j = j0; j < j0 + h; j++) for (let i = i0; i < i0 + w; i++) busy += edgeAt(i, j) > thr ? 1 : 0;
        if (busy > w * h * 0.35) continue;
        placed.push({ i: i0, j: j0, w, h });
        const x = i0 * cs, y = j0 * cs, cw = w * cs, ch = h * cs, pin = cs * 0.5;
        // pins on the two long sides
        const horiz = cw >= ch;
        ctx.fillStyle = '#b8bcc0';
        if (horiz) for (let k = 0.5; k < w; k += 1) { ctx.fillRect(x + k * cs - pin * 0.24, y - pin * 0.6, pin * 0.48, pin * 0.7); ctx.fillRect(x + k * cs - pin * 0.24, y + ch - pin * 0.1, pin * 0.48, pin * 0.7); }
        else for (let k = 0.5; k < h; k += 1) { ctx.fillRect(x - pin * 0.6, y + k * cs - pin * 0.24, pin * 0.7, pin * 0.48); ctx.fillRect(x + cw - pin * 0.1, y + k * cs - pin * 0.24, pin * 0.7, pin * 0.48); }
        const g = ctx.createLinearGradient(x, y, x + cw * 0.6, y + ch);
        g.addColorStop(0, '#2a2c30'); g.addColorStop(1, '#0c0d0f'); ctx.fillStyle = g; ctx.fillRect(x, y, cw, ch);
        ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = Math.max(1, u * 0.2); ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(x + cs * 0.55, y + cs * 0.55, cs * 0.17, 0, TAU); ctx.fill();
        label(ctx, `${names[(r() * names.length) | 0]}${1 + ((r() * 14) | 0)}`, x + cw / 2, y + ch / 2, `600 ${Math.max(7, cs * 0.62)}px "JetBrains Mono", ui-monospace, monospace`, 'rgba(255,255,255,0.55)');
      }
    }
    // silk-screen part names near a few pads
    ctx.fillStyle = B.silk;
    for (let t = 0; t < 14; t++) {
      const i = 1 + ((r() * (cols - 4)) | 0), j = 1 + ((r() * (rows - 2)) | 0);
      if (edgeAt(i, j) > thr || edgeAt(i + 1, j) > thr || edgeAt(i + 2, j) > thr) continue;
      label(ctx, `${'RCDL'[(r() * 4) | 0]}${1 + ((r() * 40) | 0)}`, (i + 0.2) * cs, (j + 0.5) * cs, `500 ${Math.max(7, cs * 0.52)}px "JetBrains Mono", ui-monospace, monospace`, B.silk, 'left');
    }
  },
});
