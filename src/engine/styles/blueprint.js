import { still, hexToRgb, lumArray, boxBlur, sobel, smoothstep, lerp } from '../utils.js';

const SCHEMES = {
  blueprint: { bg: '#0e3a8c', line: '#dce9ff' },
  whiteprint: { bg: '#f3f5f9', line: '#17418f' },
  mono: { bg: '#0a0a0a', line: '#f2f2f0' },
};

export default still({
  id: 'blueprint',
  number: 18,
  name: 'Blueprint',
  blurb: 'Technical-drawing linework with a grid, hatching and a title block.',
  maxSide: 1100,
  params: [
    {
      key: 'scheme', label: 'Sheet', type: 'select', default: 'blueprint',
      options: [['blueprint', 'Blueprint'], ['whiteprint', 'Whiteprint'], ['mono', 'Black']],
    },
    { key: 'detail', label: 'Line detail', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'weight', label: 'Line weight', type: 'range', min: 1, max: 3, step: 1, default: 1 },
    { key: 'hatch', label: 'Hatching', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'grid', label: 'Grid', type: 'toggle', default: true },
    { key: 'notes', label: 'Annotations', type: 'toggle', default: true },
    { key: 'title', label: 'Title', type: 'text', default: 'STUDY NO. 18', max: 22 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const sc = SCHEMES[p.scheme] || SCHEMES.blueprint;
    const bg = hexToRgb(sc.bg), ln = hexToRgb(sc.line);
    if (cache.key !== 'src') {
      const wd = work.getContext('2d').getImageData(0, 0, W, H);
      cache.L = lumArray(wd); cache.key = 'src';
    }
    const L = cache.L;
    const wk = Math.max(1, Math.round(p.weight * (W / 800)));
    const Lb = boxBlur(L, W, H, Math.max(1, Math.round(W / 600)));
    const { mag } = sobel(Lb, W, H, wk);
    const th = lerp(0.3, 0.035, p.detail / 100);
    const dark = boxBlur(L, W, H, Math.max(1, Math.round(W / 300)));
    const sp = Math.max(4, Math.round(W / 105));
    const lvl1 = lerp(0.85, 0.45, p.hatch / 100), lvl2 = lvl1 - 0.2;
    const gs = Math.max(8, Math.round(W / 40)), gw = Math.max(1, Math.round(W / 900));

    const img = ctx.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let a = smoothstep(th, th * 1.7, mag[i]);
        if (p.hatch > 0) {
          const dk = 1 - dark[i];
          if (dk > lvl1 && (x + y) % sp < gw + 0.5) a = Math.max(a, 0.5);
          if (dk > lvl2 + 0.2 && (x - y + 4 * H) % sp < gw + 0.5) a = Math.max(a, 0.4);
        }
        if (p.grid) {
          const gx = x % gs < gw, gy = y % gs < gw;
          if (gx || gy) {
            const major = (Math.floor(x / gs) % 5 === 0 && gx) || (Math.floor(y / gs) % 5 === 0 && gy);
            a = Math.max(a, major ? 0.22 : 0.1);
          }
        }
        const o = i * 4;
        d[o] = bg[0] + (ln[0] - bg[0]) * a;
        d[o + 1] = bg[1] + (ln[1] - bg[1]) * a;
        d[o + 2] = bg[2] + (ln[2] - bg[2]) * a;
        d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    if (!p.notes) return;
    const m = W * 0.035, u = W / 100;
    const mono = (px) => `500 ${px}px "DM Mono", ui-monospace, Menlo, monospace`;
    ctx.strokeStyle = sc.line; ctx.fillStyle = sc.line;
    ctx.lineWidth = Math.max(1, u * 0.22);
    ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.lineWidth = Math.max(1, u * 0.12);
    ctx.strokeRect(m + u * 0.9, m + u * 0.9, W - 2 * m - u * 1.8, H - 2 * m - u * 1.8);

    // dimension lines
    const fs = u * 1.5;
    ctx.font = mono(fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function dim(x0, y0, x1, y1, label, rot) {
      ctx.lineWidth = Math.max(1, u * 0.14);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const ang = Math.atan2(y1 - y0, x1 - x0), t = u * 1.1;
      for (const [px, py, s] of [[x0, y0, 1], [x1, y1, -1]]) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + s * Math.cos(ang - 0.35) * t, py + s * Math.sin(ang - 0.35) * t);
        ctx.lineTo(px + s * Math.cos(ang + 0.35) * t, py + s * Math.sin(ang + 0.35) * t);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px - Math.sin(ang) * t * 0.8, py + Math.cos(ang) * t * 0.8);
        ctx.lineTo(px + Math.sin(ang) * t * 0.8, py - Math.cos(ang) * t * 0.8);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate((x0 + x1) / 2, (y0 + y1) / 2);
      if (rot) ctx.rotate(-Math.PI / 2);
      const tw = ctx.measureText(label).width + u * 2;
      ctx.fillStyle = sc.bg; ctx.fillRect(-tw / 2, -fs * 0.75, tw, fs * 1.5);
      ctx.fillStyle = sc.line; ctx.fillText(label, 0, 0);
      ctx.restore();
    }
    dim(m * 2, m * 0.5, W - m * 2, m * 0.5, `${W} PX`, false);
    dim(m * 0.5, m * 2, m * 0.5, H - m * 2, `${H} PX`, true);

    // title block
    const bw = W * 0.34, bh = u * 8.6, bx = W - m - u * 0.9 - bw, by = H - m - u * 0.9 - bh;
    ctx.fillStyle = sc.bg; ctx.fillRect(bx, by, bw, bh);
    ctx.lineWidth = Math.max(1, u * 0.2); ctx.strokeRect(bx, by, bw, bh);
    ctx.beginPath(); ctx.moveTo(bx, by + bh * 0.55); ctx.lineTo(bx + bw, by + bh * 0.55);
    ctx.moveTo(bx + bw * 0.55, by + bh * 0.55); ctx.lineTo(bx + bw * 0.55, by + bh); ctx.stroke();
    ctx.fillStyle = sc.line; ctx.textAlign = 'left';
    ctx.font = mono(u * 2.1); ctx.fillText((p.title || '').toUpperCase(), bx + u * 1.2, by + bh * 0.28);
    ctx.font = mono(u * 1.25);
    ctx.fillText('SCALE 1:1', bx + u * 1.2, by + bh * 0.78);
    ctx.fillText('SHEET 18 OF 20', bx + bw * 0.55 + u * 1.2, by + bh * 0.78);

    // registration marks
    ctx.lineWidth = Math.max(1, u * 0.14);
    for (const [cx, cy] of [[W / 2, m + u * 0.9], [W / 2, H - m - u * 0.9], [m + u * 0.9, H / 2], [W - m - u * 0.9, H / 2]]) {
      ctx.beginPath(); ctx.moveTo(cx - u * 1.2, cy); ctx.lineTo(cx + u * 1.2, cy); ctx.moveTo(cx, cy - u * 1.2); ctx.lineTo(cx, cy + u * 1.2); ctx.stroke();
    }
  },
});
