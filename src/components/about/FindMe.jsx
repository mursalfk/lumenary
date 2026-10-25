// src/components/about/FindMe.jsx
// A row of plain links to the places I write and build.
export default function FindMe({ items }) {
  return (
    <ul className="find-me" aria-label="Links">
      {items.map(({ label, href }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        </li>
      ))}
    </ul>
  );
}
