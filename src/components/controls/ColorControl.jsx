import { useId } from 'react';
import Field from '../ui/Field.jsx';
import ColorInput from '../ui/ColorInput.jsx';

export default function ColorControl({ def, value, onChange }) {
  const id = useId();
  return (
    <Field label={def.label} htmlFor={id} inline>
      <ColorInput id={id} value={value} onChange={(v) => onChange(def.key, v)} />
    </Field>
  );
}
