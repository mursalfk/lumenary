// src/engine/styles/night-sky.js
import { clamp, lerp, rng, boxBlur, sobel, fitSize, hash2, TAU } from '../utils.js';
import { fbm } from '../helpers.js';

export default {
  id: 'night-sky',
  name: 'Night Sky',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 1.2,
  blurb: 'The picture drawn in stars: its bright places fill with points of light that twinkle, its outlines are joined into constellations, and now and then a meteor crosses. The cursor brightens the sky around it.',
  params: [
    { key: 'stars', label: 'Stars', type: 'range', min: 600, max: 6000, step: 100, default: 3800 },
    { key: 'twinkle', label: 'Twinkle', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'lines', label: 'Constellations', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'haze', label: 'Glow of the picture', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'tint', label: 'Starlight', type: 'select', default: 'star', options: [['star', 'Blue white to warm'], ['picture', 'The picture’s colours']] },
    { key: 'meteors', label: 'Meteors', type: 'toggle', default: true },
    { key: 'seed', label: 'Another night', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, n = 0, sx, sy, sb, sz, ph, per, css = [], links = [], anchors = [], back = null, bctx = null, built = '', time = 0, glow = null, L = null, img = null;

    // Brightness and colour of every star, read from the picture under it, and the faint glow behind them all.
    function read() {
      img = work.getContext('2d').getImageData(0, 0, W, H).data;
      const N = W * H, raw = new Float32Array(N);
      for (let i = 0; i < N; i++) raw[i] = (0.2126 * img[i * 4] + 0.7152 * img[i * 4 + 1] + 0.0722 * img[i * 4 + 2]) / 255;
      L = boxBlur(raw, W, H, 2);
      // the picture, very dark and very soft, lies behind the stars like airglow
      const { w, h } = fitSize(W, H, 96);
      if (!back) { back = env.makeCanvas(w, h); bctx = back.getContext('2d'); }
      bctx.globalCompositeOperation = 'source-over'; bctx.filter = 'none'; bctx.imageSmoothingQuality = 'high'; bctx.drawImage(work, 0, 0, w, h);
      const bd = bctx.getImageData(0, 0, w, h), o = bd.data;
      for (let y = 0, k = 0; y < h; y++) for (let x = 0; x < w; x++, k += 4) {
        const l = (0.2126 * o[k] + 0.7152 * o[k + 1] + 0.0722 * o[k + 2]) / 255, v = y / h, milk = Math.pow(fbm(x / 22 + 3, y / 9 + (x / w) * 3, p.seed, 3), 3) * 0.9;
        o[k] = 4 + 10 * v + 46 * l + 26 * milk; o[k + 1] = 6 + 14 * v + 60 * l + 28 * milk; o[k + 2] = 16 + 26 * v + 96 * l + 40 * milk;
      }
      bctx.putImageData(bd, 0, 0);
      if (n) paint();
    }
    function paint() {
      const tint = p.tint === 'picture';
      for (let i = 0; i < n; i++) {
        const j = (clamp(sy[i] | 0, 0, H - 1) * W + clamp(sx[i] | 0, 0, W - 1)), l = L[j];
        sb[i] = Math.pow(l, 1.05) * (0.7 + 0.5 * sz[i]) + 0.03;
        if (tint) { const k = j * 4, m = 255 / Math.max(90, img[k], img[k + 1], img[k + 2]); css[i] = `rgb(${Math.min(255, img[k] * m) | 0},${Math.min(255, img[k + 1] * m) | 0},${Math.min(255, img[k + 2] * m) | 0})`; }
      }
    }
    function build() {
      const key = [p.stars, p.seed, p.tint, p.lines, W, H].join('|');
      if (key === built) return;
      back = null; read();
      const r = rng(p.seed * 43 + 5); n = p.stars;
      sx = new Float32Array(n); sy = new Float32Array(n); sb = new Float32Array(n); sz = new Float32Array(n); ph = new Float32Array(n); per = new Float32Array(n); css = new Array(n);
      for (let i = 0; i < n; i++) {
        // more stars where the picture is bright: a place is kept with a chance that grows with its brightness
        let x = 0, y = 0;
        for (let tries = 0; tries < 24; tries++) { x = r() * W; y = r() * H; if (r() < 0.07 + Math.pow(L[(y | 0) * W + (x | 0)], 1.7)) break; }
        sx[i] = x; sy[i] = y; sz[i] = Math.pow(r(), 2.4); ph[i] = r() * TAU; per[i] = 1.2 + r() * 3.6;
        // most stars are white; a few lean blue, a few lean warm
        const q = r(); css[i] = q < 0.2 ? 'rgb(190,214,255)' : q > 0.86 ? 'rgb(255,226,190)' : 'rgb(240,244,255)';
      }
      paint();
      // constellations: the strongest point of outline in each cell of a coarse grid, each joined to its nearest neighbours
      anchors = []; links = [];
      if (p.lines > 0) {
        const e = sobel(boxBlur(L, W, H, 3), W, H, 1).mag, cell = Math.round(W / lerp(6, 13, p.lines / 100));
        for (let y0 = 0; y0 < H; y0 += cell) for (let x0 = 0; x0 < W; x0 += cell) {
          let bv = 0.05, bx = -1, by = -1;
          for (let y = y0 + 2; y < Math.min(H - 2, y0 + cell); y += 3) for (let x = x0 + 2; x < Math.min(W - 2, x0 + cell); x += 3) { const v = e[y * W + x]; if (v > bv) { bv = v; bx = x; by = y; } }
          if (bx >= 0) anchors.push([bx, by]);
        }
        const seen = new Set();
        anchors.forEach((a, i) => {
          const near = anchors.map((b, j) => [(a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2, j]).filter((q) => q[1] !== i && q[0] < (cell * 1.9) ** 2).sort((u, v) => u[0] - v[0]).slice(0, 2);
          for (const [, j] of near) { const k = Math.min(i, j) + '|' + Math.max(i, j); if (!seen.has(k)) { seen.add(k); links.push([i, j]); } }
        });
      }
      const s = 48; glow = env.makeCanvas(s, s);
      const gx = glow.getContext('2d'), g = gx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.2, 'rgba(210,225,255,0.35)'); g.addColorStop(1, 'rgba(200,220,255,0)');
      gx.fillStyle = g; gx.fillRect(0, 0, s, s);
      built = key;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      // A new video frame of the same size: the stars stay in their places and take their brightness from the new frame.
      setFrame(w) { work = w; if (built) read(); },
      setParams(np) { p = np; },
      step(dt) { build(); time += dt; },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const sc = W / 720, tw = p.twinkle / 100, haze = p.haze / 100, inside = ptr && ptr.inside, px = inside ? ptr.x * W : -1e6, py = inside ? ptr.y * H : -1e6, reach = W * 0.2;
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = '#03050c'; ctx.fillRect(0, 0, W, H);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.globalAlpha = 0.25 + 0.75 * haze; ctx.drawImage(back, 0, 0, W, H); ctx.globalAlpha = 1;
        if (links.length) {
          ctx.lineWidth = Math.max(1, 1 * sc); ctx.strokeStyle = 'rgb(170,196,255)';
          for (const [i, j] of links) {
            const a = anchors[i], b = anchors[j], d = Math.hypot((a[0] + b[0]) / 2 - px, (a[1] + b[1]) / 2 - py);
            ctx.globalAlpha = 0.16 + 0.2 * (p.lines / 100) + (d < reach ? 0.5 * (1 - d / reach) : 0);
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          }
          ctx.fillStyle = 'rgb(235,242,255)';
          for (const a of anchors) { ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(a[0], a[1], 1.9 * sc, 0, TAU); ctx.fill(); }
        }
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) {
          let b = sb[i] * (1 - tw * 0.75 * (0.5 + 0.5 * Math.sin((time * TAU) / per[i] + ph[i])));
          if (inside) { const d = Math.hypot(sx[i] - px, sy[i] - py); if (d < reach) b += 0.5 * (1 - d / reach) * (0.3 + sz[i]); }
          if (b < 0.035) continue;
          const s = (0.9 + 2.3 * sz[i] * Math.min(1, b * 1.4)) * sc;
          ctx.globalAlpha = Math.min(1, b * 1.25); ctx.fillStyle = css[i];
          if (s < 1.3) ctx.fillRect(sx[i] - s / 2, sy[i] - s / 2, s, s); else { ctx.beginPath(); ctx.arc(sx[i], sy[i], s / 2, 0, TAU); ctx.fill(); }
          if (sz[i] > 0.55 && b > 0.5) { const g = s * 5; ctx.globalAlpha = Math.min(1, (b - 0.4) * 0.9); ctx.drawImage(glow, sx[i] - g, sy[i] - g, g * 2, g * 2); }
        }
        // a meteor: one every few seconds, on a path fixed by the seed, lasting about half a second
        if (p.meteors) {
          const slot = Math.floor(time / 4.2), u = (time / 4.2 - slot) * 4.2 / 0.6;
          if (u < 1 && hash2(slot, 1, p.seed) > 0.3) {
            const x0 = (0.1 + 0.7 * hash2(slot, 2, p.seed)) * W, y0 = (0.05 + 0.35 * hash2(slot, 3, p.seed)) * H, an = 0.45 + 0.4 * hash2(slot, 4, p.seed), len = W * 0.34;
            const hx = x0 + Math.cos(an) * len * u, hy = y0 + Math.sin(an) * len * u, tx = hx - Math.cos(an) * len * 0.3, ty = hy - Math.sin(an) * len * 0.3, g = ctx.createLinearGradient(tx, ty, hx, hy);
            g.addColorStop(0, 'rgba(200,220,255,0)'); g.addColorStop(1, `rgba(255,255,255,${0.9 * Math.sin(u * Math.PI)})`);
            ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.8 * sc; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      },
      dispose() {},
    };
  },
};
