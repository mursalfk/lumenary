import { sampleImage, lumOf, clamp, hash2 } from '../utils.js';

const STEP = 0.07;

export default {
  id: 'split-flap',
  number: 13,
  name: 'Split-flap',
  kind: 'animated',
  maxSide: 900,
  thumbAt: 3.2,
  blurb: 'An airport departures board that flips its way to your picture, then flips away.',
  params: [
    { key: 'cols', label: 'Tiles across', type: 'range', min: 20, max: 80, step: 1, default: 42 },
    { key: 'charset', label: 'Characters', type: 'select', default: 'density', options: [['density', 'Light to heavy'], ['alnum', 'Letters & numbers']] },
    { key: 'color', label: 'Ink', type: 'select', default: 'white', options: [['white', 'Warm white'], ['original', 'Original colors']] },
    { key: 'seed', label: 'Replay', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, key = '', lastSeed = null, tStart = 0, pendingReset = false, first = true;
    let shade, cols = 0, rows = 0, cw = 0, ch = 0, M = 0, drum = [], target, delay, rgb, maxDelay = 0, period = 10, holdStart = 5;

    function build() {
      cols = Math.round(p.cols); cw = W / cols; rows = Math.max(2, Math.round(H / (cw * 1.45))); ch = H / rows;
      const d = sampleImage(env, work, cols, rows).data;
      drum = Array.from(p.charset === 'alnum' ? ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' : ' .:-=+*#%@');
      M = drum.length;
      target = new Uint8Array(cols * rows); shade = new Float32Array(cols * rows); delay = new Float32Array(cols * rows); rgb = new Uint8Array(cols * rows * 3);
      maxDelay = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x, o = i * 4;
          const l = clamp((lumOf(d[o], d[o + 1], d[o + 2]) - 0.5) * 1.4 + 0.5);
          target[i] = Math.round(l * (M - 1)); shade[i] = 0.42 + 0.58 * l;
          delay[i] = x * 0.011 + y * 0.009 + hash2(x, y, 5) * 0.08;
          maxDelay = Math.max(maxDelay, delay[i]);
          const m = 1 / Math.max(0.4, d[o] / 255, d[o + 1] / 255, d[o + 2] / 255);
          rgb[i * 3] = Math.min(255, d[o] * m); rgb[i * 3 + 1] = Math.min(255, d[o + 1] * m); rgb[i * 3 + 2] = Math.min(255, d[o + 2] * m);
        }
      }
      holdStart = maxDelay + M * STEP + 2.4;
      period = holdStart + maxDelay + (M + 1) * STEP + 1.2;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; key = ''; first = true; },
      setParams(np) {
        p = np;
        if (lastSeed !== null && np.seed !== lastSeed) pendingReset = true;
        lastSeed = np.seed;
      },
      draw(ctx, t) {
        const k = p.cols + '|' + p.charset;
        if (k !== key) { build(); key = k; tStart = first ? 0 : t; first = false; }
        if (pendingReset) { tStart = t; pendingReset = false; }
        const tau = (t - tStart) % period;
        ctx.fillStyle = '#060606'; ctx.fillRect(0, 0, W, H);
        const gap = cw * 0.07, tw = cw - gap, th = ch - gap, lineH = Math.max(1, th * 0.03);
        ctx.font = `700 ${th * 0.82}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const topC = '#1d1d1d', botC = '#141414';
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x, tg = target[i], x0 = x * cw + gap / 2, y0 = y * ch + gap / 2, mid = y0 + th / 2, cx = x0 + tw / 2;
            let cur = 0, prev = 0, f = 0, flip = false;
            const ta = tau - delay[i];
            if (ta >= 0) {
              const s = Math.floor(ta / STEP);
              if (s < tg) { cur = s; prev = Math.max(0, s - 1); f = (ta - s * STEP) / STEP; flip = s > 0; } else cur = tg;
            }
            const tb = tau - holdStart - delay[i];
            if (tb >= 0) {
              const s = Math.floor(tb / STEP), pos = tg + s;
              if (pos < M) { cur = pos; prev = Math.max(0, pos - 1); f = (tb - s * STEP) / STEP; flip = s > 0; }
              else if (pos === M) { cur = 0; prev = M - 1; f = (tb - s * STEP) / STEP; flip = true; }
              else { cur = 0; flip = false; }
            }
            const color = p.color === 'original' ? `rgb(${rgb[i * 3]},${rgb[i * 3 + 1]},${rgb[i * 3 + 2]})` : `rgb(${Math.round(236 * shade[i])},${Math.round(232 * shade[i])},${Math.round(223 * shade[i])})`;
            ctx.fillStyle = topC; ctx.fillRect(x0, y0, tw, th / 2);
            ctx.fillStyle = botC; ctx.fillRect(x0, mid, tw, th / 2);
            ctx.fillStyle = color;
            const half = (chr, top, sy) => {
              if (chr === ' ') return;
              ctx.save(); ctx.beginPath();
              ctx.rect(x0, top ? y0 : mid, tw, th / 2); ctx.clip();
              ctx.translate(cx, mid); ctx.scale(1, sy); ctx.fillText(chr, 0, 0); ctx.restore();
            };
            if (!flip) { if (drum[cur] !== ' ') ctx.fillText(drum[cur], cx, mid); }
            else if (f < 0.5) {
              const s = 1 - 2 * f;
              half(drum[cur], true, 1); half(drum[prev], false, 1);
              ctx.fillStyle = topC; ctx.fillRect(x0, mid - (th / 2) * s, tw, (th / 2) * s);
              ctx.fillStyle = color; half(drum[prev], true, s);
            } else {
              const s = 2 * f - 1;
              half(drum[cur], true, 1); half(drum[prev], false, 1);
              ctx.fillStyle = botC; ctx.fillRect(x0, mid, tw, (th / 2) * s);
              ctx.fillStyle = color; half(drum[cur], false, s);
            }
            ctx.fillStyle = '#000'; ctx.fillRect(x0, mid - lineH / 2, tw, lineH);
          }
        }
      },
      dispose() {},
    };
  },
};
