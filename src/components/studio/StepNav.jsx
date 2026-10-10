import { Link } from 'react-router-dom';

// Round arrow links to the neighbouring styles.
export default function StepNav({ prev, next }) {
  return (
    <nav className="step-nav" aria-label="Other treatments">
      <Link to={`/style/${prev.id}`} title={prev.name} aria-label={`Previous: ${prev.name}`}>←</Link>
      <Link to={`/style/${next.id}`} title={next.name} aria-label={`Next: ${next.name}`}>→</Link>
    </nav>
  );
}
