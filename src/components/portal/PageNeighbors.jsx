// src/components/portal/PageNeighbors.jsx
import { Link } from 'react-router-dom';

// Links to the previous and the next page in a list. `prev` and `next` are { to, title }.
export default function PageNeighbors({ prev, next, label }) {
  return (
    <nav className="page-neighbors" aria-label={label}>
      <Link to={prev.to} rel="prev"><span className="dir">← Previous</span><span className="name">{prev.title}</span></Link>
      <Link to={next.to} rel="next" className="next"><span className="dir">Next →</span><span className="name">{next.title}</span></Link>
    </nav>
  );
}
