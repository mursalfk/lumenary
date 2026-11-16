// src/hooks/useExport.js
import { useCallback, useEffect, useRef, useState } from 'react';
import useDownload from './useDownload.js';
import { env } from '../env.js';
import { exportVideo } from '../engine/videoExport.js';
import { timeLeft } from '../utils/format.js';

// PNG export, WebM recording for live styles and whole-video export, with busy, progress and status state.
export default function useExport(rtRef, style, animated, scale, params, src) {
  const download = useDownload();
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);

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

  // Renders the whole video through the treatment. The preview rests meanwhile, so the work gets the whole tab.
  const saveVideo = useCallback((side) => run('video', async () => {
    const control = new AbortController(), began = performance.now();
    abortRef.current = control;
    setProgress(0);
    setNote('Getting the video ready…');
    if (rtRef.current) rtRef.current.stop();
    try {
      const done = await exportVideo({
        file: src.file, style, params, env, side, signal: control.signal,
        onProgress: (p) => { setProgress(p); setNote(timeLeft(p, (performance.now() - began) / 1000)); },
      });
      download(done.blob, `lumenary-${style.id}.${done.ext}`);
      setNote(`Video saved: ${done.width} × ${done.height} px, ${done.ext.toUpperCase()}${done.lostSound ? '. This browser could not keep the sound' : ''}.`);
    } catch (e) {
      if (e.name !== 'AbortError') throw e;
      setNote('Export stopped.');
    } finally {
      abortRef.current = null;
      if (rtRef.current) rtRef.current.start();
    }
  }), [run, rtRef, style, params, src, download]);

  const cancel = useCallback(() => { if (abortRef.current) abortRef.current.abort(); }, []);
  // Leaving the page stops an export that is still running.
  useEffect(() => cancel, [cancel]);

  return { busy, note, progress, savePng, record, saveVideo, cancel };
}
