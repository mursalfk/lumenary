import { AnimatePresence, motion } from 'motion/react';
import { STYLES } from '../../engine/styles/index.js';
import { peekThumb, useThumbCount } from '../../thumbs.js';
import useCycle from '../../hooks/useCycle.js';
import FeaturedLink from './FeaturedLink.jsx';
import TiltPlate from './TiltPlate.jsx';

// First style, from index i onward, whose preview is ready.
const firstReady = (i) => {
  for (let k = 0; k < STYLES.length; k++) {
    const s = STYLES[(i + k) % STYLES.length];
    if (peekThumb(s.id)) return s;
  }
  return STYLES[i];
};

// Cycles through the styles once their previews exist, crossfading between them.
export default function HeroCard({ className }) {
  useThumbCount(); // re-render as previews arrive
  const i = useCycle(STYLES.length, 3600);
  const style = firstReady(i);
  return (
    <div className={className}>
      <TiltPlate>
        <AnimatePresence mode="wait">
          <motion.div
            key={style.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <FeaturedLink style={style} />
          </motion.div>
        </AnimatePresence>
      </TiltPlate>
    </div>
  );
}
