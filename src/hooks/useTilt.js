import { useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

const SPRING = { stiffness: 140, damping: 18, mass: 0.6 };

// 3D tilt toward the pointer, plus a glare that slides with it. Spread `style` on a motion element
// inside a `perspective` parent, and `bind` on the element that listens.
export default function useTilt({ max = 9 } = {}) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), SPRING);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), SPRING);
  const gx = useTransform(px, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22), transparent 55%)`;

  const bind = reduce ? {} : {
    onPointerMove: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width - 0.5);
      py.set((e.clientY - r.top) / r.height - 0.5);
    },
    onPointerLeave: () => { px.set(0); py.set(0); },
  };
  return { style: { rotateX, rotateY }, glare, bind };
}
