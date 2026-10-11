import { useCallback, useState } from 'react';
import useDownload from './useDownload.js';

// PNG export (and WebM recording for live styles) with busy/status state.
export default function useExport(rtRef, style, animated, scale) {
  const download = useDownload();
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');

  const run = useCallback(async (kind, work) => {
    setBusy(kind);
    try { await work(); } catch (e) { setNote(e.message || 'That did not work. Try again.'); }
    setBusy('');
  }, []);

  const savePng = useCallback(() => run('png', async () => {
    setNote('');
    const blob = await rtRef.current.exportBlob(animated ? 1 : scale);
    if (!blob) throw new Error('Could not save the image. Try a smaller size.');
    download(blob, `lumenary-${style.id}.png`);
  }), [run, rtRef, animated, scale, style, download]);

  const record = useCallback(() => run('rec', async () => {
    setNote('Recording six seconds…');
    const blob = await rtRef.current.recordWebM(6);
    download(blob, `lumenary-${style.id}.webm`);
    setNote('Clip saved.');
  }), [run, rtRef, style, download]);

  return { busy, note, savePng, record };
}
