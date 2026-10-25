// src/components/theory/TheoryTerms.jsx

// Small glossary: [term, meaning] pairs.
export default function TheoryTerms({ terms }) {
  return (
    <dl className="theory-terms">
      {terms.map(([term, meaning]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
