import { useEffect, useRef } from 'react';

// setInterval that always calls the latest callback. Pass null to pause.
export default function useInterval(callback, ms) {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; }, [callback]);
  useEffect(() => {
    if (ms == null) return undefined;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}
