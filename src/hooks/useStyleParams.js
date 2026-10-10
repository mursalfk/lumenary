import { useCallback, useState } from 'react';
import { defaultsOf } from '../engine/runtime.js';

// Parameter state for one style: values, a keyed setter, and reset.
export default function useStyleParams(style) {
  const [params, setParams] = useState(() => defaultsOf(style));
  const set = useCallback((key, value) => setParams((p) => ({ ...p, [key]: value })), []);
  const reset = useCallback(() => setParams(defaultsOf(style)), [style]);
  return { params, set, reset };
}
