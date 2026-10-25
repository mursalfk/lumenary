// src/engine/styles/aboriginal-dot-painting.js
import { still, hexToRgb, clamp, boxBlur, hash2, rng } from '../utils.js';
import { pixels, sampler, stretchedL, marching, chainSegments, fbm, nearest } from '../helpers.js';
import { css, vivid } from '../culture.js';

// Ground colours and the dot colours, dark to light: deep red, red ochre, orange, yellow, sand, cream.
const GROUNDS = { black: [18, 14, 12], red: [92, 28, 18], night: [14, 20, 44] };
const DOTS = ['#8e2b1d', '#c3452b', '#e08a2c', '#f0c24a', '#d9b36a', '#f3ead8'].map(hexToRgb);
const BANDS = ['#f3ead8', '#e08a2c', '#c3452b', '#f0c24a', '#d9b36a', '#8e2b1d', '#f3ead8', '#3f7f8f'].map(hexToRgb);

export default still({
  id: 'aboriginal-dot-painting',
  name: 'Aboriginal Dot Painting',
  blurb: 'In the style of the Western Desert painters: the picture is laid down as rings of small dots following its contours, in the ochres of the country, on dark ground.',
  maxSide: 1100,
  params: [
    { key: 'dot', label: 'Dot size', type: 'range', min: 3, max: 10, step: 0.5, default: 5 },
    { key: 'rings', label: 'Rings', type: 'range', min: 5, max: 18, step: 1, default: 11 },
    { key: 'fill', label: 'Ground dots', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'colour', label: 'Colours', type: 'select', default: 'level', options: [['level', 'By light'], ['bands', 'Bands'], ['picture', 'Colours of the picture']] },
    { key: 'ground', label: 'Ground', type: 'select', default: 'black', options: [['black', 'Black'], ['red', 'Red earth'], ['night', 'Night blue']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, R = p.dot * sc, sp = R * 2.3, g = GROUNDS[p.ground], smp = sampler(cache, d, W, H, 3 * sc), tmp = [0, 0, 0];
    ctx.fillStyle = css(g); ctx.fillRect(0, 0, W, H);
    // faint canvas weave
    ctx.globalAlpha = 0.05; ctx.fillStyle = '#fff';
    for (let y = 0; y < H; y += 3 * sc) ctx.fillRect(0, y, W, 1);
    ctx.globalAlpha = 1;
    const F = boxBlur(boxBlur(stretchedL(cache), W, H, Math.max(2, Math.round(4 * sc))), W, H, Math.max(2, Math.round(4 * sc)));
    const r = rng(11), dotAt = (x, y, rad, col, lift) => {
      ctx.fillStyle = css(col); ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
      ctx.fillStyle = `rgba(255,245,225,${lift})`; ctx.beginPath(); ctx.arc(x - rad * 0.3, y - rad * 0.32, rad * 0.5, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.arc(x + rad * 0.45, y + rad * 0.5, rad * 0.4, 0, 6.2832); ctx.fill();
    };
    const colourAt = (x, y, level, ring) => {
      if (p.colour === 'bands') return BANDS[ring % BANDS.length];
      if (p.colour === 'picture') { const c = smp.rgb(clamp(x, 0, W - 1), clamp(y, 0, H - 1)); vivid(c, 1.5, 0.05, tmp); return DOTS[nearest(DOTS, tmp[0], tmp[1], tmp[2])]; }
      return DOTS[Math.min(DOTS.length - 1, Math.floor(level * DOTS.length))];
    };
    // small dots on the open ground
    if (p.fill > 0) {
      const f = p.fill / 100, s2 = sp * 0.95;
      for (let y = s2 / 2, row = 0; y < H; y += s2 * 0.87, row++) for (let x = (row % 2) * s2 / 2; x < W; x += s2) {
        const t = smp.tone(clamp(x, 0, W - 1), clamp(y, 0, H - 1)), rad = R * (0.16 + 0.3 * t) * (0.4 + f);
        if (rad < 0.7) continue;
        const c = colourAt(x, y, t, row);
        ctx.fillStyle = css(c, 0.55 + 0.3 * f); ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
      }
    }
    const n = p.rings, step = Math.max(2, Math.round(3 * sc));
    for (let li = 0; li < n; li++) {
      const level = 0.07 + (0.86 * (li + 0.5)) / n, lines = chainSegments(marching(F, W, H, level, step));
      for (const line of lines) {
        if (line.length < 4) continue;
        let carry = 0;
        for (let j = 1; j < line.length; j++) {
          const ax = line[j - 1][0], ay = line[j - 1][1], bx = line[j][0], by = line[j][1], len = Math.hypot(bx - ax, by - ay);
          if (len < 1e-6) continue;
          let pos = carry;
          while (pos < len) {
            const t = pos / len, x = ax + (bx - ax) * t + (r() - 0.5) * R * 0.18, y = ay + (by - ay) * t + (r() - 0.5) * R * 0.18, rad = R * (0.9 + 0.2 * r());
            dotAt(x, y, rad, colourAt(x, y, level, li), 0.22);
            pos += sp;
          }
          carry = pos - len;
        }
      }
    }
  },
});
