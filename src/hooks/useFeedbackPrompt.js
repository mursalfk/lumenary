// src/hooks/useFeedbackPrompt.js
import { useCallback, useEffect, useState } from 'react';
import { FEEDBACK } from '../data/feedback.js';
import { canPrompt, markShown, snooze as rememberSnooze, markDone } from '../utils/feedbackState.js';

// Opens the feedback pop-up shortly after the page opens, unless the visitor has already seen it this visit,
// asked for quiet ("Not now"), or opened the form. Returns `open` and the two ways to close it.
export default function useFeedbackPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!canPrompt()) return undefined;
    const t = setTimeout(() => { markShown(); setOpen(true); }, FEEDBACK.delay);
    return () => clearTimeout(t);
  }, []);

  const later = useCallback(() => { rememberSnooze(); setOpen(false); }, []);
  const visited = useCallback(() => { markDone(); setOpen(false); }, []);
  return { open, later, visited };
}
