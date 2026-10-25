// src/engine/styles/kaleidoscope.js
import { still, clamp, TAU } from '../utils.js';
import { pixels, bilinearRGB } from '../helpers.js';

export default still({
  id: 'kaleidoscope',
  name: 'Kaleidoscope',
  blurb: 'Two mirrors, one wedge of your picture, repeated all the way round. Slide the wedge across the image and the pattern changes.',
  maxSide: 1000,
  params: [
    { key: 'n', label: 'Mirrors', type: 'range', min: 3, max: 16, step: 1, default: 8 },
    { key: 'turn', label: 'Turn the pattern', type: 'range', min: 0, max: 360, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'zoom', label: 'Zoom into the picture', type: 'range', min: 20, max: 200, step: 1, default: 80 },
    { key: 'sx', label: 'Look left to right', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'sy', label: 'Look up and down', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'spin', label: 'Rotate the wedge', type: 'range', min: 0, max: 360, step: 1, default: 20, fmt: (v) => v + '°' },
    { key: 'rim', label: 'Dark joins', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const img = pixels(work, W, H, cache), d = img.data, n = p.n, seg = TAU / n, half = seg / 2, turn = (p.turn * Math.PI) / 180, spin = (p.spin * Math.PI) / 180;
    const cx = W / 2, cy = H / 2, scx = (p.sx / 100) * W, scy = (p.sy / 100) * H, k = (p.zoom / 100) * 0.5, rv = [0, 0, 0];
    const out = ctx.createImageData(W, H), o4 = out.data;
    const mirror = (v, L) => { const m = ((v % (2 * L)) + 2 * L) % (2 * L); return m > L ? 2 * L - m : m; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
      let a = Math.atan2(dy, dx) - turn;
      a = ((a % seg) + seg) % seg;
      const edge = Math.abs(a - half), fold = a > half ? seg - a : a;
      const sa = fold + spin;
      bilinearRGB(d, W, H, mirror(scx + Math.cos(sa) * r * k * 2, W - 1), mirror(scy + Math.sin(sa) * r * k * 2, H - 1), rv);
      let m = 1;
      if (p.rim) { const w = Math.min(a, seg - a) * r; m = clamp(w / (2.5 * (W / 800)) * 0.4 + 0.6, 0, 1); }
      const o = (y * W + x) * 4;
      o4[o] = rv[0] * m; o4[o + 1] = rv[1] * m; o4[o + 2] = rv[2] * m; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
