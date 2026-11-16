// src/hooks/useMediaInput.js
import { useCallback, useState } from 'react';
import { useSource, loadFile, resetToSample } from '../source.js';

// The shared picture or video, plus a safe loader that reports errors and says while it is opening a file.
export default function useMediaInput() {
  const src = useSource();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const take = useCallback(async (file) => {
    if (!file) return;
    setError('');
    setLoading(true);
    try { await loadFile(file); } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);
  const reset = useCallback(() => { setError(''); resetToSample(); }, []);
  return { src, take, error, loading, reset };
}
