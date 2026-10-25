// src/engine/styles/chromatic-aberration.js
import { still, clamp, lerp } from '../utils.js';
import { pixels } from '../helpers.js';

const MODES = [['radial', 'Radial fringes'], ['side', 'Sideways'], ['spread', 'Full spectrum']];

function ch(d, W, H, x, y, c) {
  x = x < 0 ? 0 : x > W - 1 ? W - 1 : x; y = y < 0 ? 0 : y > H - 1 ? H - 1 : y;
  const x0 = x | 0, y0 = y | 0, x1 = x0 + 1 < W ? x0 + 1 : x0, y1 = y0 + 1 < H ? y0 + 1 : y0, fx = x - x0, fy = y - y0;
  return (d[(y0 * W + x0) * 4 + c] * (1 - fx) + d[(y0 * W + x1) * 4 + c] * fx) * (1 - fy) + (d[(y1 * W + x0) * 4 + c] * (1 - fx) + d[(y1 * W + x1) * 4 + c] * fx) * fy;
}

// Seven taps from one end of the spectrum to the other, weighted so that a flat colour comes through unchanged.
const TAPS = 7, WT = (() => {
  const w = [[], [], []];
  for (let k = 0; k < TAPS; k++) { const t = k / (TAPS - 1); w[0].push(Math.max(0, 1 - Math.abs(t - 1) * 1.7)); w[1].push(Math.max(0, 1 - Math.abs(t - 0.5) * 2.3)); w[2].push(Math.max(0, 1 - Math.abs(t) * 1.7)); }
  return w.map((a) => { const s = a.reduce((x, y) => x + y, 0); return a.map((v) => v / s); });
})();

export default still({
  id: 'chromatic-aberration',
  name: 'Chromatic Aberration',
  blurb: 'A lens cannot bend every colour by the same amount. Red, green and blue land in slightly different places, and the edges split into colour.',
  maxSide: 1100,
  params: [
    { key: 'amount', label: 'Amount', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'mode', label: 'Kind of fringing', type: 'select', default: 'radial', options: MODES },
    { key: 'edge', label: 'Strongest at the edges', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'angle', label: 'Direction (sideways only)', type: 'range', min: 0, max: 180, step: 1, default: 0, fmt: (v) => v + '°' },
    { key: 'glow', label: 'Soft glow', type: 'range', min: 0, max: 100, step: 1, default: 20 },
    { key: 'swap', label: 'Swap red and blue', type: 'toggle', default: false },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, cx = W / 2, cy = H / 2, R = Math.hypot(cx, cy), amp = (p.amount / 100) * 34 * sc, ed = p.edge / 100, sg = p.swap ? -1 : 1;
    const ang = (p.angle * Math.PI) / 180, ax = Math.cos(ang), ay = Math.sin(ang);
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4, dx = x - cx, dy = y - cy, rr = Math.hypot(dx, dy) / R, w = lerp(1, rr * rr * 2.2, ed);
      let ux, uy;
      if (p.mode === 'side') { ux = ax * amp * 0.5; uy = ay * amp * 0.5; if (ed > 0) { ux *= lerp(1, rr * 1.6, ed); uy *= lerp(1, rr * 1.6, ed); } }
      else { const k = rr > 1e-5 ? (amp * w * 0.5) / (rr * R) : 0; ux = dx * k; uy = dy * k; }
      ux *= sg; uy *= sg;
      if (p.mode === 'spread') {
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < TAPS; k++) { const t = (k / (TAPS - 1) - 0.5) * 2, sx = x + ux * t, sy = y + uy * t; r += WT[0][k] * ch(d, W, H, sx, sy, 0); g += WT[1][k] * ch(d, W, H, sx, sy, 1); b += WT[2][k] * ch(d, W, H, sx, sy, 2); }
        o4[o] = r; o4[o + 1] = g; o4[o + 2] = b;
      } else { o4[o] = ch(d, W, H, x + ux, y + uy, 0); o4[o + 1] = d[o + 1]; o4[o + 2] = ch(d, W, H, x - ux, y - uy, 2); }
      o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    if (p.glow > 0) {
      const s = env.makeCanvas(Math.max(2, W / 10), Math.max(2, H / 10)), sx = s.getContext('2d'); sx.imageSmoothingQuality = 'high'; sx.drawImage(ctx.canvas, 0, 0, s.width, s.height);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (p.glow / 100) * 0.45; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(s, 0, 0, W, H); ctx.restore();
    }
  },
});
