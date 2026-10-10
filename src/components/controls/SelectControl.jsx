import { useId } from 'react';
import Field from '../ui/Field.jsx';
import Segmented from '../ui/Segmented.jsx';
import SelectInput from '../ui/SelectInput.jsx';

const SEGMENTED_MAX = 3;

export default function SelectControl({ def, value, onChange }) {
  const id = useId();
  const set = (v) => onChange(def.key, v);
  const short = def.options.length <= SEGMENTED_MAX;
  return short ? (
    <Field label={def.label} labelId={id}>
      <Segmented options={def.options} value={value} onChange={set} labelledBy={id} />
    </Field>
  ) : (
    <Field label={def.label} htmlFor={id}>
      <SelectInput id={id} options={def.options} value={value} onChange={set} />
    </Field>
  );
}
