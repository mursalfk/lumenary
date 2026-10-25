// src/components/theory/GroupTitle.jsx
// The big heading that opens a group on the theory page. `letter` and `text` are optional.
export default function GroupTitle({ letter, title, text }) {
  return (
    <header className="group-title">
      <h2>{letter && <span className="letter" aria-hidden="true">{letter}</span>}{title}</h2>
      {text && <p>{text}</p>}
    </header>
  );
}
