// src/engine/styles/paper-cut-out.js
import { still, boxBlur, hexToRgb, smoothstep, clamp, hash2, vnoise } from '../utils.js';
import { pixels, stretchedL, ramp, kmeans } from '../helpers.js';

const PALETTES = {
  sunset: ['#2b1b4a', '#6b2d7a', '#c2407a', '#f4755a', '#ffc07a', '#fff0c8'],
  ocean: ['#04202c', '#0b4a63', '#1b7f95', '#4fb6b0', '#a5dcc6', '#eefbe9'],
  forest: ['#10261c', '#1f4a34', '#3f7a4c', '#86a85a', '#d6c872', '#f6efc8'],
  mono: ['#1a1a1c', '#3b3b3e', '#6a6a6c', '#9c9c9a', '#cfcfca', '#f4f2ec'],
};

export default still({
  id: 'paper-cut-out',
  name: 'Paper Cut-out',
  blurb: 'Layers of coloured paper cut with scissors and stacked, each one throwing a soft shadow on the sheet below.',
  maxSide: 1000,
  params: [
    { key: 'palette', label: 'Papers', type: 'select', default: 'sunset', options: [['sunset', 'Sunset'], ['ocean', 'Ocean'], ['forest', 'Forest'], ['mono', 'Greys'], ['picture', 'From the picture']] },
    { key: 'layers', label: 'Layers', type: 'range', min: 3, max: 7, step: 1, default: 5 },
    { key: 'smooth', label: 'Smoothness of cuts', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'shadow', label: 'Shadow', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'angle', label: 'Light from', type: 'range', min: 0, max: 360, step: 1, default: 135, fmt: (v) => v + '°' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const px = pixels(work, W, H, cache), N = W * H, sc = W / 800, n = p.layers;
    const sm = Math.max(1, Math.round((2 + (p.smooth / 100) * 14) * sc)), Lb = boxBlur(boxBlur(stretchedL(cache), W, H, sm), W, H, sm);
    // paper colours from lightest to darkest picked per layer
    let cols;
    if (p.palette === 'picture') {
      cols = kmeans(px.data, n, 5, 9, 13).sort((a, b) => a[0] * 0.3 + a[1] * 0.59 + a[2] * 0.11 - (b[0] * 0.3 + b[1] * 0.59 + b[2] * 0.11));
    } else {
      const stops = (PALETTES[p.palette] || PALETTES.sunset).map(hexToRgb), t = [0, 0, 0]; cols = [];
      for (let i = 0; i < n; i++) { ramp(stops, i / (n - 1), t); cols.push([t[0], t[1], t[2]]); }
    }
    // layer i covers the pixels brighter than its threshold; layer 0 is the whole sheet underneath
    const a = (p.angle * Math.PI) / 180, dx = Math.round(Math.cos(a) * 5 * sc * -1), dy = Math.round(-Math.sin(a) * 5 * sc * -1), sr = Math.max(1, Math.round(3.5 * sc)), dep = p.shadow / 100;
    const masks = [], shadows = [];
    for (let i = 1; i < n; i++) {
      const t = i / n, m = new Float32Array(N);
      for (let k = 0; k < N; k++) m[k] = smoothstep(t - 0.012, t + 0.012, Lb[k]);
      const sh = new Float32Array(N);
      for (let y = 0; y < H; y++) { const yy = Math.min(H - 1, Math.max(0, y - dy)); for (let x = 0; x < W; x++) { const xx = Math.min(W - 1, Math.max(0, x - dx)); sh[y * W + x] = m[yy * W + xx]; } }
      masks.push(m); shadows.push(boxBlur(boxBlur(sh, W, H, sr), W, H, sr));
    }
    const out = ctx.createImageData(W, H), d = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, fibre = 1 + (hash2(x >> 1, y >> 1, 4) - 0.5) * 0.05 + (vnoise(x * 0.25 / sc, y * 0.25 / sc, 2) - 0.5) * 0.04;
      let R = cols[0][0], G = cols[0][1], B = cols[0][2];
      for (let l = 1; l < n; l++) {
        const m = masks[l - 1][i], s = shadows[l - 1][i] * (1 - m) * 0.55 * dep, c = cols[l];
        R *= 1 - s; G *= 1 - s; B *= 1 - s;
        R = R * (1 - m) + c[0] * m; G = G * (1 - m) + c[1] * m; B = B * (1 - m) + c[2] * m;
        // the cut edge catches the light: a hairline brighter than the paper
        const edge = m > 0.02 && m < 0.98 ? 0.28 : 0; R += edge * 60; G += edge * 60; B += edge * 60;
      }
      d[o] = R * fibre; d[o + 1] = G * fibre; d[o + 2] = B * fibre; d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
