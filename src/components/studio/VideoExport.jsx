// src/components/studio/VideoExport.jsx
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Segmented from '../ui/Segmented.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import Hint from '../ui/Hint.jsx';
import { VIDEO_SIDES } from '../../engine/videoExport.js';
import { clock } from '../../utils/format.js';

const SIDES = VIDEO_SIDES.map((s) => [s, `${s} px`]);

// The video part of the Export block: output size, the export button, and progress with a way to stop.
export default function VideoExport({ side, onSide, onExport, onCancel, busy, progress, width, height, seconds, supported }) {
  const working = busy === 'video';
  return (
    <div className="video-export">
      <Field label="Longest side" labelId="video-side">
        <Segmented options={SIDES} value={side} onChange={onSide} labelledBy="video-side" disabled={!!busy} />
      </Field>
      <div className="export-actions">
        {working
          ? <Button onClick={onCancel}>Stop</Button>
          : <Button variant="solid" onClick={onExport} disabled={!!busy || !supported}>Export video</Button>}
      </div>
      {working && <ProgressBar value={progress} label="Video export" />}
      <Hint>
        {supported
          ? `Video will be ${width} × ${height} px and ${clock(seconds)} long, with its sound. Every frame is rendered, so keep this tab open.`
          : 'Video export needs a current version of Chrome, Edge, Safari or Firefox.'}
      </Hint>
    </div>
  );
}
