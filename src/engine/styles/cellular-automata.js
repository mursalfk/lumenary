// src/engine/styles/cellular-automata.js
import { clamp, lerp, rng } from '../utils.js';

// Birth and survival counts for each rule: a cell is born with these neighbour counts and survives with these.
const RULES = {
  life: [[3], [2, 3], 'Conway’s Life'], high: [[3, 6], [2, 3], 'HighLife'], dn: [[3, 6, 7, 8], [3, 4, 6, 7, 8], 'Day and Night'],
  coral: [[3], [4, 5, 6, 7, 8], 'Coral'], maze: [[3], [1, 2, 3, 4, 5], 'Maze'],
};

export default {
  id: 'cellular-automata',
  name: 'Cellular Automata',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 3.2,
  blurb: 'Every cell looks at its eight neighbours and lives, dies or is born. The picture sets where life starts thickest, and the cursor plants new cells.',
  params: [
    { key: 'rule', label: 'Rule', type: 'select', default: 'life', options: Object.entries(RULES).map(([k, v]) => [k, v[2]]) },
    { key: 'cell', label: 'Cell size', type: 'range', min: 3, max: 12, step: 1, default: 5 },
    { key: 'speed', label: 'Generations per second', type: 'range', min: 2, max: 40, step: 1, default: 14 },
    { key: 'start', label: 'How crowded it starts', type: 'range', min: 5, max: 60, step: 1, default: 34, fmt: (v) => v + '%' },
    { key: 'trail', label: 'Afterglow', type: 'range', min: 0, max: 95, step: 1, default: 78 },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['phosphor', 'Green phosphor'], ['ink', 'Ink on paper']] },
    { key: 'seed', label: 'Seed again', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, cols = 0, rows = 0, cur, nxt, heat, img, tone, built = '', small = null, sctx = null, sdata = null, acc = 0, gen = 0, r = rng(5), birth = [], keep = [];

    function build() {
      const key = [p.cell, p.start, p.seed, p.rule, W].join('|');
      if (key === built) return;
      cols = Math.max(20, Math.round(W / (p.cell * (W / 720)))); rows = Math.max(20, Math.round((cols * H) / W));
      const c = env.makeCanvas(cols, rows), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, cols, rows);
      img = cx.getImageData(0, 0, cols, rows).data; const n = cols * rows;
      cur = new Uint8Array(n); nxt = new Uint8Array(n); heat = new Float32Array(n); tone = new Float32Array(n);
      let lo = 1, hi = 0;
      for (let i = 0; i < n; i++) { const l = (0.2126 * img[i * 4] + 0.7152 * img[i * 4 + 1] + 0.0722 * img[i * 4 + 2]) / 255; tone[i] = l; if (l < lo) lo = l; if (l > hi) hi = l; }
      for (let i = 0; i < n; i++) tone[i] = (tone[i] - lo) / (hi - lo + 1e-6);
      r = rng(p.seed * 71 + 3); const dens = p.start / 100;
      for (let i = 0; i < n; i++) cur[i] = r() < clamp(dens * (0.25 + 1.5 * tone[i])) ? 1 : 0;
      const [b, s] = RULES[p.rule] || RULES.life; birth = new Uint8Array(9); keep = new Uint8Array(9); b.forEach((k) => (birth[k] = 1)); s.forEach((k) => (keep[k] = 1));
      small = env.makeCanvas(cols, rows); sctx = small.getContext('2d'); sdata = sctx.createImageData(cols, rows); acc = 0; gen = 0; built = key;
    }

    function generation() {
      const w = cols, h = rows;
      for (let y = 0; y < h; y++) {
        const ym = ((y + h - 1) % h) * w, y0 = y * w, yp = ((y + 1) % h) * w;
        for (let x = 0; x < w; x++) {
          const xm = x ? x - 1 : w - 1, xp = x < w - 1 ? x + 1 : 0, nb = cur[ym + xm] + cur[ym + x] + cur[ym + xp] + cur[y0 + xm] + cur[y0 + xp] + cur[yp + xm] + cur[yp + x] + cur[yp + xp], i = y0 + x;
          nxt[i] = cur[i] ? keep[nb] : birth[nb];
        }
      }
      const t = cur; cur = nxt; nxt = t; gen++;
      const n = w * h; let alive = 0; for (let i = 0; i < n; i++) alive += cur[i];
      // when a pattern settles or dies, scatter a few new cells where the picture is bright
      if (gen % 60 === 0 && alive < n * 0.05) for (let i = 0; i < n; i++) if (r() < 0.12 * tone[i]) cur[i] = 1;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build();
        if (ptr && ptr.down && ptr.inside) {
          const cx = (ptr.x * cols) | 0, cy = (ptr.y * rows) | 0;
          for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) { const x = cx + i, y = cy + j; if (x >= 0 && y >= 0 && x < cols && y < rows && r() < 0.55) cur[y * cols + x] = 1; }
        }
        acc += dt * p.speed;
        let guard = 6; while (acc >= 1 && guard-- > 0) { generation(); acc -= 1; }
        if (acc > 6) acc = 0;
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const n = cols * rows, o4 = sdata.data, tr = p.trail / 100;
        for (let i = 0; i < n; i++) {
          const a = cur[i]; heat[i] = a ? 1 : heat[i] * tr;
          const o = i * 4, h = heat[i]; let R, G, B;
          if (p.colour === 'picture') { const k = a ? 1.1 : 0.78 * h; R = img[o] * k + 20 * a; G = img[o + 1] * k + 20 * a; B = img[o + 2] * k + 20 * a; R += 6; G += 6; B += 10; }
          else if (p.colour === 'phosphor') { const v = a ? 1 : 0.8 * h; R = 8 + 90 * v * v; G = 12 + 236 * v; B = 10 + 110 * v * v; }
          else { const v = a ? 1 : 0.7 * h; R = lerp(243, 24, v); G = lerp(238, 26, v); B = lerp(224, 34, v); }
          o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
        }
        sctx.putImageData(sdata, 0, 0);
        ctx.imageSmoothingEnabled = false; ctx.drawImage(small, 0, 0, W, H); ctx.imageSmoothingEnabled = true;
      },
      dispose() {},
    };
  },
};
