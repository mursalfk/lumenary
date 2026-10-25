import { STYLES } from '../engine/styles/index.js';
import useNeighborsIn from './useNeighborsIn.js';

// Previous / next style in the index (wraps around).
export default function useNeighbors(style) {
  return useNeighborsIn(STYLES, style.id);
}
