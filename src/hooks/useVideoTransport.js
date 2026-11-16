// src/hooks/useVideoTransport.js
import { useCallback, useEffect, useState } from 'react';
import { holdVideo } from '../source.js';

// Play state, position and sound of the video being previewed, with the actions a transport bar needs.
// The position is read once per animation frame while the video plays, so the scrubber moves smoothly.
export default function useVideoTransport(src) {
  const video = src.video || null, limit = src.limit || 0;
  const [state, setState] = useState({ playing: false, time: 0, muted: true });

  useEffect(() => {
    if (!video) return undefined;
    let raf = 0;
    const read = () => setState((s) => {
      const next = { playing: !video.paused, time: Math.min(video.currentTime, limit), muted: video.muted };
      return next.playing === s.playing && next.time === s.time && next.muted === s.muted ? s : next;
    });
    const loop = () => { read(); raf = requestAnimationFrame(loop); };
    const events = ['play', 'pause', 'seeked', 'volumechange'];
    events.forEach((name) => video.addEventListener(name, read));
    loop();
    return () => { cancelAnimationFrame(raf); events.forEach((name) => video.removeEventListener(name, read)); };
  }, [video, limit]);

  const toggle = useCallback(() => {
    if (!video) return;
    holdVideo(!video.paused);
    if (video.paused) video.play().catch(() => {}); else video.pause();
  }, [video]);
  const seek = useCallback((t) => { if (video) video.currentTime = Math.max(0, Math.min(limit - 0.02, t)); }, [video, limit]);
  const mute = useCallback(() => { if (video) video.muted = !video.muted; }, [video]);

  return { ...state, limit, toggle, seek, mute };
}
