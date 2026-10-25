// src/hooks/useStyleParams.js
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { defaultsOf } from '../engine/runtime.js';
import { presetFromSearch } from '../utils/presets.js';

// Parameter state for one style: values, a keyed setter, and reset. A link can open the treatment with some
// dials already set (see utils/presets.js); Reset always goes back to the treatment's own defaults.
export default function useStyleParams(style) {
  const { search } = useLocation();
  const [params, setParams] = useState(() => ({ ...defaultsOf(style), ...presetFromSearch(style, search) }));
  const set = useCallback((key, value) => setParams((p) => ({ ...p, [key]: value })), []);
  const reset = useCallback(() => setParams(defaultsOf(style)), [style]);
  return { params, set, reset };
}
