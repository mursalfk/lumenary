import { STYLES } from '../../engine/styles/index.js';
import useNeighbors from '../../hooks/useNeighbors.js';
import BackLink from './BackLink.jsx';
import TitleBlock from './TitleBlock.jsx';
import StepNav from './StepNav.jsx';
import './StudioBar.scss';

export default function StudioBar({ style }) {
  const { prev, next } = useNeighbors(style);
  return (
    <header className="studio-bar">
      <BackLink>Index</BackLink>
      <TitleBlock style={style} total={STYLES.length} />
      <StepNav prev={prev} next={next} />
    </header>
  );
}
