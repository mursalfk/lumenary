// src/components/ui/ProgressBar.jsx
// A thin bar for a job with a known end. `value` runs from 0 to 1.
export default function ProgressBar({ value, label }) {
  const part = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(part * 100)}>
      <div className="fill" style={{ transform: `scaleX(${part})` }} />
    </div>
  );
}
