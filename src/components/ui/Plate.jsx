import { cx } from '../../utils/cx.js';

// Framed 4:5 preview image with a placeholder while it is being made.
export default function Plate({ src, placeholder = '', className }) {
  return (
    <div className={cx('plate', className)}>
      {src ? <img src={src} alt="" /> : <span className="wait">{placeholder}</span>}
    </div>
  );
}
