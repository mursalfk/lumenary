// src/engine/styles/greek-vase.js
import { still, clamp, lerp, smoothstep, boxBlur, sobel, hash2 } from '../utils.js';
import { pixels, stretchedL, blurRGB, cellular, fbm } from '../helpers.js';
import { darkLines } from '../toon.js';

const CLAYS = { corinth: [222, 156, 92], attic: [200, 102, 48], pale: [228, 202, 154] };
const GLAZE = [23, 17, 13], RED = [150, 45, 31], WHITE = [237, 229, 208];

// The running meander ("Greek key") that edges a vase: a hook that spirals inward, standing on a line, repeated.
function meander(ctx, x0, y0, w, h) {
  const u = (h * 0.62) / 5, lw = u * 0.78, top = y0 + (h - 5 * u) / 2;
  ctx.lineWidth = lw; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
  ctx.beginPath();
  for (let x = x0 - 6 * u; x < x0 + w + 6 * u; x += 6 * u) {
    const X = (a) => x + a * u, Y = (b) => top + b * u;
    ctx.moveTo(X(0), Y(5)); ctx.lineTo(X(6), Y(5));
    ctx.moveTo(X(0), Y(5)); ctx.lineTo(X(0), Y(0)); ctx.lineTo(X(5), Y(0)); ctx.lineTo(X(5), Y(4)); ctx.lineTo(X(2), Y(4)); ctx.lineTo(X(2), Y(2)); ctx.lineTo(X(3), Y(2));
  }
  ctx.stroke();
  ctx.fillRect(x0, y0 + h * 0.04, w, h * 0.06); ctx.fillRect(x0, y0 + h * 0.9, w, h * 0.06);
}

export default still({
  id: 'greek-vase',
  name: 'Greek Vase',
  blurb: 'The picture painted onto the side of an ancient Greek vase. In black-figure the shapes are glossy black glaze on orange clay, with fine lines scratched through to the clay; in red-figure it is the other way round. Meander borders, the curve of the pot and the cracks of two thousand years finish it.',
  maxSide: 1200,
  params: [
    { key: 'mode', label: 'Technique', type: 'select', default: 'black', options: [['black', 'Black-figure'], ['red', 'Red-figure']] },
    { key: 'figures', label: 'How much is painted', type: 'range', min: 0, max: 100, step: 1, default: 50, fmt: (v) => v + '%' },
    { key: 'incise', label: 'Scratched detail', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'clay', label: 'Clay', type: 'select', default: 'attic', options: [['attic', 'Attic orange'], ['corinth', 'Corinthian buff'], ['pale', 'Pale ground']] },
    { key: 'accent', label: 'Added red and white', type: 'toggle', default: true },
    { key: 'border', label: 'Meander borders', type: 'toggle', default: true },
    { key: 'curve', label: 'Curve of the pot', type: 'range', min: 0, max: 100, step: 1, default: 45, fmt: (v) => v + '%' },
    { key: 'age', label: 'Age and wear', type: 'range', min: 0, max: 100, step: 1, default: 40, fmt: (v) => v + '%' },
    { key: 'seed', label: 'Another pot', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, Ls = stretchedL(cache), sc = W / 1000, N = W * H, black = p.mode === 'black', seed = p.seed, age = p.age / 100;
    const clay = CLAYS[p.clay] || CLAYS.attic, fine = boxBlur(Ls, W, H, Math.max(1, Math.round(1.6 * sc))), wide = boxBlur(boxBlur(Ls, W, H, Math.max(2, Math.round(W / 24))), W, H, Math.max(2, Math.round(W / 24))), soft = new Float32Array(N);
    // The picture with its local contrast lifted, so a face or a fold keeps its shape in just two tones.
    for (let i = 0; i < N; i++) soft[i] = clamp(fine[i] + (fine[i] - wide[i]) * 0.85);

    // Where the panel for the picture is, and the bands of meander above and below it.
    const bh = p.border ? Math.round(H * 0.085) : 0, gap = p.border ? Math.round(H * 0.022) : 0, y0 = bh + gap, y1 = H - bh - gap;
    // Silhouettes: the threshold moves with "how much is painted"; a blur and a second threshold make the edges smooth.
    const t = lerp(0.16, 0.62, p.figures / 100), S = new Float32Array(N), raw = new Float32Array(N);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      if (y < y0 || y >= y1) { raw[i] = 0; continue; }
      raw[i] = black ? smoothstep(t + 0.035, t - 0.035, soft[i]) : 1 - smoothstep(1 - t - 0.035, 1 - t + 0.035, soft[i]);
    }
    const sm = boxBlur(raw, W, H, Math.max(1, Math.round(2 * sc)));
    for (let i = 0; i < N; i++) S[i] = smoothstep(0.4, 0.6, sm[i]);
    // meander bands are drawn on their own sheet and added to the glaze mask
    if (p.border) {
      const c = env.makeCanvas(W, H), x = c.getContext('2d');
      x.fillStyle = '#000'; x.strokeStyle = '#000';
      meander(x, 0, 0, W, bh); meander(x, 0, H - bh, W, bh);
      const a = x.getImageData(0, 0, W, H).data;
      for (let i = 0; i < N; i++) S[i] = Math.max(S[i], a[i * 4 + 3] / 255);
    }
    const deep = boxBlur(boxBlur(S, W, H, Math.max(2, Math.round(2.2 * sc))), W, H, Math.max(1, Math.round(sc))), halo = boxBlur(S, W, H, Math.max(3, Math.round(4 * sc)));

    // Scratched lines: edges and thin features of the picture, kept to the inside of the shapes.
    const { mag } = sobel(boxBlur(Ls, W, H, Math.max(1, Math.round(1.1 * sc))), W, H, 1), thin = darkLines(Ls, W, H, Math.max(1, Math.round(sc)), Math.max(2, Math.round(3 * sc)));
    const inc = p.incise / 100, lineAt = lerp(0.3, 0.1, inc), tint = p.accent && black ? blurRGB(d, W, H, Math.max(2, Math.round(3 * sc)), 1) : null;
    const img = ctx.createImageData(W, H), o = img.data, tmp = [0, 0, 0, 0, 0], cell = Math.max(8, W / 34), curve = p.curve / 100;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      const k4 = i * 4, s = S[i], u = x / W;
      // clay: slow mottling from uneven firing, a fine grain, and a warm darkening next to the glaze
      const mot = fbm(x / (W * 0.16), y / (W * 0.16), seed, 3), grain = hash2(x, y, seed) - 0.5, hl = halo[i] * (1 - s);
      const cm = 0.9 + 0.2 * mot + grain * 0.05 - hl * 0.14;
      let r = clay[0] * cm, g = clay[1] * (cm - hl * 0.03), b = clay[2] * (cm - hl * 0.06);
      // glaze: nearly black, a little brown where it is thin, with a slight sheen
      const sheen = fbm(x / (W * 0.1) + 5, y / (W * 0.1), seed + 3, 2);
      const gr = GLAZE[0] + 12 * sheen + grain * 5, gg = GLAZE[1] + 9 * sheen + grain * 4, gb = GLAZE[2] + 7 * sheen + grain * 3;
      r = lerp(r, gr, s); g = lerp(g, gg, s); b = lerp(b, gb, s);
      // lines scratched through the glaze to the clay (black-figure), or drawn in glaze on the clay (red-figure)
      const e = Math.max(smoothstep(lineAt, lineAt * 1.6, mag[i]), smoothstep(0.05, 0.12, -thin[i]) * 0.7) * inc;
      if (inc > 0 && y >= y0 && y < y1) {
        if (black) { const a = e * smoothstep(0.7, 0.95, deep[i]); r = lerp(r, clay[0] * 0.98, a); g = lerp(g, clay[1] * 0.98, a); b = lerp(b, clay[2] * 0.98, a); }
        else { const a = e * smoothstep(0.7, 0.95, 1 - deep[i]) * (S[i] < 0.5 ? 1 : 0); r = lerp(r, gr, a); g = lerp(g, gg, a); b = lerp(b, gb, a); }
      }
      // paint added over the glaze: red where the picture is warm and saturated, white where it is cool and pale
      if (tint && s > 0.85) {
        const R = tint[0][i], G = tint[1][i], B = tint[2][i], mx = Math.max(R, G, B), ch = (mx - Math.min(R, G, B)) / 255;
        if (ch > 0.14) {
          const a = smoothstep(0.14, 0.26, ch) * smoothstep(0.75, 0.95, deep[i]) * (0.55 + 0.45 * fbm(x / 9, y / 9, seed + 1, 2)), warm = R >= B;
          const c = warm ? RED : WHITE;
          r = lerp(r, c[0], a); g = lerp(g, c[1], a); b = lerp(b, c[2], a);
        }
      }
      // the curve of the pot: darker towards both sides, with a long soft highlight on the left
      const side = Math.abs(2 * u - 1), shade = 1 - curve * 0.62 * Math.pow(side, 2.3), hi = curve * 38 * Math.exp(-Math.pow((u - 0.3) / 0.045, 2)) * (0.4 + 0.6 * s);
      r = r * shade + hi; g = g * shade + hi; b = b * shade + hi * 0.9;
      // age: a net of fine cracks, chips in the glaze, and stains
      if (age > 0) {
        const stain = fbm(x / (W * 0.22) + 9, y / (W * 0.22), seed + 8, 3);
        const dirt = 1 - age * 0.34 * smoothstep(0.5, 0.8, stain);
        r *= dirt; g *= dirt; b *= dirt * 0.97;
        if (age > 0.12) {
          cellular(x, y, cell, seed, tmp);
          const crack = 1 - smoothstep(0.5 * sc, 1.5 * sc, (tmp[1] - tmp[0]) * 0.9), amount = smoothstep(0.12, 0.7, age) * 0.34 * (0.4 + 0.6 * hash2(tmp[2] | 0, 3, seed));
          r *= 1 - crack * amount; g *= 1 - crack * amount; b *= 1 - crack * amount;
        }
        const chip = hash2(x >> 1, y >> 1, seed + 21) > 1 - 0.0016 * age * (1 + 6 * s * 0) ? 1 : 0;
        if (chip && s > 0.5) { r = lerp(r, clay[0] * 0.9, 0.85); g = lerp(g, clay[1] * 0.9, 0.85); b = lerp(b, clay[2] * 0.9, 0.85); }
      }
      o[k4] = r; o[k4 + 1] = g; o[k4 + 2] = b; o[k4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  },
});
