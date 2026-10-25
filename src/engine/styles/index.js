// src/engine/styles/index.js
// The style registry. Every file in this folder is picked up automatically; data/sections.js decides
// which ones are shown and in what order. Adding a treatment = add a file here + its name in sections.js.
import { SECTIONS, slugify } from '../../data/sections.js';

const files = import.meta.glob(['./*.js', '!./index.js'], { eager: true });

// Every style module that exists, enabled or not. Used by tests and the roadmap.
export const ALL_STYLES = Object.values(files).map((m) => m.default);
const byId = new Map(ALL_STYLES.map((s) => [s.id, s]));

let counter = 0;

// Sections that are switched on, each with its styles in order. A style gets its running `number` and its
// `section` here, so numbers always run 1..N across whatever is currently live.
export const SECTION_LIST = SECTIONS.filter((sec) => sec.enabled).map((sec) => {
  const styles = sec.items
    .map((name) => byId.get(slugify(name)))
    .filter(Boolean)
    .map((s) => ({ ...s, number: ++counter, section: sec.id }));
  return { ...sec, styles };
});

export const STYLES = SECTION_LIST.flatMap((sec) => sec.styles);
export const getStyle = (slug) => STYLES.find((s) => s.id === slug);
export const getSection = (id) => SECTION_LIST.find((s) => s.id === id);
