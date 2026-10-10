import { sampleImage, rng, rgb2hsl, hsl2rgb, clamp } from '../utils.js';

export default {
  id: 'gradient-mesh',
  number: 11,
  name: 'Gradient mesh',
  kind: 'animated',
  maxSide: 900,
  thumbAt: 1.0,
  blurb: 'The picture dissolved into a slow, soft field of its own colors.',
  params: [
    { key: 'points', label: 'Color points', type: 'range', min: 3, max: 9, step: 1, default: 5 },
    { key: 'warp', label: 'Warp', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'speed', label: 'Drift speed', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'vivid', label: 'Vividness', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 40 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, key = '', grid = null, GX = 0, GY = 0, low = null, lw = 0, lh = 0, lowImg = null, noise = null;
    function build() {
      GX = Math.round(p.points); GY = Math.max(3, Math.round((GX * H) / W));
      const d = sampleImage(env, work, GX, GY).data;
      grid = new Float32Array(GX * GY * 3);
      for (let i = 0; i < GX * GY; i++) {
        const [h, s, l] = rgb2hsl(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
        const [r, g, b] = hsl2rgb(h, clamp(s * (1 + p.vivid / 60)), clamp((l - 0.5) * (1 + p.vivid / 200) + 0.5));
        grid[i * 3] = r; grid[i * 3 + 1] = g; grid[i * 3 + 2] = b;
      }
    }
    return {
      animated: true,
      setSource(w, ww, hh) {
        work = w; W = ww; H = hh; key = '';
        lw = Math.min(180, W); lh = Math.max(2, Math.round((lw * H) / W));
        low = env.makeCanvas(lw, lh);
        noise = env.makeCanvas(160, 160);
        const nx = noise.getContext('2d'), img = nx.createImageData(160, 160), r = rng(5);
        for (let i = 0; i < 160 * 160; i++) { const v = 128 + (r() - 0.5) * 180; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
        nx.putImageData(img, 0, 0);
      },
      setParams(np) { p = np; },
      draw(ctx, t) {
        const k = p.points + '|' + p.vivid;
        if (k !== key) { build(); key = k; }
        const lx = low.getContext('2d');
        if (!lowImg) lowImg = lx.createImageData(lw, lh);
        const d = lowImg.data, tt = t * (p.speed / 40) * 0.6, wp = (p.warp / 100) * 0.16;
        for (let y = 0; y < lh; y++) {
          const v0 = y / (lh - 1);
          for (let x = 0; x < lw; x++) {
            const u0 = x / (lw - 1);
            const u = clamp(u0 + wp * Math.sin(v0 * 3.4 + tt * 0.9 + Math.sin(u0 * 2.2 + tt * 0.6) * 1.2), 0, 1);
            const v = clamp(v0 + wp * Math.cos(u0 * 3.0 - tt * 0.8 + Math.sin(v0 * 2.6 - tt * 0.5) * 1.2), 0, 1);
            const gx = u * (GX - 1), gy = v * (GY - 1);
            const i0 = Math.min(GX - 2, gx | 0), j0 = Math.min(GY - 2, gy | 0);
            let fx = gx - i0, fy = gy - j0;
            fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
            const a = (j0 * GX + i0) * 3, b = a + 3, c = a + GX * 3, e = c + 3, o = (y * lw + x) * 4;
            for (let ch = 0; ch < 3; ch++) {
              d[o + ch] = (grid[a + ch] * (1 - fx) + grid[b + ch] * fx) * (1 - fy) + (grid[c + ch] * (1 - fx) + grid[e + ch] * fx) * fy;
            }
            d[o + 3] = 255;
          }
        }
        lx.putImageData(lowImg, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(low, 0, 0, W, H);
        if (p.grain > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = (p.grain / 100) * 0.55;
          const pat = ctx.createPattern(noise, 'repeat');
          ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
      },
      dispose() {},
    };
  },
};
