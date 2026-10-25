// src/engine/styles/lomography.js
import { still, rng, clamp, smoothstep, rgb2hsl, hsl2rgb } from '../utils.js';
import { addGrain, vignette } from '../helpers.js';

const CASTS = { warm: [1.06, 1.0, 0.84], green: [0.92, 1.08, 0.92], magenta: [1.08, 0.88, 1.06], cool: [0.88, 1.0, 1.12] };
const LEAKS = { warm: ['255,120,40', '255,60,90'], green: ['255,200,60', '90,255,120'], magenta: ['255,70,150', '255,150,60'], cool: ['80,160,255', '255,90,190'] };

export default still({
  id: 'lomography',
  name: 'Lomography',
  blurb: 'A cheap plastic lens and expired film: saturated colour, hard contrast, dark corners, soft edges and a stray leak of light.',
  maxSide: 1100,
  params: [
    { key: 'sat', label: 'Saturation', type: 'range', min: 0, max: 100, step: 1, default: 62 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'vig', label: 'Dark corners', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'soft', label: 'Soft edges', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'leak', label: 'Light leak', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'cast', label: 'Colour cast', type: 'select', default: 'warm', options: [['warm', 'Warm'], ['green', 'Green'], ['magenta', 'Magenta'], ['cool', 'Cool']] },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'seed', label: 'Move the leak', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const sc = W / 800, r = rng(p.seed * 31 + 5), cast = CASTS[p.cast] || CASTS.warm, leakCol = LEAKS[p.cast] || LEAKS.warm;
    ctx.drawImage(work, 0, 0, W, H);
    const img = ctx.getImageData(0, 0, W, H), d = img.data, ct = 1 + (p.contrast / 100) * 1.1, sa = 0.6 + (p.sat / 100) * 1.3;
    for (let i = 0; i < d.length; i += 4) {
      let R = d[i] / 255, G = d[i + 1] / 255, B = d[i + 2] / 255;
      const l = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      R = l + (R - l) * sa; G = l + (G - l) * sa; B = l + (B - l) * sa;
      R = clamp(R * cast[0]); G = clamp(G * cast[1]); B = clamp(B * cast[2]);
      const s = (v) => { const x = (v - 0.5) * ct; return clamp(0.5 + x / (1 + Math.abs(x) * 0.55 * (ct - 1) * 2) * (1 + 0.28 * (ct - 1))); };
      d[i] = s(R) * 255; d[i + 1] = s(G) * 255; d[i + 2] = s(B) * 255;
    }
    ctx.putImageData(img, 0, 0);
    // soft, smeared edges from a cheap lens
    if (p.soft > 0) {
      const k = 6, sm = env.makeCanvas(Math.max(2, W / k), Math.max(2, H / k)), sx = sm.getContext('2d');
      sx.imageSmoothingQuality = 'high'; sx.drawImage(ctx.canvas, 0, 0, sm.width, sm.height);
      const lay = env.makeCanvas(W, H), lx = lay.getContext('2d'); lx.imageSmoothingQuality = 'high'; lx.drawImage(sm, 0, 0, W, H);
      lx.globalCompositeOperation = 'destination-in';
      const g = lx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.28, W / 2, H / 2, Math.hypot(W, H) * 0.52);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.35 + (p.soft / 100) * 0.65})`);
      lx.fillStyle = g; lx.fillRect(0, 0, W, H);
      ctx.drawImage(lay, 0, 0);
    }
    // light leaks: soft glows bleeding in from one or two edges
    if (p.leak > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const n = 2, k = p.leak / 100;
      for (let j = 0; j < n; j++) {
        const side = j === 0 ? (r() < 0.5 ? 0 : 1) : 1 - (r() < 0.5 ? 0 : 1) , x = side ? W * (0.85 + r() * 0.2) : W * (-0.05 + r() * 0.15), y = H * (0.1 + r() * 0.8), rad = Math.max(W, H) * (0.35 + r() * 0.3);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(${leakCol[j]},${1.0 * k})`); g.addColorStop(0.5, `rgba(${leakCol[j]},${0.42 * k})`); g.addColorStop(1, `rgba(${leakCol[j]},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }
    vignette(ctx, W, H, (p.vig / 100) * 0.9, '8,4,14');
    addGrain(ctx, W, H, (p.grain / 100) * 0.9, p.seed + 11);
  },
});
