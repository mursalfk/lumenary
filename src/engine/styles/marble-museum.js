// src/engine/styles/marble-museum.js
import { still, clamp, lerp, smoothstep, boxBlur, hash2, roundRect } from '../utils.js';
import { pixels, stretchedL, slopes, fbm } from '../helpers.js';

// stone body, its lighter clouding, and the colour of its veins
const STONES = {
  carrara: [[226, 224, 220], [246, 245, 242], [128, 134, 146]],
  nero: [[30, 30, 34], [52, 52, 58], [214, 204, 180]],
  rosso: [[150, 62, 52], [186, 96, 80], [238, 222, 206]],
  verde: [[38, 82, 64], [70, 122, 98], [220, 232, 214]],
};

export default still({
  id: 'marble-museum',
  name: 'Marble Museum',
  blurb: 'A relief in a gallery: the picture carved shallow into veined marble, polished, hung on a dark wall under one spotlight, with a brass plate beneath it.',
  maxSide: 1000,
  params: [
    { key: 'depth', label: 'Depth of carving', type: 'range', min: 10, max: 100, step: 1, default: 55 },
    { key: 'detail', label: 'Fine chisel work', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'veins', label: 'Veins', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'polish', label: 'Polish', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'stone', label: 'Stone', type: 'select', default: 'carrara', options: [['carrara', 'White Carrara'], ['nero', 'Black Marquina'], ['rosso', 'Red Verona'], ['verde', 'Green serpentine']] },
    { key: 'light', label: 'Spotlight from', type: 'range', min: 180, max: 360, step: 5, default: 235, fmt: (v) => v + '°' },
    { key: 'title', label: 'Brass plate', type: 'text', default: 'Untitled, marble', max: 40 },
    { key: 'wall', label: 'Gallery wall', type: 'toggle', default: true },
    { key: 'seed', label: 'Another block', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const N = W * H, sc = W / 900, seed = p.seed * 23 + 5;
    if (cache.dk !== p.detail) {
      // a relief keeps the big forms and only hints at the small ones: mostly the blurred picture, a little of the sharp one
      const Ls = stretchedL(cache), fine = boxBlur(Ls, W, H, Math.max(1, Math.round(1.5 * sc))), r = Math.max(2, Math.round(7 * sc)), broad = boxBlur(boxBlur(Ls, W, H, r), W, H, r), q = p.detail / 100, h = new Float32Array(N);
      for (let i = 0; i < N; i++) h[i] = broad[i] * (1 - 0.5 * q) + fine[i] * 0.5 * q;
      cache.h = h; cache.hb = boxBlur(h, W, H, Math.max(2, Math.round(5 * sc))); cache.dk = p.detail;
    }
    const { h, hb } = cache, { sx, sy } = slopes(h, W, H, lerp(3, 13, p.depth / 100) * sc), [body, cloud, vein] = STONES[p.stone] || STONES.carrara;
    const ang = (p.light * Math.PI) / 180, lx = Math.cos(ang) * 0.7, ly = Math.sin(ang) * 0.7, lz = Math.sqrt(1 - lx * lx - ly * ly), hl = Math.hypot(lx, ly, lz + 1), hx = lx / hl, hy = ly / hl, hz = (lz + 1) / hl;
    const veins = p.veins / 100, polish = p.polish / 100, rel = env.makeCanvas(W, H), rx = rel.getContext('2d'), img = rx.createImageData(W, H), o = img.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      // the stone: soft clouding, then veins where a warped noise crosses its middle value
      const u = x / (230 * sc), v = y / (230 * sc), wx = fbm(u * 0.9 + 3, v * 0.9, seed, 3) - 0.5, wy = fbm(u * 0.9, v * 0.9 + 7, seed + 2, 3) - 0.5;
      const m = fbm(u * 1.6 + wx, v * 1.6 + wy, seed + 4, 4), big = 1 - Math.abs(2 * fbm(u + wx * 2.6, v * 0.7 + wy * 2.6, seed + 6, 4) - 1), small = 1 - Math.abs(2 * fbm(u * 3.1 - wy * 2, v * 2.4 + wx * 2, seed + 8, 3) - 1);
      const vv = clamp(Math.pow(big, 9) * 1.1 + Math.pow(small, 12) * 0.5) * veins;
      let r = lerp(body[0], cloud[0], m), g = lerp(body[1], cloud[1], m), b = lerp(body[2], cloud[2], m);
      r += (vein[0] - r) * vv * 0.75; g += (vein[1] - g) * vv * 0.75; b += (vein[2] - b) * vv * 0.75;
      const nx = sx[i], ny = sy[i], nl = 1 / Math.sqrt(nx * nx + ny * ny + 1), diff = (nx * lx + ny * ly + lz) * nl, nh = clamp((nx * hx + ny * hy + hz) * nl);
      // light soaks a little way into marble, so the shading is gentler than on plaster; hollows collect shade
      const hollow = clamp((hb[i] - h[i]) * 3.2, 0, 0.5), lit = clamp(0.36 + 0.84 * diff, 0.2, 1.3) * (1 - hollow), spec = Math.pow(nh, 60) * polish * 0.75 + Math.pow(nh, 9) * polish * 0.1;
      const grainy = 1 + (hash2(x, y, seed) - 0.5) * 0.03;
      o[k] = r * lit * grainy + 255 * spec; o[k + 1] = g * lit * grainy + 255 * spec; o[k + 2] = b * lit * grainy + 250 * spec; o[k + 3] = 255;
    }
    rx.putImageData(img, 0, 0);
    if (!p.wall) { ctx.drawImage(rel, 0, 0); return; }
    // the wall, with the pool of light the spot throws on it
    ctx.fillStyle = '#17161a'; ctx.fillRect(0, 0, W, H);
    const pool = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.36, Math.max(W, H) * 0.75);
    pool.addColorStop(0, 'rgba(120,108,96,0.75)'); pool.addColorStop(0.5, 'rgba(56,50,48,0.5)'); pool.addColorStop(1, 'rgba(10,10,12,0)');
    ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
    const sw = W * 0.8, sh = H * 0.74, x0 = (W - sw) / 2, y0 = H * 0.065, e = Math.max(3, 7 * sc);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 34 * sc; ctx.shadowOffsetX = -lx * 22 * sc; ctx.shadowOffsetY = 16 * sc;
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(rel, x0, y0, sw, sh); ctx.restore();
    // the cut edges of the slab: lit on the side facing the spot, dark on the other
    const lite = 'rgba(255,255,255,0.4)', dim = 'rgba(0,0,0,0.38)';
    ctx.fillStyle = ly < 0 ? lite : dim; ctx.fillRect(x0, y0, sw, e); ctx.fillStyle = ly < 0 ? dim : lite; ctx.fillRect(x0, y0 + sh - e, sw, e);
    ctx.fillStyle = lx < 0 ? lite : dim; ctx.fillRect(x0, y0, e, sh); ctx.fillStyle = lx < 0 ? dim : lite; ctx.fillRect(x0 + sw - e, y0, e, sh);
    const title = (p.title || '').trim();
    if (title) {
      let px = Math.max(10, 15 * sc);
      ctx.font = `600 ${px}px "Bodoni Moda", Georgia, serif`;
      const pw = Math.min(W * 0.7, ctx.measureText(title).width + 46 * sc), ph = px * 2.5, px0 = (W - pw) / 2, py0 = y0 + sh + (H - y0 - sh - ph) / 2;
      const brass = ctx.createLinearGradient(0, py0, 0, py0 + ph); brass.addColorStop(0, '#d8bd72'); brass.addColorStop(0.45, '#a8873c'); brass.addColorStop(1, '#7a5f24');
      ctx.fillStyle = brass; roundRect(ctx, px0, py0, pw, ph, 2 * sc); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(px0, py0, pw, Math.max(1, sc));
      ctx.fillStyle = '#2a2008'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      while (ctx.measureText(title).width > pw - 20 * sc && px > 7) { px -= 1; ctx.font = `600 ${px}px "Bodoni Moda", Georgia, serif`; }
      ctx.fillText(title, W / 2, py0 + ph / 2 + px * 0.06);
    }
  },
});
