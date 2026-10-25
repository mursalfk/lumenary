// src/engine/styles/hala-blue-pottery.js
import { still, clamp, hexToRgb, hash2, boxBlur, TAU } from '../utils.js';
import { pixels, stretchedL, marching, chainSegments, cellular } from '../helpers.js';
import { css, mix, leaf } from '../culture.js';

const COBALT = '#254d9e', TURQ = '#2aa6b5';
const GROUNDS = { white: '#f5f4ee', cream: '#efe6cf', turquoise: '#8fd0cf' };

export default still({
  id: 'hala-blue-pottery',
  name: 'Hala Blue Pottery',
  blurb: 'Cobalt and turquoise painted on white glaze, as in the kilns of Hala. Vines follow the contours of your picture, with leaves, flowers and the fine crackle of old glaze.',
  maxSide: 1100,
  params: [
    { key: 'levels', label: 'Vines', type: 'range', min: 3, max: 14, step: 1, default: 8 },
    { key: 'smooth', label: 'Smoothness', type: 'range', min: 1, max: 10, step: 1, default: 5 },
    { key: 'leaves', label: 'Leaves', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'flowers', label: 'Flowers', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'wash', label: 'Blue wash', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'crackle', label: 'Crackle glaze', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'ground', label: 'Glaze', type: 'select', default: 'white', options: [['white', 'White'], ['cream', 'Cream'], ['turquoise', 'Turquoise']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, L = stretchedL(cache), r = Math.max(1, Math.round(p.smooth * sc * 0.9));
    const T = boxBlur(boxBlur(L, W, H, r), W, H, r), g = hexToRgb(GROUNDS[p.ground]), cob = hexToRgb(COBALT), wash = p.wash / 100, cr = p.crackle / 100;
    const img = ctx.createImageData(W, H), o = img.data, out = [0, 0, 0, 0, 0], cs = 54 * sc;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const v = Math.pow(1 - T[i], 1.5) * 0.78 * wash, sh = 0.97 + 0.03 * Math.sin(y / (9 * sc));
      let c0 = (g[0] + (cob[0] - g[0]) * v) * sh, c1 = (g[1] + (cob[1] - g[1]) * v) * sh, c2 = (g[2] + (cob[2] - g[2]) * v) * sh;
      if (cr > 0.02) {
        cellular(x, y, cs, 5, out);
        const e = out[1] - out[0];
        if (e < 1.1 * sc) { const a = (1 - e / (1.1 * sc)) * 0.3 * cr; c0 *= 1 - a; c1 *= 1 - a * 0.9; c2 *= 1 - a * 0.7; }
      }
      o[k] = c0; o[k + 1] = c1; o[k + 2] = c2; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const lines = [];
    for (let k = 1; k < p.levels; k++) {
      const lev = k / p.levels;
      for (const ln of chainSegments(marching(T, W, H, lev, 3))) if (ln.length > 5) lines.push([ln, lev]);
    }
    const lf = p.leaves / 100, step = 24 * sc;
    for (const [ln, lev] of lines) {
      ctx.strokeStyle = COBALT; ctx.lineWidth = (1.7 + 2.2 * (1 - lev)) * sc;
      ctx.beginPath(); ctx.moveTo(ln[0][0], ln[0][1]);
      for (let i = 1; i < ln.length - 1; i++) ctx.quadraticCurveTo(ln[i][0], ln[i][1], (ln[i][0] + ln[i + 1][0]) / 2, (ln[i][1] + ln[i + 1][1]) / 2);
      ctx.stroke();
      if (lf < 0.02) continue;
      let acc = step * hash2(ln.length, (lev * 100) | 0, 3), side = 1, n = 0;
      for (let i = 1; i < ln.length; i++) {
        acc -= Math.hypot(ln[i][0] - ln[i - 1][0], ln[i][1] - ln[i - 1][1]);
        if (acc > 0) continue;
        acc = step * (0.8 + 0.4 * hash2(i, n, 7)); side = -side; n++;
        if (hash2(i, n, 11) > lf) continue;
        const a = Math.atan2(ln[i][1] - ln[i - 1][1], ln[i][0] - ln[i - 1][0]) + side * 0.95, len = (14 + 8 * hash2(i, n, 13)) * sc * (0.75 + 0.5 * (1 - lev));
        leaf(ctx, ln[i][0], ln[i][1], a, len, len * 0.3);
        ctx.fillStyle = n % 2 ? TURQ : COBALT; ctx.fill(); ctx.strokeStyle = COBALT; ctx.lineWidth = 1.1 * sc; ctx.stroke();
      }
    }
    const fl = p.flowers / 100, gs = 34 * sc;
    if (fl > 0.02) for (let gy = gs / 2; gy < H; gy += gs) for (let gx = gs / 2; gx < W; gx += gs) {
      const x = gx + (hash2(gx | 0, gy | 0, 1) - 0.5) * gs * 0.7, y = gy + (hash2(gx | 0, gy | 0, 2) - 0.5) * gs * 0.7, t = T[clamp(y | 0, 0, H - 1) * W + clamp(x | 0, 0, W - 1)];
      if (t > 0.34 * (0.4 + fl) || hash2(gx | 0, gy | 0, 3) > fl) continue;
      const R = gs * (0.3 + 0.16 * hash2(gx | 0, gy | 0, 4)), rot = hash2(gx | 0, gy | 0, 5) * TAU;
      for (let j = 0; j < 5; j++) {
        const a = rot + (j / 5) * TAU;
        ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * R * 0.62, y + Math.sin(a) * R * 0.62, R * 0.55, R * 0.3, a, 0, TAU);
        ctx.fillStyle = '#f7f6f0'; ctx.fill(); ctx.strokeStyle = COBALT; ctx.lineWidth = 1.1 * sc; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(x, y, R * 0.3, 0, TAU); ctx.fillStyle = TURQ; ctx.fill(); ctx.strokeStyle = COBALT; ctx.stroke();
    }
    // the sheen of a glazed surface
    const gr = ctx.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.28, 'rgba(255,255,255,0.18)'); gr.addColorStop(0.36, 'rgba(255,255,255,0.0)'); gr.addColorStop(1, 'rgba(10,30,70,0.1)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  },
});
