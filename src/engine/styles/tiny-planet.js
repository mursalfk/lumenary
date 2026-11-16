// src/engine/styles/tiny-planet.js
import { still, clamp, lerp, smoothstep, TAU } from '../utils.js';
import { pixels, paintPixels, bilinearRGB } from '../helpers.js';

const BLEND = 0.14;   // share of the picture's width that is cross-faded where its two sides meet

export default still({
  id: 'tiny-planet',
  name: 'Tiny Planet',
  blurb: 'The picture bent into a small round world. Its bottom edge shrinks to the centre of the planet, its top edge becomes the horizon of the sky, and its left and right sides are joined round the back.',
  maxSide: 1200,
  params: [
    { key: 'curve', label: 'Curve of the world', type: 'range', min: 0, max: 100, step: 1, default: 45, fmt: (v) => v + '%' },
    { key: 'zoom', label: 'Size of the planet', type: 'range', min: 30, max: 150, step: 1, default: 78, fmt: (v) => v + '%' },
    { key: 'spin', label: 'Turn', type: 'range', min: 0, max: 360, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'repeat', label: 'Times round', type: 'range', min: 1, max: 4, step: 1, default: 1 },
    { key: 'seam', label: 'Where the sides meet', type: 'select', default: 'blend', options: [['blend', 'Fade into each other'], ['mirror', 'Mirror']] },
    { key: 'sky', label: 'Beyond the top edge', type: 'select', default: 'soft', options: [['soft', 'A haze of the picture’s sky'], ['stretch', 'Stretch the top edge'], ['black', 'Black'], ['white', 'White']] },
    { key: 'rim', label: 'Glow at the horizon', type: 'range', min: 0, max: 100, step: 1, default: 30, fmt: (v) => v + '%' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data;
    // How far from the centre a row of the picture lands. s runs from 0 (the bottom row, at the centre) to 1 (the top
    // row, at radius Rout) and beyond it into the sky. At 0% curve the radius grows evenly with s, which is the plain
    // polar map; at 100% it follows the stereographic projection, which is what a true tiny planet uses and which
    // crowds the lower rows into the middle. In between is the blend. `lut` holds g(s) so it can be turned back round.
    const S = Math.min(W, H) / 2, Rout = (S * p.zoom) / 100, k = p.curve / 100, FOV = 2.45, tn = Math.tan(FOV / 2);
    const g = (s) => (1 - k) * s + (k * Math.tan((s * FOV) / 2)) / tn;
    const gd = (s) => (1 - k) + (k * (FOV / 2)) / tn / Math.pow(Math.cos((s * FOV) / 2), 2);
    const sEnd = Math.min(3, Math.PI / FOV - 0.002), NL = 1024, lut = new Float32Array(NL + 1);
    for (let i = 0; i <= NL; i++) lut[i] = g((i / NL) * sEnd);
    const sOf = (gr) => {
      if (gr >= lut[NL]) return sEnd;
      let lo = 0, hi = NL;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (lut[m] <= gr) lo = m; else hi = m; }
      return ((lo + (gr - lut[lo]) / (lut[hi] - lut[lo] + 1e-9)) / NL) * sEnd;
    };
    const spin = (p.spin * Math.PI) / 180, rep = p.repeat, mirror = p.seam === 'mirror', cx = W / 2, cy = H / 2;

    // The sky: the average colour of the top of the picture in every column, blurred sideways round the loop,
    // stored as a strip two rows high so it can be read like the picture.
    if (!cache.sky) {
      const rows = Math.max(2, Math.round(H * 0.05)), raw = new Float32Array(W * 3), strip = new Uint8ClampedArray(W * 2 * 4), mean = [0, 0, 0];
      for (let x = 0; x < W; x++) for (let y = 0; y < rows; y++) for (let c = 0; c < 3; c++) raw[x * 3 + c] += d[(y * W + x) * 4 + c] / rows;
      const r = Math.max(2, Math.round(W / 9));
      for (let x = 0; x < W; x++) {
        for (let c = 0; c < 3; c++) {
          let s = 0;
          for (let k = -r; k <= r; k += 2) s += raw[((x + k + W * 4) % W) * 3 + c];
          const v = s / (Math.floor((2 * r) / 2) + 1);
          strip[x * 4 + c] = v; strip[(W + x) * 4 + c] = v; mean[c] += v / W;
        }
        strip[x * 4 + 3] = 255; strip[(W + x) * 4 + 3] = 255;
      }
      cache.sky = { strip, mean };
    }
    const { strip, mean } = cache.sky;

    // One read of a picture (or the sky strip) at angle `theta` and height `y`, with the two sides joined the chosen way.
    const A = [0, 0, 0], B = [0, 0, 0];
    function read(data, h, theta, y, out) {
      let u = (theta / TAU) * rep; u -= Math.floor(u);
      if (mirror) return bilinearRGB(data, W, h, (u < 0.5 ? u * 2 : (1 - u) * 2) * (W - 1), y, out);
      const q = u * (1 - BLEND);
      if (q >= BLEND) return bilinearRGB(data, W, h, q * (W - 1), y, out);
      const w = smoothstep(0, 1, q / BLEND);
      bilinearRGB(data, W, h, (q + 1 - BLEND) * (W - 1), y, A); bilinearRGB(data, W, h, q * (W - 1), y, B);
      out[0] = lerp(A[0], B[0], w); out[1] = lerp(A[1], B[1], w); out[2] = lerp(A[2], B[2], w);
      return out;
    }

    const t = [0, 0, 0], sk = [0, 0, 0], sum = [0, 0, 0], skyMode = p.sky, rim = p.rim / 100;
    paintPixels(ctx, W, H, (x, y, o) => {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.hypot(dx, dy) + 1e-6, th = Math.atan2(dy, dx) + spin;
      const sr = sOf(r / Rout), v = clamp(1 - sr, 0, 1), ysrc = v * (H - 1);
      // How many picture pixels one output pixel covers: near the centre a whole row is squeezed into a few pixels,
      // so several samples are averaged there. Without that the middle of the planet would be a moire of stripes.
      const spanX = (W * (mirror ? 2 : 1 - BLEND) * rep) / (TAU * r), spanY = H / (Rout * gd(Math.min(sr, sEnd)));
      const tx = clamp(Math.ceil(spanX), 1, 12), ty = clamp(Math.ceil(spanY), 1, 3);
      sum[0] = sum[1] = sum[2] = 0;
      for (let j = 0; j < ty; j++) for (let i = 0; i < tx; i++) {
        read(d, H, th + ((i + 0.5) / tx - 0.5) / r, clamp(ysrc + ((j + 0.5) / ty - 0.5) * spanY, 0, H - 1), t);
        sum[0] += t[0]; sum[1] += t[1]; sum[2] += t[2];
      }
      const inv = 1 / (tx * ty);
      let R = sum[0] * inv, G = sum[1] * inv, Bc = sum[2] * inv;
      const past = sr - 1;
      if (past > 0) {
        if (skyMode === 'soft') {
          // beyond the picture's top edge the colours are those of its sky, smoothed so no streaks are left, and they
          // fade towards the average colour of that sky as the far pole of the sphere comes near
          read(strip, 2, th, 0.5, sk);
          const m = smoothstep(0, Math.max(0.05, sEnd - 1), past) * 0.85, f = smoothstep(0, 0.035, past);
          R = lerp(R, lerp(sk[0], mean[0], m), f); G = lerp(G, lerp(sk[1], mean[1], m), f); Bc = lerp(Bc, lerp(sk[2], mean[2], m), f);
        } else if (skyMode === 'black' || skyMode === 'white') {
          const e = smoothstep(Rout - 1.2, Rout + 1.2, r), gg = skyMode === 'white' ? 255 : 0;
          R = lerp(R, gg, e); G = lerp(G, gg, e); Bc = lerp(Bc, gg, e);
        }
      } else if (skyMode === 'black' || skyMode === 'white') {
        const e = smoothstep(Rout - 1.2, Rout + 1.2, r), gg = skyMode === 'white' ? 255 : 0;
        R = lerp(R, gg, e); G = lerp(G, gg, e); Bc = lerp(Bc, gg, e);
      }
      if (rim > 0) {
        const z = (r - Rout) / (0.09 * Rout), glow = Math.exp(-z * z) * rim * 0.5, wh = skyMode === 'white' ? 0 : 255;
        R = lerp(R, wh, glow); G = lerp(G, wh, glow); Bc = lerp(Bc, wh, glow);
      }
      o[0] = R; o[1] = G; o[2] = Bc;
    });
  },
});
