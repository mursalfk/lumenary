import { useEffect, useRef, useState } from 'react';
import { createRuntime } from '../engine/runtime.js';
import { env, ensureFonts } from '../env.js';

// Owns the canvas runtime for one style and keeps params + source in sync.
export default function useRuntime(style, canvasRef, params, source) {
  const rtRef = useRef(null);
  const latest = useRef({ params, source });
  const applied = useRef({ params: null, source: null });
  const [dim, setDim] = useState({ W: 0, H: 0 });
  latest.current = { params, source };

  useEffect(() => {
    const rt = createRuntime({ canvas: canvasRef.current, env, onSize: (W, H) => setDim({ W, H }) });
    const { params: p, source: s } = latest.current;
    rtRef.current = rt;
    applied.current = { params: p, source: s };
    rt.setStyle(style, p);
    rt.setSource(s.canvas);
    rt.start();
    ensureFonts().then(() => rt.invalidate());
    return () => { rt.dispose(); rtRef.current = null; };
  }, [style, canvasRef]);

  useEffect(() => {
    if (!rtRef.current || applied.current.params === params) return;
    applied.current.params = params;
    rtRef.current.setParams(params);
  }, [params]);

  useEffect(() => {
    if (!rtRef.current || applied.current.source === source) return;
    applied.current.source = source;
    rtRef.current.setSource(source.canvas);
  }, [source]);

  return { rtRef, dim };
}
