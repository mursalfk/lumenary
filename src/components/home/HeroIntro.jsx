// src/components/home/HeroIntro.jsx
import { motion, useReducedMotion } from 'motion/react';
import MagneticButtonLink from '../ui/MagneticButtonLink.jsx';
import ButtonLink from '../ui/ButtonLink.jsx';
import { STYLES } from '../../engine/styles/index.js';
import { numberWords, capitalise } from '../../utils/words.js';

export default function HeroIntro() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="hero-intro"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay: 1.1 }}
    >
      <h2>{capitalise(numberWords(STYLES.length))} ways to see an image.</h2>
      <p>
        Choose a treatment, bring a photograph and turn the dials slowly.
        Everything is worked out on your own device, so the picture never leaves it.
      </p>
      <div className="actions">
        <MagneticButtonLink href="#index">Choose a treatment</MagneticButtonLink>
        <ButtonLink to="/theory" variant="text">How they are made</ButtonLink>
      </div>
    </motion.div>
  );
}
