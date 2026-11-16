// src/engine/styles/soft-3d.js
import { still, clamp, lerp, smoothstep, blur2, rgb2hsl, hsl2rgb } from '../utils.js';
import { pixels, slopes } from '../helpers.js';
import { flatten } from '../toon.js';

const LIGHTS = { left: [-0.55, -0.6], top: [0, -0.8], right: [0.55, -0.6] };

export default still({
  id: 'soft-3d',
  name: 'Soft 3D',
  blurb: 'A toy-like render: every shape swells like soft vinyl, is lit from above, throws a small shadow on its neighbour and carries a sheen, in the pale colours of a studio set.',
  maxSide: 1000,
  params: [
    { key: 'colours', label: 'Shapes', type: 'range', min: 5, max: 14, step: 1, default: 9 },
    { key: 'smooth', label: 'Simple shapes', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'puff', label: 'Inflation', type: 'range', min: 10, max: 100, step: 1, default: 60 },
    { key: 'gloss', label: 'Sheen', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'shadow', label: 'Shadows', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'pastel', label: 'Pastel', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'light', label: 'Light from', type: 'select', default: 'left', options: [['left', 'Upper left'], ['top', 'Above'], ['right', 'Upper right']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 900;
    const fk = p.colours + '|' + p.smooth;
    if (cache.fk !== fk) { cache.flat = flatten(d, W, H, p.colours, lerp(4, 9, p.smooth / 100) * sc, lerp(1, 4, p.smooth / 100) * sc, 6, cache); cache.fk = fk; cache.hk = ''; }
    const hk = fk + '|' + p.puff;
    if (cache.hk !== hk) {
      // Height: 1 well inside a shape, falling to nothing at its outline. Blurring "not an outline" twice gives each
      // shape the cross-section of a cushion; the blur radius is how far in from the edge the swelling reaches.
      const { idx } = cache.flat, flatness = new Float32Array(N).fill(1);
      for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) { const i = y * W + x; if (idx[i] !== idx[i + 1] || idx[i] !== idx[i + W]) flatness[i] = 0; }
      const r = Math.max(2, Math.round(lerp(4, 11, p.puff / 100) * sc)), dome = blur2(blur2(flatness, W, H, r), W, H, Math.max(1, Math.round(r / 2)));
      for (let i = 0; i < N; i++) dome[i] = Math.pow(clamp(dome[i]), 2.2);
      cache.dome = dome;
      cache.near = blur2(flatness, W, H, Math.max(1, Math.round(2.5 * sc)));
      cache.slope = slopes(dome, W, H, lerp(10, 26, p.puff / 100) * sc);
      cache.hk = hk;
    }
    const { idx, pal, ch } = cache.flat, { dome, near, slope } = cache, pastel = p.pastel / 100, gloss = p.gloss / 100, shadow = p.shadow / 100;
    const paint = pal.map((c) => { const [h, s, l] = rgb2hsl(c[0], c[1], c[2]); return hsl2rgb(h, clamp(s * lerp(1.35, 0.95, pastel) + 0.05), clamp(lerp(l, 0.5 + (l - 0.5) * 0.62 + 0.12, pastel))); });
    const [lx, ly] = LIGHTS[p.light] || LIGHTS.left, lz = Math.sqrt(1 - lx * lx - ly * ly), hl = Math.hypot(lx, ly, lz + 1), hx = lx / hl, hy = ly / hl, hz = (lz + 1) / hl;
    const off = Math.round(7 * sc), ox = -Math.round(lx * off * 1.4), oy = -Math.round(ly * off * 1.4);
    const out = ctx.createImageData(W, H), o = out.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const c = paint[idx[i]], nx = slope.sx[i], ny = slope.sy[i], nl = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      // lit from one side, but never to black: light wraps round a soft object
      const diff = (nx * lx + ny * ly + lz) * nl, wrap = clamp(diff * 0.62 + 0.42);
      const nh = clamp((nx * hx + ny * hy + hz) * nl), spec = (Math.pow(nh, 46) * 0.85 + Math.pow(nh, 7) * 0.12) * gloss * smoothstep(0.15, 0.6, dome[i]);
      // creases between shapes sit in shade, and each shape drops a little shadow away from the light
      const crease = (1 - near[i]) * 0.5, cast = shadow * 0.42 * clamp(near[i] - near[clamp(y - oy, 0, H - 1) * W + clamp(x - ox, 0, W - 1)]) * 1.6;
      const rim = (1 - nl) * 0.5;
      const lit = (0.5 + 0.66 * wrap) * (1 - crease * (0.35 + 0.4 * shadow)) * (1 - cast);
      // a little of the smoothed picture is kept under the paint, so faces and skies keep their gradients
      let r = (c[0] * 0.8 + ch[0][i] * 0.2) * lit, g = (c[1] * 0.8 + ch[1][i] * 0.2) * lit, b = (c[2] * 0.8 + ch[2][i] * 0.2) * lit;
      r += 255 * spec + 60 * rim; g += 255 * spec + 80 * rim; b += 255 * spec + 110 * rim;
      const wash = 0.12 * pastel;
      o[k] = r + (255 - r) * wash; o[k + 1] = g + (250 - g) * wash; o[k + 2] = b + (246 - b) * wash; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
