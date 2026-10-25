// src/components/theory/TheoryFacts.jsx

const LABELS = [['from', 'Comes from'], ['era', 'Around'], ['bestOn', 'Works best on']];

// Three short facts under a treatment's title. Entries that are missing are skipped.
export default function TheoryFacts({ facts }) {
  const rows = LABELS.filter(([key]) => facts && facts[key]);
  if (rows.length === 0) return null;
  return (
    <dl className="theory-facts">
      {rows.map(([key, label]) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>{facts[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
