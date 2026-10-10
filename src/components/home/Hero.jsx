import Eyebrow from '../ui/Eyebrow.jsx';
import DisplayTitle from './DisplayTitle.jsx';
import Cta from './Cta.jsx';
import HeroCard from './HeroCard.jsx';

export default function Hero() {
  return (
    <section className="hero">
      <Eyebrow className="kicker">An image studio · twenty treatments</Eyebrow>
      <DisplayTitle className="title" lead="Twenty" italic="ways to see" tail="an image." />
      <div className="foot">
        <p className="lede">
          Choose a treatment, drop in a photograph, adjust a few dials and take the result home.
          Everything is processed on your device, so your picture never leaves it.
        </p>
        <Cta href="#index">Enter the index</Cta>
      </div>
      <HeroCard className="card" />
    </section>
  );
}
