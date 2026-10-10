import { useId } from 'react';
import Field from '../ui/Field.jsx';
import Switch from '../ui/Switch.jsx';

export default function ToggleControl({ def, value, onChange }) {
  const id = useId();
  return (
    <Field label={def.label} htmlFor={id} inline>
      <Switch id={id} checked={value} onChange={(v) => onChange(def.key, v)} />
    </Field>
  );
}
