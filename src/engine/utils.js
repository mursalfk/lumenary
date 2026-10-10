// Shared helpers for every style. Pure JS, no DOM: canvases come from `env.makeCanvas`.

export const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function rng(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cheap integer hash -> [0,1)
export function hash2(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function hexToRgb(h) {
  h = String(h || '#000000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgbCss = (r, g, b, a = 1) =>
  a === 1 ? `rgb(${r | 0},${g | 0},${b | 0})` : `rgba(${r | 0},${g | 0},${b | 0},${a})`;

export function hsl2rgb(h, s, l) {
  h = ((h % 1) + 1) % 1;
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}
export function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

export const lumOf = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

export function fitSize(w, h, maxSide) {
  // Downscale only: a small source is never blown up, large ones are fitted to the style's working size.
  const k = Math.min(1, maxSide / Math.max(w, h));
  return { w: Math.max(2, Math.round(w * k)), h: Math.max(2, Math.round(h * k)) };
}

// Resample a canvas to w x h, halving step by step so large photos average instead of alias.
export function scaleCanvas(env, src, w, h) {
  let cur = src;
  while (cur.width / 2 >= w && cur.height / 2 >= h) {
    const c = env.makeCanvas(Math.max(w, Math.ceil(cur.width / 2)), Math.max(h, Math.ceil(cur.height / 2)));
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = 'high';
    x.drawImage(cur, 0, 0, c.width, c.height);
    cur = c;
  }
  const out = env.makeCanvas(w, h);
  const ox = out.getContext('2d');
  ox.imageSmoothingEnabled = true;
  ox.imageSmoothingQuality = 'high';
  ox.drawImage(cur, 0, 0, w, h);
  return out;
}

export function sampleImage(env, src, w, h) {
  const c = scaleCanvas(env, src, Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  return c.getContext('2d').getImageData(0, 0, c.width, c.height);
}

export function lumArray(img) {
  const d = img.data, n = img.width * img.height, L = new Float32Array(n);
  for (let i = 0; i < n; i++) L[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
  return L;
}

export function boxBlur(src, w, h, r) {
  r = Math.round(r);
  if (r < 1) return Float32Array.from(src);
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), d = 2 * r + 1;
  const cl = (v, m) => (v < 0 ? 0 : v > m ? m : v);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let i = -r; i <= r; i++) acc += src[row + cl(i, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc / d;
      acc += src[row + cl(x + r + 1, w - 1)] - src[row + cl(x - r, w - 1)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let i = -r; i <= r; i++) acc += tmp[cl(i, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / d;
      acc += tmp[cl(y + r + 1, h - 1) * w + x] - tmp[cl(y - r, h - 1) * w + x];
    }
  }
  return out;
}

export function blur2(src, w, h, r) {
  return boxBlur(boxBlur(src, w, h, r), w, h, r);
}

// Sobel on a luminance array. mag is roughly 0..1.
export function sobel(L, w, h, s = 1) {
  const mag = new Float32Array(w * h), gx = new Float32Array(w * h), gy = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - s) * w, y1 = Math.min(h - 1, y + s) * w, yc = y * w;
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - s), x1 = Math.min(w - 1, x + s);
      const a = L[y0 + x0], b = L[y0 + x], c = L[y0 + x1];
      const d = L[yc + x0], f = L[yc + x1];
      const g = L[y1 + x0], hh = L[y1 + x], i = L[y1 + x1];
      const sx = c + 2 * f + i - (a + 2 * d + g);
      const sy = g + 2 * hh + i - (a + 2 * b + c);
      const k = yc + x;
      gx[k] = sx; gy[k] = sy; mag[k] = Math.sqrt(sx * sx + sy * sy) / 4;
    }
  }
  return { mag, gx, gy };
}

export function bilinear(A, w, h, x, y) {
  x = clamp(x, 0, w - 1); y = clamp(y, 0, h - 1);
  const x0 = x | 0, y0 = y | 0, x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const fx = x - x0, fy = y - y0;
  const a = A[y0 * w + x0], b = A[y0 * w + x1], c = A[y1 * w + x0], d = A[y1 * w + x1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

// Smooth 2D value noise, 0..1
export function vnoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed), c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Wraps a still style. `render(ctx, work, p, env, W, H, cache)` runs whenever the source or params change.
export function still(def) {
  return {
    kind: 'still',
    maxSide: 1100,
    ...def,
    create(env) {
      let work = null, p = {}, W = 0, H = 0, cache = {};
      return {
        animated: false,
        setSource(w, ww, hh) { work = w; W = ww; H = hh; cache = {}; },
        setParams(np) { p = np; },
        draw(ctx) { if (work) def.render(ctx, work, p, env, W, H, cache); },
        dispose() {},
      };
    },
  };
}
