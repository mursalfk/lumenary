import { useRef } from 'react';
import { useScroll } from 'motion/react';
import ScrollWord from './ScrollWord.jsx';

// A paragraph whose words light up one after another as it scrolls through the viewport.
export default function ScrollWords({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.82', 'end 0.45'] });
  const words = text.split(' ');
  return (
    <p className="scroll-words" ref={ref}>
      {words.map((w, i) => {
        const a = i / words.length;
        const b = Math.min(1, a + 1.6 / words.length);
        return <ScrollWord key={i} progress={scrollYProgress} range={[a, b]}>{w} </ScrollWord>;
      })}
    </p>
  );
}
