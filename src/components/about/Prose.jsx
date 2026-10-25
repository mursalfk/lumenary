// src/components/about/Prose.jsx
// Paragraphs of running text.
export default function Prose({ paragraphs }) {
  return (
    <div className="prose">
      {paragraphs.map((text) => <p key={text.slice(0, 24)}>{text}</p>)}
    </div>
  );
}
