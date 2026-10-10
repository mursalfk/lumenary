import { useRef } from 'react';
import { STYLES } from '../../engine/styles/index.js';
import { useThumb } from '../../thumbs.js';
import useFollowPointer from '../../hooks/useFollowPointer.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import Plate from '../ui/Plate.jsx';
import { cx } from '../../utils/cx.js';
import './FloatingPreview.scss';

// Preview that trails the cursor while a row is hovered (mouse devices only).
export default function FloatingPreview({ style }) {
  const ref = useRef(null);
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const thumb = useThumb(style ? style.id : STYLES[0].id);
  useFollowPointer(ref, { enabled: fine });
  return (
    <div ref={ref} className={cx('floating-preview', style && thumb && 'on')} aria-hidden="true">
      <Plate src={thumb} />
    </div>
  );
}
