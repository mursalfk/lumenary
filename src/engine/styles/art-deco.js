import { still, clamp, lumArray, bilinear, TAU } from '../utils.js';

const METALS = {
  gold: ['#6e5214', '#c9a24b', '#f6e7a8', '#b8913c', '#5e4510'],
  silver: ['#5b5f66', '#aeb4bd', '#f4f6f8', '#9aa1ab', '#4a4e55'],
  copper: ['#6a3319', '#c0713e', '#f2b98f', '#a95b2f', '#55280f'],
  white: ['#8e8e8a', '#dcdcd6', '#ffffff', '#c8c8c2', '#7c7c78'],
};

export default still({
  id: 'art-deco',
  number: 19,
  name: 'Art deco',
  blurb: 'Engraved metallic linework inside a stepped, fan-cornered frame.',
  maxSide: 1100,
  params: [
    { key: 'mode', label: 'Engraving', type: 'select', default: 'lines', options: [['lines', 'Lines'], ['rays', 'Sunburst']] },
    { key: 'density', label: 'Line count', type: 'range', min: 30, max: 160, step: 1, default: 84 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -50, max: 60, step: 1, default: 20 },
    { key: 'metal', label: 'Metal', type: 'select', default: 'gold', options: [['gold', 'Gold'], ['silver', 'Silver'], ['copper', 'Copper'], ['white', 'White']] },
    { key: 'frame', label: 'Frame', type: 'toggle', default: true },
    { key: 'title', label: 'Title', type: 'text', default: 'N° 19', max: 20 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    if (cache.key !== 'src') {
      cache.L = lumArray(work.getContext('2d').getImageData(0, 0, W, H));
      cache.key = 'src';
    }
    const L = cache.L, u = W / 100;
    ctx.fillStyle = '#070706';
    ctx.fillRect(0, 0, W, H);

    const st = METALS[p.metal] || METALS.gold;
    const lg = ctx.createLinearGradient(0, 0, W, H);
    [0, 0.28, 0.5, 0.74, 1].forEach((o, i) => lg.addColorStop(o, st[i]));

    const hasTitle = !!(p.title && p.title.trim());
    const ax = W * 0.115, ay = H * 0.085, aw = W - ax * 2, ah = H - ay - (hasTitle ? H * 0.155 : H * 0.085);
    const cf = Math.tan((p.contrast / 100 + 1) * Math.PI / 4);
    const lumAt = (x, y) => {
      const l = bilinear(L, W, H, ((x - ax) / aw) * (W - 1), ((y - ay) / ah) * (H - 1));
      return clamp((l - 0.5) * cf + 0.5);
    };

    ctx.fillStyle = lg;
    if (p.mode === 'lines') {
      const n = Math.round(p.density), step = ah / n, dx = Math.max(1, aw / 360);
      ctx.beginPath();
      for (let r = 0; r < n; r++) {
        const yc = ay + (r + 0.5) * step;
        const top = [], bot = [];
        for (let x = ax; x <= ax + aw + 0.001; x += dx) {
          const w = step * (0.05 + 0.9 * Math.pow(lumAt(x, yc), 0.9));
          top.push([x, yc - w / 2]); bot.push([x, yc + w / 2]);
        }
        ctx.moveTo(top[0][0], top[0][1]);
        for (const q of top) ctx.lineTo(q[0], q[1]);
        for (let k = bot.length - 1; k >= 0; k--) ctx.lineTo(bot[k][0], bot[k][1]);
        ctx.closePath();
      }
      ctx.fill();
    } else {
      const n = Math.round(p.density * 1.3), span = (82 * Math.PI) / 180;
      const cx = ax + aw / 2, cy = ay + ah * 1.02, dr = Math.max(1, ah / 300), da = (2 * span) / n;
      ctx.save();
      ctx.beginPath(); ctx.rect(ax, ay, aw, ah); ctx.clip();
      ctx.beginPath();
      for (let k = 0; k < n; k++) {
        const a = -span + (k + 0.5) * da, dxv = Math.sin(a), dyv = -Math.cos(a);
        const left = [], right = [];
        for (let r = ah * 0.04; r < ah * 1.6; r += dr) {
          const x = cx + dxv * r, y = cy + dyv * r;
          if (x < ax - 4 || x > ax + aw + 4 || y < ay - 4 || y > ay + ah + 4) { if (left.length) break; continue; }
          const w = Math.min(da * r * 0.96, da * r * (0.05 + 0.9 * Math.pow(lumAt(x, y), 0.9)));
          left.push([x - dyv * (w / 2), y + dxv * (w / 2)]);
          right.push([x + dyv * (w / 2), y - dxv * (w / 2)]);
        }
        if (left.length < 2) continue;
        ctx.moveTo(left[0][0], left[0][1]);
        for (const q of left) ctx.lineTo(q[0], q[1]);
        for (let m = right.length - 1; m >= 0; m--) ctx.lineTo(right[m][0], right[m][1]);
        ctx.closePath();
      }
      ctx.fill();
      ctx.restore();
    }

    if (p.frame) {
      ctx.strokeStyle = lg; ctx.fillStyle = lg;
      const m = u * 3.2;
      ctx.lineWidth = u * 0.5; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
      ctx.lineWidth = u * 0.2; ctx.strokeRect(m + u * 1.1, m + u * 1.1, W - 2 * (m + u * 1.1), H - 2 * (m + u * 1.1));
      // corner fans
      const fr = u * 7.5;
      const corners = [[m + u * 1.1, m + u * 1.1, 0], [W - m - u * 1.1, m + u * 1.1, 1], [W - m - u * 1.1, H - m - u * 1.1, 2], [m + u * 1.1, H - m - u * 1.1, 3]];
      ctx.lineWidth = u * 0.18;
      for (const [x, y, q] of corners) {
        const a0 = (q * Math.PI) / 2;
        for (let rr = 1; rr <= 3; rr++) { ctx.beginPath(); ctx.arc(x, y, (fr * rr) / 3, a0, a0 + Math.PI / 2); ctx.stroke(); }
        for (let k = 0; k <= 8; k++) {
          const a = a0 + (k / 8) * (Math.PI / 2);
          ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * fr * 0.34, y + Math.sin(a) * fr * 0.34); ctx.lineTo(x + Math.cos(a) * fr, y + Math.sin(a) * fr); ctx.stroke();
        }
      }
      // midpoint diamonds
      for (const [x, y] of [[W / 2, m], [W / 2, H - m], [m, H / 2], [W - m, H / 2]]) {
        ctx.beginPath(); ctx.moveTo(x, y - u * 1.6); ctx.lineTo(x + u * 1.6, y); ctx.lineTo(x, y + u * 1.6); ctx.lineTo(x - u * 1.6, y); ctx.closePath(); ctx.fillStyle = '#070706'; ctx.fill(); ctx.stroke();
      }
    }

    if (hasTitle) {
      const text = p.title.trim().toUpperCase(), size = u * 4.4, track = size * 0.32;
      ctx.font = `400 ${size}px "Bodoni Moda", Didot, "Bodoni 72", "Times New Roman", serif`;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      let total = 0; const ws = [];
      for (const ch of text) { const w = ctx.measureText(ch).width; ws.push(w); total += w + track; }
      total -= track;
      let x = (W - total) / 2; const y = H - H * 0.082;
      ctx.fillStyle = lg;
      let k = 0; for (const ch of text) { ctx.fillText(ch, x, y); x += ws[k++] + track; }
      ctx.strokeStyle = lg; ctx.lineWidth = u * 0.2;
      const gap = u * 3, lx0 = W * 0.14, lx1 = (W - total) / 2 - gap, rx0 = (W + total) / 2 + gap, rx1 = W * 0.86;
      if (lx1 > lx0) {
        ctx.beginPath(); ctx.moveTo(lx0, y); ctx.lineTo(lx1, y); ctx.moveTo(rx0, y); ctx.lineTo(rx1, y); ctx.stroke();
        for (const dxp of [lx1 + u * 0.8, rx0 - u * 0.8]) { ctx.beginPath(); ctx.moveTo(dxp, y - u * 0.7); ctx.lineTo(dxp + u * 0.7, y); ctx.lineTo(dxp, y + u * 0.7); ctx.lineTo(dxp - u * 0.7, y); ctx.closePath(); ctx.fill(); }
      }
    }
  },
});
