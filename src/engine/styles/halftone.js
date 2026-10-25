import { still, clamp, hexToRgb, rgbCss, sampleImage, TAU } from '../utils.js';

function sampler(img) {
  const { data, width: w, height: h } = img;
  return (x, y, out) => {
    const fx = clamp(x, 0, w - 1), fy = clamp(y, 0, h - 1);
    const x0 = fx | 0, y0 = fy | 0, x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
    const ax = fx - x0, ay = fy - y0;
    for (let c = 0; c < 3; c++) {
      const a = data[(y0 * w + x0) * 4 + c], b = data[(y0 * w + x1) * 4 + c];
      const cc = data[(y1 * w + x0) * 4 + c], d = data[(y1 * w + x1) * 4 + c];
      out[c] = ((a * (1 - ax) + b * ax) * (1 - ay) + (cc * (1 - ax) + d * ax) * ay) / 255;
    }
  };
}

export default still({
  id: 'halftone',
  number: 15,
  name: 'Halftone',
  blurb: 'Print-shop dots: one ink, four inks, or colour on black.',
  maxSide: 1100,
  params: [
    { key: 'cells', label: 'Dots across', type: 'range', min: 30, max: 170, step: 1, default: 80 },
    {
      key: 'mode', label: 'Inks', type: 'select', default: 'mono',
      options: [['mono', 'One ink'], ['cmyk', 'Four-color (CMYK)'], ['color', 'Color on black']],
    },
    { key: 'angle', label: 'Screen angle', type: 'range', min: 0, max: 90, step: 1, default: 45, fmt: (v) => v + '°' },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -50, max: 50, step: 1, default: 10 },
    { key: 'gain', label: 'Dot gain', type: 'range', min: 0.7, max: 1.3, step: 0.02, default: 1, fmt: (v) => v.toFixed(2) },
    { key: 'paper', label: 'Paper', type: 'color', default: '#efede6' },
    { key: 'ink', label: 'Ink (one ink)', type: 'color', default: '#0c0c0c' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const sw = Math.round(p.cells * 2), sh = Math.max(2, Math.round(sw * H / W));
    if (cache.key !== sw) { cache.img = sampleImage(env, work, sw, sh); cache.samp = sampler(cache.img); cache.key = sw; }
    const samp = cache.samp, k = sw / W;
    const s = W / p.cells, c = (p.contrast / 50) + 1;
    const rgb = [0, 0, 0];
    const adjust = (v) => clamp((v - 0.5) * c + 0.5);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = p.mode === 'color' ? '#080808' : p.paper;
    ctx.fillRect(0, 0, W, H);

    const diag = Math.hypot(W, H), n = Math.ceil(diag / s / 2) + 2;
    const cx = W / 2, cy = H / 2;

    function lattice(angleDeg, radiusFn, colorFn) {
      const a = (angleDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
      for (let j = -n; j <= n; j++) {
        for (let i = -n; i <= n; i++) {
          const x = cx + (i * ca - j * sa) * s, y = cy + (i * sa + j * ca) * s;
          if (x < -s || x > W + s || y < -s || y > H + s) continue;
          samp(x * k, y * k, rgb);
          const r = radiusFn(rgb) * s * 0.5 * p.gain * 1.06;
          if (r < 0.25) continue;
          if (colorFn) ctx.fillStyle = colorFn(rgb);
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        }
      }
    }

    const lumv = (q) => 0.2126 * q[0] + 0.7152 * q[1] + 0.0722 * q[2];
    if (p.mode === 'mono') {
      ctx.fillStyle = p.ink;
      lattice(p.angle, (q) => Math.sqrt(adjust(1 - lumv(q))));
    } else if (p.mode === 'color') {
      lattice(p.angle, (q) => Math.sqrt(adjust(lumv(q))), (q) => {
        const m = 1 / Math.max(0.35, q[0], q[1], q[2]);
        return rgbCss(Math.min(255, q[0] * m * 255), Math.min(255, q[1] * m * 255), Math.min(255, q[2] * m * 255));
      });
    } else {
      ctx.globalCompositeOperation = 'multiply';
      const off = p.angle - 45;
      const cmyk = (q) => {
        const kk = 1 - Math.max(q[0], q[1], q[2]), d = 1 - kk || 1;
        return { c: (1 - q[0] - kk) / d, m: (1 - q[1] - kk) / d, y: (1 - q[2] - kk) / d, k: kk };
      };
      ctx.fillStyle = '#00aeef'; lattice(15 + off, (q) => Math.sqrt(adjust(cmyk(q).c)));
      ctx.fillStyle = '#ec008c'; lattice(75 + off, (q) => Math.sqrt(adjust(cmyk(q).m)));
      ctx.fillStyle = '#fff200'; lattice(0 + off, (q) => Math.sqrt(adjust(cmyk(q).y)));
      ctx.fillStyle = '#1a1a1a'; lattice(45 + off, (q) => Math.sqrt(adjust(cmyk(q).k)));
      ctx.globalCompositeOperation = 'source-over';
    }
  },
});
