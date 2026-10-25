// src/components/portal/PortalRow.jsx
import { Link } from 'react-router-dom';
import PortalPreview from './PortalPreview.jsx';

// One big row that opens a page: a letter, a title, a line about it, a count, and optionally a few previews.
export default function PortalRow({ to, letter, title, blurb, meta, previews = [] }) {
  return (
    <li className="portal-row">
      <Link to={to}>
        <span className="letter" aria-hidden="true">{letter}</span>
        <span className="title">{title}</span>
        <span className="blurb">{blurb}</span>
        <span className="meta">{meta}</span>
        {previews.length > 0 && (
          <span className="previews" aria-hidden="true">{previews.map((id) => <PortalPreview key={id} id={id} />)}</span>
        )}
        <span className="go" aria-hidden="true">→</span>
      </Link>
    </li>
  );
}
