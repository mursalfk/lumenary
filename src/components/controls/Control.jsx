import RangeControl from './RangeControl.jsx';
import SelectControl from './SelectControl.jsx';
import ToggleControl from './ToggleControl.jsx';
import ColorControl from './ColorControl.jsx';
import TextControl from './TextControl.jsx';
import ShuffleControl from './ShuffleControl.jsx';

// Param schema type -> control component.
const REGISTRY = {
  range: RangeControl,
  select: SelectControl,
  toggle: ToggleControl,
  color: ColorControl,
  text: TextControl,
  shuffle: ShuffleControl,
};

export default function Control({ def, ...rest }) {
  const Component = REGISTRY[def.type];
  return Component ? <Component def={def} {...rest} /> : null;
}
