// src/engine/styles/daguerreotype.js
import { still, rng, clamp, smoothstep, lerp, vnoise, boxBlur, hash2, TAU } from '../utils.js';
import { pixels, stretchedL, fbm, rrPath } from '../helpers.js';

const TONES = {
  silver: { dark: [22, 26, 38], mid: [118, 124, 134], light: [238, 232, 216] },
  blue: { dark: [12, 20, 40], mid: [86, 106, 140], light: [214, 226, 238] },
  gold: { dark: [30, 22, 14], mid: [140, 112, 74], light: [246, 230, 190] },
};

export default still({
  id: 'daguerreotype',
  name: 'Daguerreotype',
  blurb: 'An image on a polished silver plate: tilt it and it turns from positive to negative. Tarnish creeps in from the edges, inside a brass mat.',
  maxSide: 1000,
  params: [
    { key: 'tilt', label: 'Tilt the plate', type: 'range', min: 0, max: 100, step: 1, default: 0, fmt: (v) => (v < 15 ? 'positive' : v > 85 ? 'negative' : v + '%') },
    { key: 'tone', label: 'Plate', type: 'select', default: 'silver', options: [['silver', 'Silver'], ['blue', 'Cold blue'], ['gold', 'Gilded']] },
    { key: 'frame', label: 'Mat', type: 'select', default: 'oval', options: [['oval', 'Oval brass mat'], ['rect', 'Rounded brass mat'], ['none', 'No mat']] },
    { key: 'tarnish', label: 'Tarnish', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'scratch', label: 'Scratches and dust', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'soft', label: 'Softness', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'seed', label: 'Age it again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, N = W * H, seed = p.seed * 5 + 1, r = rng(seed * 19), tn = TONES[p.tone] || TONES.silver;
    if (cache.k !== p.soft + '|' + W) { cache.Ld = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round((0.5 + (p.soft / 100) * 3) * sc))); cache.k = p.soft + '|' + W; }
    const L = cache.Ld, tilt = p.tilt / 100;
    // frame geometry
    const frame = p.frame, mx = frame === 'none' ? 0 : W * 0.1, my = frame === 'none' ? 0 : H * 0.075, wx = W - mx * 2, wy = H - my * 2, cx = W / 2, cy = H / 2;
    // the plate: tone, tarnish rings that follow the window edge, fingerprints of light
    const plate = env.makeCanvas(W, H), pctx = plate.getContext('2d'), pimg = pctx.createImageData(W, H), pd = pimg.data, tar = p.tarnish / 100;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      let v = L[i]; v = lerp(v, 1 - v, tilt * 0.92);
      v = clamp((v - 0.5) * 1.18 + 0.5);
      // distance to the window edge, 0 at the edge and 1 at the centre
      let e;
      if (frame === 'oval') { const q = Math.hypot((x - cx) / (wx / 2), (y - cy) / (wy / 2)); e = clamp(1 - q); }
      else if (frame === 'rect') e = clamp(Math.min(x - mx, W - mx - x, y - my, H - my - y) / (Math.min(wx, wy) * 0.5));
      else e = clamp(Math.min(x, W - x, y, H - y) / (Math.min(W, H) * 0.5));
      const t = v < 0.5 ? v * 2 : (v - 0.5) * 2, a = v < 0.5 ? tn.dark : tn.mid, b = v < 0.5 ? tn.mid : tn.light;
      let R = lerp(a[0], b[0], t), G = lerp(a[1], b[1], t), B = lerp(a[2], b[2], t);
      // tarnish: iridescent bands (blue, violet, amber) that grow inward from the edge, broken by noise
      if (tar > 0) {
        const n = fbm(x * 0.012 / sc, y * 0.012 / sc, seed, 4), reach = 0.04 + tar * 0.34, ring = smoothstep(reach, 0, e + (n - 0.5) * 0.22);
        if (ring > 0) {
          const ph = e * 16 + n * 5, tr = 0.5 + 0.5 * Math.sin(ph), tg = 0.5 + 0.5 * Math.sin(ph + 2.1), tb = 0.5 + 0.5 * Math.sin(ph + 4.2), k = ring * (0.55 + 0.45 * n) * tar * 0.9;
          R = lerp(R, 40 + 140 * tr, k * 0.6); G = lerp(G, 36 + 100 * tg, k * 0.55); B = lerp(B, 70 + 150 * tb, k * 0.65);
          const dk = ring * tar * 0.35; R *= 1 - dk; G *= 1 - dk; B *= 1 - dk;
        }
      }
      // faint polishing marks
      const pol = (vnoise(x * 0.02 / sc + y * 0.012 / sc, y * 0.2 / sc, seed + 8) - 0.5) * 9; R += pol; G += pol; B += pol;
      pd[o] = R; pd[o + 1] = G; pd[o + 2] = B; pd[o + 3] = 255;
    }
    pctx.putImageData(pimg, 0, 0);
    if (p.scratch > 0) {
      const k = p.scratch / 100; pctx.save();
      pctx.lineCap = 'round';
      for (let i = 0; i < Math.round(26 * k); i++) {
        pctx.strokeStyle = `rgba(${r() < 0.7 ? '240,238,230' : '10,12,20'},${0.08 + r() * 0.25})`; pctx.lineWidth = Math.max(1, sc * (0.5 + r() * 0.8));
        const x0 = r() * W, y0 = r() * H, a = r() * TAU, len = (20 + r() * 220) * sc; pctx.beginPath(); pctx.moveTo(x0, y0); pctx.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); pctx.stroke();
      }
      for (let i = 0; i < Math.round(150 * k); i++) { pctx.fillStyle = `rgba(${r() < 0.5 ? '235,235,225' : '15,15,20'},${0.2 + r() * 0.5})`; const s = (0.4 + r() * 1.8) * sc; pctx.fillRect(r() * W, r() * H, s, s); }
      pctx.restore();
    }
    if (frame === 'none') { ctx.drawImage(plate, 0, 0); return; }
    // brass mat with a bevel
    const br = ctx.createLinearGradient(0, 0, W, H);
    ['#5a3f14', '#b88f3a', '#f1dc9a', '#a07a2c', '#6d4f1a', '#d9b765', '#4e360f'].forEach((c, i, a) => br.addColorStop(i / (a.length - 1), c));
    ctx.fillStyle = br; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.18;
    for (let i = 0; i < 700; i++) { ctx.fillStyle = r() < 0.5 ? '#fff4c8' : '#2a1c05'; ctx.fillRect(r() * W, r() * H, (4 + r() * 24) * sc, Math.max(1, sc * 0.7)); }
    ctx.restore();
    const win = (grow) => {
      ctx.beginPath();
      if (frame === 'oval') ctx.ellipse(cx, cy, wx / 2 + grow, wy / 2 + grow, 0, 0, TAU);
      else rrPath(ctx, mx - grow, my - grow, wx + grow * 2, wy + grow * 2, Math.min(wx, wy) * 0.06 + grow);
    };
    // outer bevel rings
    for (const [g, c, w] of [[16 * sc, 'rgba(40,26,6,0.65)', 3 * sc], [11 * sc, 'rgba(255,240,190,0.7)', 2 * sc], [5 * sc, 'rgba(40,26,6,0.5)', 2 * sc]]) { win(g); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
    ctx.save(); win(0); ctx.clip(); ctx.drawImage(plate, mx, my, wx, wy, mx, my, wx, wy);
    // glare: a long soft band, as if the plate were catching a window
    const gl = ctx.createLinearGradient(0, 0, W, H);
    gl.addColorStop(0.18, 'rgba(255,255,255,0)'); gl.addColorStop(0.3, `rgba(255,255,255,${0.06 + 0.08 * (1 - tilt)})`); gl.addColorStop(0.42, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H); ctx.restore();
    win(0); ctx.strokeStyle = 'rgba(15,10,3,0.8)'; ctx.lineWidth = 3 * sc; ctx.stroke();
  },
});
