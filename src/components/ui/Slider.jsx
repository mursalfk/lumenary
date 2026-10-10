
export default function Slider({ onChange, ...rest }) {
  return <input type="range" className="slider" onChange={(e) => onChange(parseFloat(e.target.value))} {...rest} />;
}
