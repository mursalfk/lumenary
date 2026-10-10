import Control from './Control.jsx';
import './ControlList.scss';

// Renders every param of a style. `values` is the params object.
export default function ControlList({ defs, values, onChange }) {
  return (
    <div className="control-list">
      {defs.map((def) => <Control key={def.key} def={def} value={values[def.key]} onChange={onChange} />)}
    </div>
  );
}
