// src/components/home/IndexList.jsx
import IndexRow from './IndexRow.jsx';

// Two columns, filled top to bottom. Hovering one row dims the rest.
export default function IndexList({ styles, onActivate, onDeactivate }) {
  const rows = Math.ceil(styles.length / 2);
  return (
    <ol className="index-list" style={{ '--rows': rows }} onMouseLeave={onDeactivate}>
      {styles.map((s) => <IndexRow key={s.id} style={s} onActivate={onActivate} onDeactivate={onDeactivate} />)}
    </ol>
  );
}
