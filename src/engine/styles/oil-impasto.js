// src/engine/styles/oil-impasto.js
import { still, rng, boxBlur, sobel, hexToRgb, clamp, rgb2hsl, hsl2rgb, hash2 } from '../utils.js';
import { pixels, blurRGB, slopes } from '../helpers.js';

export default still({
  id: 'oil-impasto',
  name: 'Oil Impasto',
  blurb: 'Thick oil paint laid on with a loaded brush: ridged strokes that catch the light from one side.',
  maxSide: 900,
  params: [
    { key: 'size', label: 'Brush size', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'flow', label: 'Follow the shapes', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'relief', label: 'Thickness of paint', type: 'range', min: 5, max: 100, step: 1, default: 60 },
    { key: 'shine', label: 'Wet shine', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'angle', label: 'Light from', type: 'range', min: 0, max: 360, step: 1, default: 135, fmt: (v) => v + '°' },
    { key: 'seed', label: 'Repaint', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800;
    const key = p.size + '|' + p.flow + '|' + p.seed + '|' + W;
    if (cache.key !== key) {
      const s = (7.5 + (p.size / 100) * 22) * sc, r = rng(p.seed * 41 + 5), fl = p.flow / 100;
      const ch = blurRGB(d, W, H, Math.max(1, Math.round(s * 0.4)), 2);
      const Lb = new Float32Array(N);
      for (let i = 0; i < N; i++) Lb[i] = (0.2126 * ch[0][i] + 0.7152 * ch[1][i] + 0.0722 * ch[2][i]) / 255;
      const { gx, gy, mag } = sobel(boxBlur(Lb, W, H, Math.max(1, Math.round(s * 0.5))), W, H, 2);
      const col = env.makeCanvas(W, H), hg = env.makeCanvas(W, H), cx = col.getContext('2d'), hx = hg.getContext('2d');
      cx.fillStyle = '#5a4a3a'; cx.fillRect(0, 0, W, H); hx.fillStyle = 'rgb(110,110,110)'; hx.fillRect(0, 0, W, H);
      cx.lineCap = 'round'; hx.lineCap = 'round';
      const passes = [{ sz: s, step: s * 0.95, keep: 1 }, { sz: s * 0.5, step: s * 0.7, keep: 0.35 }];
      for (const ps of passes) {
        const pts = [];
        for (let y = 0; y < H + ps.step; y += ps.step) for (let x = 0; x < W + ps.step; x += ps.step) if (r() < ps.keep) pts.push([x + (r() - 0.5) * ps.step, y + (r() - 0.5) * ps.step]);
        for (let i = pts.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
        for (const [x, y] of pts) {
          const xi = clamp(x | 0, 0, W - 1), yi = clamp(y | 0, 0, H - 1), i = yi * W + xi;
          const edgeA = Math.atan2(gy[i], gx[i]) + Math.PI / 2, wgt = fl * clamp(mag[i] * 12), base = -0.7 + (r() - 0.5) * 0.9;
          const ang = Math.atan2(Math.sin(edgeA) * wgt + Math.sin(base) * (1 - wgt), Math.cos(edgeA) * wgt + Math.cos(base) * (1 - wgt));
          const len = ps.sz * (1.7 + r() * 1.3), dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2, nx = -Math.sin(ang), ny = Math.cos(ang);
          const k = 0.94 + r() * 0.12, rr = clamp(ch[0][i] * k, 0, 255) | 0, gg = clamp(ch[1][i] * k, 0, 255) | 0, bb = clamp(ch[2][i] * k, 0, 255) | 0;
          cx.strokeStyle = `rgb(${rr},${gg},${bb})`; cx.lineWidth = ps.sz; cx.beginPath(); cx.moveTo(x - dx, y - dy); cx.lineTo(x + dx, y + dy); cx.stroke();
          const hb = 95 + r() * 75;
          hx.strokeStyle = `rgb(${hb | 0},${hb | 0},${hb | 0})`; hx.lineWidth = ps.sz; hx.beginPath(); hx.moveTo(x - dx, y - dy); hx.lineTo(x + dx, y + dy); hx.stroke();
          for (let b = -1; b <= 1; b++) {
            const off = b * ps.sz * 0.28, v = hb + 12 + r() * 34;
            hx.strokeStyle = `rgb(${v | 0},${v | 0},${v | 0})`; hx.lineWidth = Math.max(0.8, ps.sz * 0.2);
            hx.beginPath(); hx.moveTo(x - dx * 0.92 + nx * off, y - dy * 0.92 + ny * off); hx.lineTo(x + dx * 0.92 + nx * off, y + dy * 0.92 + ny * off); hx.stroke();
          }
          hx.strokeStyle = 'rgb(205,205,205)'; hx.lineWidth = Math.max(0.8, ps.sz * 0.1);
          for (const sd of [-1, 1]) { hx.beginPath(); hx.moveTo(x - dx + nx * sd * ps.sz * 0.46, y - dy + ny * sd * ps.sz * 0.46); hx.lineTo(x + dx + nx * sd * ps.sz * 0.46, y + dy + ny * sd * ps.sz * 0.46); hx.stroke(); }
        }
      }
      const cd = cx.getImageData(0, 0, W, H).data, hd = hx.getImageData(0, 0, W, H).data, h = new Float32Array(N);
      for (let i = 0; i < N; i++) h[i] = hd[i * 4] / 255;
      cache.cd = cd; cache.h = boxBlur(h, W, H, Math.max(1, Math.round(sc * 1.2))); cache.key = key;
    }
    const { cd, h } = cache, { sx, sy } = slopes(h, W, H, (p.relief / 100) * 8 + 1);
    const a = (p.angle * Math.PI) / 180;
    let lx = Math.cos(a), ly = -Math.sin(a), lz = 0.7; const ln = Math.hypot(lx, ly, lz); lx /= ln; ly /= ln; lz /= ln;
    const hx2 = lx, hy2 = ly, hz2 = lz + 1, hn = Math.hypot(hx2, hy2, hz2), shine = p.shine / 100;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let i = 0; i < N; i++) {
      let nx = sx[i], ny = sy[i]; const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= nl; ny *= nl; const nz = nl;
      const diff = Math.max(0, nx * lx + ny * ly + nz * lz), spec = Math.pow(Math.max(0, (nx * hx2 + ny * hy2 + nz * hz2) / hn), 26) * shine * 0.55, o = i * 4;
      const shade = 0.5 + 0.62 * diff / lz;
      o4[o] = cd[o] * shade + spec * 255; o4[o + 1] = cd[o + 1] * shade + spec * 250; o4[o + 2] = cd[o + 2] * shade + spec * 240; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
