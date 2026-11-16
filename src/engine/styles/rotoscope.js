// src/engine/styles/rotoscope.js
import { clamp, lerp, smoothstep, vnoise, boxBlur, sobel, hash2 } from '../utils.js';
import { blurRGB } from '../helpers.js';
import { readFrame } from '../history.js';

const FPS = 24;       // film rate: a new drawing every 1, 2 or 3 of these frames
const INK = [26, 21, 30];
const CELL = 8;       // grid of the wobble fields, in pixels

export default {
  id: 'rotoscope',
  name: 'Rotoscope',
  kind: 'animated',
  maxSide: 640,
  thumbAt: 1.4,
  blurb: 'Traced by hand, frame by frame, as in A Scanner Darkly. Each drawing has its own few flat tones and its own shaky ink line, and the colour never quite stays inside the lines. On video a new drawing is made every second frame; on a still picture it keeps being redrawn, so the lines boil.',
  params: [
    { key: 'levels', label: 'Tones of colour', type: 'range', min: 2, max: 8, step: 1, default: 4 },
    { key: 'colour', label: 'Colour strength', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'line', label: 'Ink line', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'boil', label: 'Boil from drawing to drawing', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'slip', label: 'Colour slips off the lines', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'wash', label: 'Loose, washed colour', type: 'range', min: 0, max: 100, step: 1, default: 30, fmt: (v) => v + '%' },
    { key: 'rate', label: 'A new drawing every', type: 'select', default: '2', options: [['1', 'Frame (on ones)'], ['2', 'Second frame (on twos)'], ['3', 'Third frame (on threes)']] },
    { key: 'paper', label: 'Paper grain', type: 'toggle', default: true },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, cur = null, fresh = true, out = null, drawn = null, since = 1, drawing = 0, clock = 0, redo = true;

    // A smooth random field on a coarse grid, read back bilinearly: how far each pixel of a drawing is nudged.
    function field(seed, amp) {
      const gw = Math.ceil(W / CELL) + 2, gh = Math.ceil(H / CELL) + 2, g = new Float32Array(gw * gh * 2);
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const k = (j * gw + i) * 2; g[k] = (vnoise(i * 0.55, j * 0.55, seed) - 0.5) * 2 * amp; g[k + 1] = (vnoise(i * 0.55 + 31, j * 0.55 + 17, seed + 1) - 0.5) * 2 * amp; }
      return { g, gw };
    }
    const at = (f, x, y, out) => {
      const u = x / CELL, v = y / CELL, i = u | 0, j = v | 0, a = u - i, b = v - j, k = (j * f.gw + i) * 2, g = f.g, s = f.gw * 2;
      out[0] = (g[k] * (1 - a) + g[k + 2] * a) * (1 - b) + (g[k + s] * (1 - a) + g[k + s + 2] * a) * b;
      out[1] = (g[k + 1] * (1 - a) + g[k + 3] * a) * (1 - b) + (g[k + s + 1] * (1 - a) + g[k + s + 3] * a) * b;
    };

    // Make the next drawing from the picture as it is now.
    function compute() {
      if (fresh) { cur = readFrame(work, W, H); fresh = false; }
      drawing++;
      const N = W * H, sc = W / 640, levels = p.levels, boil = p.boil / 100, wash = p.wash / 100, sat = 1 + (p.colour / 100) * 0.9 - 0.25;
      const bl = blurRGB(cur, W, H, Math.max(1, Math.round(2.2 * sc)), 1), R = bl[0], G = bl[1], B = bl[2], L = new Float32Array(N);
      for (let i = 0; i < N; i++) L[i] = (0.299 * R[i] + 0.587 * G[i] + 0.114 * B[i]) / 255;
      // the flat fill: the picture's tone cut into a few bands, with each band's edge wandering a little from one drawing to the next
      const fill = new Uint8ClampedArray(N * 4), wob = boil * 0.07;
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
        const l = L[i], lj = clamp(l + (vnoise(x / (34 * sc) + drawing * 7.3, y / (34 * sc), 11) - 0.5) * wob * 2), q = (Math.min(levels - 1, Math.floor(lj * levels)) + 0.5) / levels, k = q / Math.max(0.04, l);
        let r = R[i] * k, g = G[i] * k, b = B[i] * k;
        const m = 0.299 * r + 0.587 * g + 0.114 * b;
        r = m + (r - m) * sat; g = m + (g - m) * sat; b = m + (b - m) * sat;
        const o = i * 4;
        fill[o] = lerp(r, R[i], wash); fill[o + 1] = lerp(g, G[i], wash); fill[o + 2] = lerp(b, B[i], wash); fill[o + 3] = 255;
      }
      // the ink: where the tone changes fast, thickened a little
      const ln = p.line / 100, line = new Float32Array(N);
      if (ln > 0) {
        const { mag } = sobel(boxBlur(L, W, H, Math.max(1, Math.round(sc))), W, H, 1), at0 = lerp(0.34, 0.09, ln);
        for (let i = 0; i < N; i++) line[i] = smoothstep(at0, at0 * 1.7, mag[i]);
        if (ln > 0.55) { const th = boxBlur(line, W, H, Math.max(1, Math.round(sc * (ln - 0.45) * 2.2))); for (let i = 0; i < N; i++) line[i] = smoothstep(0.18, 0.5, th[i]); }
      }
      // two different wobbles: one for the ink, one for the colour, which is why the colour slips out of the lines
      const ampL = boil * 2.4 * sc, ampC = (p.slip / 100) * 5.5 * sc, fl = field(drawing * 13 + 3, ampL), fc = field(drawing * 13 + 700, ampC), o2 = [0, 0], o3 = [0, 0];
      if (!drawn) drawn = new ImageData(W, H);
      const d = drawn.data, paper = p.paper, mx = W - 1, my = H - 1;
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
        at(fc, x, y, o2); at(fl, x, y, o3);
        const cx = clamp(Math.round(x + o2[0]), 0, mx), cy = clamp(Math.round(y + o2[1]), 0, my), lx = clamp(Math.round(x + o3[0]), 0, mx), ly = clamp(Math.round(y + o3[1]), 0, my);
        const f = (cy * W + cx) * 4, k = line[ly * W + lx] * 0.93, n = paper ? (hash2(x, y, 4) - 0.5) * 14 : 0, o = i * 4;
        d[o] = fill[f] * (1 - k) + INK[0] * k + n; d[o + 1] = fill[f + 1] * (1 - k) + INK[1] * k + n; d[o + 2] = fill[f + 2] * (1 - k) + INK[2] * k + n; d[o + 3] = 255;
      }
      redo = false;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; fresh = true; drawn = null; redo = true; since = 1; },
      // a new video frame: the next drawing is traced from it
      setFrame(w) { work = w; fresh = true; },
      setParams(np) { p = np; redo = true; },
      step(dt) {
        if (!W) return;
        clock += dt; since += dt;
        if (since >= Number(p.rate) / FPS) { since = since % (Number(p.rate) / FPS); redo = true; }
      },
      draw(ctx, t, dt) {
        if (!W) return;
        if (dt > 0) this.step(dt);
        if (redo || !drawn) compute();
        ctx.putImageData(drawn, 0, 0);
      },
      dispose() { drawn = null; out = null; },
    };
  },
};
