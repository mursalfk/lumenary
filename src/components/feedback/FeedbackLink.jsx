// src/components/feedback/FeedbackLink.jsx
import { FEEDBACK } from '../../data/feedback.js';
import { markDone } from '../../utils/feedbackState.js';
import { cx } from '../../utils/cx.js';

// The always-there door to the form, for the top bars. Opens in a new tab; using it also silences the pop-up.
// Where there is no room for the word (the studio bar on a phone), the stylesheet swaps it for a speech-bubble icon.
export default function FeedbackLink({ url = FEEDBACK.url, label = FEEDBACK.label, className }) {
  if (!url) return null;
  return (
    <a className={cx('feedback-link', className)} href={url} target="_blank" rel="noopener noreferrer" onClick={markDone} aria-label={label} title={label}>
      <span className="word">{label}</span>
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H10l-4.5 3.5V17H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" /></svg>
    </a>
  );
}
