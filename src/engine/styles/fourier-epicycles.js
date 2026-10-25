// src/engine/styles/fourier-epicycles.js
import { clamp, lerp, boxBlur, TAU } from '../utils.js';
import { marching, chainSegments } from '../helpers.js';

export default {
  id: 'fourier-epicycles',
  name: 'Fourier Epicycles',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 7,
  blurb: 'A chain of turning circles, each riding on the rim of the last, traces one outline of your picture. More circles bring more of the detail.',
  params: [
    { key: 'terms', label: 'Circles', type: 'range', min: 3, max: 240, step: 1, default: 60 },
    { key: 'level', label: 'Which outline', type: 'range', min: 5, max: 95, step: 1, default: 50, fmt: (v) => v + '% brightness' },
    { key: 'period', label: 'Seconds per drawing', type: 'range', min: 6, max: 40, step: 1, default: 14 },
    { key: 'trail', label: 'Length of the trail', type: 'range', min: 10, max: 100, step: 1, default: 70, fmt: (v) => v + '%' },
    { key: 'rings', label: 'Show the circles', type: 'toggle', default: true },
    { key: 'colour', label: 'Pen colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['gold', 'Gold'], ['white', 'White']] },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, built = '', terms = [], tips = null, outline = null, time = 0, img = null;
    const M = 1024;

    function build() {
      const key = [p.level, p.terms, W].join('|');
      if (key === built) return;
      const src = work.getContext('2d').getImageData(0, 0, W, H).data; img = src;
      const g = env.makeCanvas(Math.round(W / 2), Math.round(H / 2)), gx = g.getContext('2d'); gx.imageSmoothingQuality = 'high'; gx.drawImage(work, 0, 0, g.width, g.height);
      const gd = gx.getImageData(0, 0, g.width, g.height).data, gw = g.width, gh = g.height, L = new Float32Array(gw * gh);
      let lo = 1, hi = 0; for (let i = 0; i < L.length; i++) { const l = (0.2126 * gd[i * 4] + 0.7152 * gd[i * 4 + 1] + 0.0722 * gd[i * 4 + 2]) / 255; L[i] = l; if (l < lo) lo = l; if (l > hi) hi = l; }
      const B = boxBlur(boxBlur(L, gw, gh, 2), gw, gh, 2), level = lo + (hi - lo) * (p.level / 100);
      const chains = chainSegments(marching(B, gw, gh, level, 1)); let best = null, bs = -1;
      let bestClosed = null, bcs = -1;
      for (const c of chains) { const closed = Math.hypot(c[0][0] - c[c.length - 1][0], c[0][1] - c[c.length - 1][1]) < 1.5; if (c.length > bs) { bs = c.length; best = c; } if (closed && c.length > bcs) { bcs = c.length; bestClosed = c; } }
      if (bestClosed && bcs >= bs * 0.85) best = bestClosed;
      else if (best && Math.hypot(best[0][0] - best[best.length - 1][0], best[0][1] - best[best.length - 1][1]) >= 1.5) best = best.concat(best.slice(0, -1).reverse());
      if (!best || best.length < 8) { best = []; for (let i = 0; i < 64; i++) { const a = (i / 64) * TAU; best.push([gw / 2 + Math.cos(a) * gw * 0.3, gh / 2 + Math.sin(a) * gh * 0.3]); } }
      // resample at equal arc length
      const pts = best.map(([x, y]) => [x * 2, y * 2]); pts.push(pts[0]);
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const total = cum[cum.length - 1], zr = new Float32Array(M), zi = new Float32Array(M); let seg = 0;
      for (let m = 0; m < M; m++) { const s = (m / M) * total; while (seg < cum.length - 2 && cum[seg + 1] < s) seg++; const f = (s - cum[seg]) / (cum[seg + 1] - cum[seg] || 1); zr[m] = lerp(pts[seg][0], pts[seg + 1][0], f) - W / 2; zi[m] = lerp(pts[seg][1], pts[seg + 1][1], f) - H / 2; }
      outline = { zr, zi };
      const all = [];
      for (let k = -M / 2; k < M / 2; k++) {
        let re = 0, im = 0;
        for (let m = 0; m < M; m++) { const a = (-TAU * k * m) / M, c = Math.cos(a), s = Math.sin(a); re += zr[m] * c - zi[m] * s; im += zr[m] * s + zi[m] * c; }
        all.push({ k, re: re / M, im: im / M, amp: Math.hypot(re, im) / M });
      }
      all.sort((a, b) => b.amp - a.amp);
      terms = all.slice(0, p.terms);
      const Mp = 1400; tips = new Float32Array(Mp * 2);
      for (let m = 0; m < Mp; m++) {
        const t = m / Mp; let x = 0, y = 0;
        for (const c of terms) { const a = TAU * c.k * t, cs = Math.cos(a), sn = Math.sin(a); x += c.re * cs - c.im * sn; y += c.re * sn + c.im * cs; }
        tips[m * 2] = x + W / 2; tips[m * 2 + 1] = y + H / 2;
      }
      built = key;
    }

    const colourAt = (x, y) => { const xi = clamp(x | 0, 0, W - 1), yi = clamp(y | 0, 0, H - 1), i = (yi * W + xi) * 4; return [img[i], img[i + 1], img[i + 2]]; };

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt) { time += dt; },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        build();
        if (dt > 0) this.step(dt, ptr);
        const sc = W / 720, phase = (time / p.period) % 1, Mp = tips.length / 2, head = phase * Mp;
        ctx.fillStyle = '#0a0a10'; ctx.fillRect(0, 0, W, H);
        // faint outline being copied
        ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1 * sc; ctx.beginPath();
        for (let m = 0; m < outline.zr.length; m += 4) { const x = outline.zr[m] + W / 2, y = outline.zi[m] + H / 2; if (m) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.closePath(); ctx.stroke();
        // epicycles
        if (p.rings) {
          let x = W / 2, y = H / 2; const tt = phase;
          for (const c of terms) {
            const a = TAU * c.k * tt, cs = Math.cos(a), sn = Math.sin(a), dx = c.re * cs - c.im * sn, dy = c.re * sn + c.im * cs, r = Math.hypot(c.re, c.im);
            if (r > 0.8 * sc) { ctx.strokeStyle = 'rgba(190,200,255,0.16)'; ctx.lineWidth = 1 * sc; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke(); }
            x += dx; y += dy;
          }
        }
        // the path drawn so far
        const len = Math.max(8, Math.round(Mp * (p.trail / 100))); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let j = 0; j < len; j++) {
          const m0 = Math.floor(head - j - 1 + Mp * 4) % Mp, m1 = Math.floor(head - j + Mp * 4) % Mp, age = j / len, x0 = tips[m0 * 2], y0 = tips[m0 * 2 + 1], x1 = tips[m1 * 2], y1 = tips[m1 * 2 + 1];
          if (Math.hypot(x1 - x0, y1 - y0) > W * 0.4) continue;
          let col; if (p.colour === 'picture') { const c = colourAt(x1, y1); col = [Math.min(255, c[0] * 1.2 + 60), Math.min(255, c[1] * 1.2 + 60), Math.min(255, c[2] * 1.2 + 60)]; } else if (p.colour === 'gold') col = [250, 206, 110]; else col = [248, 248, 244];
          ctx.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${(1 - age) * 0.95})`; ctx.lineWidth = (1.2 + 2.2 * (1 - age)) * sc;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tips[Math.floor(head) % Mp * 2], tips[Math.floor(head) % Mp * 2 + 1], 3 * sc, 0, TAU); ctx.fill();
      },
      dispose() {},
    };
  },
};
