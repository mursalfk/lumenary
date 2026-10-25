// src/pages/TheoryGroupPage.jsx
import { useMemo } from 'react';
import { compose } from '../utils/compose.js';
import withRouteLookup from '../hoc/withRouteLookup.jsx';
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import useScrollSpy from '../hooks/useScrollSpy.js';
import useNeighborsIn from '../hooks/useNeighborsIn.js';
import { FOUNDATIONS } from '../data/theory.js';
import { THEORY_GROUPS, getTheoryGroup } from '../data/theoryGroups.js';
import { pad } from '../utils/format.js';
import TopBar from '../components/home/TopBar.jsx';
import Footer from '../components/home/Footer.jsx';
import Grain from '../components/home/Grain.jsx';
import GroupHero from '../components/portal/GroupHero.jsx';
import PageNeighbors from '../components/portal/PageNeighbors.jsx';
import TheoryNav from '../components/theory/TheoryNav.jsx';
import TheoryJump from '../components/theory/TheoryJump.jsx';
import TheoryBlock from '../components/theory/TheoryBlock.jsx';
import StyleTheory from '../components/theory/StyleTheory.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';

const asLink = (g) => ({ to: `/theory/${g.id}`, title: g.section ? `${g.letter}. ${g.title}` : g.title });

// /theory/:id: the theory of one section (or the foundations), one block per treatment.
function TheoryGroupPage({ group }) {
  const sec = group.section;
  const items = useMemo(
    () => (sec
      ? sec.styles.map((s) => ({ id: s.id, label: s.name, number: pad(s.number) }))
      : FOUNDATIONS.map((f) => ({ id: f.id, label: f.title }))),
    [sec]
  );
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useScrollSpy(ids);
  const { prev, next } = useNeighborsIn(THEORY_GROUPS, group.id);

  return (
    <div className="theory">
      <TopBar />
      <GroupHero
        back={{ to: '/theory', label: 'All theory' }}
        letter={group.letter}
        title={group.title}
        blurb={group.blurb}
        meta={`${group.count} ${group.noun}`}
        actions={sec && <ButtonLink to={`/section/${sec.id}`} variant="ghost">Treatments in this section</ButtonLink>}
      />
      <div className="layout">
        <TheoryNav groups={[{ title: 'On this page', items }]} active={active} />
        <TheoryJump items={items} active={active} />
        <main>
          {sec
            ? sec.styles.map((s) => <StyleTheory key={s.id} style={s} />)
            : FOUNDATIONS.map((f) => (
              <TheoryBlock key={f.id} id={f.id} title={f.title} paragraphs={f.paragraphs} equations={f.equations} />
            ))}
        </main>
      </div>
      <PageNeighbors prev={asLink(prev)} next={asLink(next)} label="Other theory pages" />
      <Footer />
      <Grain />
    </div>
  );
}

export default compose(
  withRouteLookup({ param: 'id', find: getTheoryGroup, prop: 'group' }),
  withDocumentTitle(({ group }) => `${group.title}, theory | Lumenary`)
)(TheoryGroupPage);
