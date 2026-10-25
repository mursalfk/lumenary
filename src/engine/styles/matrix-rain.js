// src/engine/styles/matrix-rain.js
import { rng, hash2, lumOf, clamp, sampleImage } from '../utils.js';

const SETS = {
  code: Array.from('0123456789ABCDEFZ:.=*+-<>|/\\'),
  binary: ['0', '1'],
  kana: Array.from('ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'),
};
const TINTS = { green: [60, 255, 120], cyan: [70, 230, 255], amber: [255, 176, 56], white: [235, 240, 238] };

export default {
  id: 'matrix-rain',
  name: 'Matrix Rain',
  kind: 'animated',
  maxSide: 760,
  thumbAt: 4,
  blurb: 'Falling code that glows brightest where your picture is bright.',
  params: [
    { key: 'size', label: 'Glyph size', type: 'range', min: 8, max: 26, step: 1, default: 13 },
    { key: 'speed', label: 'Speed', type: 'range', min: 10, max: 100, step: 1, default: 50 },
    { key: 'picture', label: 'Picture strength', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'glyphs', label: 'Glyphs', type: 'select', default: 'code', options: [['code', 'Code'], ['binary', 'Binary'], ['kana', 'Katakana']] },
    { key: 'tint', label: 'Colour', type: 'select', default: 'green', options: [['green', 'Green'], ['cyan', 'Cyan'], ['amber', 'Amber'], ['white', 'White']] },
    { key: 'seed', label: 'New rain', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, key = '', cols = 0, rows = 0, cell = 0, lum = null, colSpeed, colLen, colOff;

    function build() {
      cell = Math.max(6, Math.round(p.size * (W / 760)));
      cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
      const d = sampleImage(env, work, cols, rows).data, r = rng(p.seed * 29 + 3);
      lum = new Float32Array(cols * rows);
      for (let i = 0; i < lum.length; i++) lum[i] = lumOf(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
      colSpeed = new Float32Array(cols); colLen = new Float32Array(cols); colOff = new Float32Array(cols);
      for (let c = 0; c < cols; c++) { colSpeed[c] = 0.55 + r() * 0.9; colLen[c] = 9 + r() * 22; colOff[c] = r() * 400; }
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; key = ''; },
      setParams(np) { p = np; },
      draw(ctx, t) {
        const k = p.size + '|' + p.seed + '|' + W;
        if (k !== key) { build(); key = k; }
        const set = SETS[p.glyphs] || SETS.code, tint = TINTS[p.tint] || TINTS.green, s = p.picture / 100, rate = (p.speed / 100) * 20 + 3;
        ctx.fillStyle = '#020503'; ctx.fillRect(0, 0, W, H);
        ctx.font = `700 ${cell * 1.02}px "JetBrains Mono", ui-monospace, Menlo, "Noto Sans Mono CJK JP", monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const [tr, tg, tb] = tint, steps = 10;
        // glyphs are batched by brightness so the fill colour only changes ten times per frame
        const buckets = Array.from({ length: steps + 1 }, () => []);
        for (let c = 0; c < cols; c++) {
          const len = colLen[c], cycle = rows + len + 6, head = (((t * rate * colSpeed[c] + colOff[c]) % cycle) + cycle) % cycle - len * 0.2;
          for (let rr = 0; rr < rows; rr++) {
            const dist = head - rr, trail = dist >= 0 && dist < len ? Math.pow(1 - dist / len, 1.6) : 0, B = lum[rr * cols + c];
            // the picture shows through even between drops, and drops burn brighter on bright parts
            let a = trail * (1 - s + s * (0.3 + 1.25 * B)) + s * Math.pow(B, 1.4) * 0.62;
            if (a < 0.05) continue;
            a = clamp(a);
            const isHead = dist >= 0 && dist < 1.2;
            const g = set[(hash2(c, rr, Math.floor(t * (isHead ? 18 : 2.5) + c * 0.37)) * set.length) | 0];
            buckets[isHead ? steps : Math.min(steps - 1, (a * steps) | 0)].push(c * cell + cell / 2, rr * cell + cell / 2, g);
          }
        }
        for (let b = 0; b <= steps; b++) {
          const list = buckets[b]; if (!list.length) continue;
          if (b === steps) { ctx.fillStyle = '#f2fff4'; ctx.shadowColor = `rgb(${tr},${tg},${tb})`; ctx.shadowBlur = cell * 0.9; }
          else { const a = (b + 0.5) / steps; ctx.fillStyle = `rgba(${tr},${tg},${tb},${a.toFixed(2)})`; ctx.shadowBlur = 0; }
          for (let i = 0; i < list.length; i += 3) ctx.fillText(list[i + 2], list[i], list[i + 1]);
        }
        ctx.shadowBlur = 0;
      },
      dispose() {},
    };
  },
};
