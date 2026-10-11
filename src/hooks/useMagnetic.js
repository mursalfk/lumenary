import { useMotionValue, useReducedMotion, useSpring } from 'motion/react';

const SPRING = { stiffness: 200, damping: 16, mass: 0.5 };

// Pulls an element a little toward the pointer while it is near. Returns `style` and `bind`.
export default function useMagnetic(strength = 0.3) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING);
  const y = useSpring(my, SPRING);
  const bind = reduce ? {} : {
    onPointerMove: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      mx.set((e.clientX - (r.left + r.width / 2)) * strength);
      my.set((e.clientY - (r.top + r.height / 2)) * strength);
    },
    onPointerLeave: () => { mx.set(0); my.set(0); },
  };
  return { style: { x, y }, bind };
}
