// src/components/theory/TheoryList.jsx

// A short bulleted list of real-world uses.
export default function TheoryList({ items }) {
  return (
    <ul className="theory-list">
      {items.map((text, i) => <li key={i}>{text}</li>)}
    </ul>
  );
}
