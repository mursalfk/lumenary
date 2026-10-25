// src/engine/styles/retro.js
import { still, clamp } from '../utils.js';
import { pixels, paintPixels, rgbList, addGrain, contrast, rrPath } from '../helpers.js';

// Nineteen-seventies colour: warm, a little muddy, always in bands.
const PALETTES = {
  sunset: ['#2b1810', '#7a2e1a', '#c8501e', '#f08a24', '#f6c043', '#f3e6c4'],
  avocado: ['#1e2412', '#4b5a1f', '#8a8a2a', '#d4a72c', '#e8c78a', '#f1e8d0'],
  denim: ['#14202c', '#2f4a5e', '#3f7f86', '#d08a3a', '#e9b95c', '#f1e7d2'],
};

export default still({
  id: 'retro',
  name: 'Retro',
  blurb: 'Seventies colour: warm banded tones, a cream frame and the three-stripe swoosh.',
  maxSide: 1100,
  params: [
    { key: 'palette', label: 'Palette', type: 'select', default: 'sunset', options: [['sunset', 'Sunset'], ['avocado', 'Avocado'], ['denim', 'Denim']] },
    { key: 'bands', label: 'Colour bands', type: 'range', min: 3, max: 6, step: 1, default: 5 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -50, max: 80, step: 1, default: 20 },
    { key: 'swoosh', label: 'Stripes', type: 'toggle', default: true },
    { key: 'frame', label: 'Cream frame', type: 'toggle', default: true },
    { key: 'grain', label: 'Print grain', type: 'range', min: 0, max: 100, step: 1, default: 40 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const full = rgbList(PALETTES[p.palette] || PALETTES.sunset), n = p.bands;
    // pick `n` evenly spaced colours out of the six
    const pal = Array.from({ length: n }, (_, i) => full[Math.round((i / (n - 1)) * (full.length - 1))]);
    const L = cache.L, k = p.contrast / 100;
    paintPixels(ctx, W, H, (x, y, o) => {
      // a little ordered offset so band edges are slightly broken, like a screen print
      const dth = (((x & 3) * 4 + (y & 3)) / 16 - 0.5) * 0.045;
      const v = contrast(L[y * W + x], k) + dth;
      const c = pal[clamp((v * n) | 0, 0, n - 1)];
      o[0] = c[0]; o[1] = c[1]; o[2] = c[2];
    });
    const u = Math.min(W, H) / 100;

    if (p.swoosh) {
      const cols = [full[4], full[3], full[2]];
      ctx.save();
      ctx.lineCap = 'butt';
      cols.forEach((c, i) => {
        ctx.strokeStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.lineWidth = u * 1.9;
        ctx.beginPath();
        const y0 = H - u * (8 + i * 2.5);
        ctx.moveTo(0, y0); ctx.bezierCurveTo(W * 0.35, y0 + u * 1, W * 0.55, y0 - u * 14, W, y0 - u * 22);
        ctx.stroke();
      });
      ctx.restore();
    }
    addGrain(ctx, W, H, p.grain / 100 * 0.7, 11);
    if (p.frame) {
      const bw = u * 4.5;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H); rrPath(ctx, bw, bw, W - 2 * bw, H - 2 * bw, u * 3);
      ctx.clip('evenodd');
      ctx.fillStyle = '#f1e7d2'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  },
});
