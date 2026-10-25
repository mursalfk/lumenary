// src/engine/styles/fractal-flame.js
import { still, rng, clamp, TAU } from '../utils.js';
import { pixels, ramp } from '../helpers.js';

const FAMILIES = { mixed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], smooth: [1, 2, 3, 11, 12], sharp: [4, 6, 7, 8, 9, 10] };
const PALETTES = {
  ember: [[10, 4, 8], [120, 18, 24], [236, 98, 24], [255, 214, 120], [255, 250, 230]],
  aurora: [[4, 10, 24], [18, 80, 120], [40, 190, 170], [160, 120, 230], [250, 240, 255]],
  rose: [[14, 4, 16], [110, 20, 80], [230, 70, 120], [255, 170, 160], [255, 245, 235]],
};
const V = [0, 0];

// One variation from Draves' flame algorithm, written into V.
function vary(k, x, y, om) {
  const r2 = x * x + y * y + 1e-12, r = Math.sqrt(r2), th = Math.atan2(x, y);
  switch (k) {
    case 1: V[0] = Math.sin(x); V[1] = Math.sin(y); break;
    case 2: V[0] = x / r2; V[1] = y / r2; break;
    case 3: { const s = Math.sin(r2), c = Math.cos(r2); V[0] = x * s - y * c; V[1] = x * c + y * s; break; }
    case 4: V[0] = ((x - y) * (x + y)) / r; V[1] = (2 * x * y) / r; break;
    case 5: V[0] = th / Math.PI; V[1] = r - 1; break;
    case 6: V[0] = r * Math.sin(th + r); V[1] = r * Math.cos(th - r); break;
    case 7: V[0] = r * Math.sin(th * r); V[1] = -r * Math.cos(th * r); break;
    case 8: V[0] = (th / Math.PI) * Math.sin(Math.PI * r); V[1] = (th / Math.PI) * Math.cos(Math.PI * r); break;
    case 9: V[0] = (Math.cos(th) + Math.sin(r)) / r; V[1] = (Math.sin(th) - Math.cos(r)) / r; break;
    case 10: { const sr = Math.sqrt(r), a = th / 2 + om; V[0] = sr * Math.cos(a); V[1] = sr * Math.sin(a); break; }
    case 11: { const k4 = 4 / (r2 + 4); V[0] = k4 * x; V[1] = k4 * y; break; }
    case 12: { const k2 = 2 / (r + 1); V[0] = k2 * y; V[1] = k2 * x; break; }
    default: V[0] = x; V[1] = y;
  }
}

function makeIFS(rand, family) {
  const fam = FAMILIES[family] || FAMILIES.mixed, n = 3 + ((rand() * 2) | 0), xf = [];
  for (let i = 0; i < n; i++) {
    const s = 0.5 + rand() * 0.45, t = rand() * TAU, sh = (rand() - 0.5) * 1.2, s2 = s * (0.7 + rand() * 0.5);
    const v1 = fam[(rand() * fam.length) | 0], v2 = fam[(rand() * fam.length) | 0], w1 = 0.45 + rand() * 0.55;
    xf.push({ a: s * Math.cos(t), b: -s * Math.sin(t) + sh * 0.3, c: s2 * Math.sin(t), d: s2 * Math.cos(t), e: (rand() - 0.5) * 2, f: (rand() - 0.5) * 2, v1, v2, w1, w2: 1 - w1, col: i / (n - 1), p: 0.5 + rand(), om: rand() < 0.5 ? 0 : Math.PI });
  }
  const tot = xf.reduce((a, b) => a + b.p, 0); let acc = 0;
  xf.forEach((t) => { acc += t.p / tot; t.cum = acc; });
  return xf;
}

// Runs the chaos game; `plot(x, y, c)` is called for each point after the warm-up.
function run(xf, rand, iters, sym, plot) {
  let x = rand() * 2 - 1, y = rand() * 2 - 1, c = 0.5;
  for (let it = -24; it < iters; it++) {
    const u = rand(); let t = xf[xf.length - 1];
    for (let k = 0; k < xf.length; k++) if (u <= xf[k].cum) { t = xf[k]; break; }
    const px = t.a * x + t.b * y + t.e, py = t.c * x + t.d * y + t.f;
    vary(t.v1, px, py, t.om); const ax = V[0] * t.w1, ay = V[1] * t.w1;
    vary(t.v2, px, py, t.om); x = ax + V[0] * t.w2; y = ay + V[1] * t.w2;
    c = (c + t.col) / 2;
    if (!(Math.abs(x) < 1e6 && Math.abs(y) < 1e6)) { x = rand() * 2 - 1; y = rand() * 2 - 1; continue; }
    if (it >= 0) {
      if (sym > 1) { const a = ((rand() * sym) | 0) * (TAU / sym), ca = Math.cos(a), sa = Math.sin(a); plot(x * ca - y * sa, x * sa + y * ca, c); }
      else plot(x, y, c);
    }
  }
}

export default still({
  id: 'fractal-flame',
  name: 'Fractal Flame',
  blurb: 'A point hops between a few folded transforms a couple of million times. Where it lands often, the picture glows; where it lands rarely, it fades.',
  maxSide: 900,
  params: [
    { key: 'family', label: 'Folds', type: 'select', default: 'mixed', options: [['mixed', 'Mixed'], ['smooth', 'Smooth and round'], ['sharp', 'Sharp and feathered']] },
    { key: 'sym', label: 'Rotational symmetry', type: 'range', min: 1, max: 6, step: 1, default: 1 },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ember', 'Ember'], ['aurora', 'Aurora'], ['rose', 'Rose']] },
    { key: 'quality', label: 'Quality', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'bright', label: 'Brightness', type: 'range', min: 20, max: 100, step: 1, default: 62 },
    { key: 'ghost', label: 'Faint picture behind', type: 'range', min: 0, max: 100, step: 1, default: 18 },
    { key: 'seed', label: 'Grow another', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H;
    const key = [p.family, p.sym, p.seed, p.quality, W].join('|');
    if (cache.key !== key) {
      let seed = p.seed * 977 + 13, xf = null, view = null;
      for (let tries = 0; tries < 60 && !view; tries++, seed += 101) {
        const rand = rng(seed); const cand = makeIFS(rand, p.family), xs = [], ys = [];
        run(cand, rand, 30000, p.sym, (x, y) => { xs.push(x); ys.push(y); });
        const a = Float32Array.from(xs).sort(), b = Float32Array.from(ys).sort(), q = (arr, f) => arr[Math.min(arr.length - 1, (arr.length * f) | 0)];
        const x0 = q(a, 0.03), x1 = q(a, 0.97), y0 = q(b, 0.03), y1 = q(b, 0.97), xr = x1 - x0, yr = y1 - y0;
        if (!(xr > 0.05 && yr > 0.05 && xr < 1e4 && yr < 1e4)) continue;
        const seen = new Set(); for (let i = 0; i < xs.length; i++) seen.add((((xs[i] - x0) / xr * 24) | 0) * 100 + (((ys[i] - y0) / yr * 24) | 0));
        if (seen.size < 130) continue;
        xf = cand; view = { cx: (q(a, 0.5)), cy: (q(b, 0.5)), s: Math.min(W / (xr * 1.2), H / (yr * 1.2)) };
      }
      const cnt = new Float32Array(N), hr = new Float32Array(N), hg = new Float32Array(N), hb = new Float32Array(N);
      if (xf) {
        const rand = rng(seed + 7), iters = Math.round(N * (0.8 + (p.quality / 100) * 3.4)), pal = PALETTES[p.colour], pic = p.colour === 'picture', rgb = [0, 0, 0];
        run(xf, rand, iters, p.sym, (x, y, c) => {
          const px = ((x - view.cx) * view.s + W / 2) | 0, py = ((y - view.cy) * view.s + H / 2) | 0;
          if (px < 0 || py < 0 || px >= W || py >= H) return;
          const i = py * W + px; cnt[i]++;
          if (pic) { hr[i] += d[i * 4]; hg[i] += d[i * 4 + 1]; hb[i] += d[i * 4 + 2]; }
          else { ramp(pal, c, rgb); hr[i] += rgb[0]; hg[i] += rgb[1]; hb[i] += rgb[2]; }
        });
      }
      let mx = 1; for (let i = 0; i < N; i++) if (cnt[i] > mx) mx = cnt[i];
      cache.cnt = cnt; cache.hr = hr; cache.hg = hg; cache.hb = hb; cache.mx = mx; cache.key = key;
    }
    const { cnt, hr, hg, hb, mx } = cache, lm = Math.log1p(mx), br = 0.5 + (p.bright / 100) * 1.4, ghost = (p.ghost / 100) * 0.35, out = ctx.createImageData(W, H), o4 = out.data;
    for (let i = 0; i < N; i++) {
      const o = i * 4, c = cnt[i];
      let R = 6 + d[o] * ghost, G = 6 + d[o + 1] * ghost, B = 10 + d[o + 2] * ghost;
      if (c > 0) {
        const t = clamp(Math.pow(Math.log1p(c) / lm, 0.72) * br), k = t / c;
        R = R * (1 - t) + hr[i] * k * 1.25; G = G * (1 - t) + hg[i] * k * 1.25; B = B * (1 - t) + hb[i] * k * 1.25;
        const hot = Math.pow(t, 3.5) * 0.35; R += 255 * hot; G += 255 * hot; B += 255 * hot;
      }
      o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
