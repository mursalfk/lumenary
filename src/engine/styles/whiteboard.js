// src/engine/styles/whiteboard.js
import { still, clamp, lerp, smoothstep, boxBlur, sobel, vnoise, hash2, rgb2hsl, roundRect } from '../utils.js';
import { pixels, stretchedL, fbm, blurRGB } from '../helpers.js';

const BLACK = [28, 30, 38], BLUE = [28, 76, 190], RED = [214, 44, 52], GREEN = [26, 148, 84];

export default still({
  id: 'whiteboard',
  name: 'Whiteboard',
  blurb: 'A dry-wipe marker drawing: even black outlines, shadows filled with streaky strokes in blue, red and green, the ghost of last week’s notes and glare across the board.',
  maxSide: 1000,
  params: [
    { key: 'detail', label: 'Detail', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'weight', label: 'Marker tip', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'fill', label: 'Shading strokes', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'pens', label: 'Markers', type: 'select', default: 'four', options: [['four', 'Black, blue, red, green'], ['black', 'Black only'], ['blue', 'Blue only']] },
    { key: 'wear', label: 'Ghost marks', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'frame', label: 'Frame and tray', type: 'toggle', default: true },
    { key: 'seed', label: 'Wipe and redraw', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 900, seed = p.seed * 5 + 4;
    if (!cache.edge) {
      const Ls = stretchedL(cache), r = Math.max(1, Math.round(3 * sc));
      cache.Lb = boxBlur(boxBlur(Ls, W, H, r), W, H, r);
      // the outline is found on a well-blurred picture: a marker cannot draw hair, only shapes
      cache.edge = sobel(boxBlur(boxBlur(Ls, W, H, r), W, H, r), W, H, 1).mag;
      cache.col = blurRGB(d, W, H, Math.max(2, Math.round(8 * sc)), 2);
    }
    const { Lb, edge, col } = cache, thr = lerp(0.2, 0.06, p.detail / 100), tip = lerp(0.9, 2.6, p.weight / 100), fill = p.fill / 100, wear = p.wear / 100;
    const f = 0.01 / sc, amp = 2.5 * sc, per = lerp(20, 13, fill) * sc, only = p.pens === 'black' ? BLACK : p.pens === 'blue' ? BLUE : null, lineInk = p.pens === 'blue' ? BLUE : BLACK;
    const out = ctx.createImageData(W, H), o = out.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      // the board: bright, a touch grey toward the corners, a band of glare, and smears of old ink never quite wiped off
      const u = x / W, v = y / H, glare = Math.exp(-(((u * 0.8 + v * 0.6 - 0.62) / 0.14) ** 2)) * 0.035, corner = ((u - 0.5) ** 2 + (v - 0.5) ** 2) * 0.09;
      const smear = smoothstep(0.5, 0.8, fbm(x / (260 * sc) + 3, y / (70 * sc), seed + 2, 3)) * wear, smear2 = smoothstep(0.55, 0.8, fbm(x / (90 * sc), y / (300 * sc) + 7, seed + 6, 3)) * wear;
      let r = 248 - corner * 255 + glare * 255 - smear * 9 - smear2 * 3, g = 249 - corner * 255 + glare * 255 - smear * 5 - smear2 * 9, b = 251 - corner * 240 + glare * 255 - smear * 1 - smear2 * 8;
      // shading: slanted marker strokes with gaps between them, each stroke running dry toward its end
      if (fill > 0) {
        const dark = 1 - Lb[i], sway = (vnoise(x * 0.008 / sc, y * 0.008 / sc, seed + 1) - 0.5) * per * 1.2;
        const t1 = (x * 0.64 + y * 0.77 + sway) / per, s1 = Math.abs((t1 % 1) - 0.5), row = Math.floor(t1);
        const along = (x * 0.77 - y * 0.64) / sc, dry = vnoise(along * 0.012 + row * 3.7, row * 0.37, seed + 8), streak = vnoise(along * 0.5, (t1 % 1) * 9 + row, seed + 9);
        let a = (1 - smoothstep(0.3, 0.36, s1)) * smoothstep(0.46, 0.56, dark) * smoothstep(0.22, 0.42, dry + dark * 0.4) * (0.62 + 0.3 * streak);
        const t2 = (x * 0.64 - y * 0.77 + 5000 + sway) / (per * 1.15), s2 = Math.abs((t2 % 1) - 0.5);
        a = Math.max(a, (1 - smoothstep(0.28, 0.34, s2)) * smoothstep(0.76, 0.86, dark) * (0.6 + 0.3 * streak));
        if (a > 0) {
          let c = only;
          if (!c) {
            // a colour has to be clearly a colour to earn a coloured marker; dull and very dark areas get the black one
            const R = col[0][i], G = col[1][i], B = col[2][i], chroma = Math.max(R, G, B) - Math.min(R, G, B), h = rgb2hsl(R, G, B)[0];
            c = chroma < 62 || dark > 0.86 ? BLACK : h < 0.11 || h > 0.9 ? RED : h < 0.47 ? GREEN : h < 0.78 ? BLUE : RED;
          }
          a *= 0.86 * (0.55 + 0.45 * fill);
          r += (c[0] - r) * a; g += (c[1] - g) * a; b += (c[2] - b) * a;
        }
      }
      // outlines: one width throughout, as a felt tip gives, wandering a little
      const dx = Math.round((vnoise(x * f, y * f, seed) - 0.5) * 2 * amp), dy = Math.round((vnoise(x * f + 9, y * f + 3, seed + 3) - 0.5) * 2 * amp);
      const e = edge[clamp(y + dy, 0, H - 1) * W + clamp(x + dx, 0, W - 1)], la = smoothstep(thr / tip, (thr / tip) * 1.5, e) * (0.9 + 0.1 * hash2(x >> 1, y >> 1, seed));
      r += (lineInk[0] - r) * la; g += (lineInk[1] - g) * la; b += (lineInk[2] - b) * la;
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    if (!p.frame) return;
    // aluminium frame, tray, four markers and an eraser
    const t = Math.round(W * 0.018), tray = Math.round(W * 0.045);
    const metal = (x, y, w, h, up) => { const g = up ? ctx.createLinearGradient(x, y, x + w, y) : ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#e2e5e9'); g.addColorStop(0.5, '#b4bac2'); g.addColorStop(1, '#8d949d'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); };
    metal(0, 0, W, t, false); metal(0, 0, t, H, true); metal(W - t, 0, t, H, true); metal(0, H - tray, W, tray, false);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(t, t, W - 2 * t, 2 * sc); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, H - tray, W, 1.5 * sc);
    const caps = p.pens === 'four' ? ['#1c1e26', '#1c4cbe', '#d62c34', '#1a9454'] : p.pens === 'blue' ? ['#1c4cbe', '#1c4cbe'] : ['#1c1e26', '#1c1e26'];
    caps.forEach((cap, j) => {
      const x = W * (0.1 + j * 0.115), w = W * 0.095, h = tray * 0.34, y = H - tray * 0.52 - h / 2;
      ctx.fillStyle = '#f1f2f4'; roundRect(ctx, x, y, w, h, h * 0.4); ctx.fill();
      ctx.fillStyle = cap; roundRect(ctx, x, y, w * 0.3, h, h * 0.4); ctx.fill(); ctx.fillRect(x + w * 0.62, y, w * 0.1, h);
      ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
    });
    const ex = W * 0.7, ew = W * 0.14, eh = tray * 0.5;
    ctx.fillStyle = '#2f5fae'; roundRect(ctx, ex, H - tray * 0.52 - eh / 2, ew, eh * 0.55, 3 * sc); ctx.fill();
    ctx.fillStyle = '#3b3b40'; roundRect(ctx, ex, H - tray * 0.52 - eh / 2 + eh * 0.5, ew, eh * 0.45, 2 * sc); ctx.fill();
  },
});
