// src/data/theoryGroups.js
// The groups of the theory pages: the foundations first, then one group per enabled section.
import { SECTION_LIST } from '../engine/styles/index.js';
import { FOUNDATIONS } from './theory.js';

export const THEORY_GROUPS = [
  {
    id: 'foundations',
    letter: 'Σ',
    title: 'Foundations',
    blurb: 'The tools every treatment borrows: brightness, edges, interpolation, noise, tone, colour and compositing.',
    count: FOUNDATIONS.length,
    noun: 'topics',
    section: null,
  },
  ...SECTION_LIST.map((sec) => ({
    id: sec.id,
    letter: sec.letter,
    title: sec.title,
    blurb: sec.blurb,
    count: sec.styles.length,
    noun: 'treatments',
    section: sec,
  })),
];

export const getTheoryGroup = (id) => THEORY_GROUPS.find((g) => g.id === id);
