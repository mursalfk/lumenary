// src/engine/styles/shadow-puppet.js
import { still, clamp, lerp, smoothstep, blur2, boxBlur, sobel, hash2, vnoise, rng } from '../utils.js';
import { pixels, stretchedL, fbm, blurRGB } from '../helpers.js';

const CLOTHS = { lamp: [[255, 214, 140], [224, 132, 44], [70, 26, 8]], moon: [[226, 236, 255], [120, 150, 214], [14, 20, 48]], rose: [[255, 214, 206], [226, 104, 96], [62, 14, 22]] };

export default still({
  id: 'shadow-puppet',
  name: 'Shadow Puppet',
  blurb: 'A shadow play: the dark half of the picture becomes one figure cut from hide, pierced with rows of small holes that let the lamp through, held on rods against a glowing cloth.',
  maxSide: 1000,
  params: [
    { key: 'cut', label: 'How much is figure', type: 'range', min: 15, max: 85, step: 1, default: 50 },
    { key: 'holes', label: 'Pierced pattern', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'soft', label: 'Distance from the cloth', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'tint', label: 'Painted hide', type: 'range', min: 0, max: 100, step: 1, default: 25 },
    { key: 'cloth', label: 'Light', type: 'select', default: 'lamp', options: [['lamp', 'Oil lamp'], ['moon', 'Moonlight'], ['rose', 'Rose lantern']] },
    { key: 'rods', label: 'Rods', type: 'toggle', default: true },
    { key: 'seed', label: 'Light the lamp again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 900, seed = p.seed * 27 + 6;
    if (!cache.Lw) {
      const Ls = stretchedL(cache), r = Math.max(2, Math.round(4 * sc));
      cache.Lw = blur2(Ls, W, H, r);
      cache.Lf = boxBlur(Ls, W, H, Math.max(1, Math.round(1.5 * sc)));
      cache.Lm = blur2(Ls, W, H, Math.max(3, Math.round(12 * sc)));
      cache.edge = sobel(cache.Lf, W, H, 1).mag;
      cache.col = blurRGB(d, W, H, Math.max(2, Math.round(5 * sc)), 2);
      cache.sorted = Float32Array.from(cache.Lw).sort();
    }
    const { Lw, Lf, Lm, edge, col, sorted } = cache, thr = sorted[Math.min(N - 1, Math.floor(N * (p.cut / 100)))];
    // the figure: everything darker than the threshold, as a mask that can be softened like a shadow cast from a distance
    const mask = new Float32Array(N), holes = p.holes / 100, cell = Math.max(5, Math.round(lerp(13, 8, holes) * sc)), hr = cell * 0.27, levels = lerp(5, 11, holes);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      let m = 1 - smoothstep(thr - 0.015, thr + 0.015, Lw[i]);
      if (m > 0 && holes > 0) {
        // Chisel work. Round holes on a slanted lattice wherever the figure is lighter than its surroundings, and
        // slits along its strongest inner edges: the two marks a puppet maker's punches leave.
        const u = x + y * 0.5, gx = Math.round(u / cell), gy = Math.round(y / cell), dx = u - gx * cell, dy = y - gy * cell, ci = clamp(gy * cell, 0, H - 1) * W + clamp(Math.round(gx * cell - gy * cell * 0.5), 0, W - 1);
        // holes go where the figure is lighter than its surroundings, and in bands that follow its form like filigree
        const band = 1 - smoothstep(0.1, 0.2, Math.abs(((Lm[ci] * levels) % 1) - 0.5)), want = Math.max(smoothstep(0.0, 0.05, Lf[ci] - Lm[ci] + (holes - 0.6) * 0.06), band);
        const hole = (1 - smoothstep(hr * 0.7, hr, Math.hypot(dx, dy))) * want * (Lw[ci] < thr - 0.02 ? 1 : 0);
        const slit = smoothstep(0.12, 0.2, edge[i]) * holes * (((x + y) / (cell * 0.9)) % 1 < 0.62 ? 1 : 0);
        m *= 1 - Math.max(hole, slit * 0.9);
      }
      mask[i] = m;
    }
    const br = Math.round((p.soft / 100) * 7 * sc), shade = br >= 1 ? blur2(mask, W, H, br) : mask;
    const [hot, warm, deep] = CLOTHS[p.cloth] || CLOTHS.lamp, tint = p.tint / 100, lampX = W * (0.5 + (hash2(1, 2, seed) - 0.5) * 0.16), lampY = H * 0.62, R = Math.hypot(W, H) * 0.62;
    const out = ctx.createImageData(W, H), o = out.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      // the cloth: brightest where the lamp stands behind it, woven, a little uneven
      const fall = clamp(1 - Math.hypot(x - lampX, (y - lampY) * 1.15) / R), t = fall * fall * (3 - 2 * fall);
      const weave = 1 + 0.035 * Math.sin((x * Math.PI) / (1.6 * sc)) * Math.sin((y * Math.PI) / (1.6 * sc)) + (fbm(x / (120 * sc), y / (120 * sc), seed, 3) - 0.5) * 0.12 + (hash2(x, y, seed) - 0.5) * 0.03;
      const a = t < 0.5 ? t * 2 : 1, b2 = t < 0.5 ? 0 : (t - 0.5) * 2;
      let r = lerp(lerp(deep[0], warm[0], a), hot[0], b2) * weave, g = lerp(lerp(deep[1], warm[1], a), hot[1], b2) * weave, b = lerp(lerp(deep[2], warm[2], a), hot[2], b2) * weave;
      const s = shade[i];
      if (s > 0) {
        // thin hide lets a little coloured light through; thick hide lets none
        const through = tint * 0.42 * (0.6 + 0.4 * vnoise(x * 0.05 / sc, y * 0.05 / sc, seed + 3)), fr = r * (0.05 + through * (col[0][i] / 255) * 1.3), fg = g * (0.04 + through * (col[1][i] / 255) * 1.2), fb = b * (0.05 + through * (col[2][i] / 255) * 1.4);
        r += (fr - r) * s; g += (fg - g) * s; b += (fb - b) * s;
      }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    if (p.rods) {
      // rods run from below the screen up to the figure: one to its middle, two to points out at its sides
      let sw = 0, sx = 0, sy = 0;
      for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) { const m = mask[y * W + x]; sw += m; sx += m * x; sy += m * y; }
      if (sw > 0) {
        const cx = sx / sw, cy = sy / sw, r = rng(seed + 5);
        ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(12,6,4,0.9)';
        for (const [tx, ty, bx, w] of [[cx, cy, cx + (r() - 0.5) * 30 * sc, 5], [cx - W * 0.2, cy - H * 0.06, cx - W * 0.1, 3.2], [cx + W * 0.2, cy - H * 0.04, cx + W * 0.12, 3.2]]) {
          ctx.lineWidth = w * sc; ctx.beginPath(); ctx.moveTo(clamp(tx, W * 0.05, W * 0.95), ty); ctx.lineTo(bx, H + 10); ctx.stroke();
        }
      }
    }
  },
});
