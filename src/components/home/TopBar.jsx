import { Link } from 'react-router-dom';
import NavLinks from './NavLinks.jsx';
import FeedbackLink from '../feedback/FeedbackLink.jsx';
import { NAV_ITEMS } from '../../data/nav.js';

export default function TopBar() {
  return (
    <header className="top-bar">
      <Link to="/" className="mark">Lumenary</Link>
      <div className="top-nav">
        <NavLinks items={NAV_ITEMS} />
        <FeedbackLink />
      </div>
    </header>
  );
}
