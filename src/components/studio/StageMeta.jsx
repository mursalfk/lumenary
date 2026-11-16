// src/components/studio/StageMeta.jsx
// The line under the stage: what is loaded, and what the canvas is showing.
export default function StageMeta({ name, width, height, live, video }) {
  const kind = [video && 'Video', live ? 'Live' : 'Still'].filter(Boolean).join(' · ');
  return (
    <div className="stage-meta">
      <span className="name">{name}</span>
      <span>{width} × {height} px · {kind}</span>
    </div>
  );
}
