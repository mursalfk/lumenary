// src/engine/styles/split-treatment.js
import { still, clamp } from '../utils.js';
import { defaultsOf } from '../runtime.js';
import { subjectState } from '../subject/segment.js';
import { cutout, outline, waitNote } from '../subject/cutout.js';
import { findStyle } from '../registry.js';

// The subject must keep its shape, so it can only take looks that leave every pixel where it was. The world can take any.
const SUBJECT_LOOKS = [
  ['original', 'Your picture'], ['risograph', 'Risograph'], ['duotone', 'Duotone'], ['thermal-camera', 'Thermal Camera'],
  ['comic-book', 'Comic Book'], ['pixel-art', 'Pixel Art'], ['neon-glow', 'Neon Glow'],
];
const WORLD_LOOKS = [
  ['original', 'Your picture'], ['risograph', 'Risograph'], ['cyanotype', 'Cyanotype'], ['pop-art', 'Pop Art'], ['duotone', 'Duotone'],
  ['thermal-camera', 'Thermal Camera'], ['comic-book', 'Comic Book'], ['pixel-art', 'Pixel Art'], ['ascii-art', 'ASCII Art'], ['neon-glow', 'Neon Glow'],
];
const PTR = { x: 0.5, y: 0.5, down: false, inside: false };

// A picture put through one of the other treatments, at its default dials. Worked out once per picture.
function look(env, id, work, W, H, cache, slot) {
  if (id === 'original') return work;
  const have = cache[slot];
  if (have && have.id === id) return have.canvas;
  const def = findStyle(id);
  if (!def) return work;
  const r = def.create(env), c = env.makeCanvas(W, H);
  r.setSource(work, W, H);
  r.setParams(defaultsOf(def));
  r.draw(c.getContext('2d'), 0, 0, PTR);
  if (r.dispose) r.dispose();
  cache[slot] = { id, canvas: c };
  return c;
}

export default still({
  id: 'split-treatment',
  name: 'Split Treatment',
  blurb: 'Two treatments in one picture: the subject gets one, and everything behind it gets another. Keep the subject true to life and let the world around it turn into a print, a heat map or a comic.',
  maxSide: 900,
  params: [
    { key: 'subject', label: 'Subject', type: 'select', default: 'original', options: SUBJECT_LOOKS },
    { key: 'world', label: 'Everything else', type: 'select', default: 'risograph', options: WORLD_LOOKS },
    { key: 'line', label: 'Outline', type: 'range', min: 0, max: 40, step: 1, default: 6 },
    { key: 'color', label: 'Outline colour', type: 'color', default: '#f5f5f5' },
    { key: 'edge', label: 'Soft edge', type: 'range', min: 0, max: 100, step: 1, default: 35 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const st = subjectState(env, work, cache);
    if (!st.mask) { ctx.drawImage(work, 0, 0, W, H); waitNote(ctx, W, H, st.note); return; }
    ctx.drawImage(look(env, p.world, work, W, H, cache, 'worldLook'), 0, 0, W, H);
    const front = look(env, p.subject, work, W, H, cache, 'subjectLook');
    const key = [p.subject, p.edge].join('|');
    if (!cache.cut || cache.cutKey !== key) { cache.cut = cutout(env, front, st.mask, clamp(p.edge / 100)); cache.cutKey = key; cache.ring = null; }
    if (p.line > 0) {
      const rk = p.line + '|' + p.color;
      if (!cache.ring || cache.ringKey !== rk) { cache.ring = outline(env, cache.cut, p.color, (p.line * W) / 900); cache.ringKey = rk; }
      ctx.drawImage(cache.ring, 0, 0, W, H);
    }
    ctx.drawImage(cache.cut, 0, 0, W, H);
  },
});
