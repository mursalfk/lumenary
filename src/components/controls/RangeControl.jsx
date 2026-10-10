import { useId } from 'react';
import Field from '../ui/Field.jsx';
import Slider from '../ui/Slider.jsx';
import { decimals } from '../../utils/format.js';

export default function RangeControl({ def, value, onChange }) {
  const id = useId();
  const shown = def.fmt ? def.fmt(value) : Number(value).toFixed(decimals(def.step));
  return (
    <Field label={def.label} htmlFor={id} aside={<output htmlFor={id}>{shown}</output>}>
      <Slider id={id} min={def.min} max={def.max} step={def.step} value={value} onChange={(v) => onChange(def.key, v)} />
    </Field>
  );
}
