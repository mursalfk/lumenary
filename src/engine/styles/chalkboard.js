// src/engine/styles/chalkboard.js
import { still, clamp, lerp, smoothstep, boxBlur, sobel, vnoise, hash2, rgb2hsl, rng, roundRect } from '../utils.js';
import { pixels, stretchedL, fbm, rgbList, blurRGB } from '../helpers.js';

const BOARDS = { green: [36, 68, 54], black: [30, 32, 34], blue: [36, 54, 74] };
const WHITE = [242, 240, 230];
// yellow, orange, pink, violet, blue, green: the sticks in a box of coloured chalk, by hue
const STICKS = rgbList(['#f6e58a', '#f5b47c', '#f3a3bb', '#c9a8ee', '#9fcdf2', '#a9e2a4']), HUES = [0.15, 0.07, 0.94, 0.75, 0.58, 0.33];

export default still({
  id: 'chalkboard',
  name: 'Chalkboard',
  blurb: 'Chalk on a school board: dusty outlines, the light areas rubbed in with the side of the stick, eraser smears across the slate and a wooden frame with a tray.',
  maxSide: 1000,
  params: [
    { key: 'lines', label: 'Outlines', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'shade', label: 'Side-of-chalk shading', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'dust', label: 'Eraser smears', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'chalk', label: 'Chalk', type: 'select', default: 'white', options: [['white', 'White only'], ['colour', 'Coloured sticks']] },
    { key: 'board', label: 'Board', type: 'select', default: 'green', options: [['green', 'Green'], ['black', 'Black slate'], ['blue', 'Blue grey']] },
    { key: 'frame', label: 'Frame and tray', type: 'toggle', default: true },
    { key: 'seed', label: 'Wipe and redraw', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 900, seed = p.seed * 9 + 2;
    if (!cache.edge) {
      const Ls = stretchedL(cache), r = Math.max(1, Math.round(2.5 * sc));
      cache.Lb = boxBlur(boxBlur(Ls, W, H, r), W, H, r);
      cache.edge = sobel(boxBlur(Ls, W, H, Math.max(1, Math.round(2 * sc))), W, H, 1).mag;
      cache.col = blurRGB(d, W, H, Math.max(2, Math.round(6 * sc)), 2);
    }
    const { Lb, edge, col } = cache, board = BOARDS[p.board] || BOARDS.green, lines = p.lines / 100, shade = p.shade / 100, dust = p.dust / 100;
    const thr = lerp(0.16, 0.05, lines), amp = 3.5 * sc, f = 0.012 / sc, colour = p.chalk === 'colour';
    const out = ctx.createImageData(W, H), o = out.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      // the slate: uneven, with broad wipes of old chalk left by the eraser
      const mott = fbm(x / (240 * sc), y / (240 * sc), seed, 3), wx = fbm(x / (170 * sc), y / (420 * sc), seed + 3, 3);
      const wipe = smoothstep(0.42, 0.75, fbm(x / (300 * sc) + wx * 2.2, y / (90 * sc) + wx * 1.4, seed + 5, 3));
      let fog = (0.05 + 0.2 * wipe) * dust, base = 0.8 + 0.34 * mott;
      // the tooth of the board: chalk only catches on its high points
      const tooth = 0.55 * vnoise(x * 0.55 / sc, y * 0.55 / sc, seed + 1) + 0.45 * hash2(x, y, seed);
      let a = 0;
      if (lines > 0) {
        let e = 0;
        for (let j = 0; j < 2; j++) {
          const dx = Math.round((vnoise(x * f + j * 9, y * f, seed + j) - 0.5) * 2 * amp), dy = Math.round((vnoise(x * f + 5, y * f + j * 7, seed + j + 4) - 0.5) * 2 * amp);
          e = Math.max(e, edge[clamp(y + dy, 0, H - 1) * W + clamp(x + dx, 0, W - 1)]);
        }
        a = smoothstep(thr, thr * 2.2, e) * smoothstep(0.18, 0.5, tooth + 0.25) * (0.7 + 0.3 * lines);
      }
      if (shade > 0) {
        // broad strokes laid with the side of the stick, all slanting the same way
        const u = (x * 0.82 + y * 0.57) / sc, v = (-x * 0.57 + y * 0.82) / sc, stroke = vnoise(v * 0.09, u * 0.012, seed + 7);
        const want = smoothstep(0.42, 0.95, Lb[i]) * shade * (0.55 + 0.6 * stroke);
        a = Math.max(a, smoothstep(0.95 - want * 0.9, 1.25 - want * 0.75, tooth + 0.35) * 0.82);
      }
      let c = WHITE;
      if (colour) {
        const [h, s] = rgb2hsl(col[0][i], col[1][i], col[2][i]);
        if (s > 0.28) { let best = 0, bd = 9; for (let j = 0; j < 6; j++) { const dh = Math.abs(h - HUES[j]), q = Math.min(dh, 1 - dh); if (q < bd) { bd = q; best = j; } } c = STICKS[best]; }
      }
      fog = clamp(fog + a * 0.06);
      const r0 = board[0] * base + (WHITE[0] - board[0]) * fog, g0 = board[1] * base + (WHITE[1] - board[1]) * fog, b0 = board[2] * base + (WHITE[2] - board[2]) * fog;
      o[k] = r0 + (c[0] - r0) * a; o[k + 1] = g0 + (c[1] - g0) * a; o[k + 2] = b0 + (c[2] - b0) * a; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    if (!p.frame) return;
    // a wooden frame, a tray along the bottom, three sticks of chalk and a felt eraser
    const t = Math.round(W * 0.03), tray = Math.round(W * 0.05), r = rng(seed + 3);
    const wood = (x, y, w, h, up) => {
      const g = up ? ctx.createLinearGradient(x, y, x + w, y) : ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, '#a8763f'); g.addColorStop(0.45, '#8a5c2c'); g.addColorStop(1, '#6d4520');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(40,22,8,0.22)'; ctx.lineWidth = Math.max(1, sc);
      for (let j = 0; j < 5; j++) { ctx.beginPath(); if (up) { const q = x + (w * (j + r())) / 5; ctx.moveTo(q, y); ctx.lineTo(q, y + h); } else { const q = y + (h * (j + r())) / 5; ctx.moveTo(x, q); ctx.lineTo(x + w, q); } ctx.stroke(); }
    };
    wood(0, 0, W, t, false); wood(0, 0, t, H, true); wood(W - t, 0, t, H, true); wood(0, H - tray, W, tray, false);
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(t, t, W - 2 * t, 3 * sc); ctx.fillRect(t, t, 3 * sc, H - t - tray);
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(0, H - tray, W, 2 * sc);
    ctx.fillStyle = 'rgba(240,238,228,0.16)'; ctx.fillRect(t, H - tray * 0.42, W - 2 * t, tray * 0.2);
    const sticks = colour ? ['#f2f0e6', '#f6e58a', '#f3a3bb', '#9fcdf2'] : ['#f2f0e6', '#ebe8dc', '#f2f0e6'];
    sticks.forEach((cs, j) => { const x = W * (0.12 + j * 0.085 + r() * 0.02), w = W * (0.04 + r() * 0.02), h = tray * 0.2; ctx.fillStyle = cs; roundRect(ctx, x, H - tray * 0.5 - h / 2, w, h, h * 0.3); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x, H - tray * 0.5 + h * 0.2, w, h * 0.3); });
    const ex = W * 0.68, ew = W * 0.13, eh = tray * 0.52;
    ctx.fillStyle = '#3a3330'; roundRect(ctx, ex, H - tray * 0.5 - eh / 2, ew, eh * 0.45, 2 * sc); ctx.fill();
    ctx.fillStyle = '#b9b4a6'; roundRect(ctx, ex, H - tray * 0.5 - eh / 2 + eh * 0.42, ew, eh * 0.5, 2 * sc); ctx.fill();
  },
});
