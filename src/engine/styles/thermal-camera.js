// src/engine/styles/thermal-camera.js
import { still, hash2, clamp } from '../utils.js';
import { pixels, paintPixels, ramp, blurredL, label } from '../helpers.js';

const PALETTES = {
  ironbow: [[0, 0, 22], [42, 0, 112], [150, 22, 132], [232, 72, 40], [255, 172, 22], [255, 250, 196]],
  rainbow: [[0, 0, 96], [0, 104, 255], [0, 224, 172], [124, 255, 40], [255, 224, 0], [255, 62, 0], [255, 255, 255]],
  arctic: [[0, 0, 44], [22, 64, 168], [0, 204, 232], [250, 250, 250]],
  white: [[0, 0, 0], [255, 255, 255]],
};
const T_MIN = 18, T_MAX = 38;

export default still({
  id: 'thermal-camera',
  name: 'Thermal Camera',
  blurb: 'A heat-camera view: false colour from brightness, a coarse sensor, a hot-spot reading and a scale bar.',
  maxSide: 1000,
  params: [
    { key: 'palette', label: 'Palette', type: 'select', default: 'ironbow', options: [['ironbow', 'Ironbow'], ['rainbow', 'Rainbow'], ['arctic', 'Arctic'], ['white', 'White hot']] },
    { key: 'sensor', label: 'Sensor pixel', type: 'range', min: 1, max: 14, step: 1, default: 5 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'invert', label: 'Black hot', type: 'toggle', default: false },
    { key: 'cross', label: 'Hot spot', type: 'toggle', default: true },
    { key: 'bar', label: 'Scale bar', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const u = Math.min(W, H) / 100, cell = Math.max(1, Math.round(p.sensor * (Math.min(W, H) / 700 + 0.4))), stops = PALETTES[p.palette] || PALETTES.ironbow;
    const bl = blurredL(cache, W, H, Math.max(1, Math.round(cell / 2))), k = 1 + (p.contrast / 100) * 1.7;
    const heat = (i) => { let v = clamp((bl[i] - 0.5) * k + 0.5); return p.invert ? 1 - v : v; };
    paintPixels(ctx, W, H, (x, y, o) => {
      const cx = Math.min(W - 1, ((x / cell) | 0) * cell + (cell >> 1)), cy = Math.min(H - 1, ((y / cell) | 0) * cell + (cell >> 1));
      const v = clamp(heat(cy * W + cx) + (hash2(x / cell | 0, y / cell | 0, 6) - 0.5) * 0.035);
      ramp(stops, v, o);
    });
    const f = (s) => `500 ${u * s}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
    if (p.cross) {
      // the hottest block (on a coarse grid) gets the reading
      let best = -1, bx = W / 2, by = H / 2;
      for (let y = Math.round(H * 0.14); y < H * 0.86; y += cell) for (let x = Math.round(W * 0.12); x < W * 0.74; x += cell) { const v = heat(y * W + x); if (v > best) { best = v; bx = x; by = y; } }
      const t = T_MIN + best * (T_MAX - T_MIN), a = u * 3;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, u * 0.28);
      ctx.beginPath(); ctx.moveTo(bx - a * 1.6, by); ctx.lineTo(bx - a * 0.5, by); ctx.moveTo(bx + a * 0.5, by); ctx.lineTo(bx + a * 1.6, by); ctx.moveTo(bx, by - a * 1.6); ctx.lineTo(bx, by - a * 0.5); ctx.moveTo(bx, by + a * 0.5); ctx.lineTo(bx, by + a * 1.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx, by, a * 0.28, 0, Math.PI * 2); ctx.stroke();
      const lx = Math.min(W - u * 30, Math.max(u * 2, bx + a * 1.2));
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(lx - u * 0.6, by + a * 0.9, u * 17, u * 3.4);
      label(ctx, `MAX ${t.toFixed(1)}°C`, lx, by + a * 1.8, f(2.3), '#fff', 'left');
    }
    if (p.bar) {
      const bw = u * 3.2, bh = H * 0.56, bx = W - bw - u * 5, by = (H - bh) / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx - u * 1.2, by - u * 3.6, bw + u * 9.6, bh + u * 7.2);
      const o = [0, 0, 0];
      for (let i = 0; i < bh; i++) { const v = 1 - i / (bh - 1); ramp(stops, p.invert ? 1 - v : v, o); ctx.fillStyle = `rgb(${o[0] | 0},${o[1] | 0},${o[2] | 0})`; ctx.fillRect(bx, by + i, bw, 1.4); }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, u * 0.2); ctx.strokeRect(bx, by, bw, bh);
      label(ctx, `${T_MAX}°`, bx + bw + u * 0.8, by + u * 0.4, f(2), '#fff', 'left'); label(ctx, `${(T_MIN + T_MAX) / 2}°`, bx + bw + u * 0.8, by + bh / 2, f(2), '#fff', 'left'); label(ctx, `${T_MIN}°`, bx + bw + u * 0.8, by + bh - u * 0.4, f(2), '#fff', 'left');
    }
    label(ctx, 'THERMAL  ε 0.95', u * 3, u * 4, f(2.2), '#fff', 'left');
  },
});
