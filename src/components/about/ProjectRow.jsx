// src/components/about/ProjectRow.jsx
import { Link } from 'react-router-dom';

// One project: a title, a line about it, and where to go. External links open in a new tab.
export default function ProjectRow({ title, text, meta, to, href }) {
  const inner = (
    <>
      <span className="title">{title}</span>
      <span className="blurb">{text}</span>
      <span className="meta">{meta}</span>
      <span className="go" aria-hidden="true">{href ? '↗' : '→'}</span>
    </>
  );
  return (
    <li className="project-row">
      {to
        ? <Link to={to}>{inner}</Link>
        : <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>}
    </li>
  );
}
