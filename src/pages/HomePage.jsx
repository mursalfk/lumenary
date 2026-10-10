import { useEffect } from 'react';
import { startThumbs } from '../thumbs.js';
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import TopBar from '../components/home/TopBar.jsx';
import Hero from '../components/home/Hero.jsx';
import IndexSection from '../components/home/IndexSection.jsx';
import About from '../components/home/About.jsx';
import Footer from '../components/home/Footer.jsx';
import Grain from '../components/home/Grain.jsx';

function HomePage() {
  useEffect(() => { startThumbs(); }, []);
  return (
    <div className="home">
      <TopBar />
      <Hero />
      <IndexSection />
      <About />
      <Footer />
      <Grain />
    </div>
  );
}

export default withDocumentTitle(() => 'Twenty — twenty ways to see an image')(HomePage);
