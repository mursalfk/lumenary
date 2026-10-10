import { Link } from 'react-router-dom';
import KindBadge from '../ui/KindBadge.jsx';
import withThumb from '../../hoc/withThumb.jsx';
import { pad } from '../../utils/format.js';

function IndexRow({ style, thumb, onActivate, onDeactivate }) {
  return (
    <li className="index-row">
      <Link
        to={`/style/${style.id}`}
        onMouseEnter={() => onActivate(style)}
        onMouseLeave={onDeactivate}
        onFocus={() => onActivate(style)}
        onBlur={onDeactivate}
      >
        <span className="num">{pad(style.number)}</span>
        <span className="name">{style.name}</span>
        <KindBadge style={style} />
        <span className="arrow" aria-hidden="true">→</span>
        <span className="thumb" aria-hidden="true">{thumb && <img src={thumb} alt="" />}</span>
      </Link>
    </li>
  );
}

export default withThumb(IndexRow);
