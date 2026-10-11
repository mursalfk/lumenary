import NavLinks from './NavLinks.jsx';
import Credit from './Credit.jsx';
import { NAV_ITEMS } from '../../data/nav.js';
import { AUTHOR } from '../../data/copy.js';

export default function Footer() {
  return (
    <footer className="footer">
      <Credit name={AUTHOR.name} href={AUTHOR.site} />
      <div className="row">
        <NavLinks items={NAV_ITEMS} />
        <small>Lumenary. Your pictures stay on your device.</small>
      </div>
    </footer>
  );
}
