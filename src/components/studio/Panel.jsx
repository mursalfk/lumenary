
export default function Panel({ blurb, children }) {
  return (
    <aside className="panel">
      <p className="blurb">{blurb}</p>
      {children}
    </aside>
  );
}
