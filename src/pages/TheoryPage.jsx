// src/pages/TheoryPage.jsx
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import { THEORY_GROUPS } from '../data/theoryGroups.js';
import TopBar from '../components/home/TopBar.jsx';
import Footer from '../components/home/Footer.jsx';
import Grain from '../components/home/Grain.jsx';
import TheoryHero from '../components/theory/TheoryHero.jsx';
import PortalList from '../components/portal/PortalList.jsx';
import PortalRow from '../components/portal/PortalRow.jsx';

// /theory: the way in: one row per group of theory pages.
function TheoryPage() {
  return (
    <div className="theory">
      <TopBar />
      <TheoryHero />
      <section className="theory-index">
        <PortalList label="Theory by section">
          {THEORY_GROUPS.map((g) => (
            <PortalRow
              key={g.id}
              to={`/theory/${g.id}`}
              letter={g.letter}
              title={g.title}
              blurb={g.blurb}
              meta={`${g.count} ${g.noun}`}
            />
          ))}
        </PortalList>
      </section>
      <Footer />
      <Grain />
    </div>
  );
}

export default withDocumentTitle(() => 'Theory | Lumenary')(TheoryPage);
