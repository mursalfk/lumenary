// src/components/studio/SourceSection.jsx
import Section from '../ui/Section.jsx';
import Button from '../ui/Button.jsx';
import FilePicker from '../ui/FilePicker.jsx';
import Hint from '../ui/Hint.jsx';
import { VIDEO_LIMIT } from '../../engine/runtime.js';

// Where the picture or video comes from: pick a file, or go back to the built-in sample.
export default function SourceSection({ onFile, onReset, isSample, trimmed, loading, error }) {
  const status = error || (loading ? 'Opening the file…' : trimmed ? `Using the first ${VIDEO_LIMIT} seconds of this video.` : '');
  return (
    <Section title="Picture or video">
      <div className="image-actions">
        <FilePicker variant="solid" accept="image/*,video/*" onFile={onFile} disabled={loading}>Choose a file</FilePicker>
        <Button onClick={onReset} disabled={isSample || loading}>Use sample</Button>
      </div>
      <Hint>Drag a photo or a short video onto the preview, or paste one. Videos play up to {VIDEO_LIMIT} seconds. Everything stays on your device.</Hint>
      <Hint tone="note">{status}</Hint>
    </Section>
  );
}
