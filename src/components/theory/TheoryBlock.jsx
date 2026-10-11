import Equation from '../ui/Equation.jsx';

// One titled passage of the theory page: a number (optional), paragraphs, equations, and a footer slot.
export default function TheoryBlock({ id, number, title, badge, paragraphs, equations, footer }) {
  return (
    <article className="theory-block" id={id}>
      <header>
        {number && <span className="num">{number}</span>}
        <h3>{title}</h3>
        {badge}
      </header>
      <div className="body">
        <div className="prose">
          {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
        </div>
        {equations.length > 0 && (
          <div className="equations">
            {equations.map((eq, i) => <Equation key={i} tex={eq.tex} note={eq.note} />)}
          </div>
        )}
        {footer}
      </div>
    </article>
  );
}
