import './TextInput.scss';

export default function TextInput({ onChange, ...rest }) {
  return <input type="text" className="text-input" spellCheck={false} onChange={(e) => onChange(e.target.value)} {...rest} />;
}
