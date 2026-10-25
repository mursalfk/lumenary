// src/components/portal/GroupHero.jsx
import ButtonLink from '../ui/ButtonLink.jsx';

// The top of a section page or a theory group page: back link, letter and title, a line, a count and actions.
export default function GroupHero({ back, letter, title, blurb, meta, actions }) {
  return (
    <header className="group-hero">
      <ButtonLink to={back.to} variant="text" className="back">← {back.label}</ButtonLink>
      <h1>
        {letter && <span className="letter" aria-hidden="true">{letter}</span>}
        {title}
      </h1>
      <p className="blurb">{blurb}</p>
      <div className="foot">
        <span className="meta">{meta}</span>
        {actions}
      </div>
    </header>
  );
}
