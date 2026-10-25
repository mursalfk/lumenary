// src/engine/styles/ralli-patchwork.js
import { still, clamp, hexToRgb, hash2, smoothstep } from '../utils.js';
import { pixels, sampler, nearest } from '../helpers.js';
import { vivid } from '../culture.js';

const PALS = {
  bright: ['#d6246e', '#f28c28', '#f6c90e', '#1a9850', '#1c6bc4', '#7b2d8b', '#c1121f', '#171717', '#f4efe3'],
  earth: ['#a63d2f', '#d98b3a', '#e8c872', '#4f7a4c', '#2f5d7c', '#5b3a6e', '#7a2a22', '#1b1512', '#efe6d2'],
};
const SQ = Math.SQRT1_2, fr = (v) => v - Math.floor(v);

// Printed cotton: 0 plain, 1 dots, 2 stripes, 3 checks, 4 diamonds. Returns 1 on the print.
function print(kind, x, y, q) {
  switch (kind) {
    case 1: return Math.hypot(fr(x / q) - 0.5, fr(y / q) - 0.5) < 0.2 ? 1 : 0;
    case 2: return fr((x + y) / (q * 1.2)) < 0.3 ? 1 : 0;
    case 3: return (Math.floor(x / q) + Math.floor(y / q)) & 1;
    case 4: return Math.abs(fr(x / q) - 0.5) + Math.abs(fr(y / q) - 0.5) < 0.28 ? 1 : 0;
    default: return 0;
  }
}

export default still({
  id: 'ralli-patchwork',
  name: 'Ralli Patchwork',
  blurb: 'The ralli quilt of Sindh: bright scraps cut into squares and triangles, set on the diagonal, stitched down with rows of running thread.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Patch size', type: 'range', min: 22, max: 110, step: 1, default: 62 },
    { key: 'layout', label: 'Set', type: 'select', default: 'diamond', options: [['diamond', 'On the diagonal'], ['square', 'Square on']] },
    { key: 'split', label: 'Cut', type: 'select', default: 'halves', options: [['whole', 'Whole squares'], ['halves', 'Halves'], ['quarters', 'Quarters']] },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'bright', options: [['bright', 'Bright'], ['earth', 'Earthy']] },
    { key: 'print', label: 'Printed cotton', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'stitch', label: 'Stitching', type: 'range', min: 0, max: 100, step: 1, default: 75 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, pal = PALS[p.cloth].map(hexToRgb), diag = p.layout === 'diamond';
    const smp = sampler(cache, d, W, H, s * 0.3), memo = new Map(), tmp = [0, 0, 0];
    const to = (iu, iv, fu, fv) => { const ux = (iu + fu) * s, uy = (iv + fv) * s; return diag ? [(ux - uy) * SQ, (ux + uy) * SQ] : [ux, uy]; };
    const patch = (iu, iv, tri) => {
      const key = (iu + 500) * 100003 + (iv + 500) * 11 + tri, hit = memo.get(key);
      if (hit !== undefined) return hit;
      let fu = 0.5, fv = 0.5;
      if (p.split === 'quarters') { fu += [-0.333, 0.333, 0, 0][tri]; fv += [0, 0, -0.333, 0.333][tri]; }
      else if (p.split === 'halves') { fu = tri ? 0.667 : 0.333; fv = fu; }
      const [x, y] = to(iu, iv, fu, fv), c = smp.rgb(clamp(x, 0, W - 1), clamp(y, 0, H - 1));
      vivid(c, 1.5, 0.02, tmp);
      const id = nearest(pal, tmp[0], tmp[1], tmp[2]), kind = hash2(iu, iv, tri + 7) < 0.55 * (p.print / 100) * 1.4 ? 1 + Math.floor(hash2(iu, iv, tri + 3) * 4) : 0;
      const v = { id, kind }; memo.set(key, v); return v;
    };
    const img = ctx.createImageData(W, H), o = img.data, bm = s * 0.4, st = p.stitch / 100, q = 7 * sc;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      let c, f = 1;
      if (x < bm || y < bm || x >= W - bm || y >= H - bm) {
        c = pal[7]; f = 0.9 + 0.1 * smoothstep(0, bm, Math.min(x, y, W - 1 - x, H - 1 - y));
        const e = Math.min(x, y, W - 1 - x, H - 1 - y);
        if (st > 0.05 && Math.abs(e - bm * 0.5) < 0.6 * sc && fr((x + y) / (6 * sc)) < 0.55) c = pal[8];
      } else {
        const ux = diag ? (x + y) * SQ : x, uy = diag ? (y - x) * SQ : y, iu = Math.floor(ux / s), iv = Math.floor(uy / s), fu = ux / s - iu, fv = uy / s - iv, a = fu - 0.5, b = fv - 0.5;
        let tri = 0, dd = 9;
        const de = Math.min(fu, 1 - fu, fv, 1 - fv);
        if (p.split === 'quarters') { tri = Math.abs(a) > Math.abs(b) ? (a < 0 ? 0 : 1) : (b < 0 ? 2 : 3); dd = Math.abs(Math.abs(a) - Math.abs(b)) * SQ; }
        else if (p.split === 'halves') { tri = a + b > 0 ? 1 : 0; dd = Math.abs(a + b) * SQ; }
        const dseam = Math.min(de, dd) * s, pt = patch(iu, iv, tri);
        c = pal[pt.id];
        if (pt.kind) { const light = pt.id === 7 || pt.id === 5 || pt.id === 3 || pt.id === 4; if (print(pt.kind, x, y, q)) { const m = 0.5 * (p.print / 100 + 0.3), t = light ? 244 : 24; c = [c[0] + (t - c[0]) * m, c[1] + (t - c[1]) * m, c[2] + (t - c[2]) * m]; } }
        f = 0.82 + 0.2 * smoothstep(0, 10 * sc, dseam);
        if (dseam < 0.55 * sc) { c = [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5]; f = 1; }
        else if (st > 0.05 && Math.abs(dseam - 4.6 * sc) < 0.55 * sc && fr((x * 0.8 + y * 1.3) / (6.5 * sc)) < 0.55) {
          const lum = (c[0] + c[1] + c[2]) / 3; c = lum > 130 ? [c[0] * 0.55, c[1] * 0.55, c[2] * 0.55] : [Math.min(255, c[0] * 0.5 + 150), Math.min(255, c[1] * 0.5 + 150), Math.min(255, c[2] * 0.5 + 140)]; f = 1;
        }
      }
      const wv = 1 + 0.04 * Math.sin((x * Math.PI) / (1.6 * sc)) * Math.sin((y * Math.PI) / (1.6 * sc));
      f *= wv;
      o[k] = c[0] * f; o[k + 1] = c[1] * f; o[k + 2] = c[2] * f; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
