// src/engine/styles/frosted-ice.js
import { still, rng, vnoise, hash2, boxBlur, clamp, smoothstep } from '../utils.js';
import { pixels } from '../helpers.js';

export default still({
  id: 'frosted-ice',
  name: 'Frosted Ice',
  blurb: 'A frozen window: the picture blurs behind crystals, with one wiped patch where it shows clearly.',
  maxSide: 1000,
  params: [
    { key: 'frost', label: 'Frost', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'blur', label: 'Blur', type: 'range', min: 2, max: 40, step: 1, default: 14 },
    { key: 'size', label: 'Clear patch', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'x', label: 'Patch across', type: 'range', min: 0, max: 100, step: 1, default: 52 },
    { key: 'y', label: 'Patch down', type: 'range', min: 0, max: 100, step: 1, default: 46 },
    { key: 'seed', label: 'Refreeze', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const S = pixels(work, W, H, cache).data, N = W * H, sc = W / 800, seed = p.seed * 7 + 2;
    const rad = Math.max(1, Math.round(p.blur * sc * 0.6)), ch = [0, 1, 2].map((c) => {
      const a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = S[i * 4 + c];
      return boxBlur(boxBlur(a, W, H, rad), W, H, rad);
    });
    // the wipe: a curved stroke made of circles along a short arc
    const pr = (p.size / 100) * W * 0.17, cxp = (p.x / 100) * W, cyp = (p.y / 100) * H, pts = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14 - 0.5; pts.push([cxp + t * W * 0.34, cyp + Math.sin(t * 3.1) * H * 0.06 + t * H * 0.1]); }
    const out = ctx.createImageData(W, H), d = out.data, fr = p.frost / 100, fs = 0.05 / sc;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      // frost: warped ridged noise gives crystal veins, plus fine sparkle
      const wx = vnoise(x * fs * 0.6, y * fs * 0.6, seed) - 0.5, wy = vnoise(x * fs * 0.6 + 9, y * fs * 0.6 + 4, seed) - 0.5;
      const q1 = 1 - Math.abs(2 * vnoise(x * fs + wx * 5, y * fs * 0.7 + wy * 5, seed + 1) - 1), q2 = 1 - Math.abs(2 * vnoise(x * fs * 2.7 + wy * 6, y * fs * 2.2 - wx * 6, seed + 2) - 1);
      const crystal = Math.pow(q1 * 0.65 + q2 * 0.35, 5), grain = hash2(x, y, seed) > 0.985 ? 1 : 0;
      const dx = wx * 14 * sc * fr, dy = wy * 14 * sc * fr;
      const sx = clamp((x + dx) | 0, 0, W - 1), sy = clamp((y + dy) | 0, 0, H - 1), j = sy * W + sx;
      // frost is thickest toward the edges of the pane
      const ex = Math.min(x, W - 1 - x) / W, ey = Math.min(y, H - 1 - y) / H, edge = 1 - smoothstep(0.02, 0.3, Math.min(ex, ey * 1.3));
      const f = clamp(fr * (0.55 + 0.45 * edge)); let white = clamp(f * (0.14 + crystal * 0.55) + grain * 0.22 * f);
      let R = ch[0][j], G = ch[1][j], B = ch[2][j];
      const tint = 0.28 * f;
      // wiped patch
      if (pr > 1) {
        let md = 1e9;
        for (let k = 0; k < pts.length; k++) { const ddx = x - pts[k][0], ddy = y - pts[k][1], dd = ddx * ddx + ddy * ddy; if (dd < md) md = dd; }
        const dist = Math.sqrt(md) + (vnoise(x * 0.02 / sc, y * 0.02 / sc, seed + 7) - 0.5) * pr * 0.55, m = 1 - smoothstep(pr * 0.84, pr * 0.97, dist);
        // wiped-away frost piles up in a ridge round the clear patch
        const pile = smoothstep(pr * 0.8, pr * 0.98, dist) * (1 - smoothstep(pr * 1.02, pr * 1.4, dist));
        white = clamp(white + pile * (0.3 + crystal * 0.5));
        R += (205 - R) * (tint + white * 0.7); G += (230 - G) * (tint + white * 0.7); B += (252 - B) * (tint + white * 0.7);
        if (m > 0) { R += (S[o] * 0.97 - R) * m; G += (S[o + 1] - G) * m; B += (S[o + 2] * 1.04 - B) * m; }
      } else { R += (205 - R) * (tint + white * 0.7); G += (230 - G) * (tint + white * 0.7); B += (252 - B) * (tint + white * 0.7); }
      d[o] = R; d[o + 1] = G; d[o + 2] = B; d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
