import { cx } from '../../utils/cx.js';
import './Eyebrow.scss';

export default function Eyebrow({ className, children }) {
  return <p className={cx('eyebrow', className)}>{children}</p>;
}
