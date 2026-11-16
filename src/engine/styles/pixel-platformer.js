// src/engine/styles/pixel-platformer.js
import { still, clamp, hash2, sampleImage, lumOf, rgb2hsl, hsl2rgb, rng, rgbCss } from '../utils.js';
import { pixelText, sprite } from '../retro.js';

const GREENS = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]];
const COIN = ['..oooo..', '.oYYYYo.', 'oYYWYyYo', 'oYWYYyYo', 'oYWYYyYo', 'oYYYyyYo', '.oyyyyo.', '..oooo..'];
const HEART = ['.rr.rr.', 'rRRrRRr', 'rRRRRRr', 'rRRRRRr', '.rRRRr.', '..rRr..', '...r...'];
// A small explorer with a lantern for a head: this treatment's own character.
const HERO = ['...kkkk...', '..kYYYYk..', '..kYWYYk..', '..kYYYYk..', '...kkkk...', '..kbbbbk..', '.kbbbbbbk.', '.kbkbbkbk.', '..kbbbbk..', '..kk..kk..'];

export default still({
  id: 'pixel-platformer',
  name: 'Pixel Platformer',
  blurb: 'Your picture as a level from a sixteen-bit platform game: the dark parts become solid blocks, every ledge grows grass, coins hang above it and a score bar runs along the top.',
  maxSide: 960,
  params: [
    { key: 'tiles', label: 'Tiles across', type: 'range', min: 12, max: 40, step: 1, default: 24 },
    { key: 'ground', label: 'How much is solid', type: 'range', min: 15, max: 85, step: 1, default: 45 },
    { key: 'palette', label: 'Palette', type: 'select', default: 'console', options: [['console', 'Sixteen-bit console'], ['dusk', 'Dusk level'], ['handheld', 'Green handheld'], ['picture', 'The picture’s own']] },
    { key: 'coins', label: 'Coins', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'hud', label: 'Score bar', type: 'toggle', default: true },
    { key: 'seed', label: 'New level', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    // one tile is 8 game pixels; the tile count across fixes the size of a game pixel
    const g = Math.max(1, Math.round(W / (p.tiles * 8))), T = g * 8, cols = Math.ceil(W / T), rows = Math.ceil(H / T), seed = p.seed * 19 + 3, r = rng(seed);
    const fine = sampleImage(env, work, cols * 4, rows * 4).data, fw = cols * 4, tone = new Float32Array(cols * rows), col = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      let R = 0, G = 0, B = 0;
      for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) { const q = ((j * 4 + b) * fw + i * 4 + a) * 4; R += fine[q]; G += fine[q + 1]; B += fine[q + 2]; }
      col.push([R / 16, G / 16, B / 16]); tone[j * cols + i] = lumOf(R / 16, G / 16, B / 16);
    }
    // the darkest share of the tiles is solid ground: the threshold is read off the sorted tones
    const sorted = Float32Array.from(tone).sort(), thr = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * (p.ground / 100)))];
    const solid = (i, j) => j >= rows || (i >= 0 && i < cols && j >= 0 && tone[j * cols + i] <= thr);
    const paint = (c, lift = 0) => {
      const l0 = lumOf(c[0], c[1], c[2]);
      if (p.palette === 'handheld') return GREENS[clamp(Math.floor((l0 + lift * 0.4) * 4), 0, 3)];
      let [h, s, l] = rgb2hsl(c[0], c[1], c[2]);
      if (p.palette === 'console') { s = clamp(s * 1.5 + 0.08); l = clamp((l - 0.5) * 1.1 + 0.52 + lift); }
      else if (p.palette === 'dusk') { h = h * 0.35 + 0.72 * 0.65 + (l > 0.6 ? 0.28 : 0); s = clamp(s * 0.9 + 0.3); l = clamp(l * 0.9 + lift); }
      else l = clamp(l + lift);
      // five bits a channel, as the consoles stored colour
      return hsl2rgb(h, s, l).map((v) => Math.round(v / 8.226) * 8.226);
    };
    const px = (c, x, y, w, h) => { ctx.fillStyle = rgbCss(c[0], c[1], c[2]); ctx.fillRect(x, y, w, h); };
    const ledges = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * T, y = j * T, c = col[j * cols + i];
      if (!solid(i, j)) {
        // sky: the picture itself at four blocks to the tile, so it stays readable behind the level
        for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) { const q = ((j * 4 + b) * fw + i * 4 + a) * 4; px(paint([fine[q], fine[q + 1], fine[q + 2]], 0.04), x + a * g * 2, y + b * g * 2, g * 2, g * 2); }
        continue;
      }
      // a block: body, a light edge up and left, a dark edge down and right, and two courses of brick
      const body = paint(c), hi = paint(c, 0.14), lo = paint(c, -0.16);
      px(body, x, y, T, T); px(hi, x, y, T, g); px(hi, x, y, g, T); px(lo, x, y + T - g, T, g); px(lo, x + T - g, y, g, T);
      px(lo, x + g, y + g * 4, T - g * 2, g); px(lo, x + g * ((i + j) % 2 ? 3 : 5), y + g, g, g * 3); px(lo, x + g * ((i + j) % 2 ? 5 : 2), y + g * 5, g, g * 2);
      if (!solid(i, j - 1)) {
        // a ledge: a cap of grass with a ragged lower edge
        const grass = p.palette === 'handheld' ? GREENS[3] : p.palette === 'dusk' ? [96, 214, 178] : [88, 200, 72], shade = p.palette === 'handheld' ? GREENS[2] : p.palette === 'dusk' ? [44, 140, 150] : [40, 140, 56];
        px(grass, x, y, T, g * 2); px(shade, x, y + g * 2, T, g);
        for (let a = 0; a < 8; a++) if (hash2(i * 8 + a, j, seed) > 0.5) px(shade, x + a * g, y + g * 3, g, g);
        px([255, 255, 255].map((v, q) => (v + grass[q]) / 2), x + g, y, g * 2, g);
        if (j > 1) ledges.push([i, j]);
      }
    }
    // coins float one tile above some of the ledges
    const cc = { o: '#8a5a00', Y: '#ffd21f', y: '#e0a400', W: '#fff6b0' };
    let hero = null;
    for (const [i, j] of ledges) {
      if (!hero && i > cols * 0.2 && i < cols * 0.5 && j > rows * 0.3 && !solid(i, j - 1) && !solid(i, j - 2)) { hero = [i, j]; continue; }
      if (r() < (p.coins / 100) * 0.5 && !solid(i, j - 1) && !solid(i, j - 2)) sprite(ctx, COIN, cc, i * T, (j - 2) * T + g * 2, g);
    }
    if (!hero && ledges.length) hero = ledges[Math.floor(ledges.length / 2)];
    if (hero) sprite(ctx, HERO, { k: '#1b1b2b', Y: '#ffd95e', W: '#fffbe0', b: '#3d7be0' }, hero[0] * T - g, (hero[1] - 1) * T - g * 2, g);
    if (p.hud) {
      const bar = T * 1.5;
      ctx.fillStyle = 'rgba(8,8,24,0.78)'; ctx.fillRect(0, 0, W, bar);
      const draw = (t, x) => { const c = pixelText(env, t, 7, '#ffffff'); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, x, (bar - c.height * g) / 2, c.width * g, c.height * g); ctx.imageSmoothingEnabled = true; return c.width * g; };
      let x = T * 0.5;
      x += draw('SCORE ' + String((p.seed * 7300 + 4200) % 1000000).padStart(6, '0'), x) + T;
      sprite(ctx, COIN, cc, x, (bar - T) / 2, g); x += T + g * 2; x += draw('x' + String(12 + (p.seed % 80)).padStart(2, '0'), x);
      for (let q = 0; q < 3; q++) sprite(ctx, HEART, { r: '#7a0f1c', R: '#ff4b5c' }, W - T * 0.5 - (3 - q) * (g * 8), (bar - g * 7) / 2, g);
    }
  },
});
