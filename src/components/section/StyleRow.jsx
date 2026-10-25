// src/components/section/StyleRow.jsx
import { Link } from 'react-router-dom';
import KindBadge from '../ui/KindBadge.jsx';
import withThumb from '../../hoc/withThumb.jsx';
import { isLive, pad } from '../../utils/format.js';

// One treatment in a section's list: number and name. A mouse shows its preview beside the cursor; a touch screen shows a small one in the row.
function StyleRow({ style, thumb, onActivate, onDeactivate }) {
  return (
    <li className="style-row">
      <Link
        to={`/style/${style.id}`}
        aria-label={`${style.name}. ${style.blurb}`}
        onMouseEnter={() => onActivate(style)}
        onMouseLeave={onDeactivate}
        onFocus={() => onActivate(style)}
        onBlur={onDeactivate}
      >
        <span className="num">{pad(style.number)}</span>
        <span className="name">{style.name}</span>
        {isLive(style) && <KindBadge style={style} />}
        <span className="thumb" aria-hidden="true">{thumb && <img src={thumb} alt="" />}</span>
      </Link>
    </li>
  );
}

export default withThumb(StyleRow);
