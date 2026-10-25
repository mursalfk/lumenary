// src/engine/styles/kente.js
import { still, hexToRgb, clamp, hash2 } from '../utils.js';
import { pixels, sampler, nearest } from '../helpers.js';
import { vivid } from '../culture.js';

// Gold, red, green, black, blue, white, orange: the colours of Ashanti and Ewe cloth.
const PAL = ['#f2b01e', '#c8281e', '#1f7a3a', '#17120f', '#1f3f8f', '#f0e8d4', '#e2661b'].map(hexToRgb);
const ORDER = [3, 0, 5, 1, 2, 4, 6];

// A motif in a weft-float block, u and v in 0..1. Returns 1 where the second colour shows.
function motif(m, u, v) {
  switch (m) {
    case 0: return Math.abs(u - 0.5) + Math.abs(v - 0.5) < 0.34 ? 1 : 0;
    case 1: { const tw = Math.abs(((u * 2) % 1) - 0.5) * 2; return Math.abs(v - (0.25 + 0.5 * tw)) < 0.14 ? 1 : 0; }
    case 2: return (u > 0.5) !== (v > 0.5) ? 1 : 0;
    default: return Math.abs(v - 0.5) < 0.12 || (u > 0.38 && u < 0.62 && v > 0.2 && v < 0.8) ? 1 : 0;
  }
}

export default still({
  id: 'kente',
  name: 'Kente',
  blurb: 'Ghanaian strip weaving. Narrow bands are woven on a loom, each one a run of vertical threads broken by blocks of horizontal float, then sewn edge to edge. Colours are snapped to the traditional few.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Strip width', type: 'range', min: 18, max: 64, step: 1, default: 32 },
    { key: 'motifs', label: 'Float blocks', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'thread', label: 'Thread relief', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'seed', label: 'New weave', type: 'shuffle', default: 4 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, sw = p.size * sc, cw = sw / 4, chh = cw * 1.2, nS = Math.ceil(W / sw) + 1, nR = Math.ceil(H / chh) + 3, nC = nS * 4;
    const smp = sampler(cache, d, W, H, cw * 1.1), A = new Uint8Array(nC * nR), tmp = [0, 0, 0], mo = p.motifs / 100, rl = p.thread / 100, unit = sw / 2;
    for (let c = 0; c < nC; c++) {
      const s = (c / 4) | 0, shift = s % 2 ? chh * 0.5 : 0;
      for (let r = 0; r < nR; r++) {
        const cx = clamp((c + 0.5) * cw, 0, W - 1), cy = clamp(r * chh + chh / 2 - shift, 0, H - 1);
        vivid(smp.rgb(cx, cy), 1.5, 0.02, tmp);
        A[c * nR + r] = nearest(PAL, tmp[0], tmp[1], tmp[2]);
      }
    }
    const img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      const s = (x / sw) | 0, lx = x - s * sw, shift = s % 2 ? chh * 0.5 : 0, yy = y + shift, row = (yy / chh) | 0, col = (x / cw) | 0, ai = A[col * nR + row], a = PAL[ai];
      const off = (hash2(s, 2, p.seed) * 3 | 0) * unit, bi = Math.floor((yy + off) / (unit * 3)), hb = hash2(s, bi, p.seed);
      let acc = [3, 0, 5][(hash2(s, 7, p.seed) * 3) | 0]; if (acc === ai) acc = ORDER[(ORDER.indexOf(acc) + 2) % ORDER.length];
      const b = PAL[acc];
      let c, f;
      if (hb < mo * 0.75) {
        const m = motif((hash2(s, bi, p.seed + 9) * 4) | 0, ((lx / unit) % 1 + 1) % 1, (((yy + off) / unit) % 1 + 1) % 1), th = ((yy / (chh / 3)) % 1 + 1) % 1;
        c = m ? b : a; f = 1 - rl * 0.3 * (1 - Math.sin(Math.PI * th));
      } else {
        const tw = cw / 3, tt = (lx / tw) | 0, tu = (lx / tw) % 1;
        c = tt % 6 === 2 ? b : a; f = 1 - rl * 0.32 * (1 - Math.sin(Math.PI * tu));
      }
      const seam = lx < 1.3 * sc || lx > sw - 1.3 * sc ? 0.5 : 1;
      f *= seam * (0.96 + 0.08 * hash2(s, 1, p.seed));
      o[k] = c[0] * f; o[k + 1] = c[1] * f; o[k + 2] = c[2] * f; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
