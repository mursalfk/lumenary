// src/engine/helpers.js
// Building blocks shared by the newer treatments. Pure JS, no DOM.
import { clamp, hexToRgb, rng, lumArray, boxBlur, sobel, smoothstep } from './utils.js';

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
