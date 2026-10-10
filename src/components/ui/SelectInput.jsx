
// options: [[value, label], ...]
export default function SelectInput({ options, onChange, ...rest }) {
  return (
    <select className="select-input" onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
  );
}
