// src/engine/styles/navajo-weave.js
import { still, hexToRgb, clamp, hash2 } from '../utils.js';
import { pixels, sampler, nearest } from '../helpers.js';
import { vivid } from '../culture.js';

const PALS = {
  ganado: ['#b3302a', '#1b1714', '#e9ddc2', '#8a847a', '#6a2a1f'],
  twogrey: ['#1b1612', '#4a3d2f', '#8a7a62', '#b9ae98', '#ece2cb'],
  sunset: ['#e9ddc2', '#d98a2e', '#b8402a', '#5a2a3a', '#1d1a1a', '#3f7f8a'],
};

export default still({
  id: 'navajo-weave',
  name: 'Navajo Weave',
  blurb: 'A Diné wool rug on an upright loom. The picture is built from coarse blocks of dyed and natural yarn, serrated at the edges the way diagonals have to be woven, and framed with a stepped zigzag border.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Yarn block', type: 'range', min: 5, max: 20, step: 1, default: 9 },
    { key: 'sym', label: 'Symmetry', type: 'select', default: 'lr', options: [['none', 'None'], ['lr', 'Left to right'], ['quad', 'Four-way']] },
    { key: 'palette', label: 'Wool', type: 'select', default: 'ganado', options: [['ganado', 'Ganado red'], ['twogrey', 'Natural greys'], ['sunset', 'Sunset dyes']] },
    { key: 'border', label: 'Border', type: 'select', default: 'zig', options: [['none', 'None'], ['simple', 'Stripes'], ['zig', 'Zigzag']] },
    { key: 'serrate', label: 'Serrated edges', type: 'toggle', default: true },
    { key: 'fringe', label: 'Fringe', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, c = Math.max(3, Math.round(p.size * sc)), PAL = PALS[p.palette].map(hexToRgb), smp = sampler(cache, d, W, H, c * 0.8), tmp = [0, 0, 0];
    const fh = p.fringe ? Math.round(H * 0.03) : 0, top = fh, rowsAll = Math.floor((H - 2 * fh) / c), cols = Math.floor(W / c), ox = Math.floor((W - cols * c) / 2), rows = rowsAll;
    const bwid = p.border === 'zig' ? 9 : p.border === 'simple' ? 3 : 0, grid = new Uint8Array(cols * rows);
    const colourIdx = (cx, cy) => {
      cx = clamp(cx, 0, W - 1); cy = clamp(cy, 0, H - 1);
      if (p.palette === 'twogrey') { const t = smp.tone(cx, cy); return Math.min(PAL.length - 1, Math.floor(t * PAL.length)); }
      vivid(smp.rgb(cx, cy), 1.3, 0, tmp); const idx = nearest(PAL, tmp[0], tmp[1], tmp[2]);
      return idx;
    };
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const dEx = Math.min(q, cols - 1 - q), dEy = Math.min(r, rows - 1 - r), dE = Math.min(dEx, dEy);
      let id;
      if (bwid > 0 && dE < bwid) {
        const a = dEx < dEy ? r : q, black = p.palette === 'twogrey' ? 0 : 1, cream = p.palette === 'twogrey' ? 4 : p.palette === 'sunset' ? 0 : 2, red = p.palette === 'twogrey' ? 2 : p.palette === 'sunset' ? 2 : 0;
        if (p.border === 'simple') id = dE === 0 ? black : dE === 1 ? cream : red;
        else if (dE === 0 || dE === 8) id = black; else if (dE === 1 || dE === 7) id = cream;
        else { const z = a % 8, zz = z < 4 ? z : 8 - z; id = dE - 2 === zz || dE - 2 === 4 - zz ? red : cream; if (dE - 2 > 4) id = cream; }
      } else {
        const x = ox + (q + 0.5) * c, y = top + (r + 0.5) * c; let sx = x, sy = y;
        if (p.sym === 'lr' || p.sym === 'quad') sx = x < W / 2 ? x : W - x;
        if (p.sym === 'quad') sy = y < H / 2 ? y : H - y;
        if (p.serrate) sx += ((r % 2) - 0.5) * c * 0.5;
        id = colourIdx(sx, sy);
      }
      grid[r * cols + q] = id;
    }
    const img = ctx.createImageData(W, H), o = img.data, ser = p.serrate ? 1 : 0;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      if (y < top || y >= top + rows * c || x < ox || x >= ox + cols * c) {
        // the loom bar and the fringe of warp threads
        const th = Math.floor(x / (2.2 * sc)), len = fh * (0.55 + 0.45 * hash2(th, y < H / 2 ? 1 : 2, 3)), inFr = y < top ? top - y < len : y - (top + rows * c) < len, v = 0.78 + 0.22 * Math.sin(((x % (2.2 * sc)) / (2.2 * sc)) * Math.PI);
        if (p.fringe && inFr && x >= 0) { o[k] = 232 * v; o[k + 1] = 222 * v; o[k + 2] = 198 * v; } else { o[k] = 36; o[k + 1] = 28; o[k + 2] = 22; }
        o[k + 3] = 255; continue;
      }
      const yy = y - top, row = Math.floor(yy / c), shift = ser * (row % 2) * c * 0.0, xx = x - ox + shift, col = Math.floor(xx / c), id = grid[row * cols + clamp(col, 0, cols - 1)], base = PAL[id];
      const ly = (yy - row * c) / c, ridge = 0.74 + 0.26 * Math.sin(Math.PI * ((ly * 2) % 1)), fuzz = 0.93 + 0.14 * hash2(x, y, 4), cell = 0.95 + 0.1 * hash2(col, row, 6);
      const f = ridge * fuzz * cell, edgeX = (xx - col * c) / c, side = edgeX < 0.08 ? 0.85 : 1;
      o[k] = base[0] * f * side; o[k + 1] = base[1] * f * side; o[k + 2] = base[2] * f * side; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
