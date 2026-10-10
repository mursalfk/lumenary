import { useId } from 'react';
import Field from '../ui/Field.jsx';
import TextInput from '../ui/TextInput.jsx';

export default function TextControl({ def, value, onChange }) {
  const id = useId();
  return (
    <Field label={def.label} htmlFor={id}>
      <TextInput id={id} value={value} maxLength={def.max || 40} onChange={(v) => onChange(def.key, v)} />
    </Field>
  );
}
