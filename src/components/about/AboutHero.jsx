// src/components/about/AboutHero.jsx
import { MAKER } from '../../data/maker.js';

// The first screen of /about: the page name very large, then the one-line story.
export default function AboutHero() {
  return (
    <section className="maker-hero">
      <h1>About</h1>
      <p className="tagline">{MAKER.tagline}</p>
      <p className="intro">{MAKER.intro}</p>
    </section>
  );
}
