import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.2, 0.7, 0.2, 1];

// Text that rises into view one letter at a time from behind a mask.
export default function Letters({ text, delay = 0, step = 0.055 }) {
  const reduce = useReducedMotion();
  return Array.from(text).map((ch, i) => (
    <span className="letter" key={i} aria-hidden="true">
      <motion.span
        initial={reduce ? false : { y: '108%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.1, ease: EASE, delay: delay + i * step }}
      >
        {ch}
      </motion.span>
    </span>
  ));
}
