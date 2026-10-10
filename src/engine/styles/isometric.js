import { still, clamp, sampleImage, lumOf, rgbCss } from '../utils.js';

export default still({
  id: 'isometric',
  number: 8,
  name: 'Isometric',
  blurb: 'A city of blocks: height follows brightness, color follows the picture.',
  maxSide: 1100,
  params: [
    { key: 'cols', label: 'Blocks across', type: 'range', min: 14, max: 90, step: 1, default: 56 },
    { key: 'height', label: 'Height', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'gap', label: 'Gap', type: 'range', min: 0, max: 100, step: 1, default: 25 },
    { key: 'crop', label: 'Square crop', type: 'toggle', default: true },
    { key: 'mono', label: 'Grayscale', type: 'toggle', default: false },
    { key: 'invert', label: 'Dark = tall', type: 'toggle', default: false },
    { key: 'bg', label: 'Background', type: 'color', default: '#0a0a0a' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const cols = Math.round(p.cols);
    const square = p.crop && Math.abs(W / H - 1) > 0.05;
    const rows = square ? cols : Math.max(2, Math.round((cols * H) / W));
    const key = cols + 'x' + rows + (square ? 'sq' : '');
    if (cache.key !== key) {
      let srcCanvas = work;
      if (square) {
        const side = Math.min(W, H);
        srcCanvas = env.makeCanvas(side, side);
        srcCanvas.getContext('2d').drawImage(work, (W - side) / 2, (H - side) * 0.3, side, side, 0, 0, side, side);
      }
      cache.img = sampleImage(env, srcCanvas, cols, rows); cache.key = key;
    }
    const px = cache.img.data;
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);

    const hmaxTiles = (p.height / 100) * 7;
    const hs = new Float32Array(cols * rows), lv = new Float32Array(cols * rows);
    let lo = 1, hi = 0;
    for (let i = 0; i < cols * rows; i++) {
      lv[i] = lumOf(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]);
      if (lv[i] < lo) lo = lv[i]; if (lv[i] > hi) hi = lv[i];
    }
    for (let i = 0; i < cols * rows; i++) {
      let l = (lv[i] - lo) / Math.max(0.05, hi - lo);
      if (p.invert) l = 1 - l;
      hs[i] = Math.pow(l, 1.1) * hmaxTiles + 0.08;
    }
    // Lay out in tile units (tw = 1, th = 0.5), then fit the whole diamond to the canvas.
    let ymin = 1e9, ymax = -1e9;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const by = (i + j) * 0.25;
      ymin = Math.min(ymin, by - hs[j * cols + i]);
      ymax = Math.max(ymax, by + 0.5);
    }
    const wUnits = (cols + rows) * 0.5, hUnits = ymax - ymin;
    const tw = Math.min((W * 1.04) / wUnits, (H * 0.96) / hUnits);
    const ox = W / 2, oy = (H - hUnits * tw) / 2 - ymin * tw;
    const th = tw / 2;
    const edge = p.gap / 100 * tw * 0.07;

    for (let s = 0; s <= cols + rows - 2; s++) {
      for (let i = Math.max(0, s - rows + 1); i <= Math.min(cols - 1, s); i++) {
        const j = s - i, idx = j * cols + i, o = idx * 4;
        let r = px[o], g = px[o + 1], b = px[o + 2];
        if (p.mono) { const l = lumOf(r, g, b) * 255; r = g = b = l; }
        const X = ox + (i - j) * (tw / 2), Y = oy + (i + j) * (th / 2), h = hs[idx] * tw;
        ctx.lineWidth = edge; ctx.strokeStyle = p.bg; ctx.lineJoin = 'round';
        // left face
        ctx.fillStyle = rgbCss(r * 0.62, g * 0.62, b * 0.62);
        ctx.beginPath(); ctx.moveTo(X - tw / 2, Y - h + th / 2); ctx.lineTo(X, Y - h + th); ctx.lineTo(X, Y + th); ctx.lineTo(X - tw / 2, Y + th / 2); ctx.closePath(); ctx.fill(); if (edge > 0.3) ctx.stroke();
        // right face
        ctx.fillStyle = rgbCss(r * 0.4, g * 0.4, b * 0.4);
        ctx.beginPath(); ctx.moveTo(X, Y - h + th); ctx.lineTo(X + tw / 2, Y - h + th / 2); ctx.lineTo(X + tw / 2, Y + th / 2); ctx.lineTo(X, Y + th); ctx.closePath(); ctx.fill(); if (edge > 0.3) ctx.stroke();
        // top face
        ctx.fillStyle = rgbCss(clamp(r * 1.08, 0, 255), clamp(g * 1.08, 0, 255), clamp(b * 1.08, 0, 255));
        ctx.beginPath(); ctx.moveTo(X, Y - h); ctx.lineTo(X + tw / 2, Y - h + th / 2); ctx.lineTo(X, Y - h + th); ctx.lineTo(X - tw / 2, Y - h + th / 2); ctx.closePath(); ctx.fill(); if (edge > 0.3) ctx.stroke();
      }
    }
  },
});
