import './Section.scss';

// Titled block with an optional action on the right of the heading.
export default function Section({ title, action, children }) {
  return (
    <section className="section">
      <header>
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
