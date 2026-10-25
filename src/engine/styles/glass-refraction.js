// src/engine/styles/glass-refraction.js
import { still, rng, clamp, smoothstep } from '../utils.js';
import { pixels } from '../helpers.js';

// Bilinear sample of one channel from RGBA bytes.
function bil(d, W, H, x, y, c) {
  x = x < 0 ? 0 : x > W - 1 ? W - 1 : x; y = y < 0 ? 0 : y > H - 1 ? H - 1 : y;
  const x0 = x | 0, y0 = y | 0, x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1), fx = x - x0, fy = y - y0;
  const a = d[(y0 * W + x0) * 4 + c], b = d[(y0 * W + x1) * 4 + c], e = d[(y1 * W + x0) * 4 + c], f = d[(y1 * W + x1) * 4 + c];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (e * (1 - fx) + f * fx) * fy;
}

export default still({
  id: 'glass-refraction',
  name: 'Glass Refraction',
  blurb: 'Your picture seen through ribbed glass, glass beads or soap bubbles, each splitting a little colour at the edges.',
  maxSide: 1000,
  params: [
    { key: 'mode', label: 'Glass', type: 'select', default: 'reeded', options: [['reeded', 'Ribbed'], ['ball', 'Glass beads'], ['bubbles', 'Bubbles']] },
    { key: 'size', label: 'Size', type: 'range', min: 2, max: 20, step: 1, default: 6 },
    { key: 'bend', label: 'Bend', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'split', label: 'Colour split', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'seed', label: 'Rearrange', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const src = pixels(work, W, H, cache).data, out = ctx.createImageData(W, H), d = out.data;
    const bend = p.bend / 100, disp = (p.split / 100) * 0.1, r = rng(p.seed * 23 + 5);
    d.set(src);
    if (p.mode === 'reeded') {
      const w = Math.max(5, (W * p.size) / 100 * 0.9), m = 0.3 + 3.2 * bend;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const rib = Math.floor(x / w), cx = (rib + 0.5) * w, u = ((x - rib * w) / w) * 2 - 1, o = (y * W + x) * 4;
        const shade = 1 - 0.34 * Math.pow(Math.abs(u), 5) + 0.07 * u * (1 - Math.abs(u));
        for (let c = 0; c < 3; c++) {
          const f = 1 + (c - 1) * -disp * 2, sx = cx - u * (w / 2) * m * f;
          d[o + c] = bil(src, W, H, sx, y, c) * shade + Math.max(0, u - 0.82) * 80;
        }
      }
    } else {
      const lenses = [];
      const s = Math.max(10, (W * p.size) / 100 * (p.mode === 'ball' ? 1.7 : 1));
      if (p.mode === 'ball') {
        const dy = s * 0.866;
        for (let j = -1; j * dy < H + s; j++) for (let i = -1; i * s < W + s; i++) lenses.push([i * s + (j & 1 ? s / 2 : 0) + s / 2, j * dy + s / 2, s * 0.5 * 0.96]);
        // the sheet between the beads is dark
        for (let i = 0; i < d.length; i += 4) { d[i] *= 0.28; d[i + 1] *= 0.28; d[i + 2] *= 0.28; }
      } else {
        const n = Math.round(10 + (W * H) / (s * s) * 0.9);
        for (let i = 0; i < n; i++) lenses.push([r() * W, r() * H, s * (0.25 + Math.pow(r(), 2.2) * 1.3)]);
        lenses.sort((a, b) => b[2] - a[2]);
      }
      const ball = p.mode === 'ball';
      for (const [cx, cy, rad] of lenses) {
        const x0 = Math.max(0, Math.floor(cx - rad)), x1 = Math.min(W - 1, Math.ceil(cx + rad)), y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(H - 1, Math.ceil(cy + rad));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const nx = (x - cx) / rad, ny = (y - cy) / rad, rr = Math.hypot(nx, ny);
          if (rr >= 1) continue;
          const o = (y * W + x) * 4, edge = smoothstep(1, 0.93, rr);
          for (let c = 0; c < 3; c++) {
            const f = 1 + (c - 1) * -disp * 2;
            let sx, sy;
            if (ball) { const k = (0.6 + 1.9 * bend) * f; sx = cx - nx * rad * k; sy = cy - ny * rad * k; }
            else { const q = Math.pow(rr, (1 + bend * 1.1) * (1 + (c - 1) * disp)) / (rr || 1); sx = cx + nx * rad * q; sy = cy + ny * rad * q; }
            let v = bil(src, W, H, sx, sy, c);
            // rim shading, a soft inner shadow and a window-shaped highlight at the top left
            v *= ball ? 0.55 + 0.7 * (1 - rr * rr * 0.55) : 0.9 + 0.15 * rr;
            v += Math.exp(-((nx + 0.36) * (nx + 0.36) + (ny + 0.4) * (ny + 0.4)) / 0.018) * (ball ? 170 : 130);
            if (!ball) v += smoothstep(0.78, 1, rr) * 55 * (0.6 + 0.4 * Math.sin(Math.atan2(ny, nx) * 2 + 0.7));
            d[o + c] = ball ? v * edge + d[o + c] * (1 - edge) : v * edge + d[o + c] * (1 - edge);
          }
        }
      }
    }
    for (let i = 3; i < d.length; i += 4) d[i] = 255;
    ctx.putImageData(out, 0, 0);
  },
});
