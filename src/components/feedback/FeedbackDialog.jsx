// src/components/feedback/FeedbackDialog.jsx
import { useRef } from 'react';
import Button from '../ui/Button.jsx';
import useModal from '../../hooks/useModal.js';
import NewsList from './NewsList.jsx';

// The pop-up itself. `copy` is the FEEDBACK object; `onVisit` runs when the form link is used, `onLater` for every other way out.
export default function FeedbackDialog({ copy, onVisit, onLater }) {
  const ref = useRef(null);
  useModal(ref, { active: true, onClose: onLater });
  return (
    <div className="feedback-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onLater(); }}>
      <section ref={ref} className="feedback-prompt" role="dialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-text" data-lenis-prevent>
        <h2 id="feedback-title">{copy.title}</h2>
        <p id="feedback-text" className="text">{copy.text}</p>
        <NewsList title={copy.newsTitle} items={copy.news} />
        <p className="note">{copy.note}</p>
        <div className="actions">
          <a className="button-link solid" href={copy.url} target="_blank" rel="noopener noreferrer" onClick={onVisit} data-autofocus>
            {copy.open}
          </a>
          <Button onClick={onLater}>{copy.later}</Button>
        </div>
      </section>
    </div>
  );
}
