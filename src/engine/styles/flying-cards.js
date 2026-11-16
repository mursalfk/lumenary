// src/engine/styles/flying-cards.js
import { clamp, lerp, rng, roundRect } from '../utils.js';

const TABLES = { felt: ['#1f6b4a', '#0c3524'], night: ['#1a1d2e', '#07080f'], cream: ['#efe6d2', '#cfc2a4'], wine: ['#6b1f2c', '#2e0a12'] };
const BACKS = { felt: '#8e1b2a', night: '#2c4fa8', cream: '#1f3d7a', wine: '#17324a' };

export default {
  id: 'flying-cards',
  name: 'Flying Cards',
  kind: 'animated',
  maxSide: 760,
  thumbAt: 2.6,
  blurb: 'The picture dealt out as a grid of playing cards that hang in the air: each tilts and bobs on its own, throws a shadow on the table, and turns over to show its back when the cursor passes.',
  params: [
    { key: 'cols', label: 'Cards across', type: 'range', min: 3, max: 14, step: 1, default: 6 },
    { key: 'gap', label: 'Gap', type: 'range', min: 0, max: 40, step: 1, default: 12, fmt: (v) => v + '%' },
    { key: 'tilt', label: 'Tilt', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'float', label: 'Float', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'shadow', label: 'Shadow', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'table', label: 'Table', type: 'select', default: 'felt', options: [['felt', 'Green baize'], ['night', 'Midnight'], ['cream', 'Cream'], ['wine', 'Wine']] },
    { key: 'border', label: 'White border', type: 'toggle', default: true },
    { key: 'seed', label: 'Deal again', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, cards = [], built = '', time = 0, cols = 0, rows = 0, cw = 0, ch = 0, back = null, backKey = '', lastSeed = null;

    function build() {
      const key = [p.cols, p.seed, W, H].join('|'); if (key === built) return;
      const r = rng(p.seed * 71 + 9);
      cols = p.cols; cw = W / cols; rows = Math.max(2, Math.round(H / (cw * 1.38))); ch = H / rows; cards = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) cards.push({ i, j, ph: r() * 6.283, sp: 0.7 + r() * 0.7, order: r(), flip: 0, spin: (r() - 0.5) * 5 });
      // dealt in a shuffled order, one after another
      cards.slice().sort((a, b) => a.order - b.order).forEach((c, k) => { c.at = 0.15 + (k / cards.length) * 1.5; });
      time = 0; built = key;
    }
    // the pattern on the back of every card: a lattice of small diamonds inside a white frame
    function cardBack(w, h) {
      const key = [Math.round(w), Math.round(h), p.table].join('|'); if (key === backKey) return back;
      back = env.makeCanvas(Math.ceil(w), Math.ceil(h)); const x = back.getContext('2d'), m = w * 0.09;
      x.fillStyle = '#f6f3ea'; x.fillRect(0, 0, w, h); x.fillStyle = BACKS[p.table] || BACKS.felt; x.fillRect(m, m, w - 2 * m, h - 2 * m);
      x.save(); x.beginPath(); x.rect(m, m, w - 2 * m, h - 2 * m); x.clip(); x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = Math.max(1, w * 0.012);
      const s = w * 0.14; for (let q = -h; q < w + h; q += s) { x.beginPath(); x.moveTo(q, 0); x.lineTo(q + h, h); x.stroke(); x.beginPath(); x.moveTo(q, h); x.lineTo(q + h, 0); x.stroke(); }
      x.restore(); backKey = key; return back;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      // A new video frame of the same size: the cards are painted from the picture every frame, so only the reference changes.
      setFrame(w) { work = w; },
      setParams(np) { p = np; if (lastSeed !== null && np.seed !== lastSeed) built = ''; lastSeed = np.seed; },
      step(dt, ptr) {
        build(); dt = Math.min(dt, 0.05); time += dt;
        const inside = ptr && ptr.inside, px = inside ? ptr.x * W : 0, py = inside ? ptr.y * H : 0, reach = Math.max(cw, ch) * 0.75;
        for (const c of cards) {
          const near = inside && Math.hypot((c.i + 0.5) * cw - px, (c.j + 0.5) * ch - py) < reach ? 1 : 0;
          c.flip += (near - c.flip) * Math.min(1, dt * (near ? 7 : 2.2));
        }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const [t0, t1] = TABLES[p.table] || TABLES.felt, g = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.5, Math.hypot(W, H) * 0.62);
        g.addColorStop(0, t0); g.addColorStop(1, t1);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        const gap = p.gap / 100, w = cw * (1 - gap), h = ch * (1 - gap * 0.75), rad = Math.min(w, h) * 0.07, tilt = p.tilt / 100, fl = p.float / 100, sh = p.shadow / 100, bk = cardBack(w, h);
        // where a card is and how it is turned at this moment
        const pose = (c) => {
          const e = clamp((time - c.at) / 0.75), k = 1 - Math.pow(1 - e, 3), hx = (c.i + 0.5) * cw, hy = (c.j + 0.5) * ch;
          const lift = (0.5 + 0.5 * Math.sin(time * c.sp + c.ph)) * fl * ch * 0.1, turnY = Math.sin(time * 0.8 * c.sp + c.ph * 1.7) * tilt * 0.75 + c.flip * Math.PI, turnX = Math.sin(time * 0.6 * c.sp + c.ph * 0.6) * tilt * 0.45;
          return { x: lerp(W / 2, hx, k), y: lerp(H + ch, hy, k) - lift * k, rot: (1 - k) * c.spin + Math.sin(time * 0.5 + c.ph) * tilt * 0.07, sx: Math.cos(turnY), sy: Math.cos(turnX), lift: lift * k + ch * 0.05, show: e > 0 };
        };
        const poses = cards.map(pose);
        if (sh > 0) {
          ctx.fillStyle = '#000';
          cards.forEach((c, q) => {
            const s = poses[q]; if (!s.show) return;
            // the higher a card floats, the further its shadow falls from it and the fainter it gets
            const d = s.lift * 1.5 + 5;
            ctx.save(); ctx.translate(s.x + d * 0.55, s.y + d + s.lift); ctx.rotate(s.rot); ctx.scale(Math.max(0.04, Math.abs(s.sx)) * 1.03, s.sy * 1.03);
            ctx.globalAlpha = sh * 0.34 / (1 + s.lift * 0.02); roundRect(ctx, -w / 2, -h / 2, w, h, rad); ctx.fill(); ctx.restore();
          });
        }
        cards.forEach((c, q) => {
          const s = poses[q]; if (!s.show) return;
          ctx.save(); ctx.globalAlpha = 1; ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.scale(Math.max(0.03, Math.abs(s.sx)), s.sy);
          roundRect(ctx, -w / 2, -h / 2, w, h, rad); ctx.clip();
          if (s.sx >= 0) {
            ctx.drawImage(work, c.i * cw + (cw - w) / 2, c.j * ch + (ch - h) / 2, w, h, -w / 2, -h / 2, w, h);
            if (p.border) { ctx.strokeStyle = '#f6f3ea'; ctx.lineWidth = w * 0.09; ctx.strokeRect(-w / 2, -h / 2, w, h); }
          } else ctx.drawImage(bk, -w / 2, -h / 2, w, h);
          // a card turned away from the light darkens; one turned toward it catches a sheen
          const away = 1 - Math.abs(s.sx);
          ctx.fillStyle = `rgba(0,0,0,${0.5 * away})`; ctx.fillRect(-w / 2, -h / 2, w, h);
          const lg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); lg.addColorStop(0, `rgba(255,255,255,${0.16 * (1 - away)})`); lg.addColorStop(0.5, 'rgba(255,255,255,0)');
          ctx.fillStyle = lg; ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.restore();
        });
      },
      dispose() {},
    };
  },
};
