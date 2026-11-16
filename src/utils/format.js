// src/utils/format.js
export const pad = (n) => String(n).padStart(2, '0');
export const isLive = (style) => style.kind === 'animated';
export const kindLabel = (style) => (isLive(style) ? 'Live' : 'Still');
export const decimals = (step) => (String(step).split('.')[1] || '').length;

// Seconds as minutes and seconds: 7.4 -> "0:07".
export const clock = (seconds) => {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

// A plain estimate of the time a job still needs, from the part done (0 to 1) and the seconds spent so far.
export const timeLeft = (done, spent) => {
  if (done < 0.04 || spent < 1.5) return 'Rendering every frame…';
  const left = (spent * (1 - done)) / done;
  if (left < 8) return 'Nearly there…';
  return left < 90 ? `About ${Math.ceil(left / 5) * 5} seconds left.` : `About ${Math.ceil(left / 60)} minutes left.`;
};
