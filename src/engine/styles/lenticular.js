// src/engine/styles/lenticular.js
import { clamp, smoothstep, rgb2hsl, hsl2rgb, TAU } from '../utils.js';

const ALTERS = [['negative', 'Negative'], ['night', 'Night blue'], ['hue', 'Opposite hues'], ['mono', 'Black and white'], ['sepia', 'Sepia']];

export default {
  id: 'lenticular',
  name: 'Lenticular',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 1.3,
  blurb: 'A ribbed plastic lens over two interlaced pictures. Move across it and the image flips from one to the other, strip by strip.',
  params: [
    { key: 'alter', label: 'Second picture', type: 'select', default: 'night', options: ALTERS },
    { key: 'lens', label: 'Lens width', type: 'range', min: 3, max: 16, step: 1, default: 8 },
    { key: 'depth', label: 'Parallax', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'shine', label: 'Lens shine', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'sway', label: 'Sway on its own', type: 'range', min: 0, max: 100, step: 1, default: 70 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, A = null, B = null, out = null, built = '', time = 0, tilt = 0, sx = null, sh = null, sf = null, lensKey = '';

    function build() {
      const key = p.alter + '|' + W;
      if (built === key) return;
      const src = work.getContext('2d').getImageData(0, 0, W, H).data;
      A = new Uint8ClampedArray(src); B = new Uint8ClampedArray(src.length);
      for (let i = 0; i < src.length; i += 4) {
        const r = src[i], g = src[i + 1], b = src[i + 2], l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        let R, G, Bb;
        if (p.alter === 'negative') { R = 255 - r; G = 255 - g; Bb = 255 - b; }
        else if (p.alter === 'night') { const t = l / 255; R = 8 + 40 * t * t; G = 18 + 150 * t; Bb = 42 + 213 * Math.sqrt(t); }
        else if (p.alter === 'mono') { R = G = Bb = l; }
        else if (p.alter === 'sepia') { const t = l / 255; R = 40 + 215 * t; G = 24 + 190 * t; Bb = 12 + 140 * t * t; }
        else { const [h, s, ll] = rgb2hsl(r, g, b); [R, G, Bb] = hsl2rgb((h + 0.5) % 1, Math.min(1, s * 1.1), ll); }
        B[i] = R; B[i + 1] = G; B[i + 2] = Bb; B[i + 3] = 255;
      }
      out = new ImageData(W, H); built = key;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; lensKey = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        time += dt;
        const target = ptr && ptr.inside ? clamp(ptr.x * 2 - 1, -1, 1) : Math.sin(time * 0.75) * (p.sway / 100) * 0.95;
        tilt += (target - tilt) * (1 - Math.exp(-7 * dt));
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr);
        build();
        const sc = W / 720, lw = Math.max(2, p.lens * sc), par = (p.depth / 100) * lw * 1.4, split = clamp(0.5 + tilt * 0.5, 0, 1), shine = p.shine / 100;
        if (!sx || sx.length !== W) { sx = new Float32Array(W); sh = new Float32Array(W); sf = new Uint8Array(W); }
        for (let x = 0; x < W; x++) {
          const u = (x / lw) % 1, useB = u >= split ? 1 : 0;
          sf[x] = useB;
          const hl = 0.5 + tilt * 0.38, g = Math.exp(-((u - hl) * (u - hl)) / 0.018), edge = smoothstep(0.62, 1, Math.abs(u - 0.5) * 2);
          let s = 1 + shine * (0.3 * g - 0.12 * edge);
          if (Math.abs(u - split) < 0.05 || u < 0.04) s *= 1 - 0.09 * shine;
          sh[x] = s;
          sx[x] = clamp(x + (useB ? 1 : -1) * tilt * par, 0, W - 1) | 0;
        }
        const o4 = out.data;
        for (let y = 0; y < H; y++) {
          const row = y * W;
          for (let x = 0; x < W; x++) {
            const src = sf[x] ? B : A, si = (row + sx[x]) * 4, o = (row + x) * 4, k = sh[x];
            o4[o] = src[si] * k; o4[o + 1] = src[si + 1] * k; o4[o + 2] = src[si + 2] * k; o4[o + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
      },
      dispose() {},
    };
  },
};
