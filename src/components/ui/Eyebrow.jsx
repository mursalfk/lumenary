import { cx } from '../../utils/cx.js';

export default function Eyebrow({ className, children }) {
  return <p className={cx('eyebrow', className)}>{children}</p>;
}
