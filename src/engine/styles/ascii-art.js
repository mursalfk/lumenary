import { still, clamp, hexToRgb, sampleImage, lumOf, rgbCss } from '../utils.js';

const RAMPS = {
  classic: ' .:-=+*#%@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  dots: ' ·•●',
  binary: '01',
};

export default still({
  id: 'ascii-art',
  number: 10,
  name: 'ASCII art',
  blurb: 'The picture rebuilt from typed characters, light to heavy.',
  maxSide: 1100,
  thumbParams: { detail: 52 },
  params: [
    { key: 'detail', label: 'Characters across', type: 'range', min: 30, max: 260, step: 2, default: 110 },
    {
      key: 'charset', label: 'Character set', type: 'select', default: 'classic',
      options: [['classic', 'Classic'], ['detailed', 'Detailed'], ['blocks', 'Blocks'], ['dots', 'Dots'], ['binary', 'Binary']],
    },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -80, max: 80, step: 1, default: 20 },
    { key: 'spacing', label: 'Line spacing', type: 'range', min: 0.8, max: 1.5, step: 0.05, default: 1, fmt: (v) => v.toFixed(2) },
    {
      key: 'color', label: 'Coloring', type: 'select', default: 'single',
      options: [['single', 'Single color'], ['original', 'Original colors']],
    },
    { key: 'fg', label: 'Characters', type: 'color', default: '#f2f2f0' },
    { key: 'bg', label: 'Background', type: 'color', default: '#0a0a0a' },
    { key: 'invert', label: 'Invert tones', type: 'toggle', default: false },
    { key: 'bold', label: 'Bold glyphs', type: 'toggle', default: false },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const fam = '"JetBrains Mono", "DM Mono", ui-monospace, Menlo, Consolas, monospace';
    const font = (px) => `${p.bold ? 700 : 400} ${px}px ${fam}`;
    ctx.font = font(100);
    const adv = ctx.measureText('M').width / 100 || 0.6;
    const cols = Math.round(p.detail);
    const cellW = W / cols, fs = cellW / adv;
    const rows = Math.max(1, Math.round(H / (fs * p.spacing)));
    const cellH = H / rows;

    const key = cols + 'x' + rows;
    if (cache.key !== key) { cache.img = sampleImage(env, work, cols, rows); cache.key = key; }
    const px = cache.img.data;

    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);
    const ramp = Array.from(RAMPS[p.charset] || RAMPS.classic), m = ramp.length;
    const lightOnDark = lumOf(...hexToRgb(p.bg)) < 0.5;
    const f = Math.tan((p.contrast / 100 + 1) * Math.PI / 4);

    ctx.font = font(fs);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const fg = hexToRgb(p.fg);
    if (p.color === 'single') ctx.fillStyle = rgbCss(...fg);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const l = clamp((lumOf(px[i], px[i + 1], px[i + 2]) - 0.5) * f + 0.5);
        let d = lightOnDark ? l : 1 - l;
        if (p.invert) d = 1 - d;
        const ch = ramp[Math.min(m - 1, Math.round(d * (m - 1)))];
        if (ch === ' ') continue;
        if (p.color === 'original') ctx.fillStyle = rgbCss(px[i], px[i + 1], px[i + 2]);
        // one glyph per cell keeps the grid exact even if the font falls back to a proportional face
        ctx.fillText(ch, x * cellW, (y + 0.5) * cellH);
      }
    }
  },
});
