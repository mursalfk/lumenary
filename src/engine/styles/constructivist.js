// src/engine/styles/constructivist.js
import { still, TAU, hexToRgb } from '../utils.js';
import { pixels, paintPixels, label } from '../helpers.js';

export default still({
  id: 'constructivist',
  name: 'Constructivist',
  blurb: 'Soviet poster language: a red-and-black photograph, diagonal bars, a wedge and bold slogan type.',
  maxSide: 1000,
  params: [
    { key: 'angle', label: 'Poster angle', type: 'range', min: 0, max: 40, step: 1, default: 18 },
    { key: 'contrast', label: 'Photo contrast', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'wedge', label: 'Red wedge', type: 'toggle', default: true },
    { key: 'slogan', label: 'Slogan', type: 'text', default: 'SEE THE LIGHT', max: 16 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, u = Math.min(W, H) / 100, ang = -p.angle * Math.PI / 180;
    const RED = '#d9231c', CREAM = '#efe6d2', BLACK = '#141414';
    ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H);
    // the photograph as a black-and-cream two-tone, then clipped into a rotated rectangle
    const tmp = env.makeCanvas(W, H), tx = tmp.getContext('2d');
    const sorted = Float32Array.from(L).sort(), cut = sorted[(sorted.length * (0.5 - p.contrast / 600)) | 0];   // threshold at the picture's own median
    paintPixels(tx, W, H, (x, y, o) => { const v = L[y * W + x] < cut ? 0 : 1; o[0] = v ? 239 : 20; o[1] = v ? 230 : 20; o[2] = v ? 210 : 20; });
    ctx.save();
    ctx.translate(W * 0.5, H * 0.46); ctx.rotate(ang);
    const pw = W * 0.7, ph = H * 0.6;
    ctx.beginPath(); ctx.rect(-pw / 2, -ph / 2, pw, ph); ctx.clip();
    ctx.rotate(-ang * 0.0);
    ctx.drawImage(tmp, -W * 0.55, -H * 0.5, W * 1.1, H * 1.0);
    ctx.restore();
    // red wedge cutting across the photo
    if (p.wedge) {
      ctx.save(); ctx.translate(W * 0.5, H * 0.46); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(-pw / 2 - u * 6, ph / 2 + u * 2); ctx.lineTo(-pw * 0.05, -ph / 2 - u * 2); ctx.lineTo(pw * 0.22, ph / 2 + u * 2); ctx.closePath();
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = RED; ctx.fill();
      ctx.restore();
    }
    // red photo frame
    ctx.save(); ctx.translate(W * 0.5, H * 0.46); ctx.rotate(ang);
    ctx.lineWidth = u * 1.1; ctx.strokeStyle = BLACK; ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
    ctx.restore();
    // two heavy diagonal bars and a disc
    ctx.fillStyle = RED;
    ctx.save(); ctx.translate(W * 0.5, H * 0.46); ctx.rotate(ang);
    ctx.fillRect(-pw / 2 - u * 8, ph / 2 + u * 3, pw * 0.75, u * 5);
    ctx.fillRect(pw / 2 - pw * 0.28, -ph / 2 - u * 8, pw * 0.28 + u * 8, u * 5);
    ctx.fillStyle = BLACK; ctx.beginPath(); ctx.arc(pw / 2 + u * 2, ph / 2 + u * 2, u * 6, 0, TAU); ctx.fill();
    ctx.restore();
    // slogan, set on the slant, with a red slab behind
    if (p.slogan) {
      const text = p.slogan.toUpperCase();
      ctx.save(); ctx.translate(W * 0.07, H * 0.9); ctx.rotate(ang * 0.6);
      ctx.font = `900 ${u * 8.5}px "Hanken Grotesk", Impact, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const tw = Math.min(W * 0.86, ctx.measureText(text).width);
      ctx.fillStyle = BLACK; ctx.fillRect(-u * 2, -u * 6, tw + u * 4, u * 12);
      ctx.fillStyle = CREAM; ctx.fillText(text, 0, u * 0.4, W * 0.86);
      ctx.restore();
    }
    ctx.strokeStyle = BLACK; ctx.lineWidth = u * 0.5;
    ctx.beginPath(); ctx.moveTo(W * 0.07, H * 0.045); ctx.lineTo(W * 0.5, H * 0.045); ctx.stroke();
  },
});
