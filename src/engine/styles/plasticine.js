// src/engine/styles/plasticine.js
import { still, rng, vnoise, boxBlur, hash2, rgb2hsl, hsl2rgb, clamp } from '../utils.js';
import { pixels, kmeans, nearest, slopes } from '../helpers.js';

const boost = ([r, g, b]) => {
  const [h, s, l] = rgb2hsl(r, g, b);
  return hsl2rgb(h, clamp(s * 1.2 + 0.04), clamp(l * 0.8 + 0.12, 0.2, 0.82));
};

export default still({
  id: 'plasticine',
  name: 'Plasticine',
  blurb: 'Pieces of modelling clay pressed side by side: flat colours, puffed up and glossy, with thumb dents.',
  maxSide: 900,
  params: [
    { key: 'colours', label: 'Colours of clay', type: 'range', min: 3, max: 10, step: 1, default: 6 },
    { key: 'puff', label: 'Puffiness', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'gloss', label: 'Gloss', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'dents', label: 'Thumb dents', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'angle', label: 'Light direction', type: 'range', min: 0, max: 360, step: 1, default: 135, fmt: (v) => v + '°' },
    { key: 'seed', label: 'New colours', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800;
    // 1. regions: blur a little, pick the nearest of k clay colours, then tidy single-pixel specks
    const key = p.colours + '|' + p.seed;
    if (cache.key !== key) {
      const pal = kmeans(d, p.colours, p.seed * 5 + 1, 9, 9).map(boost), rad = Math.max(1, Math.round(sc * 4)), ch = [0, 1, 2].map((c) => {
        const a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = d[i * 4 + c];
        return boxBlur(boxBlur(a, W, H, rad), W, H, rad);
      });
      let lab = new Uint8Array(N);
      for (let i = 0; i < N; i++) lab[i] = nearest(pal, ch[0][i], ch[1][i], ch[2][i]);
      for (let pass = 0; pass < 2; pass++) {
        const next = lab.slice(), cnt = new Uint8Array(pal.length), R = Math.max(1, Math.round(sc * 3));
        for (let y = R; y < H - R; y += 1) for (let x = R; x < W - R; x += 1) {
          cnt.fill(0);
          for (let j = -R; j <= R; j += R) for (let i = -R; i <= R; i += R) cnt[lab[(y + j) * W + x + i]]++;
          let b = 0; for (let c = 1; c < pal.length; c++) if (cnt[c] > cnt[b]) b = c;
          next[y * W + x] = b;
        }
        lab = next;
      }
      cache.pal = pal; cache.lab = lab; cache.key = key;
    }
    const { pal, lab } = cache;
    // 2. height: every region is its own pillow (its mask, blurred, so the middle is high and the rim falls away)
    const rad = Math.max(2, Math.round((3 + (p.puff / 100) * 16) * sc)), hgt = new Float32Array(N);
    for (let c = 0; c < pal.length; c++) {
      const m = new Float32Array(N); let any = false;
      for (let i = 0; i < N; i++) if (lab[i] === c) { m[i] = 1; any = true; }
      if (!any) continue;
      const b = boxBlur(boxBlur(m, W, H, rad), W, H, rad);
      for (let i = 0; i < N; i++) if (lab[i] === c) hgt[i] = Math.pow(b[i], 1.5);
    }
    // thumb dents: soft round hollows at random places
    const r = rng(p.seed * 13 + 3), nd = Math.round((p.dents / 100) * 46), dentR = [];
    for (let i = 0; i < nd; i++) dentR.push([r() * W, r() * H, (10 + r() * 22) * sc, 0.12 + r() * 0.2]);
    for (const [cx, cy, rr, amp] of dentR) {
      const x0 = Math.max(0, (cx - rr * 2) | 0), x1 = Math.min(W - 1, (cx + rr * 2) | 0), y0 = Math.max(0, (cy - rr * 2) | 0), y1 = Math.min(H - 1, (cy + rr * 2) | 0);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const q = ((x - cx) * (x - cx) + (y - cy) * (y - cy)) / (rr * rr); hgt[y * W + x] -= amp * Math.exp(-q); }
    }
    // a little hand-worked unevenness
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) hgt[y * W + x] += (vnoise(x * 0.09 / sc, y * 0.09 / sc, 4) - 0.5) * 0.05 + (vnoise(x * 0.35 / sc, y * 0.35 / sc, 8) - 0.5) * 0.02;
    const { sx, sy } = slopes(hgt, W, H, (2 + (p.puff / 100) * 10) * sc * 4);
    const a = (p.angle * Math.PI) / 180;
    let lx = Math.cos(a), ly = -Math.sin(a), lz = 0.75; const ln = Math.hypot(lx, ly, lz); lx /= ln; ly /= ln; lz /= ln;
    const hx = lx, hy = ly, hz = lz + 1, hn = Math.hypot(hx, hy, hz), gl = p.gloss / 100;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, c = pal[lab[i]];
      let nx = sx[i], ny = sy[i]; const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= nl; ny *= nl; const nz = nl;
      const diff = Math.max(0, nx * lx + ny * ly + nz * lz), spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hn), 42) * gl * 0.9;
      // seams between pieces are creased: dark where a neighbour is another colour
      const l = lab[i], seam = (x < W - 2 && lab[i + 2] !== l) || (y < H - 2 && lab[i + 2 * W] !== l) || (x > 1 && lab[i - 2] !== l) || (y > 1 && lab[i - 2 * W] !== l) ? 0.72 : 1;
      const shade = (0.34 + 0.8 * diff) * (0.78 + 0.22 * Math.min(1, hgt[i] + 0.2)) * seam, grain = 1 + (hash2(x, y, 3) - 0.5) * 0.03, o = i * 4;
      o4[o] = c[0] * shade * grain + spec * 255; o4[o + 1] = c[1] * shade * grain + spec * 255; o4[o + 2] = c[2] * shade * grain + spec * 255; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
