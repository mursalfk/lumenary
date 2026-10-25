// src/engine/styles/futuristic.js
import { still, clamp, TAU, hexToRgb } from '../utils.js';
import { pixels, paintPixels, ramp, edgeCanvas, glowDraw, blurredL, label } from '../helpers.js';

const TINTS = { cyan: '#35e0ff', ice: '#a9d4ff', amber: '#ffb24a', mint: '#4dffb8' };

export default still({
  id: 'futuristic',
  name: 'Futuristic',
  blurb: 'A clean heads-up display: cool gradient, glowing outlines, rings and a readout.',
  maxSide: 1100,
  params: [
    { key: 'tint', label: 'Light', type: 'select', default: 'cyan', options: [['cyan', 'Cyan'], ['ice', 'Ice'], ['amber', 'Amber'], ['mint', 'Mint']] },
    { key: 'edges', label: 'Outline glow', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'grid', label: 'Grid', type: 'toggle', default: true },
    { key: 'rings', label: 'Rings and ticks', type: 'toggle', default: true },
    { key: 'readout', label: 'Readout', type: 'toggle', default: true },
    { key: 'title', label: 'Label', type: 'text', default: 'SCAN 0427', max: 16 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const tint = hexToRgb(TINTS[p.tint] || TINTS.cyan), L = cache.L;
    const stops = [[3, 8, 16], [10, 26, 48], tint.map((v) => v * 0.55), tint, [245, 252, 255]];
    paintPixels(ctx, W, H, (x, y, o) => ramp(stops, L[y * W + x], o));
    const col = TINTS[p.tint] || TINTS.cyan;
    const u = Math.min(W, H) / 100;

    if (p.grid) {
      ctx.strokeStyle = col; ctx.globalAlpha = 0.12; ctx.lineWidth = 1;
      const g = u * 6;
      ctx.beginPath();
      for (let x = 0; x <= W; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y <= H; y += g) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (p.edges > 0) {
      const edges = edgeCanvas(env, L, W, H, { r: 2, thr: 0.1, color: col });
      glowDraw(env, ctx, edges, W, H, p.edges / 100);
    }

    // brightest region = target
    const bl = blurredL(cache, W, H, Math.round(W / 40));
    let bi = 0; for (let i = 0; i < bl.length; i += 3) if (bl[i] > bl[bi]) bi = i;
    const tx = bi % W, ty = (bi / W) | 0;

    ctx.strokeStyle = col; ctx.fillStyle = col;
    if (p.rings) {
      ctx.lineWidth = Math.max(1, u * 0.18);
      for (const [r, a, dash] of [[9, 0.9, []], [14, 0.5, [u * 2, u * 1.2]], [20, 0.3, [u * 0.4, u * 1.4]]]) {
        ctx.globalAlpha = a; ctx.setLineDash(dash);
        ctx.beginPath(); ctx.arc(tx, ty, r * u, 0, TAU); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * TAU, r0 = 20 * u, r1 = r0 + (i % 6 === 0 ? 2.4 : 1.1) * u;
        ctx.moveTo(tx + Math.cos(a) * r0, ty + Math.sin(a) * r0); ctx.lineTo(tx + Math.cos(a) * r1, ty + Math.sin(a) * r1);
      }
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx - 4 * u, ty); ctx.lineTo(tx + 4 * u, ty); ctx.moveTo(tx, ty - 4 * u); ctx.lineTo(tx, ty + 4 * u); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // corner brackets
    ctx.lineWidth = Math.max(2, u * 0.35);
    const m = u * 3, b = u * 5;
    ctx.beginPath();
    for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
      ctx.moveTo(cx, cy + sy * b); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * b, cy);
    }
    ctx.stroke();

    if (p.readout) {
      const f = `500 ${Math.max(10, u * 2)}px "DM Mono", ui-monospace, monospace`;
      label(ctx, p.title || 'SCAN', m + u * 2, m + u * 3.5, f, col, 'left');
      label(ctx, `X ${(tx / W).toFixed(3)}   Y ${(ty / H).toFixed(3)}`, W - m - u * 2, m + u * 3.5, f, col, 'right');
      label(ctx, `LUM ${(bl[bi] * 100).toFixed(1)}%`, m + u * 2, H - m - u * 3, f, col, 'left');
      ctx.globalAlpha = 0.9;
      ctx.fillRect(W - m - u * 2 - u * 24, H - m - u * 3.6, u * 24 * clamp(bl[bi]), u * 1.2);
      ctx.globalAlpha = 0.3; ctx.fillRect(W - m - u * 2 - u * 24, H - m - u * 3.6, u * 24, u * 1.2); ctx.globalAlpha = 1;
    }
  },
});
