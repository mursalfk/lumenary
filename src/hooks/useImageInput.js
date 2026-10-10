import { useCallback, useState } from 'react';
import { useSource, loadImageFile, resetToSample } from '../source.js';

// The shared uploaded image plus a safe loader that reports errors.
export default function useImageInput() {
  const src = useSource();
  const [error, setError] = useState('');
  const take = useCallback(async (file) => {
    if (!file) return;
    setError('');
    try { await loadImageFile(file); } catch (e) { setError(e.message); }
  }, []);
  return { src, take, error, reset: resetToSample };
}
