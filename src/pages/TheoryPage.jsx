// src/pages/TheoryPage.jsx
import { useMemo } from 'react';
import withDocumentTitle from '../hoc/withDocumentTitle.jsx';
import useScrollSpy from '../hooks/useScrollSpy.js';
import { SECTION_LIST } from '../engine/styles/index.js';
import { FOUNDATIONS } from '../data/theory.js';
import { pad } from '../utils/format.js';
import TopBar from '../components/home/TopBar.jsx';
import Footer from '../components/home/Footer.jsx';
import Grain from '../components/home/Grain.jsx';
import TheoryHero from '../components/theory/TheoryHero.jsx';
import TheoryNav from '../components/theory/TheoryNav.jsx';
import TheoryBlock from '../components/theory/TheoryBlock.jsx';
import StyleTheory from '../components/theory/StyleTheory.jsx';
import GroupTitle from '../components/theory/GroupTitle.jsx';

function TheoryPage() {
  const groups = useMemo(() => [
    { title: 'Foundations', items: FOUNDATIONS.map((f) => ({ id: f.id, label: f.title })) },
    ...SECTION_LIST.map((sec) => ({
      title: `${sec.letter}. ${sec.title}`,
      items: sec.styles.map((s) => ({ id: s.id, label: s.name, number: pad(s.number) })),
    })),
  ], []);
  const ids = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups]);
  const active = useScrollSpy(ids);

  return (
    <div className="theory">
      <TopBar />
      <TheoryHero />
      <div className="layout">
        <TheoryNav groups={groups} active={active} />
        <main>
          <GroupTitle title="Foundations" />
          {FOUNDATIONS.map((f) => (
            <TheoryBlock key={f.id} id={f.id} title={f.title} paragraphs={f.paragraphs} equations={f.equations} />
          ))}
          {SECTION_LIST.map((sec) => (
            <section key={sec.id} aria-label={sec.title}>
              <GroupTitle letter={sec.letter} title={sec.title} text={sec.blurb} />
              {sec.styles.map((s) => <StyleTheory key={s.id} style={s} />)}
            </section>
          ))}
        </main>
      </div>
      <Footer />
      <Grain />
    </div>
  );
}

export default withDocumentTitle(() => 'Theory — Lumenary')(TheoryPage);
