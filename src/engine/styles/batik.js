// src/engine/styles/batik.js
import { still, hexToRgb, clamp, smoothstep, hash2, vnoise } from '../utils.js';
import { pixels, sampler, cellular, fbm } from '../helpers.js';
import { paletteIdx, modeFilter, edgeMask, mix } from '../culture.js';

const fr = (v) => v - Math.floor(v);
// Dye colours. The cream is the cloth where wax kept the dye out.
const SCHEMES = {
  soga: { cream: '#eadbb4', dyes: ['#7b4a24', '#1f2d5a', '#c58a3b', '#2a1a12', '#6a2a22', '#a0703a'], dark: '#2a1a12' },
  pesisir: { cream: '#f1e6c8', dyes: ['#c1272d', '#17a2a0', '#f2b705', '#b0287a', '#27348b', '#e0751b'], dark: '#27348b' },
  indigo: { cream: '#efe9d8', dyes: ['#1b2c63', '#2f4f9a', '#5f7fc2', '#0e1a3f', '#8aa4d6', '#3a3f7a'], dark: '#0e1a3f' },
};

// The little marks (isen-isen) that fill each coloured area. Returns 1 where a mark sits.
function isen(id, x, y, q) {
  switch (id % 6) {
    case 0: return Math.hypot(fr(x / q) - 0.5, fr(y / q) - 0.5) < 0.17;
    case 1: { const u = fr((x + y) / (q * 1.2)), w = fr(x / (q * 1.2)); return Math.abs(u - 0.5) < 0.08 && w > 0.2 && w < 0.8; }
    case 2: { const u = fr(x / q) - 0.5, v = fr(y / q) - 0.5; return (Math.abs(u) < 0.07 && Math.abs(v) < 0.26) || (Math.abs(v) < 0.07 && Math.abs(u) < 0.26); }
    case 3: return Math.abs(Math.hypot(fr(x / (q * 1.3)) - 0.5, fr(y / (q * 1.3)) - 0.5) - 0.3) < 0.07;
    case 4: return Math.abs(fr((y + Math.sin(x / (q * 0.8)) * q * 0.3) / (q * 0.9)) - 0.5) < 0.09;
    default: { const u = fr(x / q) - 0.5, v = fr(y / q); return v > 0.2 && v < 0.8 && Math.abs(u) < (v - 0.2) * 0.35; }
  }
}

export default still({
  id: 'batik',
  name: 'Batik',
  blurb: 'Wax-resist dyeing from Java. Hot wax is drawn on the cloth, the cloth is dyed, and the wax keeps its colour out. Dotted outlines, small fill marks and a web of cracks where the dye crept in.',
  maxSide: 1100,
  params: [
    { key: 'simplify', label: 'Simplify', type: 'range', min: 1, max: 10, step: 1, default: 5 },
    { key: 'marks', label: 'Fill marks', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'size', label: 'Mark size', type: 'range', min: 3, max: 12, step: 1, default: 6 },
    { key: 'crackle', label: 'Crackle', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'scheme', label: 'Dyes', type: 'select', default: 'soga', options: [['soga', 'Soga and indigo'], ['pesisir', 'Coastal bright'], ['indigo', 'All indigo']] },
    { key: 'seed', label: 'New cracks', type: 'shuffle', default: 3 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, sch = SCHEMES[p.scheme], cream = hexToRgb(sch.cream), dark = hexToRgb(sch.dark);
    const PAL = [cream, ...sch.dyes.map(hexToRgb)], n = PAL.length, smp = sampler(cache, d, W, H, p.simplify * sc * 1.1);
    const key = p.simplify + '|' + p.scheme + '|' + W;
    if (cache.btk !== key) { cache.btIdx = modeFilter(paletteIdx(smp.ch, W, H, PAL, 1.25, 0.03), W, H, n, Math.max(2, Math.round(3 * sc)), 2); cache.btk = key; }
    const idx = cache.btIdx, thin = edgeMask(idx, W, H, Math.max(0, Math.round(0.8 * sc))), wide = edgeMask(idx, W, H, Math.max(1, Math.round(2.6 * sc)));
    const q = p.size * sc * 1.7, dp = 3.4 * sc, ms = p.marks / 100, cr = p.crackle / 100, cs = 17 * sc, out = [0, 0, 0, 0, 0];
    const img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const id = idx[i], base = PAL[id], wob = vnoise(x / (40 * sc), y / (40 * sc), 4) * 1.6 * sc;
      let c = id === 0 ? cream : mix(base, PAL[id], 0), r = c[0], g = c[1], b = c[2];
      const dye = 0.88 + 0.22 * fbm(x / (30 * sc), y / (30 * sc), 2, 3);
      if (id !== 0) { r *= dye; g *= dye; b *= dye; }
      if (ms > 0.02 && id !== 0 && isen(id, x + wob, y + wob, q)) { const t = ms * 0.88; r += (cream[0] - r) * t; g += (cream[1] - g) * t; b += (cream[2] - b) * t; }
      else if (ms > 0.02 && id === 0 && isen(3 + (x / (q * 8) | 0), x + wob, y + wob, q * 0.9)) { const t = ms * 0.25; r += (dark[0] * 1.6 - r) * t; g += (dark[1] * 1.6 - g) * t; b += (dark[2] * 1.6 - b) * t; }
      if (thin[i] || (wide[i] && Math.hypot(fr(x / dp) - 0.5, fr(y / dp) - 0.5) < 0.36)) { r = cream[0]; g = cream[1]; b = cream[2]; }
      if (cr > 0.02) {
        cellular(x + wob * 3, y + wob * 3, cs, p.seed * 17 + 3, out);
        const vein = out[1] - out[0], thick = (0.7 + 1.2 * cr) * sc;
        if (vein < thick && vnoise(x / (70 * sc), y / (70 * sc), p.seed) > 0.62 - 0.4 * cr) { const t = 0.8 * (1 - vein / thick); r += (dark[0] - r) * t; g += (dark[1] - g) * t; b += (dark[2] - b) * t; }
      }
      const w = 0.96 + 0.04 * Math.sin(x * 2.1) * Math.sin(y * 2.1) + (hash2(x, y, 9) - 0.5) * 0.05;
      o[k] = r * w; o[k + 1] = g * w; o[k + 2] = b * w; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
