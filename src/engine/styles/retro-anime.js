// src/engine/styles/retro-anime.js
import { still, clamp, lerp, smoothstep, rgb2hsl, hsl2rgb, blur2, boxBlur, hash2, vnoise, rng, TAU } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';
import { flatten, darkLines, shapeLines, brightSpots } from '../toon.js';

const NAVY = [30, 26, 64], CREAM = [255, 240, 214], LINE = [44, 30, 52];

export default still({
  id: 'retro-anime',
  name: 'Retro Anime',
  blurb: 'A cel from a late-eighties broadcast: flat paint in faded pastel, heavy outlines, a halo around every light, star glints, film grain and a little colour bleed.',
  maxSide: 1000,
  params: [
    { key: 'colours', label: 'Paint colours', type: 'range', min: 6, max: 16, step: 1, default: 11 },
    { key: 'fade', label: 'Pastel fade', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'lines', label: 'Outlines', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'halo', label: 'Halo on lights', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'bleed', label: 'Colour bleed', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'grain', label: 'Film grain', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'glints', label: 'Star glints', type: 'range', min: 0, max: 12, step: 1, default: 5 },
    { key: 'seed', label: 'New print', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 900, seed = p.seed * 13 + 3;
    if (cache.fk !== p.colours) {
      cache.flat = flatten(d, W, H, p.colours, 5 * sc, 2 * sc, 7, cache);
      const ch = cache.flat.ch, T = new Float32Array(N), Ls = stretchedL(cache);
      for (let i = 0; i < N; i++) T[i] = (0.2126 * ch[0][i] + 0.7152 * ch[1][i] + 0.0722 * ch[2][i]) / 255;
      cache.dog = darkLines(T, W, H, 0, Math.round(3 * sc));
      cache.rim = shapeLines(cache.flat.idx, cache.flat.pal, W, H, 0.08, 0.24);
      cache.Lb = blur2(Ls, W, H, Math.max(1, Math.round(2.5 * sc)));
      cache.Lw = blur2(Ls, W, H, Math.max(2, Math.round(18 * sc)));
      cache.fk = p.colours;
    }
    const { idx, pal } = cache.flat, { dog, rim, Lb, Lw } = cache, fade = p.fade / 100;
    // Old cel paint under a rostrum camera: blacks lift to navy, whites warm to cream, colours lose a little strength.
    const paint = pal.map((c) => {
      const [h, s, l] = rgb2hsl(c[0], c[1], c[2]), q = hsl2rgb(h, clamp(s * lerp(1.25, 0.92, fade) + 0.06), clamp(l));
      const t = l, lift = 0.5 * fade * (1 - smoothstep(0.0, 0.5, t)), warm = 0.4 * fade * smoothstep(0.6, 1.0, t);
      return [0, 1, 2].map((k) => { let v = q[k] + (NAVY[k] - q[k]) * lift; v += (CREAM[k] - v) * warm; return v; });
    });
    const dusk = paint.map((c) => [lerp(c[0] * 0.72, 96, 0.14), lerp(c[1] * 0.68, 60, 0.14), lerp(c[2] * 0.78, 140, 0.14)]);
    const lines = p.lines / 100, lo = lerp(0.05, 0.014, lines);
    const buf = new Float32Array(N * 3), hot = new Float32Array(N);
    for (let i = 0, k = 0; i < N; i++, k += 3) {
      const c = paint[idx[i]], q = dusk[idx[i]], s = smoothstep(0.045, 0.06, Lw[i] - Lb[i]);
      let r = c[0] + (q[0] - c[0]) * s, g = c[1] + (q[1] - c[1]) * s, b = c[2] + (q[2] - c[2]) * s;
      if (lines > 0) {
        // photocopied outlines: heavy, and breaking up a little where the toner ran thin
        const x = i % W, y = (i / W) | 0, thin = 0.72 + 0.28 * smoothstep(0.3, 0.55, vnoise(x * 0.09 / sc, y * 0.09 / sc, seed));
        const a = Math.max(smoothstep(lo, lo * 2.1, dog[i]), rim[i] * (0.4 + 0.6 * lines)) * thin * (0.65 + 0.35 * lines);
        r += (LINE[0] - r) * a; g += (LINE[1] - g) * a; b += (LINE[2] - b) * a;
      }
      buf[k] = r; buf[k + 1] = g; buf[k + 2] = b;
      hot[i] = smoothstep(0.72, 0.95, (0.3 * r + 0.59 * g + 0.11 * b) / 255);
    }
    // the halo: light spreading in the film around anything bright
    const hr = Math.max(2, Math.round(9 * sc)), glow = boxBlur(boxBlur(hot, W, H, hr), W, H, hr), halo = (p.halo / 100) * 0.75;
    const bleed = Math.round((p.bleed / 100) * 3 * sc), grain = (p.grain / 100) * 34, soft = 0.25 + 0.25 * (p.bleed / 100);
    const out = ctx.createImageData(W, H), o = out.data, cx = W / 2, cy = H / 2, rmax = Math.hypot(cx, cy);
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      // red is read a little to the left and blue a little to the right, as a worn tape or a cheap print would show it
      const xr = x - bleed < 0 ? 0 : x - bleed, xb = x + bleed >= W ? W - 1 : x + bleed, xl = x > 0 ? x - 1 : 0, xn = x < W - 1 ? x + 1 : x, row = y * W;
      let r = buf[(row + xr) * 3] * (1 - soft) + (buf[(row + xl) * 3] + buf[(row + xn) * 3]) * 0.5 * soft;
      let g = buf[i * 3 + 1] * (1 - soft) + (buf[(row + xl) * 3 + 1] + buf[(row + xn) * 3 + 1]) * 0.5 * soft;
      let b = buf[(row + xb) * 3 + 2] * (1 - soft) + (buf[(row + xl) * 3 + 2] + buf[(row + xn) * 3 + 2]) * 0.5 * soft;
      const hg = glow[i] * halo;
      r += (255 - r) * hg; g += (232 - g) * hg * 0.85; b += (214 - b) * hg * 0.7;
      const n = (hash2(x, y, seed) - 0.5) * grain + (vnoise(x * 0.5, y * 0.5, seed + 4) - 0.5) * grain * 0.6;
      const v = 1 - 0.22 * fade * smoothstep(0.55, 1.05, Math.hypot(x - cx, y - cy) / rmax);
      o[k] = (r + n) * v; o[k + 1] = (g + n) * v; o[k + 2] = (b + n * 1.1) * v + 6 * fade; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    // four-pointed glints on the brightest spots
    if (p.glints > 0) {
      const r = rng(seed + 9), spots = brightSpots(Lb, W, H, p.glints, W * 0.14).filter((s) => s[2] > 0.8);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [x, y] of spots) {
        const len = (34 + r() * 46) * sc, rot = (r() - 0.5) * 0.3;
        const g = ctx.createRadialGradient(x, y, 0, x, y, len * 0.5);
        g.addColorStop(0, 'rgba(255,250,240,0.85)'); g.addColorStop(0.25, 'rgba(255,225,235,0.28)'); g.addColorStop(1, 'rgba(255,220,240,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, len * 0.5, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        for (let j = 0; j < 4; j++) {
          // each ray is a long thin kite; the upright pair is longer than the level pair
          const a = rot + (j * Math.PI) / 2, L = len * (j % 2 ? 0.62 : 1), w = 1.7 * sc, ca = Math.cos(a), sa = Math.sin(a);
          ctx.beginPath(); ctx.moveTo(x + ca * L, y + sa * L); ctx.lineTo(x - sa * w, y + ca * w); ctx.lineTo(x - ca * L * 0.12, y - sa * L * 0.12); ctx.lineTo(x + sa * w, y - ca * w); ctx.closePath(); ctx.fill();
        }
      }
      ctx.restore();
    }
  },
});
