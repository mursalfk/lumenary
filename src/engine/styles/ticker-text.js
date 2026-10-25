// src/engine/styles/ticker-text.js
import { rng, lumOf, clamp, sampleImage } from '../utils.js';
import { stretch } from '../helpers.js';

const AMBER = [255, 176, 56], WHITE = [236, 240, 244], UP = [70, 235, 130], DOWN = [255, 86, 86];

export default {
  id: 'ticker-text',
  name: 'Ticker Text',
  kind: 'animated',
  maxSide: 760,
  thumbAt: 3,
  blurb: 'Rows of scrolling symbols and prices, like a trading floor wall. The picture is what the brightness spells out.',
  params: [
    { key: 'text', label: 'Symbols', type: 'text', default: 'LUM PIX HUE LUX RAW ISO', max: 60 },
    { key: 'rows', label: 'Rows', type: 'range', min: 10, max: 60, step: 1, default: 32 },
    { key: 'speed', label: 'Speed', type: 'range', min: 10, max: 100, step: 1, default: 45 },
    { key: 'picture', label: 'Picture strength', type: 'range', min: 0, max: 100, step: 1, default: 80 },
    { key: 'colour', label: 'Colour', type: 'select', default: 'market', options: [['market', 'Green and red'], ['amber', 'Amber LED'], ['white', 'White']] },
    { key: 'seed', label: 'New prices', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, key = '', lum = null, gw = 0, gh = 0, rowsData = [], rowH = 0, charW = 0, nch = 0;

    function build() {
      gw = Math.min(W, 220); gh = Math.max(1, Math.round((gw * H) / W));
      const d = sampleImage(env, work, gw, gh).data;
      lum = new Float32Array(gw * gh);
      for (let i = 0; i < lum.length; i++) lum[i] = lumOf(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
      lum = stretch(lum);
      rowH = H / p.rows;
      const fs = rowH * 0.8;
      charW = fs * 0.6; nch = Math.ceil(W / charW) + 3;
      const r = rng(p.seed * 53 + 11), names = (p.text || 'LUM').toUpperCase().split(/\s+/).filter(Boolean);
      rowsData = [];
      for (let y = 0; y < p.rows; y++) {
        const chars = [], dirs = [];
        let guard = 0;
        while (chars.length < nch && guard++ < 400) {
          const name = names[(r() * names.length) | 0], up = r() < 0.5;
          const tok = `${name} ${(10 + r() * 480).toFixed(2)} ${up ? '▲' : '▼'}${(r() * 4.9).toFixed(1)}%   `;
          for (const ch of tok) { chars.push(ch); dirs.push(up); }
        }
        rowsData.push({ chars, dirs, speed: 0.55 + r() * 0.9, off: r() * 600, dir: y % 2 ? 1 : -1 });
      }
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; key = ''; },
      setParams(np) { p = np; },
      draw(ctx, t) {
        const k = p.rows + '|' + p.seed + '|' + p.text + '|' + W + '|' + H;
        if (k !== key) { build(); key = k; }
        const s = p.picture / 100, rate = (p.speed / 100) * 90 + 10;
        ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, W, H);
        for (let y = 1; y < p.rows; y += 2) { ctx.fillStyle = 'rgba(255,255,255,0.022)'; ctx.fillRect(0, y * rowH, W, rowH); }
        ctx.font = `600 ${rowH * 0.8}px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const steps = 8, buckets = [];
        for (let h = 0; h < 3; h++) buckets.push(Array.from({ length: steps }, () => []));
        for (let y = 0; y < rowsData.length; y++) {
          const row = rowsData[y], cy = (y + 0.5) * rowH, gy = Math.min(gh - 1, ((cy / H) * gh) | 0);
          const total = row.chars.length * charW, off = row.dir * (t * rate * row.speed + row.off) * 1;
          for (let i = 0; i < row.chars.length; i++) {
            const ch = row.chars[i]; if (ch === ' ') continue;
            let x = (((i * charW + off) % total) + total) % total - charW;
            const gx = Math.min(gw - 1, Math.max(0, ((x / W) * gw) | 0)), B = lum[gy * gw + gx];
            const a = clamp(0.07 + s * Math.pow(B, 1.5) * 1.05 + (1 - s) * 0.55);
            const hue = p.colour === 'market' ? (row.dirs[i] ? 0 : 1) : 2;
            buckets[hue][Math.min(steps - 1, (a * steps) | 0)].push(x + charW / 2, cy, ch);
          }
        }
        const base = [UP, DOWN, p.colour === 'white' ? WHITE : AMBER];
        for (let h = 0; h < 3; h++) for (let b = 0; b < steps; b++) {
          const list = buckets[h][b]; if (!list.length) continue;
          const [r, g, bl] = base[h], a = (b + 0.6) / steps;
          ctx.fillStyle = `rgba(${r},${g},${bl},${a.toFixed(2)})`;
          if (b >= steps - 2) { ctx.shadowColor = `rgb(${r},${g},${bl})`; ctx.shadowBlur = rowH * 0.5; } else ctx.shadowBlur = 0;
          for (let i = 0; i < list.length; i += 3) ctx.fillText(list[i + 2], list[i], list[i + 1]);
        }
        ctx.shadowBlur = 0;
      },
      dispose() {},
    };
  },
};
