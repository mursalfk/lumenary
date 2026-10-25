// src/pages/AboutPage.jsx
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import { MAKER, WHO, FACTS, PROJECTS, WHY, SINDH, PRINCIPLES, COLOPHON, LINKS } from '../data/maker.js';
import TopBar from '../components/home/TopBar.jsx';
import Footer from '../components/home/Footer.jsx';
import Grain from '../components/home/Grain.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import AboutHero from '../components/about/AboutHero.jsx';
import MakerBlock from '../components/about/MakerBlock.jsx';
import Prose from '../components/about/Prose.jsx';
import FactList from '../components/about/FactList.jsx';
import ProjectList from '../components/about/ProjectList.jsx';
import PullQuote from '../components/about/PullQuote.jsx';
import Figures from '../components/about/Figures.jsx';
import Principles from '../components/about/Principles.jsx';
import FindMe from '../components/about/FindMe.jsx';

// /about: the person behind the studio, the work, and why it exists.
function AboutPage() {
  return (
    <div className="maker">
      <TopBar />
      <AboutHero />
      <MakerBlock id="maker" title={WHO.title}>
        <Prose paragraphs={WHO.paragraphs} />
        <FactList items={FACTS} />
      </MakerBlock>
      <MakerBlock id="projects" title="Work and projects">
        <ProjectList items={PROJECTS} />
      </MakerBlock>
      <MakerBlock id="why" title={WHY.title}>
        <Prose paragraphs={WHY.paragraphs} />
        <PullQuote>{WHY.quote}</PullQuote>
        <Figures />
      </MakerBlock>
      <MakerBlock id="sindh" title={SINDH.title}>
        <Prose paragraphs={SINDH.paragraphs} />
        <ButtonLink to={SINDH.link.to} variant="ghost">{SINDH.link.label}</ButtonLink>
      </MakerBlock>
      <MakerBlock id="principles" title="What it stands for">
        <Principles items={PRINCIPLES} />
      </MakerBlock>
      <MakerBlock id="colophon" title={COLOPHON.title}>
        <FactList items={COLOPHON.lines} />
      </MakerBlock>
      <MakerBlock id="find" title={LINKS.title} lead={LINKS.text}>
        <FindMe items={LINKS.items} />
      </MakerBlock>
      <Footer />
      <Grain />
    </div>
  );
}

export default withDocumentTitle(() => `About | Lumenary, by ${MAKER.name}`)(AboutPage);
