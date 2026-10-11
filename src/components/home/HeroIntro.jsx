import { motion, useReducedMotion } from 'motion/react';
import MagneticButtonLink from '../ui/MagneticButtonLink.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';

export default function HeroIntro() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="hero-intro"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay: 1.1 }}
    >
      <h2>Twenty ways to see an image.</h2>
      <p>
        Choose a treatment, drop in a photograph and adjust a few dials.
        Everything runs on your device, so your picture never leaves it.
      </p>
      <div className="actions">
        <MagneticButtonLink href="#index">Choose a treatment</MagneticButtonLink>
        <ButtonLink to="/theory" variant="text">How they are made</ButtonLink>
      </div>
    </motion.div>
  );
}
