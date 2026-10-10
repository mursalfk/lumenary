import { still, clamp, sampleImage, rgb2hsl, hsl2rgb } from '../utils.js';

const hex = (s) => s.match(/../g).map((v) => parseInt(v, 16));
const PALETTES = {
  gameboy: ['0f380f', '306230', '8bac0f', '9bbc0f'].map(hex),
  pico: ['000000', '1d2b53', '7e2553', '008751', 'ab5236', '5f574f', 'c2c3c7', 'fff1e8', 'ff004d', 'ffa300', 'ffec27', '00e436', '29adff', '83769c', 'ff77a8', 'ffccaa'].map(hex),
  cga: ['000000', '55ffff', 'ff55ff', 'ffffff'].map(hex),
  mono: ['0a0a0a', 'f2f2f0'].map(hex),
};
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function kmeans(px, n, k) {
  const step = Math.max(1, Math.floor(n / 6000)), pts = [];
  for (let i = 0; i < n; i += step) pts.push([px[i * 4], px[i * 4 + 1], px[i * 4 + 2]]);
  const sorted = pts.slice().sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let C = Array.from({ length: k }, (_, i) => sorted[Math.min(sorted.length - 1, Math.floor(((i + 0.5) / k) * sorted.length))].slice());
  for (let it = 0; it < 10; it++) {
    const sum = C.map(() => [0, 0, 0, 0]);
    for (const q of pts) {
      let b = 0, bd = 1e9;
      for (let c = 0; c < k; c++) {
        const d = (q[0] - C[c][0]) ** 2 + (q[1] - C[c][1]) ** 2 + (q[2] - C[c][2]) ** 2;
        if (d < bd) { bd = d; b = c; }
      }
      sum[b][0] += q[0]; sum[b][1] += q[1]; sum[b][2] += q[2]; sum[b][3]++;
    }
    C = C.map((c, i) => (sum[i][3] ? [sum[i][0] / sum[i][3], sum[i][1] / sum[i][3], sum[i][2] / sum[i][3]] : c));
  }
  return C;
}

export default still({
  id: 'pixel-art',
  number: 17,
  name: 'Pixel art',
  blurb: 'A coarse grid, a small palette, and a little dithering.',
  maxSide: 1100,
  params: [
    { key: 'width', label: 'Pixels across', type: 'range', min: 24, max: 200, step: 1, default: 64 },
    {
      key: 'palette', label: 'Palette', type: 'select', default: 'adaptive',
      options: [['adaptive', 'Adaptive'], ['pico', 'PICO-8'], ['gameboy', 'Game Boy'], ['cga', 'CGA'], ['mono', 'Two-tone']],
    },
    { key: 'colors', label: 'Colors (adaptive)', type: 'range', min: 2, max: 32, step: 1, default: 12 },
    { key: 'saturation', label: 'Saturation', type: 'range', min: -50, max: 100, step: 1, default: 20 },
    { key: 'dither', label: 'Dithering', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'grid', label: 'Pixel grid', type: 'toggle', default: false },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const sw = Math.round(p.width), sh = Math.max(1, Math.round((sw * H) / W));
    const key = sw + 'x' + sh;
    if (cache.key !== key) { cache.img = sampleImage(env, work, sw, sh); cache.key = key; }
    const src = cache.img.data, n = sw * sh;
    const adj = new Uint8ClampedArray(src.length);
    const sat = 1 + p.saturation / 100;
    for (let i = 0; i < n; i++) {
      let [h, s, l] = rgb2hsl(src[i * 4], src[i * 4 + 1], src[i * 4 + 2]);
      const [r, g, b] = hsl2rgb(h, clamp(s * sat), l);
      adj[i * 4] = r; adj[i * 4 + 1] = g; adj[i * 4 + 2] = b; adj[i * 4 + 3] = 255;
    }
    const pal = p.palette === 'adaptive' ? kmeans(adj, n, Math.round(p.colors)) : PALETTES[p.palette];
    const amt = (p.dither / 100) * (pal.length > 6 ? 40 : 90);
    const out = env.makeCanvas(sw, sh), octx = out.getContext('2d'), od = octx.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const i = (y * sw + x) * 4, o = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * amt;
        const r = adj[i] + o, g = adj[i + 1] + o, b = adj[i + 2] + o;
        let best = 0, bd = 1e12;
        for (let c = 0; c < pal.length; c++) {
          const d = (r - pal[c][0]) ** 2 * 0.9 + (g - pal[c][1]) ** 2 * 1.2 + (b - pal[c][2]) ** 2 * 0.8;
          if (d < bd) { bd = d; best = c; }
        }
        od.data[i] = pal[best][0]; od.data[i + 1] = pal[best][1]; od.data[i + 2] = pal[best][2]; od.data[i + 3] = 255;
      }
    }
    octx.putImageData(od, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(out, 0, 0, W, H);
    if (p.grid && W / sw >= 5) {
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.lineWidth = Math.max(1, W / sw / 14);
      ctx.beginPath();
      for (let x = 1; x < sw; x++) { ctx.moveTo((x * W) / sw, 0); ctx.lineTo((x * W) / sw, H); }
      for (let y = 1; y < sh; y++) { ctx.moveTo(0, (y * H) / sh); ctx.lineTo(W, (y * H) / sh); }
      ctx.stroke();
    }
  },
});
