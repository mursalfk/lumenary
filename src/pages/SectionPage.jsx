// src/pages/SectionPage.jsx
import { SECTION_LIST, getSection } from '../engine/styles/index.js';
import { compose } from '../utils/compose.js';
import withRouteLookup from '../hoc/withRouteLookup.jsx';
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import useNeighborsIn from '../hooks/useNeighborsIn.js';
import TopBar from '../components/home/TopBar.jsx';
import Footer from '../components/home/Footer.jsx';
import Grain from '../components/home/Grain.jsx';
import GroupHero from '../components/portal/GroupHero.jsx';
import PageNeighbors from '../components/portal/PageNeighbors.jsx';
import StyleIndex from '../components/section/StyleIndex.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';

const asLink = (s) => ({ to: `/section/${s.id}`, title: `${s.letter}. ${s.title}` });

// /section/:id: every treatment of one section.
function SectionPage({ section }) {
  const { prev, next } = useNeighborsIn(SECTION_LIST, section.id);
  return (
    <div className="section-page">
      <TopBar />
      <GroupHero
        back={{ to: '/#index', label: 'All sections' }}
        letter={section.letter}
        title={section.title}
        blurb={section.blurb}
        meta={`${section.styles.length} treatments`}
        actions={<ButtonLink to={`/theory/${section.id}`} variant="ghost">Theory of this section</ButtonLink>}
      />
      <StyleIndex styles={section.styles} />
      <PageNeighbors prev={asLink(prev)} next={asLink(next)} label="Other sections" />
      <Footer />
      <Grain />
    </div>
  );
}

export default compose(
  withRouteLookup({ param: 'id', find: getSection, prop: 'section' }),
  withDocumentTitle(({ section }) => `${section.title} | Lumenary`)
)(SectionPage);
