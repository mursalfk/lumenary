// src/components/theory/TheoryRelated.jsx
import { Link } from 'react-router-dom';
import { getStyle } from '../../engine/styles/index.js';
import { pad } from '../../utils/format.js';

// Links to the theory of neighbouring treatments. Ids that are not live are skipped.
export default function TheoryRelated({ ids }) {
  const styles = ids.map(getStyle).filter(Boolean);
  if (styles.length === 0) return null;
  return (
    <ul className="theory-related">
      {styles.map((s) => (
        <li key={s.id}>
          <Link to={`/theory/${s.section}#${s.id}`}>
            <span className="num">{pad(s.number)}</span>
            {s.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
