// src/components/feedback/NewsList.jsx
// A short "what's new" list. Renders nothing when there is nothing to say.
export default function NewsList({ title, items }) {
  if (!items || !items.length) return null;
  return (
    <div className="news">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
