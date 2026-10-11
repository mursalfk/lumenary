import { Link, useLocation } from 'react-router-dom';
import { cx } from '../../utils/cx.js';
import { scrollToId } from '../../utils/scroller.js';

// Route links. A link with a hash on the current page scrolls instead of navigating.
export default function NavLinks({ items, className }) {
  const { pathname } = useLocation();
  return (
    <nav className={cx('nav-links', className)} aria-label="Sections">
      {items.map(({ to, hash, label }) => {
        const here = pathname === to;
        const onClick = hash && here ? (e) => { if (scrollToId(hash)) e.preventDefault(); } : undefined;
        return (
          <Link
            key={label}
            to={hash ? `${to}#${hash}` : to}
            onClick={onClick}
            aria-current={!hash && here ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
