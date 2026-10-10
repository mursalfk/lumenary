import { cx } from '../../utils/cx.js';

// variant: 'ghost' (outline) | 'solid' (filled)
export default function Button({ variant = 'ghost', className, type = 'button', ...rest }) {
  return <button type={type} className={cx('button', variant, className)} {...rest} />;
}
