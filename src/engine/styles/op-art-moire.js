// src/engine/styles/op-art-moire.js
import { still, clamp, smoothstep, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

const PAPERS = { white: [250, 250, 247], cream: [243, 237, 222] };
const INKS = { black: [18, 18, 22], blue: [20, 40, 128], red: [180, 32, 32] };

// distance to the nearest stripe centre as a fraction of the period, 0..0.5
const dist = (u) => Math.abs(u - Math.floor(u) - 0.5);

export default still({
  id: 'op-art-moire',
  name: 'Op Art Moire',
  blurb: 'Two sets of fine lines, one of them bent by your picture. Where they cross, beats appear that were never drawn.',
  maxSide: 1100,
  params: [
    { key: 'kind', label: 'Lines', type: 'select', default: 'rings', options: [['lines', 'Straight lines'], ['rings', 'Rings'], ['waves', 'Waves']] },
    { key: 'period', label: 'Line spacing', type: 'range', min: 4, max: 24, step: 0.5, default: 9, fmt: (v) => v.toFixed(1) },
    { key: 'warp', label: 'Picture bends the lines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'weight', label: 'Picture sets line weight', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'beat', label: 'Strength of the second grid', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'angle', label: 'Turn the second grid', type: 'range', min: -20, max: 20, step: 0.5, default: 3, fmt: (v) => v + '°' },
    { key: 'ink', label: 'Ink', type: 'select', default: 'black', options: [['black', 'Black'], ['blue', 'Blue'], ['red', 'Red'], ['picture', 'Colours of the picture']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'white', options: [['white', 'White'], ['cream', 'Cream']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, per = p.period * sc, smp = sampler(cache, d, W, H, 3 * sc), L = smp.L;
    const paper = PAPERS[p.paper] || PAPERS.white, ink = INKS[p.ink], warp = (p.warp / 100) * 9, wt = p.weight / 100, dutyA = 0.12 + (p.beat / 100) * 0.38;
    const cx = W / 2, cy = H / 2, a2 = (p.angle * Math.PI) / 180, c2 = Math.cos(a2), s2 = Math.sin(a2), aa = 0.8 / per;
    const out = ctx.createImageData(W, H), o4 = out.data, ch = smp.ch;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, l = L[i];
      let u1, u2;
      if (p.kind === 'lines') { u1 = y / per; const rx = (x - cx) * c2 - (y - cy) * s2 + cx, ry = (x - cx) * s2 + (y - cy) * c2 + cy; u2 = ry / per; }
      else if (p.kind === 'rings') { u1 = Math.hypot(x - cx, y - cy) / per; const qx = x - cx * (1 + a2 * 1.4), qy = y - cy * (1 - a2 * 0.8); u2 = Math.hypot(qx, qy) / per; }
      else { const wv = Math.sin(x * 0.018 / sc) * 4 * sc; u1 = (y + wv) / per; const ry = (x - cx) * s2 + (y - cy) * c2 + cy; u2 = (ry + Math.sin((x - cx) * c2 * 0.018 / sc + 1.5) * 4 * sc) / per; }
      u2 += warp * (l - 0.5);
      const dutyB = lerp(0.5, 0.12 + 0.76 * (1 - l), wt);
      const A = 1 - smoothstep(dutyA / 2 - aa, dutyA / 2 + aa, dist(u1)), B = 1 - smoothstep(dutyB / 2 - aa, dutyB / 2 + aa, dist(u2));
      const cov = clamp(1 - (1 - A) * (1 - B));
      let r, g, b;
      if (p.ink === 'picture') { r = ch[0][i] * 0.78; g = ch[1][i] * 0.78; b = ch[2][i] * 0.78; } else { r = ink[0]; g = ink[1]; b = ink[2]; }
      o4[o] = paper[0] + (r - paper[0]) * cov; o4[o + 1] = paper[1] + (g - paper[1]) * cov; o4[o + 2] = paper[2] + (b - paper[2]) * cov; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
