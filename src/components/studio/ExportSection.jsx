import Section from '../ui/Section.jsx';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Segmented from '../ui/Segmented.jsx';
import Hint from '../ui/Hint.jsx';

const SCALES = [[1, '1×'], [2, '2×'], [3, '3×']];

export default function ExportSection({ live, scale, onScale, onSave, onRecord, busy, outW, outH, note }) {
  return (
    <Section title="Export">
      {!live && (
        <Field label="Size" labelId="export-size">
          <Segmented options={SCALES} value={scale} onChange={onScale} labelledBy="export-size" />
        </Field>
      )}
      <div className="export-actions">
        <Button variant="solid" onClick={onSave} disabled={!!busy}>Save PNG</Button>
        {live && <Button onClick={onRecord} disabled={!!busy}>{busy === 'rec' ? 'Recording…' : 'Record 6 s clip'}</Button>}
      </div>
      <Hint>PNG will be {outW} × {outH} px{live ? ' (the live frame)' : ''}.</Hint>
      <Hint tone="note">{note}</Hint>
    </Section>
  );
}
