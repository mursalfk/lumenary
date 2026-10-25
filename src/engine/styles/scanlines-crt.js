// src/engine/styles/scanlines-crt.js
import { still, hash2, clamp, TAU } from '../utils.js';
import { pixels, paintPixels, rrPath, vignette } from '../helpers.js';

export default still({
  id: 'scanlines-crt',
  name: 'Scanlines CRT',
  blurb: 'A curved tube television: phosphor stripes, scanlines, glow and a dark bezel.',
  maxSide: 1000,
  params: [
    { key: 'curve', label: 'Screen curve', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'scan', label: 'Scanlines', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'mask', label: 'Phosphor mask', type: 'select', default: 'rgb', options: [['rgb', 'RGB stripes'], ['grille', 'Aperture grille'], ['off', 'Off']] },
    { key: 'bloom', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'noise', label: 'Static', type: 'range', min: 0, max: 100, step: 1, default: 20 },
    { key: 'bezel', label: 'Bezel', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, u = Math.min(W, H) / 100;
    const k = (p.curve / 100) * 0.34, s0 = 1 + k, per = Math.max(3, Math.round(H / 140)), m = Math.max(1, Math.round(W / 480));
    const sc = p.scan / 100, nz = p.noise / 100;
    paintPixels(ctx, W, H, (x, y, o) => {
      const nx = (x / (W - 1)) * 2 - 1, ny = (y / (H - 1)) * 2 - 1, f = (1 + k * (nx * nx + ny * ny)) / s0;
      const fx = ((nx * f + 1) / 2) * (W - 1), fy = ((ny * f + 1) / 2) * (H - 1);
      if (fx < 0 || fy < 0 || fx > W - 1 || fy > H - 1) { o[0] = o[1] = o[2] = 6; return; }
      const x0 = fx | 0, y0 = fy | 0, x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1), tx = fx - x0, ty = fy - y0;
      const a = (y0 * W + x0) * 4, b = (y0 * W + x1) * 4, c = (y1 * W + x0) * 4, e = (y1 * W + x1) * 4;
      let r = 0, g = 0, bl = 0;
      for (let ch = 0; ch < 3; ch++) {
        const v = (d[a + ch] * (1 - tx) + d[b + ch] * tx) * (1 - ty) + (d[c + ch] * (1 - tx) + d[e + ch] * tx) * ty;
        if (ch === 0) r = v; else if (ch === 1) g = v; else bl = v;
      }
      // phosphor mask
      const sub = ((x / m) | 0) % 3;
      if (p.mask === 'rgb') { const dim = 0.62; if (sub !== 0) r *= dim; if (sub !== 1) g *= dim; if (sub !== 2) bl *= dim; r *= 1.22; g *= 1.22; bl *= 1.22; }
      else if (p.mask === 'grille') { const q = sub === 2 ? 0.55 : 1.08; r *= q; g *= q; bl *= q; }
      // scanlines: a soft dip once per line pair
      const sline = 1 - sc * 0.55 * (0.5 + 0.5 * Math.cos((y / per) * TAU));
      const jitter = nz ? (hash2(x, y, 9) - 0.5) * nz * 70 : 0;
      o[0] = clamp(r * sline + jitter, 0, 255); o[1] = clamp(g * sline + jitter, 0, 255); o[2] = clamp(bl * sline + jitter, 0, 255);
    });
    // bloom: two blurred copies added on top
    if (p.bloom > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true;
      for (const div of [5, 12]) {
        const s = env.makeCanvas(Math.max(2, (W / div) | 0), Math.max(2, (H / div) | 0));
        s.getContext('2d').drawImage(ctx.canvas, 0, 0, s.width, s.height);
        ctx.globalAlpha = (p.bloom / 100) * 0.42; ctx.drawImage(s, 0, 0, W, H);
      }
      ctx.restore();
    }
    vignette(ctx, W, H, 0.45);
    // glass reflection
    const gl = ctx.createLinearGradient(0, 0, W * 0.7, H * 0.5);
    gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(0.5, 'rgba(255,255,255,0.02)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(W * 0.3, H * 0.2, W * 0.42, H * 0.2, -0.5, 0, TAU); ctx.fill();
    if (p.bezel) {
      const bm = u * 4.5;
      ctx.beginPath(); ctx.rect(0, 0, W, H); rrPath(ctx, bm, bm, W - bm * 2, H - bm * 2, u * 9);
      ctx.fillStyle = '#0d0c0b'; ctx.fill('evenodd');
      ctx.beginPath(); rrPath(ctx, bm, bm, W - bm * 2, H - bm * 2, u * 9); ctx.lineWidth = u * 0.7; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.stroke();
      // tiny power light
      ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(W - bm * 1.5, H - bm * 0.5, u * 0.55, 0, TAU); ctx.fill();
    }
  },
});
