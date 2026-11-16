// src/engine/styles/manga.js
import { still, clamp, lerp, smoothstep, boxBlur, sobel, hash2, vnoise, TAU } from '../utils.js';
import { pixels, stretchedL, blurRGB } from '../helpers.js';
import { darkLines } from '../toon.js';

const PAPERS = { white: [250, 249, 245], cream: [240, 231, 208] };
const SQ = Math.SQRT1_2;

// Coverage (0 to 1, anti-aliased) of a screentone at (x, y). `pitch` is the distance between dots or lines in pixels.
const dots = (x, y, pitch, density) => {
  const u = ((x + y) * SQ) / pitch, v = ((x - y) * SQ) / pitch, fu = u - Math.round(u), fv = v - Math.round(v), r = Math.sqrt(density / Math.PI);
  return clamp((r - Math.hypot(fu, fv)) * pitch + 0.5);
};
const hatch = (x, y, pitch, half, dir) => {
  const w = ((dir ? x - y : x + y) * SQ) / pitch;
  return clamp((half - Math.abs(w - Math.round(w))) * pitch + 0.5);
};

export default still({
  id: 'manga',
  name: 'Manga',
  blurb: 'A page of black and white comic ink: firm outlines, solid blacks, and the shades in between built from screentone, the printed sheets of dots and hatching that cartoonists stick onto a page. Add speed lines for the moment of impact.',
  maxSide: 1300,
  params: [
    { key: 'tone', label: 'Size of the screentone', type: 'range', min: 40, max: 200, step: 1, default: 100, fmt: (v) => v + '%' },
    { key: 'line', label: 'Ink outline', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'black', label: 'Solid black', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'speed', label: 'Speed lines', type: 'select', default: 'none', options: [['none', 'None'], ['focus', 'Burst from the middle'], ['rush', 'Rushing sideways']] },
    { key: 'wash', label: 'Colour', type: 'select', default: 'bw', options: [['bw', 'Black and white'], ['wash', 'A wash of colour']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'white', options: [['white', 'White'], ['cream', 'Cream']] },
    { key: 'panel', label: 'Panel frame', type: 'toggle', default: true },
    { key: 'seed', label: 'Another page', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, Ls = stretchedL(cache), sc = W / 1000, N = W * H;
    // Tone map: the picture with its local contrast lifted, so faces and folds keep their shapes in only a few tones.
    const bl = boxBlur(boxBlur(Ls, W, H, Math.max(2, Math.round(W / 28))), W, H, Math.max(2, Math.round(W / 28))), soft = boxBlur(Ls, W, H, Math.max(1, Math.round(1.4 * sc))), T = new Float32Array(N);
    for (let i = 0; i < N; i++) T[i] = clamp(soft[i] + (soft[i] - bl[i]) * 0.9);
    const pitch = Math.max(2.6, (p.tone / 100) * 4.4 * sc);

    // Ink lines: strong outlines where the tone changes quickly, and thin dark features such as eyes and creases.
    const { mag } = sobel(boxBlur(Ls, W, H, Math.max(1, Math.round(1.2 * sc))), W, H, 1), dk = darkLines(Ls, W, H, Math.max(1, Math.round(sc)), Math.max(2, Math.round(3.4 * sc)));
    const lw = p.line / 100, lm = new Float32Array(N), edgeAt = lerp(0.42, 0.16, lw), darkAt = lerp(0.2, 0.07, lw);
    for (let i = 0; i < N; i++) lm[i] = Math.max(smoothstep(edgeAt, edgeAt * 1.5, mag[i]), smoothstep(darkAt, darkAt * 1.7, dk[i]) * 0.95);
    const thick = lw > 0.5 ? boxBlur(lm, W, H, Math.max(1, Math.round(sc * (lw - 0.4) * 2.4))) : lm;
    const line = new Float32Array(N), cut = lw > 0.5 ? 0.3 : 0.5;
    for (let i = 0; i < N; i++) line[i] = lw === 0 ? 0 : smoothstep(cut - 0.14, cut + 0.14, thick[i]);

    // Tone bands, from the lightest: bare paper, fine dots, coarse dots, hatching, cross-hatching, solid black.
    const solid = lerp(0.07, 0.3, p.black / 100), t1 = 0.8, t2 = 0.63, t3 = 0.48, t4 = Math.max(solid + 0.05, 0.33);
    const paper = PAPERS[p.paper] || PAPERS.white, wash = p.wash === 'wash', rgb = wash ? blurRGB(d, W, H, Math.max(3, Math.round(6 * sc)), 2) : null;
    const focus = p.speed === 'focus', rush = p.speed === 'rush', cx = W / 2, cy = H / 2, S = Math.min(W, H), seed = p.seed;
    // speed lines are kept to flat, light places (a wall, a sky), so they run behind a face instead of across it
    const calm = (focus || rush) ? boxBlur(mag, W, H, Math.max(3, Math.round(7 * sc))) : null, rays = 132, band = Math.max(6, Math.round(H / 46)), img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      const v = T[i];
      let ink;
      if (v < solid) ink = 1;
      else if (v < t4) ink = Math.max(hatch(x, y, pitch * 0.92, 0.2, 0), hatch(x, y, pitch * 0.92, 0.2, 1));
      else if (v < t3) ink = hatch(x, y, pitch * 0.92, 0.19, 0);
      else if (v < t2) ink = dots(x, y, pitch, 0.34);
      else if (v < t1) ink = dots(x, y, pitch, 0.13);
      else ink = 0;
      // speed lines only fill the light parts of the page, behind everything that is drawn
      if ((focus || rush) && v > 0.58) {
        let s = 0;
        if (focus) {
          const dx = x - cx, dy = y - cy, rr = Math.hypot(dx, dy), nn = (Math.atan2(dy, dx) / TAU) * rays + 0.5, k = Math.floor(nn), wd = 0.1 + 0.34 * hash2(k, 3, seed), jit = (hash2(k, 5, seed) - 0.5) * 0.2;
          const dist = Math.abs(nn - k - 0.5 - jit) * ((TAU * rr) / rays), gate = smoothstep(S * 0.34, S * 0.52, rr + (hash2(k, 7, seed) - 0.5) * S * 0.14);
          s = clamp(wd * ((TAU * rr) / rays) - dist + 0.5) * gate;
        } else {
          const k = Math.floor(y / band), fy = y / band - k, t = clamp(vnoise(x / (W * 0.2), k * 7.3, seed) * 1.7 - 0.5), half = t * (0.1 + 0.34 * hash2(k, 2, seed));
          s = clamp((half - Math.abs(fy - 0.5)) * band + 0.5) * smoothstep(0, 0.2, t);
        }
        ink = Math.max(ink, s * smoothstep(0.58, 0.72, v) * (1 - smoothstep(0.018, 0.06, calm[i])));
      }
      ink = Math.max(ink, line[i]);
      const k4 = i * 4, shade = 1 - ink;
      if (wash) {
        // the colour is laid under the tones, lighter than the picture, so the ink still carries all the shapes
        const q = 0.6, cr = lerp(255, rgb[0][i], 0.62), cg = lerp(255, rgb[1][i], 0.62), cb = lerp(255, rgb[2][i], 0.62);
        o[k4] = (paper[0] * (1 - q) + cr * q * (paper[0] / 255)) * shade; o[k4 + 1] = (paper[1] * (1 - q) + cg * q * (paper[1] / 255)) * shade; o[k4 + 2] = (paper[2] * (1 - q) + cb * q * (paper[2] / 255)) * shade;
      } else { o[k4] = paper[0] * shade; o[k4 + 1] = paper[1] * shade; o[k4 + 2] = paper[2] * shade; }
      // black is never quite black on a printed page
      if (ink > 0.5) { o[k4] += 14 * ink; o[k4 + 1] += 14 * ink; o[k4 + 2] += 16 * ink; }
      const grain = (hash2(x, y, seed + 9) - 0.5) * 7;
      o[k4] += grain; o[k4 + 1] += grain; o[k4 + 2] += grain; o[k4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    if (p.panel) {
      const m = Math.round(Math.min(W, H) * 0.035), fw = Math.max(2, 4.2 * sc);
      ctx.fillStyle = `rgb(${paper[0]},${paper[1]},${paper[2]})`;
      ctx.fillRect(0, 0, W, m); ctx.fillRect(0, H - m, W, m); ctx.fillRect(0, 0, m, H); ctx.fillRect(W - m, 0, m, H);
      ctx.strokeStyle = '#0c0c0e'; ctx.lineWidth = fw; ctx.lineJoin = 'miter';
      ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    }
  },
});
