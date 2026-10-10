import { clamp, hsl2rgb, hash2 } from '../utils.js';

export default {
  id: 'holographic',
  number: 3,
  name: 'Holographic',
  kind: 'animated',
  maxSide: 640,
  thumbAt: 1.0,
  blurb: 'Iridescent foil that shifts with a moving light band. Hover to steer it.',
  params: [
    { key: 'intensity', label: 'Foil intensity', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'spread', label: 'Color spread', type: 'range', min: 0.2, max: 4, step: 0.1, default: 1.0, fmt: (v) => v.toFixed(1) },
    { key: 'band', label: 'Light band', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'sparkle', label: 'Sparkle', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'speed', label: 'Drift speed', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'base', label: 'Base', type: 'select', default: 'gray', options: [['gray', 'Grayscale foil'], ['color', 'Original colors']] },
  ],
  create() {
    let W = 0, H = 0, src = null, L = null, p = {}, out = null, lut = null;
    return {
      animated: true,
      setSource(work, w, h) {
        W = w; H = h; src = work.getContext('2d').getImageData(0, 0, w, h).data; out = null;
        L = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) L[i] = (0.2126 * src[i * 4] + 0.7152 * src[i * 4 + 1] + 0.0722 * src[i * 4 + 2]) / 255;
        lut = new Uint8Array(512 * 3);
        for (let i = 0; i < 512; i++) {
          const [r, g, b] = hsl2rgb(i / 512, 0.9, 0.58);
          lut[i * 3] = r; lut[i * 3 + 1] = g; lut[i * 3 + 2] = b;
        }
      },
      setParams(np) { p = np; },
      draw(ctx, t, dt, ptr) {
        if (!out) out = ctx.createImageData(W, H);
        const d = out.data, k = p.intensity / 100, spread = p.spread;
        const ang = 0.6, ca = Math.cos(ang), sa = Math.sin(ang);
        const pos = ptr && ptr.inside ? (ptr.x * ca + ptr.y * sa) * 1.0 : 0.5 + 0.55 * Math.sin(t * 0.7 * (p.speed / 35 + 0.01));
        const bw = 0.04 + (p.band / 100) * 0.16;
        const tt = t * (p.speed / 100) * 0.4, frame = Math.floor(t * 10);
        const sparkT = 1 - (p.sparkle / 100) * 0.012;
        for (let y = 0; y < H; y++) {
          const v = y / H;
          for (let x = 0; x < W; x++) {
            const i = y * W + x, o = i * 4, u = x / W;
            const l = L[i], proj = u * ca + v * sa;
            let hue = l * spread + proj * 0.9 + tt;
            hue = hue - Math.floor(hue);
            const li = ((hue * 512) | 0) * 3;
            let br, bg, bb;
            if (p.base === 'gray') { br = bg = bb = l * 255; } else { br = src[o]; bg = src[o + 1]; bb = src[o + 2]; }
            const foil = 0.35 + 0.9 * l;
            let r = br * (1 - k) + lut[li] * foil * k;
            let g = bg * (1 - k) + lut[li + 1] * foil * k;
            let b = bb * (1 - k) + lut[li + 2] * foil * k;
            const q = (proj - pos) / bw, band = Math.exp(-q * q) * (p.band / 100) * 0.75;
            const s = band * (0.35 + l);
            r += 255 * s; g += 255 * s; b += 255 * s;
            if (p.sparkle > 0 && hash2(x, y, frame) > sparkT && l > 0.25) { r += 200; g += 200; b += 200; }
            d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
      },
      dispose() {},
    };
  },
};
