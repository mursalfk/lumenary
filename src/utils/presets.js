// src/utils/presets.js
// A preset is a handful of dial settings carried in a link, e.g. /style/halftone?size=20&ink=black.
// Anything that does not fit the treatment's own dials (unknown key, out-of-range number, option that does not
// exist) is dropped, so a hand-edited link can never put a treatment into a state its controls cannot show.

const HEX = /^#?([0-9a-f]{6})$/i;

const coerce = (def, raw) => {
  switch (def.type) {
    case 'range': {
      const n = Number(raw);
      return Number.isFinite(n) ? Math.min(def.max, Math.max(def.min, n)) : undefined;
    }
    case 'select': {
      const ok = def.options.some((o) => (Array.isArray(o) ? o[0] : o) === raw);
      return ok ? raw : undefined;
    }
    case 'toggle':
      return raw === 'true' || raw === '1' ? true : raw === 'false' || raw === '0' ? false : undefined;
    case 'shuffle': {
      const n = Math.round(Number(raw));
      return Number.isFinite(n) ? n : undefined;
    }
    case 'color': {
      const m = HEX.exec(raw);
      return m ? `#${m[1].toLowerCase()}` : undefined;
    }
    case 'text':
      return String(raw).slice(0, def.max || 40);
    default:
      return undefined;
  }
};

// Settings found in `search` that this treatment's dials accept, as { key: value }.
export function presetFromSearch(style, search) {
  const q = new URLSearchParams(search);
  const out = {};
  for (const def of style.params) {
    if (!q.has(def.key)) continue;
    const v = coerce(def, q.get(def.key));
    if (v !== undefined) out[def.key] = v;
  }
  return out;
}

// The query string for a { key: value } preset, colours without their '#'.
export function presetToSearch(set) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(set)) q.set(k, typeof v === 'string' ? v.replace(/^#/, '') : String(v));
  return `?${q.toString()}`;
}

// Is `value` acceptable for `def`? Used by the data checks, with the same rules the page applies.
export const acceptsValue = (def, value) => {
  const raw = typeof value === 'string' ? (def.type === 'color' ? value.replace(/^#/, '') : value) : String(value);
  const got = coerce(def, raw);
  if (got === undefined) return false;
  if (def.type === 'range') return got === value;
  return true;
};
