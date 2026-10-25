// src/engine/helpers.js
// Building blocks shared by the newer treatments. Pure JS, no DOM.
import { clamp, hexToRgb, rng, hash2, lumArray, boxBlur, sobel, smoothstep, vnoise } from './utils.js';

// Pixel data of the working canvas, read once and kept in `cache`.
export function pixels(work, W, H, cache) {
  if (!cache.px) {
    cache.px = work.getContext('2d').getImageData(0, 0, W, H);
    cache.L = lumArray(cache.px);
  }
  return cache.px;
}

// Parse a list of "#rrggbb" strings once.
export const rgbList = (hexes) => hexes.map(hexToRgb);

// Colour ramp: t in 0..1 over evenly spaced stops (each [r,g,b]); writes into `out`.
export function ramp(stops, t, out) {
  const n = stops.length - 1;
  const f = clamp(t) * n, i = Math.min(n - 1, f | 0), k = f - i;
  const a = stops[i], b = stops[i + 1];
  out[0] = a[0] + (b[0] - a[0]) * k;
  out[1] = a[1] + (b[1] - a[1]) * k;
  out[2] = a[2] + (b[2] - a[2]) * k;
  return out;
}

// Index of the palette colour nearest to r,g,b (squared distance, redmean-weighted).
export function nearest(pal, r, g, b) {
  let best = 0, bd = 1e12;
  for (let i = 0; i < pal.length; i++) {
    const p = pal[i], rm = (r + p[0]) / 2;
    const dr = r - p[0], dg = g - p[1], db = b - p[2];
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

// Contrast about the middle grey, on a 0..1 value. amount -1..1.
export const contrast = (v, amount) => clamp((v - 0.5) * (1 + amount) + 0.5);

// Write a full-canvas ImageData built by `fn(x, y, out)` (out = [r,g,b] 0..255).
export function paintPixels(ctx, W, H, fn) {
  const img = ctx.createImageData(W, H), d = img.data, o = [0, 0, 0];
  for (let y = 0, k = 0; y < H; y++) {
    for (let x = 0; x < W; x++, k += 4) {
      fn(x, y, o);
      d[k] = o[0]; d[k + 1] = o[1]; d[k + 2] = o[2]; d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

// Film-style grain laid over whatever is on the canvas.
export function addGrain(ctx, W, H, amount, seed = 5) {
  if (amount <= 0) return;
  const img = ctx.getImageData(0, 0, W, H), d = img.data, r = rng(seed);
  const a = amount * 60;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * a;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

// Soft vignette.
export function vignette(ctx, W, H, strength, color = '0,0,0') {
  if (strength <= 0) return;
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.55);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(1, `rgba(${color},${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Luminance with the darkest and lightest 2% clipped, then stretched to 0..1.
export function stretch(L, lo = 0.02, hi = 0.98) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < L.length; i++) hist[Math.min(255, (L[i] * 255) | 0)]++;
  let acc = 0, a = 0, b = 255;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= L.length * lo) { a = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= L.length * (1 - hi)) { b = i; break; } }
  const out = new Float32Array(L.length), lo0 = a / 255, span = Math.max(0.08, (b - a) / 255);
  for (let i = 0; i < L.length; i++) out[i] = clamp((L[i] - lo0) / span);
  return out;
}
export function stretchedL(cache) { return cache.Ls || (cache.Ls = stretch(cache.L)); }

// Slopes of a height map by central differences, scaled by k: (sx, sy) so the surface normal is (sx, sy, 1) normalised.
export function slopes(h, W, H, k) {
  const sx = new Float32Array(W * H), sy = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const ym = Math.max(0, y - 1) * W, yp = Math.min(H - 1, y + 1) * W, yc = y * W;
    for (let x = 0; x < W; x++) {
      const xm = Math.max(0, x - 1), xp = Math.min(W - 1, x + 1), i = yc + x;
      sx[i] = -(h[yc + xp] - h[yc + xm]) * 0.5 * k;
      sy[i] = -(h[yp + x] - h[ym + x]) * 0.5 * k;
    }
  }
  return { sx, sy };
}

// Nearest-cell noise on a jittered grid of spacing s: returns [distance to nearest site, distance to second nearest, nearest id]
// and the nearest site's x and y, written into `out`. Cheap Voronoi, used for leather grain, foil facets and glass pieces.
export function cellular(x, y, s, seed, out) {
  const gx = Math.floor(x / s), gy = Math.floor(y / s);
  let d1 = 1e9, d2 = 1e9, id = 0, sx = 0, sy = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = gx + i, cy = gy + j;
    const px = (cx + hash2(cx, cy, seed)) * s, py = (cy + hash2(cx, cy, seed + 101)) * s;
    const d = (x - px) * (x - px) + (y - py) * (y - py);
    if (d < d1) { d2 = d1; d1 = d; id = cx * 7919 + cy * 104729; sx = px; sy = py; } else if (d < d2) d2 = d;
  }
  out[0] = Math.sqrt(d1); out[1] = Math.sqrt(d2); out[2] = id; out[3] = sx; out[4] = sy;
  return out;
}

// Blurred copy of the luminance map, cached by radius.
export function blurredL(cache, W, H, r) {
  const key = 'bl' + r;
  if (!cache[key]) cache[key] = boxBlur(boxBlur(cache.L, W, H, r), W, H, r);
  return cache[key];
}

// k-means on RGB samples (Uint8 data, every `stride` pixels). Returns k centres as [r,g,b].
export function kmeans(data, k, seed = 1, iters = 8, stride = 7) {
  const r = rng(seed), n = (data.length / 4) | 0, pts = [];
  for (let i = 0; i < n; i += stride) pts.push(i * 4);
  let cs = [];
  for (let i = 0; i < k; i++) { const p = pts[(r() * pts.length) | 0]; cs.push([data[p], data[p + 1], data[p + 2]]); }
  for (let it = 0; it < iters; it++) {
    const sum = cs.map(() => [0, 0, 0, 0]);
    for (const p of pts) {
      let b = 0, bd = 1e12;
      for (let c = 0; c < k; c++) {
        const dr = data[p] - cs[c][0], dg = data[p + 1] - cs[c][1], db = data[p + 2] - cs[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bd) { bd = d; b = c; }
      }
      const s = sum[b]; s[0] += data[p]; s[1] += data[p + 1]; s[2] += data[p + 2]; s[3]++;
    }
    cs = cs.map((c, i) => (sum[i][3] ? [sum[i][0] / sum[i][3], sum[i][1] / sum[i][3], sum[i][2] / sum[i][3]] : c));
  }
  return cs.sort((a, b) => a[0] * 0.3 + a[1] * 0.59 + a[2] * 0.11 - (b[0] * 0.3 + b[1] * 0.59 + b[2] * 0.11));
}

// Draw `text` centred at x,y with the given CSS font.
export function label(ctx, text, x, y, font, color, align = 'center', base = 'middle') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillText(text, x, y);
}

// A flat-shaded ImageData -> canvas, upscaled with or without smoothing.
export function blit(env, ctx, img, W, H, smooth = false) {
  const c = env.makeCanvas(img.width, img.height);
  c.getContext('2d').putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = smooth;
  ctx.drawImage(c, 0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
}

// Edge map as a transparent canvas of `color` lines. `thr` ~0.05..0.4, `r` blur radius first.
export function edgeCanvas(env, L, W, H, { r = 2, thr = 0.12, color = '#ffffff' } = {}) {
  const { mag } = sobel(boxBlur(L, W, H, r), W, H, 1);
  const [cr, cg, cb] = hexToRgb(color);
  const c = env.makeCanvas(W, H), x = c.getContext('2d'), img = x.createImageData(W, H), d = img.data;
  for (let i = 0; i < W * H; i++) {
    d[i * 4] = cr; d[i * 4 + 1] = cg; d[i * 4 + 2] = cb;
    d[i * 4 + 3] = smoothstep(thr, thr * 2.2, mag[i]) * 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

// Draw `layer` with a glow: the layer itself plus blurred (down/up scaled) copies added on top.
export function glowDraw(env, ctx, layer, W, H, amount = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(layer, 0, 0, W, H);
  for (const k of [4, 10]) {
    const s = env.makeCanvas(Math.max(2, W / k), Math.max(2, H / k)), sx = s.getContext('2d');
    sx.imageSmoothingQuality = 'high';
    sx.drawImage(layer, 0, 0, s.width, s.height);
    ctx.globalAlpha = 0.9 * amount;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(s, 0, 0, W, H);
  }
  ctx.restore();
}

// A rounded-rectangle sub-path that does NOT start a new path (unlike utils.roundRect), so it can be combined
// with other sub-paths, for example to cut a window out of a frame with the even-odd rule.
export function rrPath(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// The R, G and B channels of an ImageData as three float arrays, each blurred `passes` times with a box blur of radius r.
export function blurRGB(d, W, H, r, passes = 2) {
  const N = W * H, out = [];
  for (let c = 0; c < 3; c++) {
    let a = new Float32Array(N);
    for (let i = 0; i < N; i++) a[i] = d[i * 4 + c];
    for (let k = 0; k < passes; k++) a = boxBlur(a, W, H, r);
    out.push(a);
  }
  return out;
}

// Bilinear sample of ImageData data at (x, y), written into out = [r, g, b].
export function bilinearRGB(d, W, H, x, y, out) {
  x = clamp(x, 0, W - 1); y = clamp(y, 0, H - 1);
  const x0 = x | 0, y0 = y | 0, x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1), fx = x - x0, fy = y - y0;
  const a = (y0 * W + x0) * 4, b = (y0 * W + x1) * 4, c = (y1 * W + x0) * 4, e = (y1 * W + x1) * 4;
  for (let k = 0; k < 3; k++) out[k] = (d[a + k] * (1 - fx) + d[b + k] * fx) * (1 - fy) + (d[c + k] * (1 - fx) + d[e + k] * fx) * fy;
  return out;
}

// Fractal noise: `oct` layers of smooth value noise, each at twice the frequency and half the weight. Returns 0..1.
export function fbm(x, y, seed = 0, oct = 4) {
  let a = 0.5, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += a * vnoise(x * f, y * f, seed + i * 17); norm += a; a *= 0.5; f *= 2; }
  return sum / norm;
}

// Which of the sites (sx[i], sy[i]) is nearest to each pixel: the jump flooding algorithm, which is approximate but fast.
// Returns an Int32Array of site indices.
export function voronoiLabels(sx, sy, W, H) {
  const N = W * H;
  let src = new Int32Array(N).fill(-1), dst = new Int32Array(N);
  for (let i = 0; i < sx.length; i++) {
    const x = clamp(Math.round(sx[i]), 0, W - 1), y = clamp(Math.round(sy[i]), 0, H - 1);
    src[y * W + x] = i;
  }
  let step = 1;
  while (step * 2 < Math.max(W, H)) step *= 2;
  const passes = [];
  for (let s = step; s >= 1; s >>= 1) passes.push(s);
  passes.push(2, 1);
  for (const s of passes) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let best = src[i], bd = best >= 0 ? (x - sx[best]) * (x - sx[best]) + (y - sy[best]) * (y - sy[best]) : 1e18;
      for (let j = -1; j <= 1; j++) {
        const yy = y + j * s; if (yy < 0 || yy >= H) continue;
        for (let k = -1; k <= 1; k++) {
          const xx = x + k * s; if (xx < 0 || xx >= W) continue;
          const l = src[yy * W + xx]; if (l < 0) continue;
          const dd = (x - sx[l]) * (x - sx[l]) + (y - sy[l]) * (y - sy[l]);
          if (dd < bd) { bd = dd; best = l; }
        }
      }
      dst[i] = best;
    }
    const t = src; src = dst; dst = t;
  }
  return src;
}

// Marching squares: the line segments where the field F crosses `level`, on a grid of `step` pixels.
// Returns a flat array [x0, y0, x1, y1, ...]. Points on a shared cell edge come out identical, so segments can be chained.
export function marching(F, W, H, level, step = 2) {
  const segs = [], cw = Math.floor((W - 1) / step), ch = Math.floor((H - 1) / step);
  const t = (p, q) => (level - p) / (q - p);
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const x0 = i * step, y0 = j * step, x1 = x0 + step, y1 = y0 + step;
    const a = F[y0 * W + x0], b = F[y0 * W + x1], c = F[y1 * W + x1], d = F[y1 * W + x0];
    const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
    if (idx === 0 || idx === 15) continue;
    const T = [x0 + step * t(a, b), y0], R = [x1, y0 + step * t(b, c)], B = [x0 + step * t(d, c), y1], L = [x0, y0 + step * t(a, d)];
    const add = (p, q) => segs.push(p[0], p[1], q[0], q[1]);
    switch (idx) {
      case 1: case 14: add(L, B); break;
      case 2: case 13: add(B, R); break;
      case 3: case 12: add(L, R); break;
      case 4: case 11: add(T, R); break;
      case 6: case 9: add(T, B); break;
      case 7: case 8: add(T, L); break;
      case 5: if ((a + b + c + d) / 4 > level) { add(T, L); add(B, R); } else { add(T, R); add(L, B); } break;
      case 10: if ((a + b + c + d) / 4 > level) { add(T, R); add(L, B); } else { add(T, L); add(B, R); } break;
      default: break;
    }
  }
  return segs;
}

// Joins marching-squares segments end to end into polylines (arrays of [x, y]).
export function chainSegments(segs) {
  const key = (x, y) => x.toFixed(3) + '|' + y.toFixed(3), n = segs.length / 4, ends = new Map(), used = new Uint8Array(n);
  const put = (k, i) => { const l = ends.get(k); if (l) l.push(i); else ends.set(k, [i]); };
  for (let i = 0; i < n; i++) { put(key(segs[i * 4], segs[i * 4 + 1]), i); put(key(segs[i * 4 + 2], segs[i * 4 + 3]), i); }
  const lines = [];
  const next = (k) => { const l = ends.get(k); if (!l) return -1; while (l.length) { const i = l.pop(); if (!used[i]) return i; } return -1; };
  for (let i = 0; i < n; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [[segs[i * 4], segs[i * 4 + 1]], [segs[i * 4 + 2], segs[i * 4 + 3]]];
    for (const dir of [1, 0]) {
      for (;;) {
        const e = dir ? line[line.length - 1] : line[0], j = next(key(e[0], e[1]));
        if (j < 0) break;
        used[j] = 1;
        const p = [segs[j * 4], segs[j * 4 + 1]], q = [segs[j * 4 + 2], segs[j * 4 + 3]];
        const far = key(p[0], p[1]) === key(e[0], e[1]) ? q : p;
        if (dir) line.push(far); else line.unshift(far);
      }
    }
    lines.push(line);
  }
  return lines;
}

// Smoothed colour and tone lookups around a point: `rgb(x, y)` returns [r, g, b] (a shared array, copy it if you keep it)
// and `tone(x, y)` the stretched luminance 0..1. Only the most recent radius is kept in `cache`.
export function sampler(cache, d, W, H, r) {
  r = Math.max(1, Math.round(r));
  const key = r + '|' + W;
  if (cache.smpKey === key) return cache.smp;
  const ch = blurRGB(d, W, H, r, 2), Lb = boxBlur(boxBlur(stretchedL(cache), W, H, r), W, H, r), out = [0, 0, 0];
  const idx = (x, y) => (y < 0 ? 0 : y >= H ? H - 1 : y | 0) * W + (x < 0 ? 0 : x >= W ? W - 1 : x | 0);
  cache.smp = {
    ch, L: Lb,
    rgb(x, y) { const i = idx(x, y); out[0] = ch[0][i]; out[1] = ch[1][i]; out[2] = ch[2][i]; return out; },
    tone(x, y) { return Lb[idx(x, y)]; },
  };
  cache.smpKey = key;
  return cache.smp;
}
