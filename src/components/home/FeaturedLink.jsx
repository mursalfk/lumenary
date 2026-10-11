import { Link } from 'react-router-dom';
import Plate from '../ui/Plate.jsx';
import withThumb from '../../hoc/withThumb.jsx';
import { pad } from '../../utils/format.js';

function FeaturedLink({ style, thumb }) {
  return (
    <Link to={`/style/${style.id}`} className="featured-link" aria-label={`Open ${style.name}`}>
      <Plate src={thumb} placeholder="Preparing previews" />
      <div className="caption">
        <span className="num">{pad(style.number)}</span>
        <span className="name">{style.name}</span>
      </div>
    </Link>
  );
}

export default withThumb(FeaturedLink);
