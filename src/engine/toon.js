// src/engine/toon.js
// Shared building blocks for the cartoon treatments: a picture reduced to a few flat colour shapes, the ink lines
// inside and between them, the brightest spots, and a soft glow. Pure JS, no DOM beyond `env.makeCanvas`.
import { blur2, rgb2hsl } from './utils.js';
import { modeFilter } from './culture.js';

// Smoothing that keeps edges (a separable bilateral filter). Each pixel becomes the average of the neighbours in
// its row, then its column, that are close to it in colour, so flat areas even out and outlines stay where they are.
// `tol` is how different a neighbour may be (0 to 1) and still count. Returns the three channels as float arrays.
export function smoothKeepEdges(d, W, H, radius, tol = 0.09, passes = 2) {
  const N = W * H, r = Math.max(1, Math.round(radius)), lut = new Float32Array(766), s = 765 * tol;
  for (let i = 0; i < 766; i++) lut[i] = Math.exp(-(i * i) / (2 * s * s));
  let R = new Float32Array(N), G = new Float32Array(N), B = new Float32Array(N);
  let R2 = new Float32Array(N), G2 = new Float32Array(N), B2 = new Float32Array(N);
  for (let i = 0; i < N; i++) { R[i] = d[i * 4]; G[i] = d[i * 4 + 1]; B[i] = d[i * 4 + 2]; }
  for (let pass = 0; pass < passes * 2; pass++) {
    const along = pass % 2 === 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, cr = R[i], cg = G[i], cb = B[i];
      const lo = along ? Math.max(0, x - r) - x : Math.max(0, y - r) - y, hi = along ? Math.min(W - 1, x + r) - x : Math.min(H - 1, y + r) - y, step = along ? 1 : W;
      let sw = 0, sr = 0, sg = 0, sb = 0;
      for (let k = lo; k <= hi; k++) {
        const j = i + k * step, w = lut[(Math.abs(R[j] - cr) + Math.abs(G[j] - cg) + Math.abs(B[j] - cb)) | 0];
        sw += w; sr += R[j] * w; sg += G[j] * w; sb += B[j] * w;
      }
      R2[i] = sr / sw; G2[i] = sg / sw; B2[i] = sb / sw;
    }
    let t = R; R = R2; R2 = t; t = G; G = G2; G2 = t; t = B; B = B2; B2 = t;
  }
  return [R, G, B];
}

// Colour as brightness plus two colour differences, with the differences weighted up. Distances measured this way
// keep a pale skin tone apart from a grey wall of the same brightness, which plain RGB distance does not.
const CW = 1.7;
const feat = (r, g, b, o) => { const y = 0.299 * r + 0.587 * g + 0.114 * b; o[0] = y; o[1] = (b - y) * CW; o[2] = (r - y) * CW; return o; };
const unfeat = (f) => { const r = f[0] + f[2] / CW, b = f[0] + f[1] / CW; return [r, (f[0] - 0.299 * r - 0.114 * b) / 0.587, b].map((v) => Math.max(0, Math.min(255, v))); };

// `k` palette colours for the channels `ch`: k-means on about 20 000 samples. The first centres are spread out by
// always taking the sample farthest from the ones already chosen, so the result does not depend on luck.
// `start` is an optional palette to begin from instead. In a video each frame starts from the palette of the frame
// before, so a paint keeps its place in the palette and drifts with the scene instead of jumping.
export function paletteOf(ch, W, H, k, seed = 3, start = null) {
  const N = W * H, step = Math.max(1, Math.round(Math.sqrt(N / 20000))), pts = [], f = [0, 0, 0];
  for (let y = (seed % step + step) % step; y < H; y += step) for (let x = 0; x < W; x += step) { const i = y * W + x; feat(ch[0][i], ch[1][i], ch[2][i], f); pts.push(f[0], f[1], f[2]); }
  const n = pts.length / 3, near = new Float32Array(n).fill(1e12), carried = !!start && start.length === k;
  let cs = [], pick = ((seed * 7919) % n + n) % n;
  if (carried) cs = start.map((c) => feat(c[0], c[1], c[2], [0, 0, 0]));
  else for (let c = 0; c < k; c++) {
    cs.push([pts[pick * 3], pts[pick * 3 + 1], pts[pick * 3 + 2]]);
    let far = -1;
    for (let i = 0; i < n; i++) {
      const a = pts[i * 3] - cs[c][0], b = pts[i * 3 + 1] - cs[c][1], e = pts[i * 3 + 2] - cs[c][2], dd = a * a + b * b + e * e;
      if (dd < near[i]) near[i] = dd;
      if (near[i] > far) { far = near[i]; pick = i; }
    }
  }
  for (let it = 0; it < (carried ? 3 : 12); it++) {
    const sum = cs.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) {
      let best = 0, bd = 1e12;
      for (let c = 0; c < k; c++) { const a = pts[i * 3] - cs[c][0], b = pts[i * 3 + 1] - cs[c][1], e = pts[i * 3 + 2] - cs[c][2], dd = a * a + b * b + e * e; if (dd < bd) { bd = dd; best = c; } }
      const q = sum[best]; q[0] += pts[i * 3]; q[1] += pts[i * 3 + 1]; q[2] += pts[i * 3 + 2]; q[3]++;
    }
    for (let c = 0; c < k; c++) if (sum[c][3]) cs[c] = [sum[c][0] / sum[c][3], sum[c][1] / sum[c][3], sum[c][2] / sum[c][3]];
  }
  // a carried palette keeps its order, so index 3 is the same paint from one frame to the next
  return (carried ? cs : cs.sort((a, b) => a[0] - b[0])).map(unfeat);
}

// Index of the palette colour nearest to each pixel of `ch`, measured as in `paletteOf`.
export function matchPalette(ch, W, H, pal) {
  const N = W * H, idx = new Uint8Array(N), lut = new Int16Array(32768).fill(-1), f = [0, 0, 0], pf = pal.map((c) => feat(c[0], c[1], c[2], [0, 0, 0]));
  for (let i = 0; i < N; i++) {
    const r = ch[0][i] | 0, g = ch[1][i] | 0, b = ch[2][i] | 0, q = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let v = lut[q];
    if (v < 0) {
      feat((r & 248) | 4, (g & 248) | 4, (b & 248) | 4, f);
      let bd = 1e12; v = 0;
      for (let c = 0; c < pf.length; c++) { const a = f[0] - pf[c][0], e = f[1] - pf[c][1], h = f[2] - pf[c][2], dd = a * a + e * e + h * h; if (dd < bd) { bd = dd; v = c; } }
      lut[q] = v;
    }
    idx[i] = v;
  }
  return idx;
}

// The picture as `k` flat colours. Returns { idx, pal, ch }: a palette index for every pixel, the palette as
// [r, g, b] from dark to light, and the smoothed colour channels the match was made on.
// `soft` is the reach of the edge-keeping smoothing, `clean` the radius of the majority filter that removes specks
// and rounds the shapes off (both in pixels).
// Pass the style's `cache` as the last argument and, in a video, each frame begins from the palette of the one before.
export function flatten(d, W, H, k, soft, clean, seed = 3, cache = null) {
  const ch = smoothKeepEdges(d, W, H, soft, 0.1, 2), pal = paletteOf(ch, W, H, k, seed, cache && cache.last ? cache.last.pal : null), idx = matchPalette(ch, W, H, pal);
  if (cache) cache.keep = { ...cache.keep, pal };
  return { idx: clean >= 1 ? modeFilter(idx, W, H, k, Math.round(clean), 1) : idx, pal, ch };
}

// Dress a palette in the colours of a fixed set (a box of crayons, a basket of wool). Each palette colour gets a
// different colour of the set, chosen so that the order from dark to light is kept and hues stay as close as the
// set allows. Plain "nearest colour" would hand several palette colours the same grey and lose the picture.
export function dress(pal, set) {
  const lum = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2], pl = pal.map(lum), sl = set.map(lum);
  const lo = Math.min(...pl), hi = Math.max(...pl), slo = Math.min(...sl), shi = Math.max(...sl), pairs = [];
  pal.forEach((c, i) => {
    const [h, s] = rgb2hsl(c[0], c[1], c[2]), want = slo + ((pl[i] - lo) / (hi - lo + 1e-6)) * (shi - slo);
    set.forEach((q, j) => {
      const [h2, s2] = rgb2hsl(q[0], q[1], q[2]), dh = Math.min(Math.abs(h - h2), 1 - Math.abs(h - h2));
      // hue only matters when both colours have some; a grey may become any colour of the right brightness
      pairs.push([Math.abs(sl[j] - want) + dh * 420 * Math.min(s, 0.6) * Math.min(1, s2 * 2.5) + Math.abs(s - s2) * 40, i, j]);
    });
  });
  pairs.sort((a, b) => a[0] - b[0]);
  const out = new Array(pal.length), taken = new Set();
  for (const [, i, j] of pairs) { if (out[i] || (taken.has(j) && taken.size < set.length)) continue; out[i] = set[j]; taken.add(j); }
  return out;
}

// Where the picture is darker than its surroundings: thin dark features, and the dark side of every edge.
// Returns the difference of a wide and a fine blur of the tone map L; feed it to smoothstep for a line's opacity.
export function darkLines(L, W, H, fine, wide) {
  const a = blur2(L, W, H, fine), b = blur2(L, W, H, Math.max(1, wide)), out = new Float32Array(W * H);
  for (let i = 0; i < out.length; i++) out[i] = b[i] - a[i];
  return out;
}

// Outlines between flat shapes: strong where two neighbouring pixels carry paints that differ a lot, absent between
// two near-identical paints. Returns a Float32Array from 0 to 1, softened by one pixel so the line is not jagged.
export function shapeLines(idx, pal, W, H, lo = 0.1, hi = 0.28) {
  const k = pal.length, diff = new Float32Array(k * k), e = new Float32Array(W * H);
  for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) {
    const dd = (Math.abs(pal[a][0] - pal[b][0]) + Math.abs(pal[a][1] - pal[b][1]) + Math.abs(pal[a][2] - pal[b][2])) / 765, t = Math.max(0, Math.min(1, (dd - lo) / (hi - lo)));
    diff[a * k + b] = t * t * (3 - 2 * t);
  }
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
    const i = y * W + x, a = idx[i] * k;
    e[i] = Math.max(diff[a + idx[i + 1]], diff[a + idx[i + W]]);
  }
  const soft = blur2(e, W, H, 1);
  for (let i = 0; i < soft.length; i++) soft[i] = Math.min(1, soft[i] * 2.4);
  return soft;
}

// The `n` brightest spots of a tone map that lie at least `gap` pixels apart, as [[x, y, value], ...].
export function brightSpots(L, W, H, n, gap) {
  const cell = Math.max(4, Math.round(gap / 2)), cand = [], picked = [];
  for (let y0 = 0; y0 < H; y0 += cell) for (let x0 = 0; x0 < W; x0 += cell) {
    let bv = -1, bx = 0, by = 0;
    for (let y = y0; y < Math.min(H, y0 + cell); y += 2) for (let x = x0; x < Math.min(W, x0 + cell); x += 2) { const v = L[y * W + x]; if (v > bv) { bv = v; bx = x; by = y; } }
    cand.push([bx, by, bv]);
  }
  cand.sort((a, b) => b[2] - a[2]);
  for (const c of cand) {
    if (picked.length >= n) break;
    if (picked.every((q) => (q[0] - c[0]) ** 2 + (q[1] - c[1]) ** 2 >= gap * gap)) picked.push(c);
  }
  return picked;
}

// A soft glow: the canvas, shrunk and enlarged again so it blurs, screened over itself.
export function bloom(env, ctx, W, H, amount, shrink = 8) {
  if (amount <= 0) return;
  const s = env.makeCanvas(Math.max(2, W / shrink), Math.max(2, H / shrink)), sx = s.getContext('2d');
  sx.imageSmoothingQuality = 'high';
  sx.drawImage(ctx.canvas, 0, 0, s.width, s.height);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = Math.min(1, amount);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(s, 0, 0, W, H);
  ctx.restore();
}
