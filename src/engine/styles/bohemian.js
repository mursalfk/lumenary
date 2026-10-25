// src/engine/styles/bohemian.js
import { still, rng, TAU, hexToRgb } from '../utils.js';
import { pixels } from '../helpers.js';

const PALETTES = {
  terracotta: { bg: '#efe2cf', arches: ['#b5543a', '#d98a54', '#e8b86e', '#8f9a6a'], tint: [255, 214, 170], ink: '#5a2f22' },
  sage: { bg: '#ece6d6', arches: ['#6f8466', '#a3b08a', '#d9c9a1', '#c97f5f'], tint: [235, 224, 190], ink: '#394834' },
  rose: { bg: '#f1e4de', arches: ['#b86b78', '#d99aa0', '#e9c4b6', '#7e8c9c'], tint: [250, 215, 205], ink: '#5b3040' },
};

function archPath(ctx, cx, top, r, bottom) {
  ctx.beginPath();
  ctx.moveTo(cx - r, bottom); ctx.lineTo(cx - r, top + r);
  ctx.arc(cx, top + r, r, Math.PI, TAU);
  ctx.lineTo(cx + r, bottom); ctx.closePath();
}

export default still({
  id: 'bohemian',
  name: 'Bohemian',
  blurb: 'Boho colour: earthy rainbow arches, a sun, warm tones and pampas grass.',
  maxSide: 1000,
  params: [
    { key: 'palette', label: 'Palette', type: 'select', default: 'terracotta', options: [['terracotta', 'Terracotta'], ['sage', 'Sage'], ['rose', 'Dusty rose']] },
    { key: 'rings', label: 'Arch rings', type: 'range', min: 2, max: 6, step: 1, default: 4 },
    { key: 'warmth', label: 'Warm tone', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'sun', label: 'Sun', type: 'toggle', default: true },
    { key: 'grass', label: 'Pampas grass', type: 'toggle', default: true },
    { key: 'seed', label: 'Reshuffle', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const pal = PALETTES[p.palette] || PALETTES.terracotta, u = Math.min(W, H) / 100, r = rng(p.seed * 71 + 5);
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, bottom = H * 0.9, top = H * 0.2, ar = W * 0.3;
    const gap = u * 2.8;

    if (p.sun) {
      const sx = cx, sy = top + ar * 0.1, sr = ar + gap * (p.rings + 0.2);
      ctx.fillStyle = pal.arches[2]; ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.arc(sx, sy, sr * 1.05, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = pal.arches[2]; ctx.lineWidth = u * 0.45; ctx.lineCap = 'round';
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * TAU, r0 = sr * 1.12, r1 = r0 + u * (i % 2 ? 2.2 : 4);
        ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); ctx.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); ctx.stroke();
      }
    }
    // rainbow arches, outermost first
    for (let i = p.rings; i >= 1; i--) {
      ctx.fillStyle = pal.arches[(i - 1) % pal.arches.length];
      archPath(ctx, cx, top - gap * i, ar + gap * i, bottom);
      ctx.fill();
    }
    // the photograph in the window, warmed
    ctx.save();
    archPath(ctx, cx, top, ar, bottom); ctx.clip();
    const iw = ar * 2, ih = bottom - top, s = Math.max(iw / W, ih / H);
    ctx.drawImage(work, cx - (W * s) / 2, top + (ih - H * s) / 2, W * s, H * s);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(${pal.tint[0]},${pal.tint[1]},${pal.tint[2]},${p.warmth / 100 * 0.85})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(90,50,30,${p.warmth / 100 * 0.18})`; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.strokeStyle = pal.ink; ctx.lineWidth = u * 0.35; archPath(ctx, cx, top, ar, bottom); ctx.stroke();

    // ground line with dots
    ctx.fillStyle = pal.ink;
    for (let x = u * 4; x < W - u * 3; x += u * 3.2) { ctx.beginPath(); ctx.arc(x, bottom + u * 3, u * 0.38, 0, TAU); ctx.fill(); }
    if (p.grass) {
      ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        const bx = side < 0 ? u * 6 : W - u * 6;
        for (let i = 0; i < 11; i++) {
          const a = -Math.PI / 2 + side * (0.12 + r() * 0.75), len = u * (14 + r() * 16);
          const ex = bx + Math.cos(a) * len, ey = bottom - u * 1 + Math.sin(a) * len;
          ctx.strokeStyle = pal.arches[1 + (i % 3)]; ctx.lineWidth = u * (0.5 + r() * 0.5); ctx.globalAlpha = 0.9;
          ctx.beginPath(); ctx.moveTo(bx, bottom + u * 2); ctx.quadraticCurveTo(bx + (ex - bx) * 0.2, ey + len * 0.4, ex, ey); ctx.stroke();
          ctx.fillStyle = ctx.strokeStyle;
          for (let f = 0; f < 6; f++) { const t = 0.55 + f * 0.08; ctx.beginPath(); ctx.ellipse(bx + (ex - bx) * t, bottom + (ey - bottom) * t, u * 0.5, u * 1.3, a + Math.PI / 2, 0, TAU); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
      }
    }
  },
});
