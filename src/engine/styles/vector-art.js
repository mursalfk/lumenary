// src/engine/styles/vector-art.js
import { still, boxBlur, clamp } from '../utils.js';
import { pixels, kmeans, paintPixels } from '../helpers.js';

// Blur the three colour channels of RGBA data in plain JS (canvas `filter` is missing in Safari).
function blurRGB(d, W, H, r, sat = 1) {
  const n = W * H, R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n);
  for (let i = 0; i < n; i++) { R[i] = d[i * 4]; G[i] = d[i * 4 + 1]; B[i] = d[i * 4 + 2]; }
  const br = boxBlur(R, W, H, r), bg = boxBlur(G, W, H, r), bb = boxBlur(B, W, H, r), out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const l = 0.299 * br[i] + 0.587 * bg[i] + 0.114 * bb[i];
    out[i * 4] = l + (br[i] - l) * sat; out[i * 4 + 1] = l + (bg[i] - l) * sat; out[i * 4 + 2] = l + (bb[i] - l) * sat; out[i * 4 + 3] = 255;
  }
  return out;
}

export default still({
  id: 'vector-art',
  name: 'Vector Art',
  blurb: 'Flat colour shapes with clean edges and no gradients, like an illustration exported as SVG.',
  maxSide: 1000,
  params: [
    { key: 'colors', label: 'Colours', type: 'range', min: 3, max: 12, step: 1, default: 7 },
    { key: 'smooth', label: 'Edge smoothing', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'outline', label: 'Outline', type: 'range', min: 0, max: 100, step: 1, default: 25 },
    { key: 'sat', label: 'Saturation', type: 'range', min: 60, max: 180, step: 1, default: 115 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const src = pixels(work, W, H, cache).data;
    // smooth first, so noise does not become little islands
    const px = blurRGB(src, W, H, Math.round((p.smooth / 100) * Math.min(W, H) * 0.006), p.sat / 100);
    const cent = kmeans(px, p.colors, 3, 8, 5);
    const idx = new Uint8Array(W * H);
    const snap = (buf, x, y, o) => {
      const i = y * W + x; let b = 0, bd = 1e9;
      for (let c = 0; c < cent.length; c++) { const dr = buf[i * 4] - cent[c][0], dg = buf[i * 4 + 1] - cent[c][1], db = buf[i * 4 + 2] - cent[c][2], d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; b = c; } }
      idx[i] = b; o[0] = cent[b][0]; o[1] = cent[b][1]; o[2] = cent[b][2];
    };
    let flat = new Uint8ClampedArray(W * H * 4);
    paintPixels(ctx, W, H, (x, y, o) => { snap(px, x, y, o); const i = (y * W + x) * 4; flat[i] = o[0]; flat[i + 1] = o[1]; flat[i + 2] = o[2]; flat[i + 3] = 255; });
    // rounded edges: blur the flat image, then snap each pixel back to the nearest palette colour
    if (p.smooth > 20) {
      const bx = blurRGB(flat, W, H, Math.max(1, Math.round((p.smooth / 100) * 3)));
      paintPixels(ctx, W, H, (x, y, o) => snap(bx, x, y, o));
    }
    if (p.outline > 0) {
      const a = p.outline / 100, lw = Math.max(1, (Math.min(W, H) / 700) * (1 + a * 2));
      const img = ctx.getImageData(0, 0, W, H), d = img.data, step = Math.max(1, Math.round(lw));
      for (let y = step; y < H - step; y++) for (let x = step; x < W - step; x++) {
        const i = y * W + x;
        if (idx[i] !== idx[i + step] || idx[i] !== idx[i + step * W]) { const o = i * 4; d[o] *= 0.28; d[o + 1] *= 0.28; d[o + 2] *= 0.3; }
      }
      ctx.putImageData(img, 0, 0);
    }
  },
});
