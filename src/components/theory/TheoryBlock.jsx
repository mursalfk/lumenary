// src/components/theory/TheoryBlock.jsx
import Equation from '../ui/Equation.jsx';
import TheorySection from './TheorySection.jsx';

const TheoryMath = ({ paragraphs, equations }) => (
  <>
    <div className="prose">
      {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
    </div>
    {equations.length > 0 && (
      <div className="equations">
        {equations.map((eq, i) => <Equation key={i} tex={eq.tex} note={eq.note} />)}
      </div>
    )}
  </>
);

// One titled passage of the theory page: a number (optional), then the parts in reading order.
//   top      what comes before the mathematics (facts, why, how)
//   bottom   what comes after it (history, uses, tips, glossary, related)
//   mathHeading  gives the mathematics a heading of its own; without it the paragraphs stand bare
export default function TheoryBlock({ id, number, title, badge, top, mathHeading, paragraphs, equations, bottom, footer }) {
  return (
    <article className="theory-block" id={id}>
      <header>
        {number && <span className="num">{number}</span>}
        <h3>{title}</h3>
        {badge}
      </header>
      <div className="body">
        {top}
        {mathHeading
          ? <TheorySection title={mathHeading} className="math"><TheoryMath paragraphs={paragraphs} equations={equations} /></TheorySection>
          : <TheoryMath paragraphs={paragraphs} equations={equations} />}
        {bottom}
        {footer}
      </div>
    </article>
  );
}
