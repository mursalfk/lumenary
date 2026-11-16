// src/components/studio/Stage.jsx
import { cx } from '../../utils/cx.js';

// The canvas surface. Accepts drag/drop handlers via `drop` and pointer handlers via `pointer`.
export default function Stage({ canvasRef, label, dragging, loading, drop, pointer }) {
  return (
    <div className={cx('stage', dragging && 'dragging')} {...drop}>
      <canvas ref={canvasRef} aria-label={label} {...pointer} />
      {dragging && <div className="overlay">Drop to use this picture or video</div>}
      {loading && !dragging && <div className="overlay">Opening…</div>}
    </div>
  );
}
