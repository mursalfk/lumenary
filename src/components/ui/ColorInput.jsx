
export default function ColorInput({ value, onChange, ...rest }) {
  return (
    <span className="color-input">
      <code>{value}</code>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </span>
  );
}
