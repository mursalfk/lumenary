import { motion, useTransform } from 'motion/react';

// One word that brightens as the scroll progress passes through its slice.
export default function ScrollWord({ progress, range, children }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}
