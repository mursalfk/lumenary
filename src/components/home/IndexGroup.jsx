// src/components/home/IndexGroup.jsx
import IndexList from './IndexList.jsx';

// One section of the index: its letter, title, a line about it, and its treatments.
export default function IndexGroup({ section, onActivate, onDeactivate }) {
  return (
    <section id={`section-${section.id}`} className="index-group" aria-labelledby={`heading-${section.id}`}>
      <header>
        <span className="letter" aria-hidden="true">{section.letter}</span>
        <h3 id={`heading-${section.id}`}>{section.title}</h3>
        <p>{section.blurb}</p>
        <span className="count">{section.styles.length} treatments</span>
      </header>
      <IndexList styles={section.styles} onActivate={onActivate} onDeactivate={onDeactivate} />
    </section>
  );
}
