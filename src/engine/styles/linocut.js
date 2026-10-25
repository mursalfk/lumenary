// src/engine/styles/linocut.js
import { still, vnoise, hash2, boxBlur, sobel, hexToRgb, clamp, smoothstep, TAU } from '../utils.js';
import { pixels, stretchedL, contrast } from '../helpers.js';

const INKS = { black: '#15130f', indigo: '#1a2160', rust: '#6a2c18', green: '#18402d' };

export default still({
  id: 'linocut',
  name: 'Linocut',
  blurb: 'Carved lino printed in one colour: solid black where the cutter left the block, gouged lines of changing width for the tones.',
  maxSide: 1100,
  params: [
    { key: 'lines', label: 'Cuts across', type: 'range', min: 24, max: 120, step: 1, default: 64 },
    { key: 'angle', label: 'Direction of cuts', type: 'range', min: 0, max: 180, step: 1, default: 38, fmt: (v) => v + '°' },
    { key: 'wave', label: 'Wander', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -40, max: 80, step: 1, default: 25 },
    { key: 'outline', label: 'Carved outlines', type: 'toggle', default: true },
    { key: 'ink', label: 'Ink', type: 'select', default: 'black', options: [['black', 'Black'], ['indigo', 'Indigo'], ['rust', 'Rust'], ['green', 'Pine']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, Lb = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(2 * sc)));
    const th = (p.angle * Math.PI) / 180, cs = Math.cos(th), sn = Math.sin(th), n = p.lines, wv = p.wave / 100, ct = p.contrast / 100;
    const ink = hexToRgb(INKS[p.ink] || INKS.black), paper = [244, 240, 229];
    const { mag } = p.outline ? sobel(boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(3 * sc))), W, H, 1) : { mag: null };
    const out = ctx.createImageData(W, H), d = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, dark = 1 - contrast(Lb[i], ct);
      // the cut lines swing about with the picture and a slow noise, like a hand following the form
      const along = (-x * sn + y * cs) / W, across = (x * cs + y * sn) / W;
      const u = across * n + wv * 3.2 * (vnoise(x * 0.008 / sc, y * 0.008 / sc, 3) - 0.5) + wv * 1.5 * (0.5 - Lb[i]);
      const f = u - Math.floor(u), dist = Math.abs(f - 0.5) * 2; // 0 at the middle of a ridge, 1 at the gouge
      // every ridge swells and thins along its length, as a V-gouge does
      const swell = 0.78 + 0.45 * vnoise(along * n * 1.3, Math.floor(u) * 0.37, 6);
      const w = Math.min(1.08, Math.pow(Math.max(0, dark), 0.85) * 1.12 * swell);
      let a = smoothstep(dist - 0.08, dist + 0.02, w) * (w > 0.06 ? 1 : 0);
      if (mag && mag[i] > 0.075 + 0.02 * hash2(x >> 1, y >> 1, 2)) a = 1;
      // ragged edges and a few roller specks in the black
      a *= 1 - (vnoise(x * 0.6 / sc, y * 0.6 / sc, 9) > 0.86 ? 0.7 : 0) * (a > 0.9 ? 1 : 0.4);
      const g = 1 + (hash2(x, y, 3) - 0.5) * 0.06;
      for (let c = 0; c < 3; c++) d[o + c] = (paper[c] * (1 - a) + ink[c] * a) * g;
      d[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
