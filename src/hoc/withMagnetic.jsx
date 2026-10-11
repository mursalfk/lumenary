import { motion } from 'motion/react';
import useMagnetic from '../hooks/useMagnetic.js';

// Wraps any component so it leans toward the pointer. withMagnetic(Component, strength)
export default function withMagnetic(Component, strength = 0.3) {
  function WithMagnetic(props) {
    const { style, bind } = useMagnetic(strength);
    return (
      <motion.span className="magnetic" style={style} {...bind}>
        <Component {...props} />
      </motion.span>
    );
  }
  WithMagnetic.displayName = `withMagnetic(${Component.displayName || Component.name})`;
  return WithMagnetic;
}
