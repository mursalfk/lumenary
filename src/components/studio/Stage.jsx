import { cx } from '../../utils/cx.js';

// The canvas surface. Accepts drag/drop handlers via `drop` and pointer handlers via `pointer`.
export default function Stage({ canvasRef, label, dragging, drop, pointer }) {
  return (
    <div className={cx('stage', dragging && 'dragging')} {...drop}>
      <canvas ref={canvasRef} aria-label={label} {...pointer} />
      {dragging && <div className="overlay">Drop to use this image</div>}
    </div>
  );
}
