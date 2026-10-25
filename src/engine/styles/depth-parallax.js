// src/engine/styles/depth-parallax.js
import { boxBlur, lumOf, clamp } from '../utils.js';

const BW = 520;   // the warp runs at this width and is scaled up, which keeps it fast on phones

export default {
  id: 'depth-parallax',
  name: 'Depth Parallax',
  kind: 'animated',
  maxSide: 900,
  thumbAt: 1.2,
  blurb: 'A fake depth map from brightness and position, so the flat picture shifts like a 3D scene as the cursor moves.',
  params: [
    { key: 'depth', label: 'Depth', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'focus', label: 'Focus plane', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'near', label: 'Bright is near', type: 'select', default: 'bright', options: [['bright', 'Bright is near'], ['dark', 'Dark is near']] },
    { key: 'drift', label: 'Slow drift', type: 'toggle', default: true },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, bw = 0, bh = 0, src = null, dep = null, buf = null, bctx = null, img = null, key = '', cx = 0, cy = 0, last = -1;

    function build() {
      bw = Math.min(BW, W); bh = Math.max(2, Math.round((bw * H) / W));
      const c = env.makeCanvas(bw, bh), x = c.getContext('2d'); x.drawImage(work, 0, 0, bw, bh);
      src = x.getImageData(0, 0, bw, bh).data;
      const L = new Float32Array(bw * bh);
      for (let i = 0; i < L.length; i++) L[i] = lumOf(src[i * 4], src[i * 4 + 1], src[i * 4 + 2]);
      const bl = boxBlur(boxBlur(L, bw, bh, Math.max(2, bw / 90)), bw, bh, Math.max(2, bw / 90));
      dep = new Float32Array(bw * bh);
      for (let y = 0; y < bh; y++) for (let xx = 0; xx < bw; xx++) {
        const i = y * bw + xx, tone = p.near === 'dark' ? 1 - bl[i] : bl[i];
        dep[i] = 0.62 * tone + 0.38 * (y / bh);   // lower in the frame reads as nearer
      }
      buf = env.makeCanvas(bw, bh); bctx = buf.getContext('2d'); img = bctx.createImageData(bw, bh);
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; key = ''; },
      setParams(np) { p = np; },
      draw(ctx, t, dt, ptr) {
        const k = p.near + '|' + W;
        if (k !== key) { build(); key = k; }
        // camera target: the cursor when it is over the picture, a slow figure-eight otherwise
        let tx = 0, ty = 0;
        if (ptr && ptr.inside) { tx = (ptr.x - 0.5) * 2; ty = (ptr.y - 0.5) * 2; }
        else if (p.drift) { tx = Math.sin(t * 0.8) * 0.85; ty = Math.sin(t * 1.6) * 0.3; }
        const ease = last < 0 ? 1 : 1 - Math.exp(-6 * Math.min(0.1, Math.max(0.001, dt || 0.016)));
        cx += (tx - cx) * ease; cy += (ty - cy) * ease; last = t;
        const out = img.data, strength = (p.depth / 100) * bw * 0.075, f = p.focus / 100;
        for (let y = 0; y < bh; y++) {
          const row = y * bw;
          for (let x = 0; x < bw; x++) {
            // look up the depth where the pixel lands, twice, so edges do not tear
            let d = dep[row + x], sx = x - cx * strength * (d - f), sy = y - cy * strength * 0.55 * (d - f);
            const ix = clamp(sx, 0, bw - 1) | 0, iy = clamp(sy, 0, bh - 1) | 0;
            d = dep[iy * bw + ix]; sx = x - cx * strength * (d - f); sy = y - cy * strength * 0.55 * (d - f);
            const jx = clamp(sx, 0, bw - 1) | 0, jy = clamp(sy, 0, bh - 1) | 0, s = (jy * bw + jx) * 4, o = (row + x) * 4;
            out[o] = src[s]; out[o + 1] = src[s + 1]; out[o + 2] = src[s + 2]; out[o + 3] = 255;
          }
        }
        bctx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(buf, 0, 0, W, H);
      },
      dispose() {},
    };
  },
};
