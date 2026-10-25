// src/components/theory/TheorySteps.jsx

// The treatment in plain steps, before any mathematics.
export default function TheorySteps({ steps }) {
  return (
    <ol className="theory-steps">
      {steps.map((text, i) => <li key={i}>{text}</li>)}
    </ol>
  );
}
