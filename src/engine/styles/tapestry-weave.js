// src/engine/styles/tapestry-weave.js
import { still, rng, vnoise, hash2, sampleImage, clamp, smoothstep, rgb2hsl, hsl2rgb } from '../utils.js';
import { kmeans, nearest } from '../helpers.js';

export default still({
  id: 'tapestry-weave',
  name: 'Tapestry Weave',
  blurb: 'A hand-woven wall hanging: wool passes laid row on row over hidden warp threads, in a few earthy yarns, with a fringe.',
  maxSide: 1000,
  params: [
    { key: 'rows', label: 'Passes of weft', type: 'range', min: 40, max: 160, step: 1, default: 84 },
    { key: 'yarns', label: 'Colours of wool', type: 'range', min: 3, max: 12, step: 1, default: 7 },
    { key: 'warp', label: 'Visible warp', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'wobble', label: 'Hand-woven wobble', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'fringe', label: 'Fringe', type: 'toggle', default: true },
    { key: 'seed', label: 'Re-weave', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    const woven = p.fringe ? Math.round(H * 0.9) : H, rowH = woven / p.rows, nw = Math.round(W / (rowH * 0.95)), cwid = W / nw, seed = p.seed * 7 + 2;
    const img = sampleImage(env, work, nw, p.rows), d = img.data;
    const yarn = kmeans(d, p.yarns, p.seed * 3 + 1, 10, 1).map(([r, g, b]) => { const [h, s, l] = rgb2hsl(r, g, b); return hsl2rgb(h, clamp(s * 0.9), clamp(l * 0.9 + 0.03)); });
    const lab = new Uint8Array(nw * p.rows);
    for (let i = 0; i < lab.length; i++) lab[i] = nearest(yarn, d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
    const out = ctx.createImageData(W, H), o4 = out.data, wp = p.warp / 100, wb = (p.wobble / 100) * rowH * 0.28, bg = [26, 21, 17];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      if (y >= woven) { o4[o] = bg[0]; o4[o + 1] = bg[1]; o4[o + 2] = bg[2]; o4[o + 3] = 255; continue; }
      // rows are not quite straight: a slow wave in the beat of the weft
      const yy = y + (vnoise(x * 0.012, y * 0.01, seed) - 0.5) * 2 * wb, r = clamp(Math.floor(yy / rowH), 0, p.rows - 1), fy = clamp(yy / rowH - r, 0, 1);
      const xs = x + (r & 1 ? cwid * 0.5 : 0), c = clamp(Math.floor((xs % W) / cwid), 0, nw - 1), fx = ((xs % cwid) + cwid) % cwid / cwid;
      const col = yarn[lab[r * nw + c]];
      // the weft bulges over the warp: lit in the middle of the pass, dark where it dips between passes
      const bulge = Math.pow(Math.sin(Math.PI * fy), 0.55), over = (c + r) & 1 ? 1 : 0.9;
      let k = (0.34 + 0.8 * bulge) * over * (0.9 + 0.1 * Math.sin(Math.PI * fx));
      // wool is fuzzy: fine streaks along the row
      k *= 0.93 + 0.12 * vnoise(x * 0.55, yy * 0.25, seed + 3) + (hash2(x, y, 2) - 0.5) * 0.06;
      // between passes the dark warp shows
      const gap = 1 - smoothstep(0.0, 0.14, Math.min(fy, 1 - fy)), warpShow = gap * wp;
      const w = Math.sin((x / cwid) * Math.PI * 2) * 0.5 + 0.5;
      k *= 1 - warpShow * (0.35 + 0.35 * w);
      o4[o] = col[0] * k; o4[o + 1] = col[1] * k; o4[o + 2] = col[2] * k; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    if (p.fringe) {
      const r = rng(seed), top = woven, n = Math.round(W / (cwid * 0.5)), len = H - top;
      ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * (W / n), l = len * (0.78 + r() * 0.2), sway = (r() - 0.5) * cwid * 0.5;
        ctx.strokeStyle = '#d8ccb2'; ctx.lineWidth = Math.max(1.5, cwid * 0.28); ctx.beginPath(); ctx.moveTo(x, top - 2); ctx.quadraticCurveTo(x + sway * 0.4, top + l * 0.5, x + sway, top + l); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1, cwid * 0.08); ctx.beginPath(); ctx.moveTo(x - 0.5, top - 2); ctx.quadraticCurveTo(x + sway * 0.4 - 0.5, top + l * 0.5, x + sway - 0.5, top + l); ctx.stroke();
      }
    }
  },
});
