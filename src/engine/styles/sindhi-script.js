// src/engine/styles/sindhi-script.js
import { still, clamp, hash2 } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, vivid } from '../culture.js';

// Sindhi uses the Arabic script with extra letters of its own. These word lists are read right to left.
const WORDS = ['سنڌ', 'سنڌو', 'محبت', 'امن', 'ڌرتي', 'روشني', 'سڄڻ', 'ٻولي', 'ڪتاب', 'پاڻي', 'سج', 'چنڊ', 'ڪلا', 'شعر', 'سُر', 'ڄاڻ', 'ڏات', 'ڏيئو'];
const LETTERS = 'ا ب ٻ ڀ پ ت ٽ ٿ ٺ ث ج ڄ ڃ چ ڇ ح خ د ڌ ڏ ڊ ڍ ذ ر ڙ ز س ش ص ض ط ظ ع غ ف ڦ ق ڪ ک گ ڳ ڱ ل م ن ڻ و ه ھ ء ي'.split(' ');
const PAPER = { night: '#0d0c10', cream: '#f1e9d6', indigo: '#101a3d' };
const FACE = '"Noto Naskh Arabic", "Amiri", "Scheherazade New", "Noto Sans Arabic", serif';

export default still({
  id: 'sindhi-script',
  name: 'Sindhi Script',
  blurb: 'Your picture written out in Sindhi, right to left. Words and letters grow and thicken where the light is strong, so the page reads as a calligraphic portrait.',
  maxSide: 1100,
  params: [
    { key: 'source', label: 'Text', type: 'select', default: 'words', options: [['words', 'Sindhi words'], ['letters', 'The Sindhi letters'], ['custom', 'Your own text']] },
    { key: 'text', label: 'Your text', type: 'text', default: 'سنڌ جي سونھن', max: 60 },
    { key: 'size', label: 'Letter size', type: 'range', min: 14, max: 60, step: 1, default: 30 },
    { key: 'contrast', label: 'Size follows light', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['gold', 'Gold'], ['plain', 'Plain']] },
    { key: 'paper', label: 'Page', type: 'select', default: 'night', options: [['night', 'Night'], ['indigo', 'Indigo'], ['cream', 'Cream']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, base = p.size * sc, smp = sampler(cache, d, W, H, base * 0.5), tmp = [0, 0, 0];
    const dark = p.paper !== 'cream';
    ctx.fillStyle = PAPER[p.paper]; ctx.fillRect(0, 0, W, H);
    let list = p.source === 'letters' ? LETTERS : p.source === 'custom' ? String(p.text || '').trim().split(/\s+/).filter(Boolean) : WORDS;
    if (!list.length) list = WORDS;
    ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    const lp = base * 1.45, margin = base * 0.5, fol = p.contrast / 100;
    let row = 0;
    for (let y = lp; y < H + lp * 0.4; y += lp, row++) {
      let x = W - margin, k = row * 5;
      for (let guard = 0; guard < 400 && x > margin + base; guard++, k++) {
        const word = list[(k + ((row * 7) % list.length)) % list.length];
        let fs = base, wt = 400;
        for (let pass = 0; pass < 2; pass++) {
          ctx.font = `${wt} ${fs}px ${FACE}`;
          const w = ctx.measureText(word).width, t = smp.tone(clamp(x - w / 2, 0, W - 1), clamp(y - base * 0.3, 0, H - 1)), v = dark ? t : 1 - t;
          fs = base * (1 - fol * 0.5 + fol * 1.0 * v); wt = v > 0.45 ? 700 : 400;
        }
        ctx.font = `${wt} ${fs}px ${FACE}`;
        const w = ctx.measureText(word).width;
        if (x - w < margin) break;
        const t = smp.tone(clamp(x - w / 2, 0, W - 1), clamp(y - base * 0.3, 0, H - 1)), v = dark ? t : 1 - t;
        if (p.ink === 'picture') {
          const c = smp.rgb(clamp(x - w / 2, 0, W - 1), clamp(y - base * 0.3, 0, H - 1)); vivid(c, 1.3, dark ? 0.2 : -0.08, tmp);
          const f = dark ? 0.75 + 0.4 * v : 0.8; ctx.fillStyle = css([tmp[0] * f, tmp[1] * f, tmp[2] * f]);
        } else if (p.ink === 'gold') ctx.fillStyle = css([205 * (0.45 + 0.6 * v), 164 * (0.45 + 0.6 * v), 78 * (0.45 + 0.6 * v)]);
        else ctx.fillStyle = dark ? css([240 * (0.35 + 0.65 * v), 236 * (0.35 + 0.65 * v), 226 * (0.35 + 0.65 * v)]) : '#1b1712';
        ctx.fillText(word, x, y);
        x -= w + fs * (0.32 + 0.1 * hash2(k, row, 3));
      }
    }
    ctx.direction = 'ltr';
  },
});
