import { STYLES } from '../../engine/styles/index.js';
import IndexRow from './IndexRow.jsx';

// Two columns of ten. Hovering one row dims the rest.
export default function IndexList({ onActivate, onDeactivate }) {
  return (
    <ol className="index-list" onMouseLeave={onDeactivate}>
      {STYLES.map((s) => <IndexRow key={s.id} style={s} onActivate={onActivate} onDeactivate={onDeactivate} />)}
    </ol>
  );
}
