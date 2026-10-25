// src/engine/styles/stained-glass.js
import { still, vnoise, boxBlur, smoothstep, clamp, rgb2hsl, hsl2rgb } from '../utils.js';
import { pixels, cellular } from '../helpers.js';

export default still({
  id: 'stained-glass',
  name: 'Stained Glass',
  blurb: 'Your picture cut into pieces of coloured glass set in dark lead, lit from behind.',
  maxSide: 1000,
  params: [
    { key: 'pieces', label: 'Pieces across', type: 'range', min: 8, max: 44, step: 1, default: 16 },
    { key: 'lead', label: 'Lead width', type: 'range', min: 1, max: 10, step: 1, default: 6 },
    { key: 'glow', label: 'Backlight', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'ripple', label: 'Glass ripple', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'seed', label: 'Re-cut', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800, s = W / p.pieces, seed = p.seed * 13 + 1;
    // colour of every piece: the picture blurred to about the piece size, read at the piece's centre
    const rad = Math.max(1, Math.round(s * 0.28)), ch = [0, 1, 2].map((c) => { const a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = d[i * 4 + c]; return boxBlur(boxBlur(a, W, H, rad), W, H, rad); });
    const lead = p.lead * sc * 0.9, glow = p.glow / 100, rp = p.ripple / 100, c5 = [0, 0, 0, 0, 0], cache2 = new Map();
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      cellular(x, y, s, seed, c5);
      const edge = c5[1] - c5[0], key = c5[2];
      let col = cache2.get(key);
      if (!col) {
        const sx = clamp(c5[3] | 0, 0, W - 1), sy = clamp(c5[4] | 0, 0, H - 1), i = sy * W + sx, [h, sa, l] = rgb2hsl(ch[0][i], ch[1][i], ch[2][i]);
        col = hsl2rgb(h, clamp(sa * 1.35 + 0.12), clamp(l * 0.78 + 0.14, 0.22, 0.78)); cache2.set(key, col);
      }
      if (edge < lead) {
        // lead came: a dark rounded bar with a soft highlight on top
        const t = edge / lead, hl = Math.max(0, 0.5 - Math.abs(t - 0.62)) * 0.5, v = 24 + hl * 90;
        o4[o] = v; o4[o + 1] = v; o4[o + 2] = v + 3; o4[o + 3] = 255; continue;
      }
      // glass is darker toward the lead, brighter in the middle, and rippled
      const mid = 1 - smoothstep(0.1 * s, 0.7 * s, c5[0]), rip = (vnoise(x * 0.07 / sc, y * 0.07 / sc, seed) - 0.5) * 0.4 * rp + (vnoise(x * 0.22 / sc, y * 0.22 / sc, seed + 1) - 0.5) * 0.18 * rp;
      const lit = 0.58 + 0.42 * glow, back = 0.85 + 0.3 * (1 - Math.hypot(x / W - 0.35, y / H - 0.3));
      const near = smoothstep(lead, lead + 3 * sc, edge), k = (0.55 + 0.55 * mid + rip) * lit * back * (0.78 + 0.22 * near);
      o4[o] = col[0] * k; o4[o + 1] = col[1] * k; o4[o + 2] = col[2] * k; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
