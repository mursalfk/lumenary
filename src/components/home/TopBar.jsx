import { Link } from 'react-router-dom';
import NavLinks from './NavLinks.jsx';
import { NAV_ITEMS } from '../../data/nav.js';

export default function TopBar() {
  return (
    <header className="top-bar">
      <Link to="/" className="mark">Lumenary</Link>
      <NavLinks items={NAV_ITEMS} />
    </header>
  );
}
