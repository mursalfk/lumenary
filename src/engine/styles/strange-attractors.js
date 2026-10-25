// src/engine/styles/strange-attractors.js
import { clamp, lerp, rng } from '../utils.js';
import { ramp } from '../helpers.js';

const TYPES = {
  clifford: { name: 'Clifford', sets: [[-1.4, 1.6, 1.0, 0.7], [-1.7, 1.8, -1.9, -0.4], [1.5, -1.8, 1.6, 0.9]], f: (x, y, a, b, c, d) => [Math.sin(a * y) + c * Math.cos(a * x), Math.sin(b * x) + d * Math.cos(b * y)], ext: (c, d) => [1 + Math.abs(c), 1 + Math.abs(d)] },
  dejong: { name: 'De Jong', sets: [[1.4, -2.3, 2.4, -2.1], [-2.7, -0.09, -0.86, -2.2], [-2.24, 0.43, -0.65, -2.43]], f: (x, y, a, b, c, d) => [Math.sin(a * y) - Math.cos(b * x), Math.sin(c * x) - Math.cos(d * y)], ext: () => [2, 2] },
};
const GLOW = [[4, 4, 12], [90, 30, 90], [230, 90, 70], [255, 210, 130], [255, 250, 235]];

export default {
  id: 'strange-attractors',
  name: 'Strange Attractors',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.2,
  blurb: 'Four numbers, one tiny formula, repeated without end. The point never repeats itself and never leaves a narrow band, and the band breathes as the numbers drift.',
  params: [
    { key: 'type', label: 'Formula', type: 'select', default: 'clifford', options: Object.entries(TYPES).map(([k, v]) => [k, v.name]) },
    { key: 'drift', label: 'Drift of the numbers', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'glow', label: 'Glow', type: 'range', min: 10, max: 100, step: 1, default: 65 },
    { key: 'fade', label: 'How long points linger', type: 'range', min: 50, max: 98, step: 1, default: 88, fmt: (v) => v + '%' },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ember', 'Ember']] },
    { key: 'seed', label: 'Another set of numbers', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, gw = 0, gh = 0, dens, cr, cg, cb, img, built = '', small = null, sctx = null, sdata = null, time = 0, xs, ys, r = rng(2), px = 0, py = 0;
    const K = 48;

    function build() {
      const key = [p.type, p.seed, W].join('|');
      if (key === built) return;
      gw = Math.round(W / 2); gh = Math.round((gw * H) / W);
      const c = env.makeCanvas(gw, gh), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, gw, gh); img = cx.getImageData(0, 0, gw, gh).data;
      const n = gw * gh; dens = new Float32Array(n); cr = new Float32Array(n); cg = new Float32Array(n); cb = new Float32Array(n);
      r = rng(p.seed * 13 + 1); xs = new Float32Array(K); ys = new Float32Array(K); for (let i = 0; i < K; i++) { xs[i] = r() * 2 - 1; ys[i] = r() * 2 - 1; }
      small = env.makeCanvas(gw, gh); sctx = small.getContext('2d'); sdata = sctx.createImageData(gw, gh); built = key; time = 0;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build();
        time += dt;
        if (ptr && ptr.inside) { px += ((ptr.x - 0.5) - px) * Math.min(1, dt * 4); py += ((ptr.y - 0.5) - py) * Math.min(1, dt * 4); } else { px *= 1 - Math.min(1, dt * 2); py *= 1 - Math.min(1, dt * 2); }
        const T = TYPES[p.type] || TYPES.clifford, base = T.sets[(p.seed | 0) % 3], k = (p.drift / 100) * 0.22, w = time * 0.35;
        const a = base[0] + k * Math.sin(w * 1.0 + 1) + px * 0.6, b = base[1] + k * Math.sin(w * 0.8 + 2.3) + py * 0.6, c = base[2] + k * Math.sin(w * 1.3 + 4), d = base[3] + k * Math.sin(w * 0.6 + 5.1);
        const [ex, ey] = T.ext(c, d), sx = (gw / 2 / ex) * 0.97, sy = (gh / 2 / ey) * 0.97, fade = p.fade / 100, n = gw * gh;
        for (let i = 0; i < n; i++) { dens[i] *= fade; cr[i] *= fade; cg[i] *= fade; cb[i] *= fade; }
        const per = 1100;
        for (let q = 0; q < K; q++) {
          let x = xs[q], y = ys[q];
          for (let s = 0; s < per; s++) {
            const nxy = T.f(x, y, a, b, c, d); x = nxy[0]; y = nxy[1];
            const ix = (x * sx + gw / 2) | 0, iy = (y * sy + gh / 2) | 0;
            if (ix < 0 || iy < 0 || ix >= gw || iy >= gh) continue;
            const i = iy * gw + ix; dens[i] += 1; cr[i] += img[i * 4]; cg[i] += img[i * 4 + 1]; cb[i] += img[i * 4 + 2];
          }
          xs[q] = x; ys[q] = y;
        }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const n = gw * gh, o4 = sdata.data, gain = 0.25 + (p.glow / 100) * 1.1, rgb = [0, 0, 0];
        let mx = 1; for (let i = 0; i < n; i++) if (dens[i] > mx) mx = dens[i];
        const lm = Math.log1p(mx * 0.5);
        for (let i = 0; i < n; i++) {
          const o = i * 4, c = dens[i]; let R = 6, G = 6, B = 12;
          if (c > 0.01) {
            const v = clamp(Math.pow(Math.log1p(c) / lm, 1.2) * gain);
            if (p.colour === 'picture') { const k = v / c; R = cr[i] * k * 1.35 + 255 * v * v * v * 0.5; G = cg[i] * k * 1.35 + 255 * v * v * v * 0.5; B = cb[i] * k * 1.35 + 255 * v * v * v * 0.5; }
            else { ramp(GLOW, v, rgb); R = rgb[0]; G = rgb[1]; B = rgb[2]; }
          }
          o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
        }
        sctx.putImageData(sdata, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(small, 0, 0, W, H);
      },
      dispose() {},
    };
  },
};
