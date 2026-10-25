// src/engine/styles/datamosh.js
import { still, rng, vnoise } from '../utils.js';

export default still({
  id: 'datamosh',
  name: 'Datamosh',
  blurb: 'Video compression gone wrong: blocks of the picture keep sliding on old motion and smear into each other.',
  maxSide: 900,
  params: [
    { key: 'block', label: 'Block size', type: 'range', min: 8, max: 48, step: 2, default: 18 },
    { key: 'frames', label: 'Smear length', type: 'range', min: 2, max: 50, step: 1, default: 12 },
    { key: 'motion', label: 'Motion', type: 'range', min: 5, max: 100, step: 1, default: 40 },
    { key: 'keep', label: 'Keep original', type: 'range', min: 0, max: 80, step: 1, default: 35 },
    { key: 'flat', label: 'Flat blocks', type: 'range', min: 0, max: 40, step: 1, default: 8 },
    { key: 'seed', label: 'New motion', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    const r = rng(p.seed * 61 + 17), bs = Math.max(8, Math.round(p.block * Math.min(W, H) / 700)), bx = Math.ceil(W / bs), by = Math.ceil(H / bs);
    let a = env.makeCanvas(W, H), b = env.makeCanvas(W, H), ax = a.getContext('2d'), bxc = b.getContext('2d');
    ax.drawImage(work, 0, 0, W, H);
    const ox = r() * 100, oy = r() * 100, drift = r() * 6.28, mv = (p.motion / 100) * bs * 1.3;
    // a motion vector for each block, smooth in space, so neighbours move together
    const vx = new Float32Array(bx * by), vy = new Float32Array(bx * by);
    for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
      const k = j * bx + i, n1 = vnoise(i * 0.16 + ox, j * 0.16, 2) - 0.5, n2 = vnoise(i * 0.16, j * 0.16 + oy, 5) - 0.5;
      vx[k] = (n1 * 2.4 + Math.cos(drift) * 0.5) * mv; vy[k] = (n2 * 2.4 + Math.sin(drift) * 0.5) * mv;
    }
    for (let f = 0; f < p.frames; f++) {
      bxc.drawImage(a, 0, 0);
      const refresh = (p.keep / 100) * (1 - f / p.frames) * 0.5;
      for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
        const k = j * bx + i;
        if (r() < refresh) { bxc.drawImage(work, i * bs, j * bs, bs, bs, i * bs, j * bs, bs, bs); continue; }
        const sx = Math.max(0, Math.min(W - bs, i * bs - vx[k] * (0.6 + r() * 0.8))), sy = Math.max(0, Math.min(H - bs, j * bs - vy[k] * (0.6 + r() * 0.8)));
        bxc.drawImage(a, sx, sy, bs, bs, i * bs, j * bs, bs, bs);
      }
      const t = a; a = b; b = t; ax = a.getContext('2d'); bxc = b.getContext('2d');
    }
    ctx.drawImage(a, 0, 0);
    // macroblocks that lost their detail: shrink and enlarge a few of them
    if (p.flat > 0) {
      const tiny = env.makeCanvas(bx, by); tiny.getContext('2d').drawImage(a, 0, 0, bx, by);
      ctx.imageSmoothingEnabled = false;
      const n = Math.round((p.flat / 100) * bx * by * 0.5);
      for (let q = 0; q < n; q++) { const i = (r() * bx) | 0, j = (r() * by) | 0, w = 1 + ((r() * 3) | 0); ctx.drawImage(tiny, i, j, w, 1, i * bs, j * bs, w * bs, bs); }
      ctx.imageSmoothingEnabled = true;
    }
  },
});
