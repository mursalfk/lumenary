// src/components/about/MakerBlock.jsx
import { cx } from '../../utils/cx.js';

// One part of the page: a small heading in the left margin, the content on the right.
// Under 1000px the heading sits above the content.
export default function MakerBlock({ id, title, lead, className, children }) {
  return (
    <section id={id} className={cx('maker-block', className)}>
      <header>
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </header>
      <div className="body">{children}</div>
    </section>
  );
}
