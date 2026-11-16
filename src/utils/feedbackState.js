// src/utils/feedbackState.js
// Remembers what a visitor did with the feedback pop-up.
//   shown   (this visit)    the pop-up already appeared once, so moving between pages does not bring it back
//   snooze  (days)          "Not now": quiet for a while
//   done    (for good)      they opened the form: never pop up again
import { safeGet, safeSet } from './safeStorage.js';
import { FEEDBACK } from '../data/feedback.js';

const SHOWN = 'lumenary.feedback.shown';
const SNOOZE = 'lumenary.feedback.snooze';
const DONE = 'lumenary.feedback.done';

export const canPrompt = () =>
  !!FEEDBACK.url &&
  !safeGet('localStorage', DONE) &&
  !safeGet('sessionStorage', SHOWN) &&
  Number(safeGet('localStorage', SNOOZE) || 0) < Date.now();

export const markShown = () => safeSet('sessionStorage', SHOWN, '1');
export const snooze = () => safeSet('localStorage', SNOOZE, String(Date.now() + FEEDBACK.snoozeDays * 86400000));
export const markDone = () => safeSet('localStorage', DONE, '1');
