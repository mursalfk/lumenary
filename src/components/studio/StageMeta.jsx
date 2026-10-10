
export default function StageMeta({ name, width, height, live }) {
  return (
    <div className="stage-meta">
      <span className="name">{name}</span>
      <span>{width} × {height} px · {live ? 'Live' : 'Still'}</span>
    </div>
  );
}
