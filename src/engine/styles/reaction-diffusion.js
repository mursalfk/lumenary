// src/engine/styles/reaction-diffusion.js
import { clamp, lerp, rng, rgb2hsl } from '../utils.js';
import { ramp } from '../helpers.js';

// Gray-Scott feed (f) and kill (k) rates that give each family of pattern.
const PRESETS = {
  coral: [0.0545, 0.062, 'Coral'], worms: [0.078, 0.061, 'Worms'], spots: [0.03, 0.062, 'Spots'], maze: [0.029, 0.057, 'Maze'], mitosis: [0.0367, 0.0649, 'Dividing cells'],
};
const EMBER = [[8, 4, 10], [96, 16, 30], [226, 84, 22], [255, 214, 128], [255, 250, 232]];

export default {
  id: 'reaction-diffusion',
  name: 'Reaction-diffusion',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 4.5,
  blurb: 'Two chemicals feed and kill each other while they spread. Spots, stripes and coral grow on their own, and your picture steers which one appears where.',
  params: [
    { key: 'preset', label: 'Pattern', type: 'select', default: 'coral', options: Object.entries(PRESETS).map(([k, v]) => [k, v[2]]) },
    { key: 'steer', label: 'Picture steers the pattern', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'speed', label: 'Speed', type: 'range', min: 1, max: 16, step: 1, default: 7 },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ember', 'Ember'], ['ink', 'Ink on paper']] },
    { key: 'seed', label: 'Scatter new seeds', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, gw = 0, gh = 0, U, V, U2, V2, F, K, img, tone, built = '', small = null, sctx = null, sdata = null, wasDown = false;

    function build() {
      const key = [p.preset, p.steer, p.seed, W].join('|');
      if (key === built) return;
      gw = clamp(Math.round(W / 2.8), 80, 240); gh = Math.round((gw * H) / W);
      const c = env.makeCanvas(gw, gh), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, gw, gh);
      img = cx.getImageData(0, 0, gw, gh).data;
      const n = gw * gh; tone = new Float32Array(n); U = new Float32Array(n).fill(1); V = new Float32Array(n); U2 = new Float32Array(n); V2 = new Float32Array(n); F = new Float32Array(n); K = new Float32Array(n);
      let lo = 1, hi = 0;
      for (let i = 0; i < n; i++) { const l = (0.2126 * img[i * 4] + 0.7152 * img[i * 4 + 1] + 0.0722 * img[i * 4 + 2]) / 255; tone[i] = l; if (l < lo) lo = l; if (l > hi) hi = l; }
      for (let i = 0; i < n; i++) tone[i] = (tone[i] - lo) / (hi - lo + 1e-6);
      const [f0, k0] = PRESETS[p.preset] || PRESETS.coral, s = p.steer / 100, r = rng(p.seed * 31 + 7);
      for (let i = 0; i < n; i++) { F[i] = clamp(f0 + s * (tone[i] - 0.5) * 0.02, 0.012, 0.09); K[i] = clamp(k0 + s * (tone[i] - 0.5) * 0.005, 0.045, 0.07); }
      for (let m = 0; m < n * 0.02; m++) {
        const x = (r() * gw) | 0, y = (r() * gh) | 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < gw && yy < gh) { U[yy * gw + xx] = 0.5; V[yy * gw + xx] = 0.25 + r() * 0.05; } }
      }
      small = env.makeCanvas(gw, gh); sctx = small.getContext('2d'); sdata = sctx.createImageData(gw, gh); built = key;
      if (n < 50000) iterate(320);
    }

    function iterate(count) {
      const Du = 0.21, Dv = 0.105, w = gw, h = gh, f = F, k = K;
      let u = U, v = V, u2 = U2, v2 = V2;
      for (let s = 0; s < count; s++) {
        for (let y = 0; y < h; y++) {
          const r0 = y * w, rm = (y > 0 ? y - 1 : 0) * w, rp = (y < h - 1 ? y + 1 : h - 1) * w;
          for (let x = 0; x < w; x++) {
            const i = r0 + x, xm = x > 0 ? i - 1 : i, xp = x < w - 1 ? i + 1 : i, a = u[i], b = v[i], abb = a * b * b;
            u2[i] = a + Du * (u[xm] + u[xp] + u[rm + x] + u[rp + x] - 4 * a) - abb + f[i] * (1 - a);
            v2[i] = b + Dv * (v[xm] + v[xp] + v[rm + x] + v[rp + x] - 4 * b) + abb - (f[i] + k[i]) * b;
          }
        }
        let t = u; u = u2; u2 = t; t = v; v = v2; v2 = t;
      }
      U = u; V = v; U2 = u2; V2 = v2;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build();
        if (ptr && ptr.down && ptr.inside) {
          const cx = (ptr.x * gw) | 0, cy = (ptr.y * gh) | 0, R = Math.max(2, gw * 0.025);
          for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) if (x * x + y * y <= R * R) { const xx = cx + x, yy = cy + y; if (xx >= 0 && yy >= 0 && xx < gw && yy < gh) { U[yy * gw + xx] = 0.4; V[yy * gw + xx] = 0.3; } }
        }
        iterate(p.speed);
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const n = gw * gh, o4 = sdata.data, rgb = [0, 0, 0];
        for (let i = 0; i < n; i++) {
          const o = i * 4, v = clamp(V[i] * 3.3), k = v * v * (3 - 2 * v);
          let R, G, B;
          if (p.colour === 'picture') { const a = 0.3 + 0.95 * k; R = img[o] * a + 36 * k; G = img[o + 1] * a + 30 * k; B = img[o + 2] * a + 24 * k; }
          else if (p.colour === 'ember') { ramp(EMBER, k, rgb); R = rgb[0]; G = rgb[1]; B = rgb[2]; }
          else { R = lerp(244, 26, k); G = lerp(238, 28, k); B = lerp(224, 40, k); }
          o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
        }
        sctx.putImageData(sdata, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(small, 0, 0, W, H);
      },
      dispose() {},
    };
  },
};
