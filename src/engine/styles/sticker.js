// src/engine/styles/sticker.js
import { still, clamp, lerp, smoothstep, blur2, rgb2hsl, hsl2rgb, hash2, TAU } from '../utils.js';
import { pixels } from '../helpers.js';
import { flatten, darkLines, shapeLines } from '../toon.js';

const BACKS = { pink: ['#ffc2d6', '#ff9fbe'], mint: ['#bff0dc', '#93e0c4'], yellow: ['#ffe58a', '#ffd451'], sky: ['#bfe3ff', '#93ccff'], slate: ['#3a4150', '#2a303c'], desk: ['#e9e4da', '#d8d1c3'] };

// 1 inside the largest connected patch of `m`, with any holes in it filled.
function biggest(m, W, H) {
  const N = W * H, lab = new Int32Array(N), stack = new Int32Array(N);
  let best = 0, bestN = 0, next = 0;
  for (let s = 0; s < N; s++) {
    if (!m[s] || lab[s]) continue;
    let top = 0, n = 0; next++; stack[top++] = s; lab[s] = next;
    while (top) {
      const i = stack[--top], x = i % W; n++;
      if (x > 0 && m[i - 1] && !lab[i - 1]) { lab[i - 1] = next; stack[top++] = i - 1; }
      if (x < W - 1 && m[i + 1] && !lab[i + 1]) { lab[i + 1] = next; stack[top++] = i + 1; }
      if (i >= W && m[i - W] && !lab[i - W]) { lab[i - W] = next; stack[top++] = i - W; }
      if (i < N - W && m[i + W] && !lab[i + W]) { lab[i + W] = next; stack[top++] = i + W; }
    }
    if (n > bestN) { bestN = n; best = next; }
  }
  // flood the outside from the border; whatever the flood cannot reach is the shape or a hole in it
  const outside = new Uint8Array(N); let top = 0;
  const push = (i) => { if (lab[i] !== best && !outside[i]) { outside[i] = 1; stack[top++] = i; } };
  for (let x = 0; x < W; x++) { push(x); push(N - W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (top) {
    const i = stack[--top], x = i % W;
    if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (i >= W) push(i - W); if (i < N - W) push(i + W);
  }
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) out[i] = outside[i] ? 0 : 1;
  return { mask: out, share: bestN / N };
}

export default still({
  id: 'sticker',
  name: 'Sticker',
  blurb: 'A die-cut vinyl sticker: the subject in flat cartoon colour, cut out with a thick white border, a soft shadow, a sweep of gloss and one corner starting to peel.',
  maxSide: 1000,
  params: [
    { key: 'shape', label: 'Cut', type: 'select', default: 'auto', options: [['auto', 'Around the subject'], ['circle', 'Circle'], ['square', 'Rounded square'], ['badge', 'Scalloped badge']] },
    { key: 'cut', label: 'How much is subject', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'border', label: 'White border', type: 'range', min: 10, max: 100, step: 1, default: 55 },
    { key: 'colours', label: 'Colours', type: 'range', min: 5, max: 16, step: 1, default: 10 },
    { key: 'lines', label: 'Ink lines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'gloss', label: 'Gloss', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'peel', label: 'Peeling corner', type: 'toggle', default: true },
    { key: 'back', label: 'Behind it', type: 'select', default: 'mint', options: [['mint', 'Mint'], ['pink', 'Pink'], ['yellow', 'Yellow'], ['sky', 'Sky'], ['desk', 'Pale desk'], ['slate', 'Slate']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 900, M = Math.min(W, H);
    if (cache.fk !== p.colours) {
      cache.flat = flatten(d, W, H, p.colours, 5 * sc, 2 * sc, 4, cache);
      const ch = cache.flat.ch, T = new Float32Array(N);
      for (let i = 0; i < N; i++) T[i] = (0.2126 * ch[0][i] + 0.7152 * ch[1][i] + 0.0722 * ch[2][i]) / 255;
      cache.dog = darkLines(T, W, H, 0, Math.round(2.6 * sc));
      cache.rim = shapeLines(cache.flat.idx, cache.flat.pal, W, H);
      // How unlike the edge of the frame each pixel is, plus a little for being near the middle: a rough guess at
      // "subject". The frame's colour is taken as the average of a band round the border.
      const band = Math.max(2, Math.round(M * 0.04)), bg = [0, 0, 0]; let n = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < band || y < band || x >= W - band || y >= H - band) { const i = y * W + x; bg[0] += ch[0][i]; bg[1] += ch[1][i]; bg[2] += ch[2][i]; n++; }
      bg[0] /= n; bg[1] /= n; bg[2] /= n;
      const score = new Float32Array(N);
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
        const dist = (Math.abs(ch[0][i] - bg[0]) + Math.abs(ch[1][i] - bg[1]) + Math.abs(ch[2][i] - bg[2])) / 300, u = (x / W - 0.5) * 2, v = (y / H - 0.5) * 2;
        score[i] = clamp(dist) * 0.8 + (1 - clamp(u * u + v * v)) * 0.2;
      }
      cache.score = blur2(score, W, H, Math.max(2, Math.round(7 * sc)));
      cache.fk = p.colours;
    }
    const mk = p.shape + '|' + p.cut;
    if (cache.mk !== mk) {
      let m = new Float32Array(N);
      const cx = W / 2, cy = H / 2, R = M * 0.43;
      if (p.shape === 'auto') {
        const thr = lerp(0.52, 0.16, p.cut / 100), raw = new Uint8Array(N);
        for (let i = 0; i < N; i++) raw[i] = cache.score[i] > thr ? 1 : 0;
        const big = biggest(raw, W, H);
        // a cut that takes almost nothing, or almost everything, is not a sticker: fall back to a rounded square
        m = big.share > 0.05 && big.share < 0.9 ? big.mask : null;
      }
      if (!m || p.shape !== 'auto') {
        m = new Float32Array(N);
        const kind = p.shape === 'auto' ? 'square' : p.shape, half = M * 0.4, rad = M * 0.09;
        for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
          const dx = x - cx, dy = y - cy;
          if (kind === 'circle') m[i] = dx * dx + dy * dy < R * R ? 1 : 0;
          else if (kind === 'badge') { const r = R * (0.93 + 0.055 * Math.cos(Math.atan2(dy, dx) * 14)); m[i] = dx * dx + dy * dy < r * r ? 1 : 0; }
          else { const qx = Math.max(0, Math.abs(dx) - (half - rad)), qy = Math.max(0, Math.abs(dy) - (half - rad)); m[i] = qx * qx + qy * qy < rad * rad ? 1 : 0; }
        }
      }
      cache.m = m; cache.mk = mk; cache.bk = '';
    }
    const bk = mk + '|' + p.border;
    if (cache.bk !== bk) {
      // The sheet the sticker is built on is larger than the picture by a margin all round, so that the border has
      // room even where the subject runs off the edge of the frame.
      const br = Math.max(3, Math.round(lerp(8, 30, p.border / 100) * sc)), P = br * 2 + Math.round(10 * sc), PW = W + 2 * P, PH = H + 2 * P, mp = new Float32Array(PW * PH);
      for (let y = 0; y < H; y++) mp.set(cache.m.subarray(y * W, y * W + W), (y + P) * PW + P);
      const soft = blur2(mp, PW, PH, Math.max(2, Math.round(4 * sc)));
      // The border is the shape grown outward. Blurring the shape and taking a low level of the blur does that, and
      // rounds every notch on the way, which is how a cutting plotter treats a sticker too.
      cache.sheet = { P, PW, PH, soft, wide: blur2(soft, PW, PH, br) };
      cache.bk = bk;
    }
    const { idx, pal } = cache.flat, { dog, rim } = cache, { P, PW, PH, soft, wide } = cache.sheet, lines = p.lines / 100, lo = lerp(0.05, 0.014, lines);
    const paint = pal.map((c) => { const [h, s, l] = rgb2hsl(c[0], c[1], c[2]); return hsl2rgb(h, clamp(s * 1.45 + 0.05), clamp((l - 0.5) * 1.12 + 0.53)); });
    // the sticker on its own transparent sheet: white border, artwork, keyline
    const st = env.makeCanvas(PW, PH), sx = st.getContext('2d'), img = sx.createImageData(PW, PH), o = img.data;
    for (let y = 0, j = 0, k = 0; y < PH; y++) for (let x = 0; x < PW; x++, j++, k += 4) {
      const cover = smoothstep(0.035, 0.075, wide[j]);
      if (cover <= 0) continue;
      const ix = x - P, iy = y - P, on = ix >= 0 && iy >= 0 && ix < W && iy < H, inside = on ? smoothstep(0.42, 0.58, soft[j]) : 0;
      let r = 252, g = 251, b = 247;
      if (inside > 0) {
        const i = iy * W + ix, c = paint[idx[i]];
        r = c[0]; g = c[1]; b = c[2];
        if (lines > 0) { const a = Math.max(smoothstep(lo, lo * 2.2, dog[i]), rim[i] * (0.4 + 0.6 * lines)) * (0.65 + 0.35 * lines); r += (30 - r) * a; g += (26 - g) * a; b += (40 - b) * a; }
      }
      // a dark keyline where the artwork meets the border
      const key = smoothstep(0.42, 0.5, soft[j]) * (1 - smoothstep(0.62, 0.74, soft[j])) * 0.9;
      r += (30 - r) * key; g += (26 - g) * key; b += (40 - b) * key;
      // vinyl is not quite paper white, and its cut edge is a shade darker
      const edge = 1 - 0.07 * (1 - smoothstep(0.075, 0.2, wide[j]));
      o[k] = lerp(252 * edge, r, inside); o[k + 1] = lerp(251 * edge, g, inside); o[k + 2] = lerp(247 * edge, b, inside); o[k + 3] = cover * 255;
    }
    sx.putImageData(img, 0, 0);
    // gloss: a slanted band of light, kept to the sticker with source-atop
    if (p.gloss > 0) {
      const g = sx.createLinearGradient(PW * 0.1, 0, PW * 0.75, PH * 0.85), a = (p.gloss / 100) * 0.5;
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(0.38, `rgba(255,255,255,${a})`); g.addColorStop(0.47, `rgba(255,255,255,${a * 0.25})`);
      g.addColorStop(0.52, `rgba(255,255,255,${a * 0.7})`); g.addColorStop(0.56, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      sx.globalCompositeOperation = 'source-atop'; sx.fillStyle = g; sx.fillRect(0, 0, PW, PH); sx.globalCompositeOperation = 'source-over';
    }
    // the peel: everything beyond a slanted line is folded back over it, showing the grey underside
    let flap = null, cline = 0;
    if (p.peel) {
      let far = 0;
      for (let y = 0; y < PH; y += 3) for (let x = 0; x < PW; x += 3) if (wide[y * PW + x] > 0.06 && x + y > far) far = x + y;
      cline = far - M * 0.17;
      flap = env.makeCanvas(PW, PH);
      const fx = flap.getContext('2d');
      fx.save(); fx.beginPath(); fx.moveTo(cline, 0); fx.lineTo(PW + PH, 0); fx.lineTo(PW + PH, PW + PH); fx.lineTo(cline - PH, PH); fx.closePath(); fx.clip(); fx.drawImage(st, 0, 0); fx.restore();
      fx.globalCompositeOperation = 'source-in';
      const g = fx.createLinearGradient(cline / 2, cline / 2, cline / 2 + M * 0.12, cline / 2 + M * 0.12);
      g.addColorStop(0, '#f6f6f8'); g.addColorStop(0.5, '#d9d9e0'); g.addColorStop(1, '#bfbfca');
      fx.fillStyle = g; fx.fillRect(0, 0, PW, PH);
      sx.save(); sx.globalCompositeOperation = 'destination-out'; sx.beginPath(); sx.moveTo(cline, 0); sx.lineTo(PW + PH, 0); sx.lineTo(PW + PH, PW + PH); sx.lineTo(cline - PH, PH); sx.closePath(); sx.fill(); sx.restore();
    }
    // the surface it sits on
    const [b0, b1] = BACKS[p.back] || BACKS.mint, bgG = ctx.createLinearGradient(0, 0, 0, H);
    bgG.addColorStop(0, b0); bgG.addColorStop(1, b1);
    ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = p.back === 'slate' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.28)';
    const gapD = 46 * sc;
    for (let y = gapD / 2, row = 0; y < H; y += gapD, row++) for (let x = (row % 2 ? gapD : gapD / 2); x < W; x += gapD) { ctx.beginPath(); ctx.arc(x, y, 3.2 * sc, 0, TAU); ctx.fill(); }
    const s = Math.min(W / PW, H / PH) * 0.97, ox = (W - PW * s) / 2, oy = (H - PH * s) / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(20,20,40,0.34)'; ctx.shadowBlur = 20 * sc; ctx.shadowOffsetX = 5 * sc; ctx.shadowOffsetY = 11 * sc;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(st, ox, oy, PW * s, PH * s);
    if (flap) {
      // mirror in the fold line x + y = cline: (x, y) goes to (cline - y, cline - x)
      ctx.shadowColor = 'rgba(20,20,40,0.42)'; ctx.shadowBlur = 14 * sc; ctx.shadowOffsetX = -4 * sc; ctx.shadowOffsetY = -3 * sc;
      ctx.translate(ox, oy); ctx.scale(s, s); ctx.transform(0, -1, -1, 0, cline, cline);
      ctx.drawImage(flap, 0, 0);
    }
    ctx.restore();
    // a little paper tooth over everything
    const fin = ctx.getImageData(0, 0, W, H), f = fin.data;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) { const n = (hash2(x, y, 3) - 0.5) * 7; f[k] += n; f[k + 1] += n; f[k + 2] += n; }
    ctx.putImageData(fin, 0, 0);
  },
});
