// src/components/home/SectionJump.jsx
import { scrollToId } from '../../utils/scroller.js';

// A row of links that jump to each section of the index.
export default function SectionJump({ sections }) {
  const go = (id) => (e) => { if (scrollToId(id)) e.preventDefault(); };
  return (
    <nav className="section-jump" aria-label="Sections">
      {sections.map((s) => (
        <a key={s.id} href={`#section-${s.id}`} onClick={go(`section-${s.id}`)}>
          <span className="letter" aria-hidden="true">{s.letter}</span>{s.title}
        </a>
      ))}
    </nav>
  );
}
