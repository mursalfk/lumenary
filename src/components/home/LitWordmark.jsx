import { useRef } from 'react';
import { motion } from 'motion/react';
import useSpotlight from '../../hooks/useSpotlight.js';
import Letters from './Letters.jsx';

// The name, set in near-black and lit by a moving pool of light. The lit copy sits on top, masked to the light.
export default function LitWordmark({ text }) {
  const ref = useRef(null);
  const { mask, bind } = useSpotlight(ref, { radius: 360 });
  return (
    <div className="lit-wordmark" ref={ref} {...bind}>
      <h1 className="sr-only">{text}</h1>
      <div className="layer dim"><Letters text={text} /></div>
      <motion.div className="layer lit" style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <Letters text={text} />
      </motion.div>
    </div>
  );
}
