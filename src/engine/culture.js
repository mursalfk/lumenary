// src/engine/culture.js
// Shared building blocks for the cultural treatments (sections K, L and M): palette snapping, region clean-up,
// outlines, paper and cloth grain, and a few ornament shapes. Pure JS, no DOM.
import { clamp, rgb2hsl, hsl2rgb, hash2, vnoise, smoothstep, boxBlur, TAU } from './utils.js';
import { nearest, fbm, slopes } from './helpers.js';

// "rgb(...)" string from a [r, g, b] array.
export const css = (c, a = 1) => (a === 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);

// Blend two colours.
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Scale a colour by a brightness factor.
export const shade = (c, k) => [clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)];

// Push a colour toward full saturation (and optionally lighter or darker) so it picks a bold palette entry. Written into `out`.
export function vivid(c, sat = 1.3, light = 0, out = [0, 0, 0]) {
  const [h, s, l] = rgb2hsl(c[0], c[1], c[2]);
  const o = hsl2rgb(h, clamp(s * sat + 0.04), clamp(l + light));
  out[0] = o[0]; out[1] = o[1]; out[2] = o[2];
  return out;
}

// Index of the nearest palette colour for every pixel of the blurred channels `ch` (three float arrays).
// Colours are quantised to 5 bits per channel and remembered, so each distinct colour is matched once.
export function paletteIdx(ch, W, H, pal, sat = 1.3, light = 0) {
  const N = W * H, out = new Uint8Array(N), lut = new Int16Array(32768).fill(-1), tmp = [0, 0, 0], src = [0, 0, 0];
  for (let i = 0; i < N; i++) {
    const r = ch[0][i] | 0, g = ch[1][i] | 0, b = ch[2][i] | 0, k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let v = lut[k];
    if (v < 0) {
      src[0] = (r & 248) | 4; src[1] = (g & 248) | 4; src[2] = (b & 248) | 4;
      vivid(src, sat, light, tmp);
      v = nearest(pal, tmp[0], tmp[1], tmp[2]);
      lut[k] = v;
    }
    out[i] = v;
  }
  return out;
}

// Majority filter over an index map: each pixel takes the most common index within radius r. Removes specks and rounds corners.
export function modeFilter(idx, W, H, n, r = 2, passes = 1) {
  let src = idx, dst = new Uint8Array(idx.length);
  const cnt = new Uint16Array(n);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < H; y++) {
      const y0 = Math.max(0, y - r), y1 = Math.min(H - 1, y + r);
      for (let x = 0; x < W; x++) {
        const x0 = Math.max(0, x - r), x1 = Math.min(W - 1, x + r);
        cnt.fill(0);
        for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) cnt[src[yy * W + xx]]++;
        let b = src[y * W + x], bc = cnt[b];
        for (let k = 0; k < n; k++) if (cnt[k] > bc) { bc = cnt[k]; b = k; }
        dst[y * W + x] = b;
      }
    }
    const t = src; src = dst; dst = t;
  }
  return src;
}

// Grow a 0/1 mask by r pixels (a square structuring element, done in two passes).
export function dilate(m, W, H, r) {
  if (r < 1) return m;
  const t = new Uint8Array(W * H), o = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = 0;
    for (let k = -r; k <= r && !v; k++) { const xx = x + k; if (xx >= 0 && xx < W && m[y * W + xx]) v = 1; }
    t[y * W + x] = v;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = 0;
    for (let k = -r; k <= r && !v; k++) { const yy = y + k; if (yy >= 0 && yy < H && t[yy * W + x]) v = 1; }
    o[y * W + x] = v;
  }
  return o;
}

// 1 where two neighbouring pixels carry different indices, then thickened by r pixels.
export function edgeMask(idx, W, H, r = 1) {
  const e = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if ((x < W - 1 && idx[i] !== idx[i + 1]) || (y < H - 1 && idx[i] !== idx[i + W])) e[i] = 1;
  }
  return dilate(e, W, H, r);
}

// Soft paper or cloth grain laid over the finished canvas: low-frequency mottling plus fine noise. `amount` about 0..0.2.
export function grain(ctx, W, H, amount = 0.08, seed = 3, scale = 1) {
  if (amount <= 0) return;
  const img = ctx.getImageData(0, 0, W, H), d = img.data, a = amount * 255;
  for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
    const n = (vnoise(x * 0.06 / scale, y * 0.06 / scale, seed) - 0.5) * 0.7 + (hash2(x, y, seed) - 0.5) * 0.5;
    const v = n * a;
    d[k] += v; d[k + 1] += v; d[k + 2] += v;
  }
  ctx.putImageData(img, 0, 0);
}

// A flower of n petals: petal circles around a centre disc.
export function rosette(ctx, cx, cy, R, n, petal, alt, centre, ink) {
  for (let j = 0; j < n; j++) {
    const a = (j / n) * TAU;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R * 0.58, cy + Math.sin(a) * R * 0.58, R * 0.38, 0, TAU);
    ctx.fillStyle = j % 2 ? alt : petal; ctx.fill();
    if (ink) { ctx.strokeStyle = ink; ctx.lineWidth = Math.max(0.8, R * 0.05); ctx.stroke(); }
  }
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.34, 0, TAU); ctx.fillStyle = centre; ctx.fill();
  if (ink) { ctx.strokeStyle = ink; ctx.lineWidth = Math.max(0.8, R * 0.05); ctx.stroke(); }
}

// A pointed leaf from (x, y) with its tip at angle a, length L and width w.
export function leaf(ctx, x, y, a, L, w) {
  const c = Math.cos(a), s = Math.sin(a), px = -s * w, py = c * w;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + c * L * 0.5 + px, y + s * L * 0.5 + py, x + c * L, y + s * L);
  ctx.quadraticCurveTo(x + c * L * 0.5 - px, y + s * L * 0.5 - py, x, y);
  ctx.closePath();
}

// Vertices of an n-pointed star: tips at radius R1, notches at R2.
export function starPoints(cx, cy, R1, R2, n, rot = 0) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n, r = i % 2 ? R2 : R1;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// Fill (and optionally stroke) a polygon.
export function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

// Radius of an n-pointed star's outline at angle a: tips R1 at angle 0, notches R2 at angle pi/n.
export function starRadius(a, n, R1, R2) {
  const sector = TAU / n;
  let t = ((a % sector) + sector) % sector;
  if (t > sector / 2) t = sector - t;
  const nt = Math.PI / n, px = R2 * Math.cos(nt) - R1, py = R2 * Math.sin(nt);
  const cr = R1 * py;                                   // cross(P1, P2)
  const den = Math.cos(t) * py - Math.sin(t) * px;      // cross(d, P2 - P1)
  return cr / den;
}

// Woven cloth: two dyes mottled by low-frequency noise, with a fine weave pattern. `a` and `b` are [r, g, b].
export function clothFill(ctx, W, H, a, b, sc = 1, seed = 2, weave = 0.06) {
  const img = ctx.createImageData(W, H), o = img.data;
  for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
    const t = fbm(x / (110 * sc), y / (110 * sc), seed, 3), w = 1 + weave * Math.sin((x * Math.PI) / (1.7 * sc)) * Math.sin((y * Math.PI) / (1.7 * sc)) + (hash2(x, y, seed) - 0.5) * weave * 0.7;
    o[k] = (a[0] + (b[0] - a[0]) * t) * w; o[k + 1] = (a[1] + (b[1] - a[1]) * t) * w; o[k + 2] = (a[2] + (b[2] - a[2]) * t) * w; o[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// Fill a shape of changing width along a path. `pts` is [[x, y], ...]; `wfn(t)` gives the width at t from 0 to 1.
export function ribbon(ctx, pts, wfn) {
  const n = pts.length, A = [], B = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
    let dx = p1[0] - p0[0], dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const w = wfn(n > 1 ? i / (n - 1) : 0) / 2;
    A.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    B.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  ctx.beginPath();
  ctx.moveTo(A[0][0], A[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(A[i][0], A[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(B[i][0], B[i][1]);
  ctx.closePath();
}

// Light a height map as carved stone. `Hh` is the height (float array, higher is nearer the viewer).
// o: { a, b: two stone colours, sc, light: degrees, k: relief strength, wear: 0..1,
//      paint: optional ImageData whose colour and alpha show through where it is opaque }
export function carvedStone(ctx, W, H, Hh, o) {
  const { sx, sy } = slopes(Hh, W, H, o.k), Hb = boxBlur(Hh, W, H, Math.max(1, Math.round(3 * o.sc)));
  const ang = (o.light * Math.PI) / 180, Lx = Math.cos(ang), Ly = Math.sin(ang), img = ctx.createImageData(W, H), d = img.data, pd = o.paint ? o.paint.data : null;
  for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
    const m = fbm(x / (45 * o.sc), y / (45 * o.sc), 8, 3), g = 0.93 + 0.14 * hash2(x, y, 6);
    let r = (o.a[0] + (o.b[0] - o.a[0]) * m) * g, gg = (o.a[1] + (o.b[1] - o.a[1]) * m) * g, b = (o.a[2] + (o.b[2] - o.a[2]) * m) * g;
    if (pd && pd[k + 3] > 0) { const q = (pd[k + 3] / 255) * 0.92; r += (pd[k] - r) * q; gg += (pd[k + 1] - gg) * q; b += (pd[k + 2] - b) * q; }
    const ao = clamp((Hb[i] - Hh[i]) * 2.4, 0, 0.55);
    let f = clamp(0.74 + (sx[i] * Lx + sy[i] * Ly) * 0.7, 0.3, 1.45) * (1 - ao);
    if (o.wear > 0.02) {
      const streak = fbm(x / (50 * o.sc), y / (280 * o.sc), 6, 3), lich = fbm(x / (16 * o.sc), y / (16 * o.sc), 9, 3);
      f *= 1 - 0.18 * o.wear * smoothstep(0.52, 0.7, streak);
      if (lich > 0.68) { const q = smoothstep(0.68, 0.78, lich) * 0.3 * o.wear; r += (118 - r) * q; gg += (134 - gg) * q; b += (92 - b) * q; }
    }
    d[k] = r * f; d[k + 1] = gg * f; d[k + 2] = b * f; d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// Wood-grain ground: long streaks along x blended from colour a to b, with a few darker growth lines.
export function woodFill(ctx, W, H, a, b, sc = 1, seed = 4) {
  const img = ctx.createImageData(W, H), o = img.data;
  for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
    const t = fbm(x / (240 * sc), y / (3.2 * sc), seed, 4), ln = 0.5 + 0.5 * Math.sin(y / (9 * sc) + fbm(x / (300 * sc), y / (60 * sc), seed + 1, 3) * 12), f = 0.93 + 0.1 * ln + (hash2(x, y, seed) - 0.5) * 0.04;
    o[k] = (a[0] + (b[0] - a[0]) * t) * f; o[k + 1] = (a[1] + (b[1] - a[1]) * t) * f; o[k + 2] = (a[2] + (b[2] - a[2]) * t) * f; o[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
