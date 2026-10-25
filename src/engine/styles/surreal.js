// src/engine/styles/surreal.js
import { still, clamp, vnoise, rng, TAU, smoothstep } from '../utils.js';
import { pixels, paintPixels } from '../helpers.js';

const GRADES = {
  dusk: { top: [255, 190, 150], bot: [40, 70, 110], tint: [255, 170, 120] },
  dawn: { top: [255, 225, 190], bot: [90, 140, 150], tint: [255, 210, 160] },
  moon: { top: [200, 215, 235], bot: [20, 30, 60], tint: [150, 170, 220] },
};

export default still({
  id: 'surreal',
  name: 'Surreal',
  blurb: 'A dream version of the scene: it melts downward under a pale sun and drifting clouds.',
  maxSide: 1000,
  params: [
    { key: 'melt', label: 'Melt', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'drips', label: 'Drip width', type: 'range', min: 4, max: 60, step: 1, default: 22 },
    { key: 'grade', label: 'Dream light', type: 'select', default: 'dusk', options: [['dusk', 'Dusk'], ['dawn', 'Dawn'], ['moon', 'Moonlight']] },
    { key: 'sun', label: 'Second sun', type: 'toggle', default: true },
    { key: 'clouds', label: 'Clouds', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'seed', label: 'Dream again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const px = pixels(work, W, H, cache), d = px.data, g = GRADES[p.grade] || GRADES.dusk;
    const amp = (p.melt / 100) * H * 0.34, f = 1 / Math.max(2, p.drips * W / 1000), sd = p.seed * 19;
    paintPixels(ctx, W, H, (x, y, o) => {
      const t = y / H;
      // each column slides further down the lower it is; wider noise gives wider drips
      const n = vnoise(x * f, 3.7, sd), n2 = vnoise(x * f * 3.1, 9.1, sd + 5);
      const shift = amp * smoothstep(0.18, 1, t) * (0.25 + 0.75 * (n * 0.75 + n2 * 0.25)) * (t + 0.2);
      const sy = clamp(y - shift, 0, H - 1) | 0, i = (sy * W + x) * 4;
      // grade: pull colours toward the dream tint, deeper at the top (sky) than the bottom
      const k = 0.28, sk = (1 - t) * 0.22;
      const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
      for (let c = 0; c < 3; c++) {
        const sky = g.top[c] + (g.bot[c] - g.top[c]) * t;
        o[c] = d[i + c] * (1 - k - sk) + g.tint[c] * lum * k + sky * sk * 1.4;
      }
    });
    const u = Math.min(W, H) / 100, r = rng(p.seed * 13 + 1);
    // second sun, big and pale, sitting low
    if (p.sun) {
      const sx = W * (0.68 + r() * 0.14), sy = H * (0.2 + r() * 0.06), rad = u * 17;
      const gr = ctx.createRadialGradient(sx, sy, rad * 0.2, sx, sy, rad * 2.6);
      gr.addColorStop(0, 'rgba(255,250,235,0.55)'); gr.addColorStop(1, 'rgba(255,250,235,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,247,228,0.92)'; ctx.beginPath(); ctx.arc(sx, sy, rad, 0, TAU); ctx.fill();
      // its reflection, a thin melted echo further down
      ctx.fillStyle = 'rgba(255,247,228,0.25)'; ctx.beginPath(); ctx.ellipse(sx, sy + rad * 2.4, rad * 0.7, rad * 0.18, 0, 0, TAU); ctx.fill();
    }
    // soft flat-bottomed clouds
    const nc = Math.round(p.clouds / 100 * 7);
    for (let i = 0; i < nc; i++) {
      const cx = r() * W, cy = H * (0.1 + r() * 0.35), cw = u * (14 + r() * 22);
      ctx.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.2})`;
      ctx.beginPath(); ctx.ellipse(cx, cy, cw, cw * 0.28, 0, 0, TAU); ctx.ellipse(cx - cw * 0.35, cy + cw * 0.05, cw * 0.6, cw * 0.22, 0, 0, TAU); ctx.fill();
    }
  },
});
