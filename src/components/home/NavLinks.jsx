import { cx } from '../../utils/cx.js';
import { jumpTo } from '../../utils/jumpTo.js';

export default function NavLinks({ items, className }) {
  return (
    <nav className={cx('nav-links', className)} aria-label="Sections">
      {items.map(({ href, label }) => <a key={href} href={href} onClick={jumpTo}>{label}</a>)}
    </nav>
  );
}
