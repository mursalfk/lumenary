// src/components/theory/TheoryJump.jsx
import SelectInput from '../ui/SelectInput.jsx';
import { scrollToId } from '../../utils/scroller.js';

// On a phone the table of contents is hidden, so this sticky menu takes its place: pick a treatment and go there.
export default function TheoryJump({ items, active }) {
  const options = items.map((it) => [it.id, it.number ? `${it.number}  ${it.label}` : it.label]);
  return (
    <div className="theory-jump">
      <SelectInput
        options={options}
        value={active}
        onChange={(id) => scrollToId(id)}
        aria-label="Jump to a treatment"
      />
    </div>
  );
}
