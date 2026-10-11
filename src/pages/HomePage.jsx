import { useEffect } from 'react';
import { startThumbs } from '../thumbs.js';
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import TopBar from '../components/home/TopBar.jsx';
import Hero from '../components/home/Hero.jsx';
import Manifesto from '../components/home/Manifesto.jsx';
import IndexSection from '../components/home/IndexSection.jsx';
import MethodTeaser from '../components/home/MethodTeaser.jsx';
import About from '../components/home/About.jsx';
import Footer from '../components/home/Footer.jsx';
import Grain from '../components/home/Grain.jsx';

function HomePage() {
  useEffect(() => { startThumbs(); }, []);
  return (
    <div className="home">
      <TopBar />
      <Hero />
      <Manifesto />
      <IndexSection />
      <MethodTeaser />
      <About />
      <Footer />
      <Grain />
    </div>
  );
}

export default withDocumentTitle(() => 'Lumenary — twenty ways to see an image')(HomePage);
