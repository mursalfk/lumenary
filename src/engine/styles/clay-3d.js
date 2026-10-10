import { still, clamp, lumArray, blur2, vnoise, hexToRgb, rgb2hsl, hsl2rgb, lerp } from '../utils.js';

export default still({
  id: 'clay-3d',
  number: 9,
  name: 'Clay 3D',
  blurb: 'Soft, hand-pressed relief lit from one side.',
  maxSide: 1000,
  params: [
    { key: 'depth', label: 'Depth', type: 'range', min: 5, max: 100, step: 1, default: 38 },
    { key: 'soft', label: 'Softness', type: 'range', min: 1, max: 30, step: 1, default: 14 },
    { key: 'angle', label: 'Light direction', type: 'range', min: 0, max: 360, step: 1, default: 135, fmt: (v) => v + '°' },
    { key: 'texture', label: 'Fingerprints', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'mode', label: 'Coloring', type: 'select', default: 'source', options: [['source', 'Soft source colors'], ['single', 'Single clay']] },
    { key: 'clay', label: 'Clay color', type: 'color', default: '#d9d2c5' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    if (cache.key !== 'src') {
      cache.data = work.getContext('2d').getImageData(0, 0, W, H);
      cache.L = lumArray(cache.data); cache.key = 'src';
    }
    const rb = Math.max(1, Math.round((p.soft * W) / 400));
    if (cache.rb !== rb) { cache.Lb = blur2(cache.L, W, H, rb); cache.rb = rb; }
    const Lb = cache.Lb, src = cache.data.data;
    const k = (p.depth * W) / 55;
    const a = (p.angle * Math.PI) / 180;
    let lx = Math.cos(a), ly = -Math.sin(a), lz = 0.7;
    const ln = Math.hypot(lx, ly, lz); lx /= ln; ly /= ln; lz /= ln;
    const hx = lx, hy = ly, hz = lz + 1, hn = Math.hypot(hx, hy, hz);
    const clay = hexToRgb(p.clay), tex = p.texture / 100, f1 = 60 / W, f2 = 5 / W * 20;

    const img = ctx.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) {
      const ym = Math.max(0, y - 1) * W, yp = Math.min(H - 1, y + 1) * W, yc = y * W;
      for (let x = 0; x < W; x++) {
        const xm = Math.max(0, x - 1), xp = Math.min(W - 1, x + 1);
        let nx = -(Lb[yc + xp] - Lb[yc + xm]) * 0.5 * k;
        let ny = -(Lb[yp + x] - Lb[ym + x]) * 0.5 * k;
        if (tex > 0) {
          nx += (vnoise(x * f1, y * f1, 3) - 0.5) * tex * 0.5 + (vnoise(x * f2, y * f2, 9) - 0.5) * tex * 0.18;
          ny += (vnoise(x * f1, y * f1, 5) - 0.5) * tex * 0.5 + (vnoise(x * f2, y * f2, 11) - 0.5) * tex * 0.18;
        }
        const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1);
        nx *= nl; ny *= nl; const nz = nl;
        const diff = Math.max(0, nx * lx + ny * ly + nz * lz);
        const spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hn), 28) * 0.22;
        const i = yc + x, o = i * 4;
        const ao = 0.82 + 0.18 * Lb[i];
        const shade = (0.3 + 0.78 * diff) * ao;
        let r, g, b;
        if (p.mode === 'single') { r = clay[0]; g = clay[1]; b = clay[2]; }
        else {
          const [h, s, l] = rgb2hsl(src[o], src[o + 1], src[o + 2]);
          [r, g, b] = hsl2rgb(h, clamp(s * 0.62), lerp(l, 0.62, 0.45));
        }
        d[o] = r * shade + spec * 255; d[o + 1] = g * shade + spec * 255; d[o + 2] = b * shade + spec * 255; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  },
});
