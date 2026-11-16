// src/engine/styles/mono-essay.js
import { still, clamp, lerp, smoothstep, boxBlur, hash2, vnoise, rng, TAU } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';

const TONES = { black: [1, 1, 1], warm: [1.04, 0.97, 0.86], cold: [0.88, 0.96, 1.06] };

export default still({
  id: 'mono-essay',
  name: 'Mono Essay',
  blurb: 'A frame from a quiet video essay: the picture sunk into grainy black and white, one thin white contour drawn round its forms, a circle, a rule and a single sentence set small and wide.',
  maxSide: 1100,
  params: [
    { key: 'text', label: 'Sentence', type: 'text', default: 'The quiet work comes first', max: 60 },
    { key: 'contrast', label: 'Depth of the blacks', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'lines', label: 'Contour lines', type: 'range', min: 0, max: 3, step: 1, default: 2 },
    { key: 'figure', label: 'Circle and rule', type: 'toggle', default: true },
    { key: 'tone', label: 'Tone', type: 'select', default: 'black', options: [['black', 'Neutral'], ['warm', 'Warm'], ['cold', 'Cold']] },
    { key: 'seed', label: 'New print', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 1000, seed = p.seed * 17 + 3, N = W * H;
    if (!cache.Lw) {
      const Ls = stretchedL(cache), r = Math.max(3, Math.round(16 * sc));
      cache.Ls = Ls; cache.Lw = boxBlur(boxBlur(Ls, W, H, r), W, H, r);
      // where the subject is: the average position of everything that differs from the picture's mean tone
      let mean = 0; for (let i = 0; i < N; i += 7) mean += Ls[i]; mean /= N / 7;
      let sw = 0, sx = 0, sy = 0;
      for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) { const w = Math.abs(cache.Lw[y * W + x] - mean) ** 2; sw += w; sx += w * x; sy += w * y; }
      cache.cx = sw ? sx / sw : W / 2; cache.cy = sw ? sy / sw : H / 2;
    }
    const { Ls, Lw } = cache, c = p.contrast / 100, lo = 0.08 + 0.3 * c, hi = 1.02 - 0.12 * c, tone = TONES[p.tone] || TONES.black, grain = (p.grain / 100) * 46;
    const levels = [[0.5], [0.4, 0.66], [0.32, 0.52, 0.72]][p.lines - 1] || [], wline = 1.15 * sc, r = rng(seed);
    const scratches = []; for (let j = 0; j < 3; j++) scratches.push([r() * W, 0.2 + r() * 0.5]);
    const out = ctx.createImageData(W, H), o = out.data, cx = W / 2, cy = H / 2, rm = Math.hypot(cx, cy);
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      let v = smoothstep(lo, hi, Ls[i]); v = Math.pow(v, 1.2) * 0.88;
      v *= 1 - 0.55 * smoothstep(0.35, 1.05, Math.hypot(x - cx, y - cy) / rm);
      // contours: lines of equal brightness on a heavily blurred copy, drawn one pixel wide whatever the slope
      let a = 0;
      if (levels.length && x > 0 && y > 0 && x < W - 1 && y < H - 1) {
        const gx = (Lw[i + 1] - Lw[i - 1]) * 0.5, gy = (Lw[i + W] - Lw[i - W]) * 0.5, slope = Math.hypot(gx, gy) + 1e-5;
        for (const lv of levels) a = Math.max(a, 1 - smoothstep(wline * 0.5, wline * 1.3, Math.abs(Lw[i] - lv) / slope));
        a *= smoothstep(0.0006, 0.0022, slope / sc) * 0.82;
      }
      let g = v * 255 + (255 - v * 255) * a;
      g += (hash2(x, y, seed) - 0.5) * grain + (vnoise(x * 0.45, y * 0.45, seed + 2) - 0.5) * grain * 0.7;
      for (const [sxp, sa] of scratches) if (Math.abs(x - sxp - Math.sin(y * 0.01) * 3) < 0.7 && hash2(0, y >> 3, seed + 7) < sa) g += 26 * (p.grain / 100);
      if (hash2(x >> 1, y >> 1, seed + 11) > 0.99965) g += 120 * (p.grain / 100);
      o[k] = g * tone[0]; o[k + 1] = g * tone[1]; o[k + 2] = g * tone[2]; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    ctx.lineWidth = Math.max(1, 1.2 * sc); ctx.strokeStyle = 'rgba(255,255,255,0.86)'; ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const M = Math.min(W, H), mono = (px) => `500 ${Math.round(px)}px "DM Mono", monospace`;
    // letters set one at a time, so the spacing is the same in every browser
    const spaced = (text, x, y, px, gap, align) => {
      ctx.font = mono(px); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      const chars = Array.from(text), widths = chars.map((ch) => ctx.measureText(ch).width + gap), total = widths.reduce((s, w) => s + w, 0) - gap;
      let at = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
      chars.forEach((ch, j) => { ctx.fillText(ch, at, y); at += widths[j]; });
      return total;
    };
    if (p.figure) {
      const R = M * 0.23, fx = clamp(cache.cx, R + W * 0.06, W - R - W * 0.06), fy = clamp(cache.cy, R + H * 0.08, H - R - H * 0.2);
      ctx.beginPath(); ctx.arc(fx, fy, R, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(fx, fy, 2.4 * sc, 0, TAU); ctx.fill();
      const right = fx < W / 2, ex = right ? W * 0.94 : W * 0.06, sx0 = fx + (right ? R : -R);
      ctx.beginPath(); ctx.moveTo(sx0, fy); ctx.lineTo(ex, fy); ctx.stroke();
      for (let j = 0; j <= 4; j++) { const tx = lerp(sx0, ex, j / 4); ctx.beginPath(); ctx.moveTo(tx, fy - 4 * sc); ctx.lineTo(tx, fy + 4 * sc); ctx.stroke(); }
      spaced('FIG. 1', ex, fy - 16 * sc, 12 * sc, 3 * sc, right ? 'right' : 'left');
    }
    const text = (p.text || '').trim().toUpperCase();
    if (text) {
      const by = H * 0.9;
      ctx.beginPath(); ctx.moveTo(W / 2 - 22 * sc, by - 30 * sc); ctx.lineTo(W / 2 + 22 * sc, by - 30 * sc); ctx.stroke();
      // shrink the type until the sentence fits between the margins
      let px = 15 * sc, gap = 6.5 * sc;
      ctx.font = mono(px);
      const need = Array.from(text).reduce((s, ch) => s + ctx.measureText(ch).width + gap, 0), room = W * 0.86;
      if (need > room) { const q = room / need; px *= q; gap *= q; }
      spaced(text, W / 2, by, px, gap, 'center');
    }
  },
});
