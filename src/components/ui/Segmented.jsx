import { cx } from '../../utils/cx.js';

// Radio-style pill group. options: [[value, label], ...]
export default function Segmented({ options, value, onChange, labelledBy }) {
  return (
    <div className="segmented" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map(([v, label]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className={cx(value === v && 'on')} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}
