// src/components/feedback/FeedbackPrompt.jsx
import { FEEDBACK } from '../../data/feedback.js';
import useFeedbackPrompt from '../../hooks/useFeedbackPrompt.js';
import FeedbackDialog from './FeedbackDialog.jsx';

// Mounted once, in App. Renders nothing until it is time to ask.
export default function FeedbackPrompt() {
  const { open, later, visited } = useFeedbackPrompt();
  return open ? <FeedbackDialog copy={FEEDBACK} onVisit={visited} onLater={later} /> : null;
}
