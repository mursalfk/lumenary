// src/engine/styles/dithering.js
import { still, hexToRgb, clamp } from '../utils.js';
import { pixels, rgbList, nearest, blit } from '../helpers.js';

const PALETTES = {
  mono: ['#0b0b0b', '#f2f0e8'],
  gameboy: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  amber: ['#1a0d00', '#6b3a00', '#d98a00', '#ffd27a'],
  cga: ['#000000', '#55ffff', '#ff55ff', '#ffffff'],
  mac: ['#1b1b1b', '#e9e6dc'],
  eight: ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'],
};
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const BAYER8 = (() => { const m = [[0, 2], [3, 1]]; let b = m; for (let n = 2; n < 8; n *= 2) { const s = b.length, nb = Array.from({ length: s * 2 }, () => new Array(s * 2)); for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const v = b[y][x] * 4; nb[y][x] = v; nb[y][x + s] = v + 2; nb[y + s][x] = v + 3; nb[y + s][x + s] = v + 1; } b = nb; } return b.flat().map((v) => (v + 0.5) / 64 - 0.5); })();

export default still({
  id: 'dithering',
  name: 'Dithering',
  blurb: 'Few colours, many dots: ordered, Floyd-Steinberg and Atkinson dithering in old-computer palettes.',
  maxSide: 1000,
  params: [
    { key: 'method', label: 'Method', type: 'select', default: 'atkinson', options: [['atkinson', 'Atkinson'], ['floyd', 'Floyd-Steinberg'], ['bayer8', 'Bayer 8x8'], ['bayer4', 'Bayer 4x4'], ['noise', 'Random noise']] },
    { key: 'palette', label: 'Palette', type: 'select', default: 'mac', options: [['mac', 'Mac 1-bit'], ['mono', 'Black and white'], ['gameboy', 'Game Boy'], ['amber', 'Amber monitor'], ['cga', 'CGA'], ['eight', '8 colours']] },
    { key: 'scale', label: 'Pixel size', type: 'range', min: 1, max: 8, step: 1, default: 2 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -50, max: 80, step: 1, default: 0 },
    { key: 'bright', label: 'Brightness', type: 'range', min: -60, max: 60, step: 1, default: 0 },
  ],
  render(ctx, work, p, env, W, H) {
    const w = Math.max(8, Math.ceil(W / p.scale)), h = Math.max(8, Math.ceil(H / p.scale));
    const small = env.makeCanvas(w, h), sx = small.getContext('2d'); sx.imageSmoothingEnabled = true; sx.drawImage(work, 0, 0, w, h);
    const src = sx.getImageData(0, 0, w, h).data, pal = rgbList(PALETTES[p.palette] || PALETTES.mac), gray = pal.length <= 4 && p.palette !== 'cga';
    const cf = 1 + p.contrast / 100 * 1.6, bo = p.bright * 2.2;
    const buf = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) for (let c = 0; c < 3; c++) buf[i * 3 + c] = clamp((src[i * 4 + c] - 128) * cf + 128 + bo, 0, 255);
    const img = ctx.createImageData(w, h), o = img.data;
    // palettes of up to four tones work from brightness alone, so colours do not wander
    const toGray = (i) => { const l = 0.2126 * buf[i * 3] + 0.7152 * buf[i * 3 + 1] + 0.0722 * buf[i * 3 + 2]; buf[i * 3] = buf[i * 3 + 1] = buf[i * 3 + 2] = l; };
    if (gray) for (let i = 0; i < w * h; i++) toGray(i);
    const spread = pal.length > 4 ? 90 : 255 / Math.max(1, pal.length - 1);
    const put = (i, k) => { o[i * 4] = pal[k][0]; o[i * 4 + 1] = pal[k][1]; o[i * 4 + 2] = pal[k][2]; o[i * 4 + 3] = 255; };
    // ordered ones compare each pixel with a fixed threshold pattern
    const mapIdx = gray ? (v) => { // nearest of the grayscale-sorted palette by luminance
      let b = 0, bd = 1e9; for (let k = 0; k < pal.length; k++) { const l = 0.2126 * pal[k][0] + 0.7152 * pal[k][1] + 0.0722 * pal[k][2], dd = Math.abs(l - v); if (dd < bd) { bd = dd; b = k; } } return b; } : null;
    const sorted = gray ? pal.map((c, k) => ({ k, l: 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] })).sort((a, b) => a.l - b.l) : null;
    const pick = (r, g, b) => (gray ? mapIdx(r) : nearest(pal, r, g, b));
    if (p.method === 'bayer4' || p.method === 'bayer8' || p.method === 'noise') {
      const mat = p.method === 'bayer4' ? BAYER4 : BAYER8, n = p.method === 'bayer4' ? 4 : 8;
      let seed = 1; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, t = (p.method === 'noise' ? rnd() - 0.5 : mat[(y % n) * n + (x % n)]) * spread;
        put(i, pick(buf[i * 3] + t, buf[i * 3 + 1] + t, buf[i * 3 + 2] + t));
      }
    } else {
      const atk = p.method === 'atkinson';
      const kernel = atk ? [[1, 0, 1 / 8], [2, 0, 1 / 8], [-1, 1, 1 / 8], [0, 1, 1 / 8], [1, 1, 1 / 8], [0, 2, 1 / 8]] : [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]];
      for (let y = 0; y < h; y++) {
        const ltr = y % 2 === 0;
        for (let xx = 0; xx < w; xx++) {
          const x = ltr ? xx : w - 1 - xx, i = y * w + x, r = buf[i * 3], g = buf[i * 3 + 1], b = buf[i * 3 + 2], k = pick(r, g, b);
          put(i, k);
          const er = r - pal[k][0], eg = g - pal[k][1], eb = b - pal[k][2];
          for (const [dx, dy, f] of kernel) {
            const nx = x + (ltr ? dx : -dx), ny = y + dy; if (nx < 0 || nx >= w || ny >= h) continue;
            const j = (ny * w + nx) * 3;
            if (gray) { const e = (er * 0.2126 + eg * 0.7152 + eb * 0.0722) * f; buf[j] += e; buf[j + 1] += e; buf[j + 2] += e; }
            else { buf[j] += er * f; buf[j + 1] += eg * f; buf[j + 2] += eb * f; }
          }
        }
      }
    }
    blit(env, ctx, img, W, H, false);
  },
});
