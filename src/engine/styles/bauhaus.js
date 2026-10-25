import { still, rng, sampleImage, lumOf, rgb2hsl, lumArray, sobel, TAU } from '../utils.js';

const PALETTES = {
  classic: { red: '#d8372b', yellow: '#f1bd2d', blue: '#1d46a6', black: '#141414', paper: '#ece6d8' },
  mono: { red: '#8a8a86', yellow: '#c8c7c0', blue: '#4a4a48', black: '#0e0e0e', paper: '#f1f0ec' },
  dusk: { red: '#c4553b', yellow: '#e2a94b', blue: '#35507a', black: '#1b1a1d', paper: '#e9e2d3' },
};

export default still({
  id: 'bauhaus',
  number: 16,
  name: 'Bauhaus',
  blurb: 'The picture reduced to circles, quarter-circles and squares in primary colours.',
  maxSide: 1100,
  params: [
    { key: 'tiles', label: 'Tiles across', type: 'range', min: 8, max: 40, step: 1, default: 18 },
    { key: 'palette', label: 'Palette', type: 'select', default: 'classic', options: [['classic', 'Primary'], ['dusk', 'Dusk'], ['mono', 'Gray']] },
    { key: 'variation', label: 'Variation', type: 'range', min: 0, max: 100, step: 1, default: 25 },
    { key: 'seed', label: 'Reshuffle', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const cols = Math.round(p.tiles), cell = W / cols, rows = Math.max(2, Math.ceil(H / cell));
    const key = cols + 'x' + rows;
    if (cache.key !== key) {
      cache.img = sampleImage(env, work, cols, rows);
      const L = lumArray(cache.img);
      cache.grad = sobel(L, cols, rows, 1);
      cache.key = key;
    }
    const px = cache.img.data, { gx, gy } = cache.grad;
    const pal = PALETTES[p.palette] || PALETTES.classic;
    ctx.fillStyle = pal.paper;
    ctx.fillRect(0, 0, W, H);
    const vary = p.variation / 100;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i, o = idx * 4;
        const r = px[o], g = px[o + 1], b = px[o + 2];
        const l = lumOf(r, g, b), [h, s] = rgb2hsl(r, g, b);
        const rnd = rng(p.seed * 104729 + idx * 31 + 7);
        let color;
        if (l < 0.2) color = pal.black;
        else if (s < 0.2) color = l < 0.4 ? pal.black : l > 0.72 ? pal.paper : (rnd() < 0.5 ? pal.black : pal.blue);
        else if (h < 0.08 || h > 0.86) color = pal.red;
        else if (h < 0.46) color = pal.yellow;
        else color = pal.blue;

        let corner = Math.floor((((Math.atan2(gy[idx], gx[idx]) + Math.PI) / TAU) * 4)) % 4;
        let shape = l < 0.22 ? 'square' : l < 0.45 ? 'quarter' : l < 0.66 ? 'half' : l < 0.84 ? 'circle' : 'dot';
        if (rnd() < vary * 0.6) shape = ['square', 'quarter', 'half', 'circle', 'dot'][Math.floor(rnd() * 5)];
        if (rnd() < vary) corner = Math.floor(rnd() * 4);

        const x = i * cell, y = j * cell;
        ctx.fillStyle = color;
        ctx.beginPath();
        if (shape === 'square') ctx.rect(x, y, cell + 0.5, cell + 0.5);
        else if (shape === 'circle') ctx.arc(x + cell / 2, y + cell / 2, cell * 0.4, 0, TAU);
        else if (shape === 'dot') ctx.arc(x + cell / 2, y + cell / 2, cell * 0.17, 0, TAU);
        else if (shape === 'quarter') {
          const cx = x + (corner === 0 || corner === 3 ? 0 : cell), cy = y + (corner < 2 ? 0 : cell);
          const a0 = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][corner];
          ctx.moveTo(cx, cy); ctx.arc(cx, cy, cell, a0, a0 + Math.PI / 2); ctx.closePath();
        } else {
          const ang = (corner * Math.PI) / 2, cx = x + cell / 2, cy = y + cell / 2;
          ctx.moveTo(cx, cy); ctx.arc(cx, cy, cell / 2, ang - Math.PI / 2, ang + Math.PI / 2); ctx.closePath();
        }
        ctx.fill();
      }
    }
  },
});
