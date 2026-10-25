// src/components/studio/SectionLinks.jsx
import { Link } from 'react-router-dom';
import { getSection } from '../../engine/styles/index.js';
import { cx } from '../../utils/cx.js';

// "More in this section": the treatments that share the current one's section.
export default function SectionLinks({ style }) {
  const section = getSection(style.section);
  if (!section) return null;
  return (
    <nav className="section-links" aria-label={section.title}>
      <h2>
        <Link to={`/#section-${section.id}`}><span className="letter" aria-hidden="true">{section.letter}</span>{section.title}</Link>
      </h2>
      <ul>
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
