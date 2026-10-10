import { STYLES } from '../engine/styles/index.js';

// Previous / next style in the index (wraps around).
export default function useNeighbors(style) {
  const i = STYLES.findIndex((s) => s.id === style.id);
  return {
    prev: STYLES[(i + STYLES.length - 1) % STYLES.length],
    next: STYLES[(i + 1) % STYLES.length],
  };
}
