// src/components/studio/Transport.jsx
import Button from '../ui/Button.jsx';
import Slider from '../ui/Slider.jsx';
import useVideoTransport from '../../hooks/useVideoTransport.js';
import { clock } from '../../utils/format.js';

// Play, scrub and sound for the video being previewed.
export default function Transport({ src, disabled = false }) {
  const { playing, time, muted, limit, toggle, seek, mute } = useVideoTransport(src);
  return (
    <div className="transport">
      <Button onClick={toggle} disabled={disabled}>{playing ? 'Pause' : 'Play'}</Button>
      <Slider aria-label="Position in the video" min={0} max={limit} step={0.01} value={time} onChange={seek} disabled={disabled} />
      <span className="time">{clock(time)} / {clock(limit)}</span>
      <Button onClick={mute} aria-pressed={!muted} disabled={disabled}>{muted ? 'Sound off' : 'Sound on'}</Button>
    </div>
  );
}
