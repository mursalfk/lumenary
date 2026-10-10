import AboutColumn from './AboutColumn.jsx';
import { ABOUT } from '../../data/about.js';
import './About.scss';

export default function About() {
  return (
    <section id="about" className="about">
      {ABOUT.map((item) => <AboutColumn key={item.title} {...item} />)}
    </section>
  );
}
