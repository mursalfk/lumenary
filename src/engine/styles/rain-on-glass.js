// src/engine/styles/rain-on-glass.js
import { clamp, lerp, rng, TAU } from '../utils.js';

export default {
  id: 'rain-on-glass',
  name: 'Rain on Glass',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 3,
  blurb: 'A misted window with drops that run down it. Each drop turns the scene upside down, and every trail clears the fog. Move across the glass to wipe it with a finger.',
  params: [
    { key: 'rain', label: 'Rain', type: 'range', min: 5, max: 100, step: 1, default: 55 },
    { key: 'fog', label: 'Mist on the glass', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'size', label: 'Drop size', type: 'range', min: 30, max: 160, step: 1, default: 90, fmt: (v) => v + '%' },
    { key: 'run', label: 'How fast they run', type: 'range', min: 10, max: 100, step: 1, default: 50 },
    { key: 'wind', label: 'Slant', type: 'range', min: -40, max: 40, step: 1, default: 6, fmt: (v) => v + '°' },
    { key: 'seed', label: 'New shower', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, fog = null, mask = null, mctx = null, tmp = null, tctx = null, drops = [], built = '', r = rng(1), spawnAcc = 0, lastPtr = null, fade = 0;

    function build() {
      const key = [p.fog, p.rain, p.seed, W].join('|');
      if (key === built) return;
      r = rng(p.seed * 67 + 5); const sc = W / 720;
      fog = env.makeCanvas(W, H); const fx = fog.getContext('2d'), s = env.makeCanvas(Math.max(8, W / 10), Math.max(8, H / 10)), sx = s.getContext('2d');
      sx.imageSmoothingQuality = 'high'; sx.drawImage(work, 0, 0, s.width, s.height);
      fx.imageSmoothingQuality = 'high'; fx.drawImage(s, 0, 0, W, H);
      const f = p.fog / 100; fx.fillStyle = `rgba(196,208,222,${0.12 + 0.5 * f})`; fx.fillRect(0, 0, W, H);
      mask = env.makeCanvas(W, H); mctx = mask.getContext('2d'); tmp = env.makeCanvas(W, H); tctx = tmp.getContext('2d');
      drops = [];
      const n0 = Math.round((p.rain / 100) * 340 * (W * H) / (720 * 900));
      for (let i = 0; i < n0; i++) drops.push({ x: r() * W, y: r() * H, r: (1.2 + Math.pow(r(), 2.2) * 4.5) * sc, vy: 0, wait: 0, slide: false });
      const m0 = Math.round((p.rain / 100) * 16);
      for (let i = 0; i < m0; i++) drops.push(bigDrop(true));
      built = key;
    }
    function bigDrop(anywhere) { const sc = W / 720; return { x: r() * W, y: anywhere ? r() * H : -10, r: (5 + r() * 5) * sc, vy: 0, wait: r() * 1.5, slide: true, vmul: 0.6 + r() * 0.8 }; }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); dt = Math.min(dt, 0.05);
        const sc = W / 720, wind = Math.tan((p.wind * Math.PI) / 180), sizeK = p.size / 100, run = (p.run / 100) * 190 * sc;
        mctx.lineCap = 'round';
        // the mist slowly comes back
        fade += dt; if (fade > 0.12) { mctx.globalCompositeOperation = 'destination-out'; mctx.fillStyle = 'rgba(0,0,0,0.035)'; mctx.fillRect(0, 0, W, H); mctx.globalCompositeOperation = 'source-over'; fade = 0; }
        for (const d of drops) {
          if (!d.slide) continue;
          if (d.wait > 0) { d.wait -= dt; continue; }
          const px = d.x, py = d.y;
          d.vy += (run * d.vmul * (d.r / (6 * sc)) - d.vy) * Math.min(1, dt * 3);
          if (r() < dt * 0.9) { d.wait = 0.1 + r() * 0.6; d.vy *= 0.3; }
          d.y += d.vy * dt; d.x += d.vy * dt * wind + (r() - 0.5) * 12 * dt * sc;
          mctx.strokeStyle = 'rgba(255,255,255,0.9)'; mctx.shadowColor = 'rgba(255,255,255,0.9)'; mctx.shadowBlur = 3 * sc; mctx.lineWidth = d.r * 0.95 * sizeK; mctx.beginPath(); mctx.moveTo(px, py); mctx.lineTo(d.x, d.y); mctx.stroke(); mctx.shadowBlur = 0;
          if (r() < dt * 3.2) drops.push({ x: d.x + (r() - 0.5) * d.r * 0.8, y: d.y - d.r * 0.5, r: (1 + r() * 2.2) * sc, vy: 0, wait: 0, slide: false });
          if (d.y > H + 20) { Object.assign(d, bigDrop(false)); }
        }
        // fresh drops arrive and fall
        spawnAcc += dt * (p.rain / 100) * 2.2;
        while (spawnAcc >= 1) { spawnAcc -= 1; if (r() < 0.45) drops.push(bigDrop(false)); else drops.push({ x: r() * W, y: r() * H * 0.9, r: (1.5 + r() * 3) * sc, vy: 0, wait: 0, slide: false }); }
        if (drops.length > 900) drops.splice(0, drops.length - 900);
        // a finger wiping the glass
        if (ptr && ptr.inside) {
          const x = ptr.x * W, y = ptr.y * H;
          if (lastPtr) { mctx.strokeStyle = 'rgba(255,255,255,0.98)'; mctx.shadowColor = 'rgba(255,255,255,1)'; mctx.shadowBlur = W * 0.02; mctx.lineWidth = W * 0.07; mctx.beginPath(); mctx.moveTo(lastPtr[0], lastPtr[1]); mctx.lineTo(x, y); mctx.stroke(); mctx.shadowBlur = 0; }
          lastPtr = [x, y];
        } else lastPtr = null;
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        ctx.drawImage(fog, 0, 0);
        tctx.globalCompositeOperation = 'source-over'; tctx.clearRect(0, 0, W, H); tctx.drawImage(work, 0, 0, W, H);
        tctx.globalCompositeOperation = 'destination-in'; tctx.drawImage(mask, 0, 0); tctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tmp, 0, 0);
        const sizeK = p.size / 100;
        for (const d of drops) {
          const rr = d.r * sizeK; if (rr < 0.8 || d.y < -rr || d.y > H + rr) continue;
          if (rr < 2.6) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(d.x, d.y, rr, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(20,30,50,0.3)'; ctx.beginPath(); ctx.arc(d.x + rr * 0.3, d.y + rr * 0.35, rr * 0.7, 0, TAU); ctx.fill(); continue; }
          ctx.save(); ctx.beginPath(); ctx.arc(d.x, d.y, rr, 0, TAU); ctx.clip();
          ctx.translate(d.x, d.y); ctx.scale(-1, -1);
          const k = 3.2; ctx.drawImage(work, d.x - rr * k, d.y - rr * k, rr * 2 * k, rr * 2 * k, -rr, -rr, rr * 2, rr * 2);
          ctx.restore();
          const g = ctx.createRadialGradient(d.x - rr * 0.2, d.y - rr * 0.25, rr * 0.25, d.x, d.y, rr);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(10,20,40,0.12)'); g.addColorStop(1, 'rgba(10,20,40,0.5)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, rr, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(d.x - rr * 0.32, d.y - rr * 0.4, rr * 0.2, rr * 0.13, -0.6, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = Math.max(0.7, rr * 0.1); ctx.beginPath(); ctx.arc(d.x, d.y, rr - rr * 0.05, 0.2, 1.7); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = Math.max(0.6, rr * 0.07); ctx.beginPath(); ctx.arc(d.x, d.y, rr, 0, TAU); ctx.stroke();
        }
      },
      dispose() {},
    };
  },
};
