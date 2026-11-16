// src/engine/styles/glow-sketch.js
import { still, clamp, lerp, smoothstep, boxBlur, sobel, vnoise, hash2, hsl2rgb, TAU } from '../utils.js';
import { pixels, stretchedL, glowDraw } from '../helpers.js';

const PENS = { cyan: [70, 225, 255], pink: [255, 90, 190], lime: [170, 255, 90], amber: [255, 190, 70], white: [245, 245, 255] };
const PAPERS = { black: '#07070b', navy: '#070c1c', plum: '#12081a' };

export default still({
  id: 'glow-sketch',
  name: 'Glow Sketch',
  blurb: 'A drawing made with a pen of light on a dark page: every outline is gone over twice by an unsteady hand, shadows are hatched in, and the lines glow.',
  maxSide: 1000,
  params: [
    { key: 'detail', label: 'Detail', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'wobble', label: 'Unsteady hand', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'hatch', label: 'Hatched shadows', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'pen', label: 'Pen', type: 'select', default: 'cyan', options: [['cyan', 'Cyan'], ['pink', 'Pink'], ['lime', 'Lime'], ['amber', 'Amber'], ['white', 'White'], ['rainbow', 'Rainbow']] },
    { key: 'paper', label: 'Page', type: 'select', default: 'black', options: [['black', 'Black'], ['navy', 'Navy'], ['plum', 'Plum']] },
    { key: 'grid', label: 'Dotted grid', type: 'toggle', default: true },
    { key: 'seed', label: 'Draw again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 900, seed = p.seed * 7 + 1;
    if (!cache.edge) {
      const Ls = stretchedL(cache);
      cache.Lb = boxBlur(boxBlur(Ls, W, H, Math.max(1, Math.round(3 * sc))), W, H, Math.max(1, Math.round(3 * sc)));
      cache.edge = sobel(boxBlur(Ls, W, H, Math.max(1, Math.round(2 * sc))), W, H, 1).mag;
    }
    const { Lb, edge } = cache, thr = lerp(0.17, 0.035, p.detail / 100), wob = p.wobble / 100, amp = (1.5 + wob * 9) * sc, hatch = p.hatch / 100;
    const pen = PENS[p.pen], layer = env.makeCanvas(W, H), lx = layer.getContext('2d'), img = lx.createImageData(W, H), o = img.data, f = 0.012 / sc, per = 11 * sc;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      // the outline is looked up three times, each time nudged a different way, so it reads as three passes of the pen
      let a = 0;
      for (let j = 0; j < 3; j++) {
        const dx = Math.round((vnoise(x * f + j * 13, y * f, seed + j) - 0.5) * 2 * amp), dy = Math.round((vnoise(x * f + 7, y * f + j * 11, seed + j + 9) - 0.5) * 2 * amp);
        const e = edge[clamp(y + dy, 0, H - 1) * W + clamp(x + dx, 0, W - 1)];
        a = Math.max(a, smoothstep(thr, thr * 2.3, e) * (0.6 + 0.4 * hash2(x >> 2, y >> 2, seed + j)));
      }
      if (hatch > 0) {
        // shadows are filled with slanted strokes, and the deepest ones are crossed a second way
        const dark = 1 - Lb[i], sway = (vnoise(x * 0.01 / sc, y * 0.01 / sc, seed + 5) - 0.5) * per * 0.7 * (0.3 + wob);
        const s1 = Math.abs((((x + y + sway) / per) % 1) - 0.5), s2 = Math.abs((((x - y + sway + 4000) / per) % 1) - 0.5);
        const dash = 0.55 + 0.45 * vnoise((x - y) * 0.02 / sc, (x + y) * 0.2 / sc, seed + 6);
        const h1 = (1 - smoothstep(0.05, 0.11, s1)) * smoothstep(0.5, 0.62, dark) * dash, h2 = (1 - smoothstep(0.05, 0.11, s2)) * smoothstep(0.74, 0.86, dark) * dash;
        a = Math.max(a, Math.max(h1, h2) * 0.62 * hatch * 1.6);
      }
      if (a <= 0.004) continue;
      let c = pen;
      if (!c) c = hsl2rgb(x / W * 0.55 + y / H * 0.35 + 0.5, 0.95, 0.62);
      o[k] = c[0]; o[k + 1] = c[1]; o[k + 2] = c[2]; o[k + 3] = clamp(a) * 255;
    }
    lx.putImageData(img, 0, 0);
    ctx.fillStyle = PAPERS[p.paper] || PAPERS.black; ctx.fillRect(0, 0, W, H);
    if (p.grid) {
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      const g = 34 * sc;
      for (let y = g / 2; y < H; y += g) for (let x = g / 2; x < W; x += g) { ctx.beginPath(); ctx.arc(x, y, 1.1 * sc, 0, TAU); ctx.fill(); }
    }
    glowDraw(env, ctx, layer, W, H, 0.25 + (p.glow / 100) * 1.1);
    // a second, fainter pass in white makes the core of each line hotter than its halo
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28; ctx.drawImage(layer, 0, 0); ctx.restore();
  },
});
