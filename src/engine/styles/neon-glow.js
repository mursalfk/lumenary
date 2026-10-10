import { lumArray, boxBlur, sobel, smoothstep, lerp, hexToRgb, clamp } from '../utils.js';

export default {
  id: 'neon-glow',
  number: 4,
  name: 'Neon glow',
  kind: 'animated',
  maxSide: 800,
  thumbAt: 0.5,
  blurb: 'Every edge becomes a glowing tube on a dark wall.',
  params: [
    { key: 'detail', label: 'Line detail', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'mode', label: 'Colors', type: 'select', default: 'duo', options: [['duo', 'Two neon colors'], ['source', 'From the image']] },
    { key: 'c1', label: 'Neon one', type: 'color', default: '#19e6ff' },
    { key: 'c2', label: 'Neon two', type: 'color', default: '#ff2fd0' },
    { key: 'base', label: 'Show image', type: 'range', min: 0, max: 100, step: 1, default: 12 },
    { key: 'flicker', label: 'Flicker', type: 'toggle', default: true },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, L = null, srcData = null, edge = null, levels = [], key = '';

    function rebuild() {
      if (!L) {
        srcData = work.getContext('2d').getImageData(0, 0, W, H).data;
        L = lumArray({ data: srcData, width: W, height: H });
      }
      const Lb = boxBlur(L, W, H, 1);
      const { mag } = sobel(Lb, W, H, Math.max(1, Math.round(W / 700)));
      const th = lerp(0.26, 0.03, p.detail / 100);
      const c1 = hexToRgb(p.c1), c2 = hexToRgb(p.c2);
      edge = env.makeCanvas(W, H);
      const ex = edge.getContext('2d'), img = ex.createImageData(W, H), d = img.data;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * W + x, o = i * 4, a = smoothstep(th, th * 2, mag[i]);
          if (a <= 0) continue;
          let r, g, b;
          if (p.mode === 'source') {
            r = clamp(srcData[o] * 1.5 + 50, 0, 255); g = clamp(srcData[o + 1] * 1.5 + 50, 0, 255); b = clamp(srcData[o + 2] * 1.5 + 50, 0, 255);
          } else {
            const tmix = clamp((x / W) * 0.65 + (y / H) * 0.35);
            r = lerp(c1[0], c2[0], tmix); g = lerp(c1[1], c2[1], tmix); b = lerp(c1[2], c2[2], tmix);
          }
          d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = a * 255;
        }
      }
      ex.putImageData(img, 0, 0);
      levels = [];
      let cur = edge;
      for (let k = 0; k < 4; k++) {
        const c = env.makeCanvas(Math.max(2, Math.round(cur.width / 2)), Math.max(2, Math.round(cur.height / 2)));
        const cx = c.getContext('2d'); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
        cx.drawImage(cur, 0, 0, c.width, c.height);
        levels.push(c); cur = c;
      }
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; L = null; key = ''; },
      setParams(np) { p = np; },
      draw(ctx, t) {
        const k = [p.detail, p.mode, p.c1, p.c2].join('|');
        if (k !== key) { rebuild(); key = k; }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#030305';
        ctx.fillRect(0, 0, W, H);
        if (p.base > 0) { ctx.globalAlpha = (p.base / 100) * 0.4; ctx.drawImage(work, 0, 0, W, H); ctx.globalAlpha = 1; }
        let f = 1;
        if (p.flicker) {
          f = 0.93 + 0.05 * Math.sin(t * 9.1) + 0.03 * Math.sin(t * 23.7);
          if ((t * 0.37) % 1 > 0.965) f *= 0.45;
        }
        const g = p.glow / 100;
        ctx.globalCompositeOperation = 'lighter';
        const w = [0.95, 0.85, 0.75, 0.65];
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        for (let i = 0; i < levels.length; i++) {
          ctx.globalAlpha = clamp(g * w[i] * f);
          ctx.drawImage(levels[i], 0, 0, W, H);
          ctx.drawImage(levels[i], 0, 0, W, H);
        }
        ctx.globalAlpha = clamp(0.95 * f);
        ctx.drawImage(edge, 0, 0, W, H);
        ctx.globalAlpha = clamp(0.7 * f);
        ctx.drawImage(edge, 0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      },
      dispose() {},
    };
  },
};
