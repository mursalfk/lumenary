// src/components/theory/TheorySection.jsx
import { cx } from '../../utils/cx.js';

// A titled part of a theory block: "A short history", "Where it is used", and so on.
export default function TheorySection({ title, className, children }) {
  return (
    <section className={cx('theory-section', className)}>
      <h4>{title}</h4>
      {children}
    </section>
  );
}
