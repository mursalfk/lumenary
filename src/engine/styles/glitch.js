// src/engine/styles/glitch.js
import { still, rng } from '../utils.js';
import { pixels, paintPixels } from '../helpers.js';

export default still({
  id: 'glitch',
  name: 'Glitch',
  blurb: 'A corrupted signal: sliced rows, split colour channels, stolen blocks and static.',
  maxSide: 1000,
  params: [
    { key: 'amount', label: 'Corruption', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'slices', label: 'Row slices', type: 'range', min: 0, max: 60, step: 1, default: 22 },
    { key: 'rgb', label: 'Channel split', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'blocks', label: 'Stolen blocks', type: 'range', min: 0, max: 40, step: 1, default: 14 },
    { key: 'tint', label: 'Tinted slices', type: 'toggle', default: true },
    { key: 'seed', label: 'Corrupt again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, u = Math.min(W, H) / 100, r = rng(p.seed * 53 + 11), am = p.amount / 100;
    const split = Math.round((p.rgb / 100) * u * 2.4);
    paintPixels(ctx, W, H, (x, y, o) => {
      const i = y * W;
      o[0] = d[(i + Math.max(0, x - split)) * 4]; o[1] = d[(i + x) * 4 + 1]; o[2] = d[(i + Math.min(W - 1, x + split)) * 4 + 2];
    });
    const snap = env.makeCanvas(W, H); snap.getContext('2d').drawImage(ctx.canvas, 0, 0);
    // displaced slices, wrapped so nothing leaves a gap
    for (let i = 0; i < p.slices; i++) {
      const y0 = (r() * H) | 0, h = Math.max(2, (r() * H * 0.07 * (0.4 + am)) | 0), dx = (r() - 0.5) * W * 0.55 * am * (r() < 0.25 ? 2 : 1);
      ctx.drawImage(snap, 0, y0, W, h, dx, y0, W, h);
      ctx.drawImage(snap, 0, y0, W, h, dx + (dx > 0 ? -W : W), y0, W, h);
      if (p.tint && r() < 0.35) {
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.22 + r() * 0.2;
        ctx.fillStyle = r() < 0.5 ? '#00e5ff' : '#ff2bd6'; ctx.fillRect(0, y0, W, h); ctx.restore();
      }
    }
    // blocks lifted from elsewhere in the picture
    for (let i = 0; i < p.blocks; i++) {
      const w = W * (0.04 + r() * 0.18), h = H * (0.008 + r() * 0.035), sx = r() * (W - w), sy = r() * (H - h), dx = r() * (W - w), dy = r() * (H - h);
      ctx.drawImage(snap, sx, sy, w, h, dx, dy, w, h);
      if (r() < 0.22) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(dx, dy, w, h); ctx.restore(); }
    }
    // static: thin bright lines and speckles
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 6 * am + 1; i++) ctx.fillRect(0, (r() * H) | 0, W, 1);
    for (let i = 0; i < 260 * am; i++) { ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.5})`; ctx.fillRect(r() * W, r() * H, 1 + r() * u * 2, 1); }
  },
});
