export default {
  id: 'kinetic-type',
  number: 7,
  name: 'Kinetic type',
  kind: 'animated',
  maxSide: 900,
  thumbAt: 1.4,
  blurb: 'Giant sliding type with your picture showing through the letters.',
  params: [
    { key: 'text', label: 'Words', type: 'text', default: 'KINETIC', max: 18 },
    { key: 'rows', label: 'Rows', type: 'range', min: 3, max: 12, step: 1, default: 6 },
    { key: 'speed', label: 'Speed', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'lift', label: 'Brighten image', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'outline', label: 'Outline rows', type: 'toggle', default: true },
    { key: 'bg', label: 'Background', type: 'color', default: '#0a0a0a' },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, mask, tmp, lifted = null, liftKey = -1, mctx, tctx;
    function lift() {
      const c = env.makeCanvas(W, H), x = c.getContext('2d');
      x.drawImage(work, 0, 0, W, H);
      const img = x.getImageData(0, 0, W, H), d = img.data, g = 1 - (p.lift / 100) * 0.5;
      const lut = new Uint8Array(256);
      for (let i = 0; i < 256; i++) lut[i] = Math.pow(i / 255, g) * 255;
      for (let i = 0; i < d.length; i += 4) { d[i] = lut[d[i]]; d[i + 1] = lut[d[i + 1]]; d[i + 2] = lut[d[i + 2]]; }
      x.putImageData(img, 0, 0);
      lifted = c; liftKey = p.lift;
    }
    return {
      animated: true,
      setSource(w, ww, hh) {
        work = w; W = ww; H = hh; liftKey = -1;
        mask = env.makeCanvas(W, H); tmp = env.makeCanvas(W, H);
        mctx = mask.getContext('2d'); tctx = tmp.getContext('2d');
      },
      setParams(np) { p = np; },
      draw(ctx, t) {
        if (liftKey !== p.lift) lift();
        const rows = Math.round(p.rows), rh = H / rows, fs = rh * 1.12;
        const font = `900 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
        const text = ((p.text || 'KINETIC') + '').toUpperCase(), unit = text + '   ';
        mctx.font = font;
        const tw = Math.max(10, mctx.measureText(unit).width);
        mctx.clearRect(0, 0, W, H);
        mctx.fillStyle = '#fff'; mctx.textBaseline = 'middle'; mctx.textAlign = 'left';
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);
        ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        ctx.strokeStyle = '#f2f2f0'; ctx.lineWidth = Math.max(1, W / 480); ctx.globalAlpha = 0.9;
        for (let i = 0; i < rows; i++) {
          const dir = i % 2 ? -1 : 1, v = (p.speed / 100) * W * 0.32 * (0.6 + 0.25 * (i % 3));
          const off = ((((t * v * dir + i * tw * 0.31) % tw) + tw) % tw);
          const outline = p.outline && i % 4 === 1, y = (i + 0.5) * rh;
          for (let x = off - tw; x < W; x += tw) {
            if (outline) ctx.strokeText(unit, x, y); else mctx.fillText(unit, x, y);
          }
        }
        ctx.globalAlpha = 1;
        tctx.globalCompositeOperation = 'source-over';
        tctx.clearRect(0, 0, W, H);
        tctx.drawImage(lifted, 0, 0);
        tctx.globalCompositeOperation = 'destination-in';
        tctx.drawImage(mask, 0, 0);
        tctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tmp, 0, 0);
      },
      dispose() {},
    };
  },
};
