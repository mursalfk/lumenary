// scripts/check-theory.mjs
// Checks the theory data against the live treatments: coverage, shape, dial presets, links and dashes.
// Run it with `npm run check:theory` after writing or editing any entry in src/data/theory-extra/.
// Pass section letters to check only those: `npm run check:theory -- KLM`.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const load = (p) => import(pathToFileURL(join(src, p)).href);
const { EXTRA } = await load('data/theory-extra/index.js');
const { acceptsValue } = await load('utils/presets.js');
const { SECTIONS, slugify } = await load('data/sections.js');

const stylesDir = join(src, 'engine/styles');
const byId = new Map();
for (const f of readdirSync(stylesDir).filter((n) => n.endsWith('.js') && n !== 'index.js')) {
  const def = (await load(`engine/styles/${f}`)).default;
  byId.set(def.id, def);
}

const live = SECTIONS.filter((s) => s.enabled).flatMap((s) => s.items.map(slugify)).filter((id) => byId.has(id));
const only = process.argv[2] ? new Set(process.argv[2].toUpperCase().split('')) : null;
const want = SECTIONS.filter((s) => s.enabled && (!only || only.has(s.letter))).flatMap((s) => s.items.map(slugify));

const errors = [];
const warnings = [];
const bad = (id, msg) => errors.push(`${id}: ${msg}`);
const text = (id, key, v, min, max) => {
  if (typeof v !== 'string' || !v.trim()) return bad(id, `${key} is missing`);
  if (v.length < min) warnings.push(`${id}: ${key} is short (${v.length})`);
  if (v.length > max) warnings.push(`${id}: ${key} is long (${v.length})`);
};
const count = (id, key, list, min, max) => {
  if (!Array.isArray(list) || list.length < min || list.length > max) { bad(id, `${key} needs ${min} to ${max} items`); return false; }
  return true;
};

let entries = 0;
let words = 0;
for (const id of want) {
  const e = EXTRA[id];
  if (!e) { bad(id, 'has no entry'); continue; }
  entries += 1;
  const style = byId.get(id);
  for (const k of ['from', 'era', 'bestOn']) text(id, `facts.${k}`, (e.facts || {})[k], 4, 110);
  text(id, 'why', e.why, 220, 700);
  text(id, 'history', e.history, 220, 820);
  if (count(id, 'how', e.how, 4, 6)) e.how.forEach((h, i) => text(id, `how[${i}]`, h, 25, 230));
  if (count(id, 'uses', e.uses, 3, 4)) e.uses.forEach((h, i) => text(id, `uses[${i}]`, h, 12, 130));
  if (count(id, 'tips', e.tips, 2, 3)) {
    let withSet = 0;
    e.tips.forEach((t, i) => {
      text(id, `tips[${i}].text`, t.text, 25, 190);
      if (!t.set) return;
      withSet += 1;
      for (const [k, v] of Object.entries(t.set)) {
        const def = style.params.find((p) => p.key === k);
        if (!def) bad(id, `tip ${i}: there is no dial "${k}"`);
        else if (!acceptsValue(def, v)) bad(id, `tip ${i}: dial "${k}" rejects ${JSON.stringify(v)}`);
      }
    });
    if (withSet < 2) warnings.push(`${id}: only ${withSet} tip(s) with a preset`);
  }
  if (count(id, 'terms', e.terms, 2, 4)) {
    e.terms.forEach((t, i) => {
      if (!Array.isArray(t) || t.length !== 2) return bad(id, `terms[${i}] should be [term, meaning]`);
      text(id, `terms[${i}] term`, t[0], 3, 40);
      text(id, `terms[${i}] meaning`, t[1], 20, 190);
    });
  }
  if (count(id, 'related', e.related, 2, 4)) {
    for (const r of e.related) {
      if (r === id) bad(id, 'is related to itself');
      else if (!live.includes(r)) bad(id, `related "${r}" is not a live treatment`);
    }
  }
  const all = JSON.stringify(e);
  if (/[—–]/.test(all)) bad(id, 'contains an em or en dash');
  words += all.split(/\s+/).length;
}
for (const id of Object.keys(EXTRA)) if (!live.includes(id)) bad(id, 'has an entry but is not a live treatment');

console.log(`Theory check: ${entries} of ${want.length} entries, about ${words} words, ${errors.length} errors, ${warnings.length} warnings.`);
errors.forEach((m) => console.log('  error  ', m));
warnings.forEach((m) => console.log('  warning', m));
process.exit(errors.length ? 1 : 0);
