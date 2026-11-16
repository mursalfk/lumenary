// src/engine/retro.js
// Shared building blocks for the game-console treatments: ordered dithering, text set in hard pixels, and small
// sprites drawn from rows of characters. Pure JS, no DOM beyond `env.makeCanvas`.

// The 4 x 4 Bayer matrix as thresholds from 0 to 1 (exclusive). Adding one to a colour before it is rounded down
// turns a smooth gradient into a regular pattern of two neighbouring shades.
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)];

// Round a channel value (0..255) down to `levels` steps, with the Bayer pattern deciding the ties.
export const dither = (v, levels, x, y, amount = 1) => {
  const step = 255 / (levels - 1), q = v / step, f = Math.floor(q);
  return Math.min(255, (f + (q - f > 0.5 + (bayer(x, y) - 0.5) * amount ? 1 : 0)) * step);
};

// `text` as a small canvas of hard-edged pixels, `h` pixels tall, in the CSS colour `color`.
// The type is drawn small and its soft edges are cut to on or off, which is what gives it the look of a bitmap font.
export function pixelText(env, text, h, color = '#ffffff') {
  const probe = env.makeCanvas(4, 4).getContext('2d'), font = `700 ${h}px "JetBrains Mono", monospace`;
  probe.font = font;
  const w = Math.max(2, Math.ceil(probe.measureText(text).width) + 2), c = env.makeCanvas(w, h + 4), x = c.getContext('2d');
  x.font = font; x.textBaseline = 'top'; x.fillStyle = color; x.fillText(text, 1, 1);
  const img = x.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;
  x.putImageData(img, 0, 0);
  return c;
}

// Draw a sprite given as rows of characters. `colors` maps a character to a CSS colour; any other character is
// left transparent. Each character becomes a square of `px` pixels with its top-left corner at (x, y).
export function sprite(ctx, rows, colors, x, y, px) {
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
    const c = colors[rows[j][i]];
    if (c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x + i * px), Math.round(y + j * px), Math.ceil(px), Math.ceil(px)); }
  }
}
