// src/engine/styles/bokeh.js
import { still, rng, clamp, smoothstep, lerp, TAU } from '../utils.js';
import { pixels } from '../helpers.js';

const SHAPES = [['circle', 'Round'], ['hex', 'Hexagon'], ['penta', 'Pentagon'], ['star', 'Star'], ['heart', 'Heart']];

function shapePath(ctx, shape, x, y, r, rot) {
  ctx.beginPath();
  if (shape === 'circle') { ctx.arc(x, y, r, 0, TAU); return; }
  if (shape === 'heart') {
    const s = r * 1.05;
    ctx.moveTo(x, y + s * 0.85);
    ctx.bezierCurveTo(x - s * 1.25, y + s * 0.05, x - s * 0.95, y - s * 0.95, x, y - s * 0.38);
    ctx.bezierCurveTo(x + s * 0.95, y - s * 0.95, x + s * 1.25, y + s * 0.05, x, y + s * 0.85);
    ctx.closePath(); return;
  }
  const n = shape === 'hex' ? 6 : shape === 'penta' ? 5 : 10;
  for (let i = 0; i < n; i++) {
    const rr = shape === 'star' && i % 2 ? r * 0.48 : r, a = rot + (i / n) * TAU;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
}

export default still({
  id: 'bokeh',
  name: 'Bokeh',
  blurb: 'The picture goes out of focus and every bright point swells into a disc of light, soft in the middle and brighter at the rim.',
  maxSide: 1000,
  params: [
    { key: 'size', label: 'Disc size', type: 'range', min: 10, max: 90, step: 1, default: 44 },
    { key: 'density', label: 'How many lights', type: 'range', min: 5, max: 100, step: 1, default: 55 },
    { key: 'shape', label: 'Aperture shape', type: 'select', default: 'circle', options: SHAPES },
    { key: 'blur', label: 'Out of focus', type: 'range', min: 20, max: 100, step: 1, default: 80 },
    { key: 'glow', label: 'Brightness', type: 'range', min: 10, max: 100, step: 1, default: 60 },
    { key: 'ring', label: 'Bright rim', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'thr', label: 'Lights come from', type: 'range', min: 20, max: 90, step: 1, default: 45, fmt: (v) => 'above ' + v + '%' },
    { key: 'seed', label: 'Scatter again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const sc = W / 800, r = rng(p.seed * 23 + 4);
    const k = lerp(3, 18, p.blur / 100), sw = Math.max(4, Math.round(W / (k * 1.6))), sh = Math.max(4, Math.round(H / (k * 1.6)));
    const key = sw + 'x' + sh;
    if (cache.key !== key) {
      const s = env.makeCanvas(sw, sh), sx = s.getContext('2d'); sx.imageSmoothingQuality = 'high'; sx.drawImage(work, 0, 0, sw, sh);
      cache.small = s; cache.sd = sx.getImageData(0, 0, sw, sh).data; cache.key = key;
    }
    const sd = cache.sd;
    ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = 0.78; ctx.drawImage(cache.small, 0, 0, W, H); ctx.globalAlpha = 1;
    const R0 = (6 + (p.size / 100) * 40) * sc, g = R0 * 1.05, thr = p.thr / 100, glow = p.glow / 100, ring = p.ring / 100, dens = p.density / 100;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let y = -g; y < H + g; y += g) for (let x = -g; x < W + g; x += g) {
      const px = x + (r() - 0.5) * g * 1.6, py = y + (r() - 0.5) * g * 1.6;
      const sxi = clamp((px / W) * sw | 0, 0, sw - 1), syi = clamp((py / H) * sh | 0, 0, sh - 1), o = (syi * sw + sxi) * 4;
      let R = sd[o], G = sd[o + 1], B = sd[o + 2];
      const l = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255, prob = smoothstep(thr * 0.7, thr + 0.35, l) * (0.04 + dens * 0.62);
      if (r() > prob) continue;
      const m = Math.max(R, G, B, 1), bst = Math.min(1.9, 255 / m) * (0.8 + 0.2 * l), rad = R0 * (0.45 + r() * 0.85) * (0.8 + 0.4 * l), rot = r() * TAU;
      R = Math.min(255, R * bst * 1.08); G = Math.min(255, G * bst); B = Math.min(255, B * bst * 1.05);
      shapePath(ctx, p.shape, px, py, rad, rot);
      ctx.fillStyle = `rgba(${R | 0},${G | 0},${B | 0},${0.05 + 0.15 * glow * (0.5 + 0.5 * l)})`; ctx.fill();
      if (ring > 0) { ctx.strokeStyle = `rgba(${R | 0},${G | 0},${B | 0},${0.08 + 0.42 * ring * glow})`; ctx.lineWidth = Math.max(1, rad * 0.075); ctx.stroke(); }
    }
    ctx.restore();
  },
});
