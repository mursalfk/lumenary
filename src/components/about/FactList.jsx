// src/components/about/FactList.jsx
// A plain list of labelled facts.
export default function FactList({ items }) {
  return (
    <dl className="fact-list">
      {items.map(({ label, text }) => (
        <div key={label} className="fact">
          <dt>{label}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}
