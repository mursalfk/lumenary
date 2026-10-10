import Section from '../ui/Section.jsx';
import Button from '../ui/Button.jsx';
import FilePicker from '../ui/FilePicker.jsx';
import Hint from '../ui/Hint.jsx';
import './ImageSection.scss';

export default function ImageSection({ onFile, onReset, isSample, error }) {
  return (
    <Section title="Image">
      <div className="image-actions">
        <FilePicker variant="solid" onFile={onFile}>Choose image</FilePicker>
        <Button onClick={onReset} disabled={isSample}>Use sample</Button>
      </div>
      <Hint>Or drop a file on the preview, or paste one. It stays on your device.</Hint>
      <Hint tone="note">{error}</Hint>
    </Section>
  );
}
