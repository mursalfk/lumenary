// src/engine/styles/mandelbrot-fill.js
import { still, clamp, lerp, TAU } from '../utils.js';
import { pixels, bilinearRGB, ramp } from '../helpers.js';

const OUT = {
  dusk: [[16, 14, 48], [64, 30, 112], [168, 56, 124], [244, 150, 96], [64, 30, 112]],
  gold: [[24, 14, 6], [120, 74, 20], [236, 180, 70], [255, 236, 170], [120, 74, 20]],
  ice: [[8, 24, 52], [28, 88, 150], [120, 190, 226], [232, 246, 255], [28, 88, 150]],
  ink: [[18, 18, 24], [56, 56, 66], [140, 140, 150], [236, 234, 228], [56, 56, 66]],
};

const VIEWS = {
  full: { cx: -0.55, cy: 0, w: 3.2, name: 'The whole set' },
  seahorse: { cx: -0.7453, cy: 0.1127, w: 0.4, name: 'Seahorse valley' },
  elephant: { cx: 0.2855, cy: 0.0127, w: 0.45, name: 'Elephant valley' },
  spiral: { cx: -0.0885, cy: 0.6535, w: 0.4, name: 'Triple spiral' },
  mini: { cx: -1.7549, cy: 0, w: 0.3, name: 'A small copy of the set' },
};

export default still({
  id: 'mandelbrot-fill',
  name: 'Mandelbrot Fill',
  blurb: 'Follow each point’s orbit under z² + c. When it passes through a window in the plane, the picture shows the colour found there.',
  maxSide: 760,
  params: [
    { key: 'kind', label: 'Set', type: 'select', default: 'mandel', options: [['mandel', 'Mandelbrot set'], ['julia', 'Julia set']] },
    { key: 'view', label: 'Where to look', type: 'select', default: 'full', options: Object.entries(VIEWS).map(([k, v]) => [k, v.name]) },
    { key: 'zoom', label: 'Zoom', type: 'range', min: 0.5, max: 5, step: 0.1, default: 1, fmt: (v) => v.toFixed(1) + 'x' },
    { key: 'julia', label: 'Julia shape', type: 'range', min: 0, max: 360, step: 1, default: 40, fmt: (v) => v + '°' },
    { key: 'window', label: 'Size of the picture window', type: 'range', min: 20, max: 200, step: 1, default: 90, fmt: (v) => (v / 100).toFixed(2) },
    { key: 'iter', label: 'Detail', type: 'range', min: 30, max: 300, step: 5, default: 110 },
    { key: 'edge', label: 'Glow of the edge', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'out', label: 'Where no picture lands', type: 'select', default: 'dusk', options: [['dusk', 'Dusk'], ['gold', 'Gold'], ['ice', 'Ice'], ['ink', 'Ink']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, vw = VIEWS[p.view] || VIEWS.full, wid = (p.kind === 'julia' ? 3.2 : vw.w) / p.zoom, hei = (wid * H) / W;
    const cx = p.kind === 'julia' ? 0 : vw.cx, cy = p.kind === 'julia' ? 0 : vw.cy, ja = (p.julia * Math.PI) / 180, jr = 0.7885, jcx = jr * Math.cos(ja), jcy = jr * Math.sin(ja);
    const hx = p.window / 100 * 1.1, hy = hx * (H / W), maxIt = p.iter, glow = p.edge / 100, rgb = [0, 0, 0];
    const out = ctx.createImageData(W, H), o4 = out.data;
    const stops = OUT[p.out] || OUT.dusk, pc = [0, 0, 0];
    const pal = (t) => { ramp(stops, 0.5 + 0.5 * Math.sin(TAU * t), pc); pc[0] *= 0.7; pc[1] *= 0.7; pc[2] *= 0.7; return pc; };
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const x0 = cx + (px / W - 0.5) * wid, y0 = cy - (py / H - 0.5) * hei;
      let zx = p.kind === 'julia' ? x0 : 0, zy = p.kind === 'julia' ? y0 : 0;
      const ccx = p.kind === 'julia' ? jcx : x0, ccy = p.kind === 'julia' ? jcy : y0;
      let hit = -1, hr = 0, hg = 0, hb = 0, esc = -1, nu = 0;
      for (let it = 0; it < maxIt; it++) {
        const t = zx * zx - zy * zy + ccx; zy = 2 * zx * zy + ccy; zx = t;
        const m = zx * zx + zy * zy;
        if (hit < 0 && it > 0 && Math.abs(zx) < hx && Math.abs(zy) < hy) {
          bilinearRGB(d, W, H, ((zx / hx + 1) / 2) * (W - 1), ((1 - zy / hy) / 2) * (H - 1), rgb); hit = it; hr = rgb[0]; hg = rgb[1]; hb = rgb[2];
        }
        if (m > 400) { esc = it; nu = it + 1 - Math.log2(Math.log2(m) / 2 + 1e-9); break; }
      }
      const o = (py * W + px) * 4;
      let R, G, B;
      if (hit >= 0) { const f = 0.5 + 0.5 * Math.exp(-hit / 7); R = hr * f; G = hg * f; B = hb * f; }
      else if (esc >= 0) { const c = pal(nu * 0.045); R = c[0]; G = c[1]; B = c[2]; }
      else { R = 8; G = 8; B = 14; }
      if (esc >= 0 && glow > 0) { const g = Math.exp(-esc / 14) * glow; R += 200 * g * 0.45; G += 170 * g * 0.45; B += 140 * g * 0.45; }
      o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
