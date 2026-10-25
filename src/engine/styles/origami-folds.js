// src/engine/styles/origami-folds.js
import { still, rng, hash2, hexToRgb, clamp, sampleImage, rgb2hsl, hsl2rgb } from '../utils.js';
import { addGrain } from '../helpers.js';

export default still({
  id: 'origami-folds',
  name: 'Origami Folds',
  blurb: 'Paper folded into a sheet of small pyramids; each facet catches light differently and takes its colour from your picture.',
  maxSide: 1000,
  params: [
    { key: 'cells', label: 'Folds across', type: 'range', min: 5, max: 30, step: 1, default: 13 },
    { key: 'fold', label: 'Fold strength', type: 'range', min: 0, max: 100, step: 1, default: 62 },
    { key: 'angle', label: 'Light direction', type: 'range', min: 0, max: 360, step: 1, default: 135, fmt: (v) => v + '°' },
    { key: 'paper', label: 'Paper', type: 'select', default: 'colour', options: [['colour', 'Coloured by the picture'], ['white', 'Plain white']] },
    { key: 'crease', label: 'Crease lines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'seed', label: 'Fold differently', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const cols = p.cells, s = W / cols, rows = Math.ceil(H / s) + 1, r = rng(p.seed * 19 + 4);
    const img = sampleImage(env, work, cols * 4, rows * 4), d = img.data, iw = img.width, ih = img.height;
    const at = (x, y) => { const sx = clamp(Math.floor((x / W) * iw), 0, iw - 1), sy = clamp(Math.floor((y / H) * ih), 0, ih - 1), o = (sy * iw + sx) * 4; return [d[o], d[o + 1], d[o + 2]]; };
    const a = (p.angle * Math.PI) / 180, lx = Math.cos(a), ly = -Math.sin(a), fold = p.fold / 100;
    ctx.fillStyle = '#f2efe8'; ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x0 = i * s, y0 = j * s, x1 = x0 + s, y1 = y0 + s, cx = x0 + s / 2, cy = y0 + s / 2;
      // each square folds one of three ways: four facets round the centre, or two split along either diagonal
      const kind = hash2(i, j, p.seed + 7), flip = hash2(i, j, p.seed + 3) < 0.5 ? 1 : -1, q = Math.SQRT1_2;
      let tris;
      if (kind < 0.34) tris = [[x0, y0, x1, y0, 0, -1], [x1, y0, x1, y1, 1, 0], [x1, y1, x0, y1, 0, 1], [x0, y1, x0, y0, -1, 0]];
      else if (kind < 0.67) tris = [[x0, y0, x1, y0, q, -q, x1, y1], [x0, y0, x1, y1, -q, q, x0, y1]];
      else tris = [[x0, y0, x1, y0, -q, -q, x0, y1], [x1, y0, x1, y1, q, q, x0, y1]];
      for (const t of tris) {
        const [ax, ay, bx, by, nx, ny, ex, ey] = t, four = t.length === 6;
        const mx = four ? (ax + bx + cx) / 3 : (ax + bx + ex) / 3, my = four ? (ay + by + cy) / 3 : (ay + by + ey) / 3;
        let c = p.paper === 'white' ? [236, 232, 224] : at(mx, my);
        if (p.paper !== 'white') { const [h, sa, l] = rgb2hsl(c[0], c[1], c[2]); c = hsl2rgb(h, clamp(sa * 0.9), clamp(l * 0.9 + 0.06)); }
        // a facet tilted toward the light is bright, away from it dark; each also has its own small random tilt
        const shade = 1 + fold * (0.62 * flip * (nx * lx + ny * ly) + (hash2(Math.round(mx), Math.round(my), p.seed) - 0.5) * 0.5);
        ctx.fillStyle = `rgb(${clamp(c[0] * shade, 0, 255) | 0},${clamp(c[1] * shade, 0, 255) | 0},${clamp(c[2] * shade, 0, 255) | 0})`;
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        if (four) ctx.lineTo(cx, cy); else ctx.lineTo(ex, ey);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
    // creases: a dark line with a pale one beside it, as a real fold has
    const cr = p.crease / 100;
    if (cr > 0) {
      for (const [col, off, al] of [['0,0,0', 0, 0.2 * cr], ['255,255,255', 1, 0.34 * cr]]) {
        ctx.strokeStyle = `rgba(${col},${al})`; ctx.lineWidth = Math.max(0.8, s * 0.014); ctx.beginPath();
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const x0 = i * s + off, y0 = j * s + off, x1 = x0 + s, y1 = y0 + s, kind = hash2(i, j, p.seed + 7);
          ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1);
          if (kind < 0.34) { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.moveTo(x1, y0); ctx.lineTo(x0, y1); }
          else if (kind < 0.67) { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); }
          else { ctx.moveTo(x1, y0); ctx.lineTo(x0, y1); }
        }
        ctx.stroke();
      }
    }
    addGrain(ctx, W, H, 0.22, 5);
  },
});
