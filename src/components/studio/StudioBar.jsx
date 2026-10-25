// src/components/studio/StudioBar.jsx
import { STYLES } from '../../engine/styles/index.js';
import useNeighbors from '../../hooks/useNeighbors.js';
import BackLink from './BackLink.jsx';
import TitleBlock from './TitleBlock.jsx';
import StepNav from './StepNav.jsx';

export default function StudioBar({ style }) {
  const { prev, next } = useNeighbors(style);
  return (
    <header className="studio-bar">
      <BackLink to={`/#section-${style.section}`}>Index</BackLink>
      <TitleBlock style={style} total={STYLES.length} />
      <StepNav prev={prev} next={next} />
    </header>
  );
}
