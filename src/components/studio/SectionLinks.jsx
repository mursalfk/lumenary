// src/components/studio/SectionLinks.jsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getSection } from '../../engine/styles/index.js';
import { cx } from '../../utils/cx.js';

// "More in this section": the treatments that share the current one's section, on one row you can
// scroll sideways. The current treatment is brought into view, so a long section never grows tall.
export default function SectionLinks({ style }) {
  const section = getSection(style.section);
  const row = useRef(null);
  useEffect(() => {
    const el = row.current && row.current.querySelector('.on');
    if (el) row.current.scrollLeft = Math.max(0, el.offsetLeft - row.current.clientWidth / 2 + el.offsetWidth / 2);
  }, [style.id]);
  if (!section) return null;
  return (
    <nav className="section-links" aria-label={section.title}>
      <h2>
        <Link to={`/section/${section.id}`}><span className="letter" aria-hidden="true">{section.letter}</span>{section.title}</Link>
        <Link to={`/section/${section.id}`} className="all">See all {section.styles.length}</Link>
      </h2>
      <ul ref={row}>
        {section.styles.map((s) => (
          <li key={s.id}>
            <Link to={`/style/${s.id}`} className={cx(s.id === style.id && 'on')} aria-current={s.id === style.id ? 'page' : undefined}>
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
