// src/components/studio/ExportSection.jsx
import Section from '../ui/Section.jsx';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Segmented from '../ui/Segmented.jsx';
import Hint from '../ui/Hint.jsx';
import VideoExport from './VideoExport.jsx';

const SCALES = [[1, '1×'], [2, '2×'], [3, '3×']];

// Saving the result. `video` holds the props of the video block and is only passed when the source is a video.
export default function ExportSection({ live, video, scale, onScale, onSave, onRecord, busy, outW, outH, note }) {
  return (
    <Section title="Export">
      {video && <VideoExport {...video} busy={busy} />}
      {!live && (
        <Field label={video ? 'Frame size' : 'Size'} labelId="export-size">
          <Segmented options={SCALES} value={scale} onChange={onScale} labelledBy="export-size" disabled={!!busy} />
        </Field>
      )}
      <div className="export-actions">
        <Button variant={video ? 'ghost' : 'solid'} onClick={onSave} disabled={!!busy}>{video ? 'Save this frame' : 'Save PNG'}</Button>
        {live && !video && <Button onClick={onRecord} disabled={!!busy}>{busy === 'rec' ? 'Recording…' : 'Record 6 s clip'}</Button>}
      </div>
      <Hint>PNG will be {outW} × {outH} px{live ? ' (the live frame)' : ''}.</Hint>
      <Hint tone="note">{note}</Hint>
    </Section>
  );
}
