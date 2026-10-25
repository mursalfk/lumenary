// src/engine/styles/sindhi-mirror-embroidery.js
import { still, hexToRgb, rgb2hsl, hsl2rgb, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, vivid, clothFill, leaf } from '../culture.js';

const CLOTH = { black: ['#1a1211', '#0d0908'], maroon: ['#521319', '#2e0a0f'], indigo: ['#1c2658', '#10163a'], green: ['#14402f', '#0b241b'] };

export default still({
  id: 'sindhi-mirror-embroidery',
  name: 'Sindhi Mirror Embroidery',
  blurb: 'Abhla bharat: small round mirrors stitched onto dark cloth, each ringed with radiating thread. The mirrors catch your picture and the thread takes its colours.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Spacing', type: 'range', min: 30, max: 100, step: 1, default: 56 },
    { key: 'mirror', label: 'Mirror size', type: 'range', min: 25, max: 80, step: 1, default: 50 },
    { key: 'thread', label: 'Thread', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'shine', label: 'Mirror shine', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'cloth', label: 'Cloth', type: 'select', default: 'black', options: [['black', 'Black'], ['maroon', 'Maroon'], ['indigo', 'Indigo'], ['green', 'Bottle green']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, dy = s * 0.866, smp = sampler(cache, d, W, H, s * 0.35);
    const [a, b] = CLOTH[p.cloth].map(hexToRgb), rm = s * 0.5 * (p.mirror / 100) * 0.74, th = p.thread / 100, tmp = [0, 0, 0];
    clothFill(ctx, W, H, a, b, sc, 3, 0.07);
    ctx.lineCap = 'round';
    const spots = [];
    for (let j = -1, y = -dy; y < H + dy; j++, y += dy) for (let x = (((j % 2) + 2) % 2) * (s / 2) - s; x < W + s; x += s) spots.push([x, y]);
    const palette = (x, y) => {
      const c = smp.rgb(Math.min(W - 1, Math.max(0, x)), Math.min(H - 1, Math.max(0, y))), t = smp.tone(Math.min(W - 1, Math.max(0, x)), Math.min(H - 1, Math.max(0, y)));
      vivid(c, 1.7, 0.1, tmp);
      const [h, sa, l] = rgb2hsl(tmp[0], tmp[1], tmp[2]), k = 0.92 + 0.28 * t;
      const c1 = [tmp[0] * k, tmp[1] * k, tmp[2] * k], c2 = hsl2rgb(h + 0.45, Math.min(1, sa + 0.1), 0.55 * k + 0.1), c3 = hsl2rgb(h + 0.08, 0.35, 0.8 * k + 0.12);
      return [c1, c2, c3];
    };
    // seed stitches in the gaps between three mirrors
    for (const [x, y] of spots) for (const [ox, oy] of [[s / 2, dy / 3], [s, (2 * dy) / 3]]) {
      const px = x + ox, py = y + oy;
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const [, , c3] = palette(px, py), r = s * 0.07;
      ctx.strokeStyle = css(c3, 0.8); ctx.lineWidth = 1.6 * sc;
      ctx.beginPath(); for (let q = 0; q < 4; q++) { const an = (q / 4) * TAU + Math.PI / 4; ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(an) * r, py + Math.sin(an) * r); } ctx.stroke();
    }
    for (const [x, y] of spots) {
      const [c1, c2, c3] = palette(x, y);
      if (th > 0.02) {
        ctx.fillStyle = css(c3, 0.95); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.8 * sc;
        const n2 = 10;
        for (let q = 0; q < n2; q++) { const an = (q / n2) * TAU + 0.15; leaf(ctx, x + Math.cos(an) * rm * 1.5, y + Math.sin(an) * rm * 1.5, an, rm * (0.7 + 1.0 * th), rm * 0.34); ctx.fill(); ctx.stroke(); }
        const n1 = Math.max(14, Math.round((TAU * rm * 1.3) / (2.3 * sc)));
        ctx.lineWidth = 2.4 * sc;
        for (let q = 0; q < n1; q++) { const an = (q / n1) * TAU; ctx.strokeStyle = css(q % 2 ? c1 : c2); ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * rm * 1.05, y + Math.sin(an) * rm * 1.05); ctx.lineTo(x + Math.cos(an) * rm * (1.3 + 0.6 * th), y + Math.sin(an) * rm * (1.3 + 0.6 * th)); ctx.stroke(); }
      }
      // the mirror itself, showing a small piece of the picture
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, rm, 0, TAU); ctx.clip();
      const half = rm * 3.4;
      ctx.translate(x, y); ctx.scale(-1, 1);
      ctx.drawImage(work, Math.max(0, Math.min(W - 2, x - half)), Math.max(0, Math.min(H - 2, y - half)), Math.min(2 * half, W), Math.min(2 * half, H), -rm, -rm, 2 * rm, 2 * rm);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const sh = p.shine / 100, gr = ctx.createRadialGradient(x - rm * 0.35, y - rm * 0.4, rm * 0.05, x, y, rm);
      gr.addColorStop(0, `rgba(255,255,255,${0.55 * sh})`); gr.addColorStop(0.5, `rgba(200,215,235,${0.2 * sh})`); gr.addColorStop(1, `rgba(20,30,50,${0.45 * sh})`);
      ctx.fillStyle = gr; ctx.fillRect(x - rm, y - rm, 2 * rm, 2 * rm);
      ctx.restore();
      ctx.strokeStyle = 'rgba(12,8,8,0.85)'; ctx.lineWidth = 1.8 * sc; ctx.beginPath(); ctx.arc(x, y, rm, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(230,236,245,0.55)'; ctx.lineWidth = 0.9 * sc; ctx.beginPath(); ctx.arc(x, y, rm * 0.96, 0, TAU); ctx.stroke();
    }
  },
});
