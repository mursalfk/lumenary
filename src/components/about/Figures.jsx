// src/components/about/Figures.jsx
import { STYLES, SECTION_LIST } from '../../engine/styles/index.js';
import { isLive } from '../../utils/format.js';

// Big numbers, counted from the treatments themselves so they are never out of date.
const figures = () => [
  { value: STYLES.length, label: 'treatments' },
  { value: SECTION_LIST.length, label: 'sections' },
  { value: STYLES.filter(isLive).length, label: 'that move' },
  { value: STYLES.reduce((n, s) => n + (s.params ? s.params.length : 0), 0), label: 'dials to turn' },
];

export default function Figures() {
  return (
    <ul className="figures" aria-label="Lumenary in numbers">
      {figures().map(({ value, label }) => (
        <li key={label}>
          <span className="value">{value}</span>
          <span className="label">{label}</span>
        </li>
      ))}
    </ul>
  );
}
