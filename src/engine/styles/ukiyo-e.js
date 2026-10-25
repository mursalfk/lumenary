// src/engine/styles/ukiyo-e.js
import { still, hexToRgb, clamp, smoothstep, boxBlur, sobel, hash2, vnoise } from '../utils.js';
import { pixels, sampler, stretchedL, fbm } from '../helpers.js';
import { paletteIdx, modeFilter, edgeMask, mix } from '../culture.js';

// Prussian blue, vermilion, ochre, sage, pink, grey-brown, paper, sumi ink: the colours a woodblock printer of the Edo period had.
const PAL = ['#1f4068', '#c8402a', '#d9a441', '#7f9a6b', '#dc9a94', '#8a7a66', '#efe3c6', '#2a2623'].map(hexToRgb);
const PAPERS = { washi: [239, 227, 198], aged: [222, 204, 160], white: [245, 240, 226] };
const INK = [38, 35, 32], BLUE = PAL[0], PINK = PAL[4], RED = [192, 43, 32];

export default still({
  id: 'ukiyo-e',
  name: 'Ukiyo-e',
  blurb: 'A Japanese woodblock print: a few flat colours pressed one block at a time, a black key line, and the soft fade of bokashi in the sky. Wood grain and paper fibre show through the ink.',
  maxSide: 1100,
  params: [
    { key: 'simplify', label: 'Simplify', type: 'range', min: 1, max: 10, step: 1, default: 5 },
    { key: 'line', label: 'Key line', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'bokashi', label: 'Bokashi fade', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'wood', label: 'Wood grain', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'reg', label: 'Block misregistration', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'paper', label: 'Paper', type: 'select', default: 'washi', options: [['washi', 'Washi'], ['aged', 'Aged'], ['white', 'Bright']] },
    { key: 'seal', label: 'Artist seal', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, n = PAL.length, smp = sampler(cache, d, W, H, p.simplify * sc * 0.9), paper = PAPERS[p.paper];
    const key = p.simplify + '|' + W;
    if (cache.ukk !== key) { cache.ukIdx = modeFilter(paletteIdx(smp.ch, W, H, PAL, 1.15, 0.03), W, H, n, Math.max(2, Math.round(2.5 * sc)), 2); cache.ukk = key; }
    const idx = cache.ukIdx, Lb = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(1.4 * sc))), E = sobel(Lb, W, H, 1).mag;
    const thr = 0.24 - 0.17 * (p.line / 100), keyEdge = edgeMask(idx, W, H, 0), lw = p.line / 100, bok = p.bokashi / 100, wd = p.wood / 100;
    const sh = p.reg / 100 * 2.6 * sc, dx = Math.round(sh), dy = Math.round(sh * 0.6);
    const img = ctx.createImageData(W, H), o = img.data, c = [0, 0, 0];
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const xi = clamp(x - dx, 0, W - 1) | 0, yi = clamp(y - dy, 0, H - 1) | 0, id = idx[yi * W + xi];
      const fibre = (hash2(x, y, 5) - 0.5) * 9 + (fbm(x / (14 * sc), y / (14 * sc), 9, 3) - 0.5) * 12 + (vnoise(x / (70 * sc), y / (1.6 * sc), 3) - 0.5) * 9;
      if (id === 6) { c[0] = paper[0]; c[1] = paper[1]; c[2] = paper[2]; } else {
        const col = PAL[id], g = fbm(x / (130 * sc), y / (1.5 * sc), 5, 3), grain = 1 - wd * (0.16 * smoothstep(0.35, 0.8, g) + 0.05 * hash2(x >> 1, y, 8));
        const wet = 0.1 + 0.2 * wd * (1 - fbm(x / (24 * sc), y / (24 * sc), 11, 3));
        c[0] = (col[0] + (paper[0] - col[0]) * wet) * grain; c[1] = (col[1] + (paper[1] - col[1]) * wet) * grain; c[2] = (col[2] + (paper[2] - col[2]) * wet) * grain;
      }
      if (bok > 0.01 && id !== 7) {
        const top = Math.pow(clamp(1 - y / (H * 0.38)), 1.5) * bok, bot = Math.pow(clamp((y / H - 0.82) / 0.18), 1.4) * bok;
        const t1 = top * (0.5 + 0.2 * fbm(x / (90 * sc), y / (3 * sc), 2, 2)), t2 = bot * 0.4;
        if (t1 > 0) { const m = mix(c, BLUE, t1); c[0] = m[0]; c[1] = m[1]; c[2] = m[2]; }
        if (t2 > 0) { const m = mix(c, PINK, t2); c[0] = m[0]; c[1] = m[1]; c[2] = m[2]; }
      }
      const ln = Math.max(keyEdge[i] * (0.5 + 0.5 * lw), smoothstep(thr, thr * 2.1, E[i]) * lw) * (0.9 - 0.12 * hash2(x, y, 3));
      if (ln > 0.01) { const m = mix(c, INK, Math.min(0.95, ln)); c[0] = m[0]; c[1] = m[1]; c[2] = m[2]; }
      o[k] = c[0] + fibre; o[k + 1] = c[1] + fibre; o[k + 2] = c[2] + fibre; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    if (p.seal) {
      const s = Math.min(W, H) * 0.075, sx = W - s * 1.7, sy = H - s * 1.9;
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.92;
      ctx.fillStyle = `rgb(${RED[0]},${RED[1]},${RED[2]})`; ctx.fillRect(sx, sy, s, s * 1.25);
      ctx.restore();
      ctx.save(); ctx.fillStyle = `rgb(${paper[0]},${paper[1]},${paper[2]})`; ctx.globalAlpha = 0.9;
      const u = s / 6;
      for (const [a, b, w, h] of [[1, 1, 4, 0.6], [1, 2.2, 0.6, 3], [2.4, 2.2, 2.6, 0.6], [2.4, 3.5, 0.6, 2.2], [3.8, 3.2, 1.2, 0.6], [1.9, 5, 3.4, 0.6]]) ctx.fillRect(sx + a * u, sy + b * u * 1.05, w * u, h * u);
      ctx.restore();
      ctx.save(); ctx.strokeStyle = 'rgba(160,30,24,0.9)'; ctx.lineWidth = Math.max(1, s * 0.05); ctx.strokeRect(sx + s * 0.05, sy + s * 0.05, s * 0.9, s * 1.15); ctx.restore();
    }
  },
});
