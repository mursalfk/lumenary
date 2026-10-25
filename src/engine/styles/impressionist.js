// src/engine/styles/impressionist.js
import { still, rng, boxBlur, sobel, clamp, rgb2hsl, hsl2rgb } from '../utils.js';
import { pixels, blurRGB } from '../helpers.js';

export default still({
  id: 'impressionist',
  name: 'Impressionist',
  blurb: 'Broken colour in short, visible brushstrokes: big ones first for the light, small ones only where the picture has detail.',
  maxSide: 900,
  params: [
    { key: 'brush', label: 'Brush size', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'detail', label: 'Detail', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'length', label: 'Stroke length', type: 'range', min: 1, max: 100, step: 1, default: 45 },
    { key: 'glow', label: 'Sunlit colour', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'canvas', label: 'Canvas texture', type: 'toggle', default: true },
    { key: 'seed', label: 'Repaint', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800, r = rng(p.seed * 37 + 11), glow = p.glow / 100;
    const Rs = [(7 + (p.brush / 100) * 14) * sc, (3.4 + (p.brush / 100) * 7) * sc, (1.8 + (p.brush / 100) * 3.6) * sc];
    const tone = ([R, G, B]) => {
      let [h, s, l] = rgb2hsl(R, G, B);
      s = clamp(s * (1 + 0.35 * glow) + 0.03 * glow); l = clamp(l + 0.05 * glow * (1 - l));
      if (l < 0.4) { const t = (0.4 - l) * 1.4 * glow; h = h + (0.72 - h) * Math.min(0.5, t); }
      return hsl2rgb(h, s, l);
    };
    ctx.fillStyle = '#d8ccb4'; ctx.fillRect(0, 0, W, H);
    const base = env.makeCanvas(Math.max(8, Math.round(W / 14)), Math.max(8, Math.round(H / 14)));
    base.getContext('2d').drawImage(work, 0, 0, base.width, base.height);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(base, 0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    Rs.forEach((R, pass) => {
      const ref = blurRGB(d, W, H, Math.max(1, Math.round(R * 0.5)), 2), L = new Float32Array(N);
      for (let i = 0; i < N; i++) L[i] = (0.2126 * ref[0][i] + 0.7152 * ref[1][i] + 0.0722 * ref[2][i]) / 255;
      const { gx, gy } = sobel(boxBlur(L, W, H, Math.max(1, Math.round(R * 0.6))), W, H, 1);
      const cur = ctx.getImageData(0, 0, W, H).data, g = R * 1.15, thr = pass === 0 ? 0 : (1 - p.detail / 100) * 60 + 8, jobs = [];
      for (let y0 = 0; y0 < H; y0 += g) for (let x0 = 0; x0 < W; x0 += g) {
        let err = 0, bx = x0, by = y0, be = -1;
        for (let k = 0; k < 5; k++) {
          const x = clamp((x0 + r() * g) | 0, 0, W - 1), y = clamp((y0 + r() * g) | 0, 0, H - 1), i = y * W + x, o = i * 4;
          const e = Math.abs(cur[o] - ref[0][i]) + Math.abs(cur[o + 1] - ref[1][i]) + Math.abs(cur[o + 2] - ref[2][i]);
          err += e; if (e > be) { be = e; bx = x; by = y; }
        }
        if (err / 5 / 3 > thr || pass === 0) jobs.push([bx, by]);
      }
      for (let i = jobs.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [jobs[i], jobs[j]] = [jobs[j], jobs[i]]; }
      const maxLen = 2 + Math.round((p.length / 100) * (pass === 0 ? 5 : 7));
      for (const [sx, sy] of jobs) {
        let x = sx, y = sy, i = (y | 0) * W + (x | 0), px = 0, py = 0;
        const c0 = tone([ref[0][i], ref[1][i], ref[2][i]]), k = 0.95 + r() * 0.1, col = [clamp(c0[0] * k, 0, 255), clamp(c0[1] * k, 0, 255), clamp(c0[2] * k, 0, 255)];
        ctx.strokeStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; ctx.lineWidth = R * 2 * (0.85 + r() * 0.3);
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < maxLen; s++) {
          i = clamp(y | 0, 0, H - 1) * W + clamp(x | 0, 0, W - 1);
          let dx = -gy[i], dy = gx[i]; const m = Math.hypot(dx, dy);
          if (m < 0.02) { dx = Math.cos(-0.6); dy = Math.sin(-0.6); } else { dx /= m; dy /= m; }
          if (px * dx + py * dy < 0) { dx = -dx; dy = -dy; }
          x += dx * R * 0.9; y += dy * R * 0.9; px = dx; py = dy;
          if (x < 0 || y < 0 || x >= W || y >= H) break;
          ctx.lineTo(x, y);
          const j = (y | 0) * W + (x | 0);
          if (s > 1 && Math.abs(ref[0][j] - c0[0]) + Math.abs(ref[1][j] - c0[1]) + Math.abs(ref[2][j] - c0[2]) > 90) break;
        }
        ctx.stroke();
      }
    });
    if (p.canvas) {
      const img = ctx.getImageData(0, 0, W, H), o4 = img.data, wv = Math.max(2, 2.6 * sc);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4, k = 1 + (Math.cos((x * 6.2832) / wv) * Math.cos((y * 6.2832) / wv)) * 0.03 + (((x * 7 + y * 13) & 7) - 3.5) * 0.004;
        o4[o] *= k; o4[o + 1] *= k; o4[o + 2] *= k;
      }
      ctx.putImageData(img, 0, 0);
    }
  },
});
