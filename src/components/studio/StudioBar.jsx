// src/components/studio/StudioBar.jsx
import { STYLES, getSection } from '../../engine/styles/index.js';
import useNeighbors from '../../hooks/useNeighbors.js';
import BackLink from './BackLink.jsx';
import TitleBlock from './TitleBlock.jsx';
import StepNav from './StepNav.jsx';
import TheoryLink from './TheoryLink.jsx';

export default function StudioBar({ style }) {
  const { prev, next } = useNeighbors(style);
  const section = getSection(style.section);
  return (
    <header className="studio-bar">
      <BackLink to={`/section/${style.section}`}>{section.title}</BackLink>
      <TitleBlock style={style} total={STYLES.length} />
      <div className="bar-actions">
        <TheoryLink style={style} className="in-bar" />
        <StepNav prev={prev} next={next} />
      </div>
    </header>
  );
}
