import LitWordmark from './LitWordmark.jsx';
import HeroIntro from './HeroIntro.jsx';
import HeroCard from './HeroCard.jsx';

export default function Hero() {
  return (
    <section className="hero">
      <LitWordmark text="Lumenary" />
      <div className="below">
        <HeroIntro />
        <HeroCard className="card" />
      </div>
    </section>
  );
}
