// src/components/studio/TheoryLink.jsx
import ButtonLink from '../ui/ButtonLink.jsx';
import { cx } from '../../utils/cx.js';

// Button to this treatment's entry on its section's theory page.
export default function TheoryLink({ style, className }) {
  return (
    <ButtonLink to={`/theory/${style.section}#${style.id}`} variant="ghost" className={cx('theory-link', className)}>
      Theory
    </ButtonLink>
  );
}
