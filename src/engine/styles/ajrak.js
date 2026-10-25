// src/engine/styles/ajrak.js
import { still, hexToRgb, hash2 } from '../utils.js';
import { pixels, sampler, fbm } from '../helpers.js';
import { starRadius } from '../culture.js';

// Each state lists [ground, star]. Resist (the white of the cloth where the paste kept the dye out) is shared.
const PALS = {
  classic: { A: ['#1d2c68', '#a3141e'], B: ['#a3141e', '#1d2c68'], C: ['#efe6d0', '#a3141e'], R: '#f3ecd9' },
  madder: { A: ['#17120f', '#8e1b1b'], B: ['#8e1b1b', '#17120f'], C: ['#e9dcc0', '#8e1b1b'], R: '#f1e8d2' },
  indigo: { A: ['#0f1a45', '#2f4c9a'], B: ['#2f4c9a', '#0f1a45'], C: ['#e8e4d6', '#2f4c9a'], R: '#f2efe4' },
};
const fr = (v) => v - Math.floor(v);

// Which part of the block a point falls in: 0 ground, 1 star colour, 2 resist (white).
function zone(x, y, s, sz) {
  const u = fr(x / s) - 0.5, v = fr(y / s) - 0.5, rho = Math.hypot(u, v) * 2, a = Math.atan2(v, u);
  const R = starRadius(a, 8, 0.94 * sz, 0.55 * sz);
  if (rho < R + 0.05) {
    if (Math.abs(rho - R) < 0.05) return 2;
    if (rho < 0.14) return 2;
    if (Math.abs(rho - 0.34 * sz) < 0.035) return 2;
    if (rho < 0.3 * sz) return 0;
    return 1;
  }
  const dc = ((0.5 - Math.abs(u)) + (0.5 - Math.abs(v))) * 2;
  if (dc < 0.3) return 1;
  if (dc < 0.37) return 2;
  if (Math.min(Math.hypot(Math.abs(u) - 0.5, v), Math.hypot(u, Math.abs(v) - 0.5)) * 2 < 0.1) return 2;
  return 0;
}

export default still({
  id: 'ajrak',
  name: 'Ajrak',
  blurb: 'The block-printed shawl of Sindh: madder red and indigo, a lattice of eight-pointed stars, and white lines where the resist paste held the dye back.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Block size', type: 'range', min: 28, max: 90, step: 1, default: 48 },
    { key: 'follow', label: 'Colour follows picture', type: 'range', min: 0, max: 100, step: 1, default: 85 },
    { key: 'dye', label: 'Dye', type: 'select', default: 'classic', options: [['classic', 'Crimson and indigo'], ['madder', 'Madder and black'], ['indigo', 'Indigo only']] },
    { key: 'border', label: 'End borders', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'print', label: 'Hand-printed look', type: 'range', min: 0, max: 100, step: 1, default: 55 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, P = PALS[p.dye], ncx = Math.max(3, Math.round(W / (p.size * sc))), s = W / ncx;
    const bh = Math.round(H * 0.1 * (p.border / 100)), fh = H - 2 * bh, ncy = Math.max(2, Math.round(fh / s));
    const smp = sampler(cache, d, W, H, s * 0.4), conv = (h) => hexToRgb(h);
    const st = { A: P.A.map(conv), B: P.B.map(conv), C: P.C.map(conv) }, R = conv(P.R);
    const cellState = new Uint8Array(ncx * ncy), cellSz = new Float32Array(ncx * ncy), fol = p.follow / 100, sy = fh / ncy;
    for (let j = 0; j < ncy; j++) for (let i = 0; i < ncx; i++) {
      const t = smp.tone((i + 0.5) * s, bh + (j + 0.5) * sy), k = j * ncx + i;
      const pick = t < 0.36 ? 0 : t < 0.66 ? 1 : 2, alt = (i + j) % 2 ? 1 : 0;
      cellState[k] = hash2(i, j, 4) < fol ? pick : alt;
      cellSz[k] = 0.82 + 0.18 * (1 - t);
    }
    const img = ctx.createImageData(W, H), o = img.data, mis = (p.print / 100) * 1.5 * sc, A = st.A, B = st.B;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      let c;
      if (y < bh || y >= H - bh) {
        const q = (y < bh ? y : H - 1 - y) / bh, u = fr(x / (bh * 0.36));
        if (q < 0.07 || (q > 0.22 && q < 0.27) || (q > 0.62 && q < 0.68) || q > 0.93) c = R;
        else if (q < 0.22) c = A[0];
        else if (q < 0.62) c = Math.abs(u - 0.5) * 2 < 1 - (q - 0.27) / 0.35 ? R : B[0];
        else { const w = bh * 0.25, uu = fr(x / w) - 0.5, vv = (q - 0.68) / 0.25 - 0.5; c = Math.hypot(uu * w, vv * 0.25 * bh) < bh * 0.04 ? R : A[0]; }
      } else {
        const yy = y - bh, ci = Math.min(ncx - 1, (x / s) | 0), cj = Math.min(ncy - 1, (yy / sy) | 0), cell = cj * ncx + ci;
        const S = cellState[cell] === 0 ? st.A : cellState[cell] === 1 ? st.B : st.C, sz = cellSz[cell];
        const z1 = zone(x, yy * (s / sy), s, sz), z2 = mis > 0.05 ? zone(x + mis, yy * (s / sy) + mis * 0.7, s, sz) : z1;
        const z = z2 === 2 ? 2 : z1 === 2 ? 0 : z1;
        c = z === 2 ? R : z === 1 ? S[1] : S[0];
      }
      const dye = 1 + (fbm(x / (40 * sc), y / (40 * sc), 3, 2) - 0.5) * 0.24 * (p.print / 100 + 0.3), weave = 1 + 0.035 * Math.sin(x * Math.PI / (1.6 * sc)) * Math.sin(y * Math.PI / (1.6 * sc));
      const f = (c === R ? 1 : dye) * weave;
      if (p.print > 0 && hash2(x, y, 9) < 0.0012 * (p.print / 50)) c = R;
      o[k] = c[0] * f; o[k + 1] = c[1] * f; o[k + 2] = c[2] * f; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
