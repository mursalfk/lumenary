export const pad = (n) => String(n).padStart(2, '0');
export const isLive = (style) => style.kind === 'animated';
export const kindLabel = (style) => (isLive(style) ? 'Live' : 'Still');
export const decimals = (step) => (String(step).split('.')[1] || '').length;
