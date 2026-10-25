import AboutColumn from './AboutColumn.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import { ABOUT } from '../../data/about.js';

export default function About() {
  return (
    <section id="about" className="about">
      {ABOUT.map((item) => <AboutColumn key={item.title} {...item} />)}
      <ButtonLink to="/about" variant="text" className="about-more">More about the maker</ButtonLink>
    </section>
  );
}
