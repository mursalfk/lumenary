// src/engine/styles/cyberpunk.js
import { still, rng, hexToRgb } from '../utils.js';
import { pixels, paintPixels, ramp, edgeCanvas, glowDraw, label } from '../helpers.js';

const SCHEMES = {
  neon: { a: '#ff2a9d', b: '#19e6ff', c: '#fff3ff' },
  acid: { a: '#7a1fff', b: '#b6ff1a', c: '#f4ffd9' },
  dusk: { a: '#ff5a36', b: '#18c6b0', c: '#fff0dc' },
};

export default still({
  id: 'cyberpunk',
  name: 'Cyberpunk',
  blurb: 'Neon-lit night: split-toned colour, glowing outlines, rain and a flickering sign.',
  maxSide: 1100,
  params: [
    { key: 'scheme', label: 'Neon', type: 'select', default: 'neon', options: [['neon', 'Magenta and cyan'], ['acid', 'Violet and acid'], ['dusk', 'Ember and teal']] },
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'rain', label: 'Rain', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'glitch', label: 'Glitch slices', type: 'range', min: 0, max: 100, step: 1, default: 25 },
    { key: 'sign', label: 'Neon sign', type: 'toggle', default: true },
    { key: 'text', label: 'Sign text', type: 'text', default: 'NIGHT MARKET', max: 16 },
    { key: 'seed', label: 'Reroll', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = SCHEMES[p.scheme] || SCHEMES.neon, L = cache.L, r = rng(p.seed * 977 + 3);
    const A = hexToRgb(sc.a), B = hexToRgb(sc.b), C = hexToRgb(sc.c);
    const stops = [[4, 2, 12], A.map((v) => v * 0.35), A, B, C];
    paintPixels(ctx, W, H, (x, y, o) => ramp(stops, Math.pow(L[y * W + x], 0.9), o));
    const u = Math.min(W, H) / 100;

    const e1 = edgeCanvas(env, L, W, H, { r: 2, thr: 0.1, color: sc.b });
    const e2 = edgeCanvas(env, L, W, H, { r: 4, thr: 0.07, color: sc.a });
    ctx.save(); ctx.translate(u * 0.35, 0); glowDraw(env, ctx, e2, W, H, p.glow / 100); ctx.restore();
    glowDraw(env, ctx, e1, W, H, p.glow / 100);

    // rain
    ctx.save();
    ctx.strokeStyle = sc.c; ctx.lineCap = 'round';
    const drops = Math.round(p.rain * 7 * (W * H) / 1e6);
    for (let i = 0; i < drops; i++) {
      const x = r() * (W + 200) - 100, y = r() * H, len = u * (2 + r() * 7);
      ctx.globalAlpha = 0.1 + r() * 0.3; ctx.lineWidth = Math.max(1, u * 0.12);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.25, y + len); ctx.stroke();
    }
    ctx.restore();

    // glitch: shift a few horizontal bands sideways
    const slices = Math.round(p.glitch / 100 * 9);
    for (let i = 0; i < slices; i++) {
      const y = (r() * H) | 0, h = Math.max(2, (r() * u * 4) | 0), dx = ((r() - 0.5) * u * 14) | 0;
      if (y + h > H) continue;
      const band = ctx.getImageData(0, y, W, h);
      ctx.putImageData(band, dx, y);
    }
    // scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

    if (p.sign && p.text) {
      const fs = u * 6.5;
      ctx.save();
      ctx.font = `700 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const x = u * 5, y = H - u * 9, flick = r() > 0.8 ? 0.55 : 1;
      ctx.globalAlpha = flick;
      for (const [blur, col] of [[u * 5, sc.a], [u * 2, sc.a], [0, '#ffffff']]) {
        ctx.shadowColor = sc.a; ctx.shadowBlur = blur; ctx.fillStyle = col; ctx.fillText(p.text.toUpperCase(), x, y);
      }
      ctx.restore();
    }
  },
});
