import './Switch.scss';

export default function Switch({ onChange, checked, ...rest }) {
  return <input type="checkbox" role="switch" className="switch" checked={!!checked} onChange={(e) => onChange(e.target.checked)} {...rest} />;
}
