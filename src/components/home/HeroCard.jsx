import { STYLES } from '../../engine/styles/index.js';
import { peekThumb, useThumbCount } from '../../thumbs.js';
import useCycle from '../../hooks/useCycle.js';
import FeaturedLink from './FeaturedLink.jsx';

// First style, from index i onward, whose preview is ready.
const firstReady = (i) => {
  for (let k = 0; k < STYLES.length; k++) {
    const s = STYLES[(i + k) % STYLES.length];
    if (peekThumb(s.id)) return s;
  }
  return STYLES[i];
};

// Cycles through the styles once their previews exist.
export default function HeroCard({ className }) {
  useThumbCount(); // re-render as previews arrive
  const i = useCycle(STYLES.length, 3200);
  return <div className={className}><FeaturedLink style={firstReady(i)} /></div>;
}
