// src/data/theory-extra/index.js
// The fuller story of every treatment, one file per section. Each entry is keyed by the treatment's id:
//   facts    { from, era, bestOn }          three short facts shown under the title
//   why      string                         why it looks the way it does
//   how      string[]                       the treatment in four or five plain steps
//   history  string                         where it comes from
//   uses     string[]                       where it is used in the real world
//   tips     { text, set? }[]               things to try; `set` is a { dial: value } preset behind the "See it" link
//   terms    [term, meaning][]              a small glossary
//   related  string[]                       ids of neighbouring treatments
// Keep dashes out of the prose: use commas, colons and full stops.
import { EXTRA_DESIGN } from './a-design.js';
import { EXTRA_DIGITAL } from './b-digital.js';
import { EXTRA_TYPE } from './c-type.js';
import { EXTRA_LIGHT } from './d-light.js';
import { EXTRA_PHYSICAL } from './e-physical.js';
import { EXTRA_CRAFT } from './f-craft.js';
import { EXTRA_PAINTERLY } from './g-painterly.js';
import { EXTRA_OPTICAL } from './h-optical.js';
import { EXTRA_GENERATIVE_1 } from './i-generative-1.js';
import { EXTRA_GENERATIVE_2 } from './i-generative-2.js';
import { EXTRA_MOTION } from './j-motion.js';
import { EXTRA_WORLD } from './k-world.js';
import { EXTRA_SINDHI } from './l-sindhi.js';
import { EXTRA_SOUTHASIA } from './m-southasia.js';

export const EXTRA = {
  ...EXTRA_DESIGN,
  ...EXTRA_DIGITAL,
  ...EXTRA_TYPE,
  ...EXTRA_LIGHT,
  ...EXTRA_PHYSICAL,
  ...EXTRA_CRAFT,
  ...EXTRA_PAINTERLY,
  ...EXTRA_OPTICAL,
  ...EXTRA_GENERATIVE_1,
  ...EXTRA_GENERATIVE_2,
  ...EXTRA_MOTION,
  ...EXTRA_WORLD,
  ...EXTRA_SINDHI,
  ...EXTRA_SOUTHASIA,
};
