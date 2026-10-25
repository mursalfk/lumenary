// src/engine/styles/screen-print.js
import { still, hash2, vnoise, boxBlur, hexToRgb, smoothstep } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

// Four inks, lightest (covers the most) to darkest (covers the least).
const PALETTES = {
  poster: ['#ffd23a', '#e8412c', '#2457c5', '#16140f'],
  sunset: ['#ffc75f', '#ff6f61', '#a8327d', '#2a1245'],
  forest: ['#f2d16b', '#7fb069', '#1f6f5c', '#0f2a24'],
  ice: ['#bfe8f2', '#5aa9d6', '#2a4fa0', '#101a40'],
};
const TH = [0.84, 0.62, 0.41, 0.21];
const PICK = { 2: [1, 3], 3: [0, 2, 3], 4: [0, 1, 2, 3] };

export default still({
  id: 'screen-print',
  name: 'Screen Print',
  blurb: 'A poster pulled through silk screens, one flat colour per pass. Where inks overlap they mix, and no pass sits quite where it should.',
  maxSide: 1100,
  params: [
    { key: 'palette', label: 'Inks', type: 'select', default: 'poster', options: [['poster', 'Poster primaries'], ['sunset', 'Sunset'], ['forest', 'Forest'], ['ice', 'Ice']] },
    { key: 'passes', label: 'Number of inks', type: 'range', min: 2, max: 4, step: 1, default: 4 },
    { key: 'miss', label: 'Misregistration', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'rough', label: 'Rough edges', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'mesh', label: 'Mesh texture', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'seed', label: 'Pull again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(1.5 * sc))), seed = p.seed * 11 + 2;
    const pal = (PALETTES[p.palette] || PALETTES.poster), idx = PICK[p.passes] || PICK[4], inks = idx.map((k) => hexToRgb(pal[k])), ths = idx.map((k) => TH[k]);
    const rough = (p.rough / 100) * 0.09, mesh = p.mesh / 100, step = 3 * sc + 1.2, m = (p.miss / 100) * 5 * sc;
    // each pass is shifted by its own small amount, as a screen is never put back exactly
    const offs = inks.map((_, k) => [Math.round((hash2(k, 1, seed) - 0.5) * 2 * m), Math.round((hash2(k, 2, seed) - 0.5) * 2 * m)]);
    const out = ctx.createImageData(W, H), d = out.data, paper = [246, 241, 228];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4, r = (vnoise(x * 0.4 / sc, y * 0.4 / sc, seed) - 0.5) * 2 * rough;
      let R = paper[0], G = paper[1], B = paper[2];
      for (let k = 0; k < inks.length; k++) {
        const xx = Math.min(W - 1, Math.max(0, x + offs[k][0])), yy = Math.min(H - 1, Math.max(0, y + offs[k][1]));
        const cov = 1 - smoothstep(ths[k] - 0.012, ths[k] + 0.012, L[yy * W + xx] + r);
        if (cov > 0) {
          // an ink film is not perfectly even
          const film = 0.93 + 0.07 * vnoise(x * 0.03 / sc, y * 0.03 / sc, seed + k);
          const t = cov * film;
          R *= 1 - t * (1 - inks[k][0] / 255); G *= 1 - t * (1 - inks[k][1] / 255); B *= 1 - t * (1 - inks[k][2] / 255);
        }
      }
      // the weave of the screen leaves a faint cross-hatch in every ink
      const w = 1 - mesh * 0.07 * (0.5 + 0.5 * Math.cos((x * 6.2832) / step) * Math.cos((y * 6.2832) / step));
      d[o] = R * w; d[o + 1] = G * w; d[o + 2] = B * w; d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
