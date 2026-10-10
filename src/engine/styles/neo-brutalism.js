import { still, clamp, lumArray, boxBlur, sobel, hexToRgb, smoothstep } from '../utils.js';

const PALETTES = {
  pop: ['#111111', '#ff5757', '#ffde59', '#5ce1e6', '#ffffff'],
  candy: ['#2b1d4a', '#ff7ac6', '#ffb86b', '#c1ff72', '#fff8e1'],
  mono: ['#111111', '#4a4a4a', '#8c8c8c', '#cfcfcf', '#ffffff'],
};
const BGS = { yellow: '#ffde59', pink: '#ff90e8', lime: '#c1ff72', cyan: '#5ce1e6', white: '#f1f1ed' };

export default still({
  id: 'neo-brutalism',
  number: 20,
  name: 'Neo-brutalism',
  blurb: 'Flat color blocks, thick black outlines and a hard offset shadow.',
  maxSide: 1100,
  params: [
    { key: 'palette', label: 'Colors', type: 'select', default: 'pop', options: [['pop', 'Pop'], ['candy', 'Candy'], ['mono', 'Gray']] },
    { key: 'bg', label: 'Backdrop', type: 'select', default: 'yellow', options: [['yellow', 'Yellow'], ['pink', 'Pink'], ['lime', 'Lime'], ['cyan', 'Cyan'], ['white', 'White']] },
    { key: 'levels', label: 'Color blocks', type: 'range', min: 3, max: 5, step: 1, default: 5 },
    { key: 'ink', label: 'Outline detail', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'weight', label: 'Outline weight', type: 'range', min: 1, max: 5, step: 1, default: 3 },
    { key: 'shadow', label: 'Shadow', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'window', label: 'Window bar', type: 'toggle', default: true },
    { key: 'title', label: 'Window title', type: 'text', default: 'your_image.png', max: 24 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const u = W / 100, bw = u * (0.35 + p.weight * 0.22);
    ctx.fillStyle = BGS[p.bg] || BGS.yellow;
    ctx.fillRect(0, 0, W, H);

    const sh = (p.shadow / 100) * u * 3.4;
    const m = u * 6, cw = W - 2 * m - sh, chh = H - 2 * m - sh;
    const bar = p.window ? u * 6.4 : 0;
    const cx = m, cy = m;

    // hard shadow + card
    ctx.fillStyle = '#111';
    ctx.fillRect(cx + sh, cy + sh, cw, chh);
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx, cy, cw, chh);

    // inner picture area, center-cropped from the source
    const ix = Math.round(cx + bw), iy = Math.round(cy + bw + bar);
    const iw = Math.round(cw - 2 * bw), ih = Math.round(chh - 2 * bw - bar);
    const key = iw + 'x' + ih;
    if (cache.key !== key) {
      const t = env.makeCanvas(iw, ih), tx = t.getContext('2d');
      const k = Math.max(iw / W, ih / H), sw = iw / k, shh = ih / k;
      tx.drawImage(work, (W - sw) / 2, (H - shh) / 2, sw, shh, 0, 0, iw, ih);
      cache.data = tx.getImageData(0, 0, iw, ih);
      cache.L = lumArray(cache.data);
      cache.Lb = boxBlur(cache.L, iw, ih, Math.max(1, Math.round(W / 600)));
      cache.key = key;
    }
    const L = cache.L, Lb = cache.Lb;
    const pal = (PALETTES[p.palette] || PALETTES.pop).map(hexToRgb);
    const n = Math.round(p.levels);
    const pick = [];
    for (let i = 0; i < n; i++) pick.push(pal[Math.round((i / (n - 1)) * (pal.length - 1))]);
    const { mag } = sobel(Lb, iw, ih, Math.max(1, Math.round((W / 800) * p.weight)));
    const th = 0.34 - (p.ink / 100) * 0.27;

    const img = ctx.createImageData(iw, ih), d = img.data;
    for (let i = 0; i < iw * ih; i++) {
      const c = pick[Math.min(n - 1, Math.floor(clamp(L[i]) * n))];
      const e = p.ink > 0 ? smoothstep(th, th * 1.25, mag[i]) : 0;
      d[i * 4] = c[0] * (1 - e) + 17 * e; d[i * 4 + 1] = c[1] * (1 - e) + 17 * e; d[i * 4 + 2] = c[2] * (1 - e) + 17 * e; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, ix, iy);

    // chrome
    ctx.strokeStyle = '#111'; ctx.fillStyle = '#111'; ctx.lineJoin = 'miter';
    if (p.window) {
      ctx.lineWidth = bw;
      ctx.beginPath(); ctx.moveTo(cx, cy + bw + bar - bw / 2); ctx.lineTo(cx + cw, cy + bw + bar - bw / 2); ctx.stroke();
      const s = bar * 0.38, y0 = cy + bw + (bar - bw - s) / 2;
      ctx.lineWidth = Math.max(1, bw * 0.7);
      ['#ff5757', '#ffde59', '#5ce1e6'].forEach((col, i) => {
        ctx.fillStyle = col; ctx.fillRect(cx + bw + u * 1.6 + i * (s + u * 1.1), y0, s, s);
        ctx.strokeRect(cx + bw + u * 1.6 + i * (s + u * 1.1), y0, s, s);
      });
      ctx.fillStyle = '#111';
      ctx.font = `700 ${bar * 0.4}px "DM Mono", ui-monospace, Menlo, monospace`;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
      ctx.fillText(p.title || '', cx + cw - bw - u * 2, cy + bw + (bar - bw) / 2);
    }
    ctx.lineWidth = bw * 2;
    ctx.strokeRect(cx, cy, cw, chh);
  },
});
