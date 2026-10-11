import { motion } from 'motion/react';
import useTilt from '../../hooks/useTilt.js';
import withPerspective from '../../hoc/withPerspective.jsx';

// Children float on a card that leans toward the pointer and catches a moving glare.
function TiltPlate({ children }) {
  const { style, glare, bind } = useTilt({ max: 9 });
  return (
    <motion.div className="tilt-plate" style={style} {...bind}>
      {children}
      <motion.span className="glare" style={{ backgroundImage: glare }} aria-hidden="true" />
    </motion.div>
  );
}

export default withPerspective(TiltPlate, 1100);
