import { cx } from '../../utils/cx.js';
import './Hint.scss';

// tone: 'hint' (muted) | 'note' (live status line)
export default function Hint({ tone = 'hint', children }) {
  return <p className={cx('hint', tone === 'note' && 'note')} role={tone === 'note' ? 'status' : undefined}>{children}</p>;
}
