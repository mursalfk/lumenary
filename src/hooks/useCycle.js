import { useState } from 'react';
import useInterval from './useInterval.js';

// Index that advances 0..length-1 on a timer.
export default function useCycle(length, ms) {
  const [i, setI] = useState(0);
  useInterval(() => setI((v) => (v + 1) % length), ms);
  return i;
}
