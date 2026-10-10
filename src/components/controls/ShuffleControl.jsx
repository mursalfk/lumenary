import Button from '../ui/Button.jsx';

// A button that bumps a counter param, re-seeding the style.
export default function ShuffleControl({ def, value, onChange }) {
  return <Button onClick={() => onChange(def.key, (value || 0) + 1)}>{def.label}</Button>;
}
