import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx.js';
import { jumpTo } from '../../utils/jumpTo.js';

// A link that looks like a button. `to` = another route, `href="#id"` = a section on this page.
// variant: 'solid' | 'ghost' | 'text'
export default function ButtonLink({ to, href, variant = 'solid', className, children, ...rest }) {
  const classes = cx('button-link', variant, className);
  if (to) return <Link to={to} className={classes} {...rest}>{children}</Link>;
  return <a href={href} className={classes} onClick={jumpTo} {...rest}>{children}</a>;
}
