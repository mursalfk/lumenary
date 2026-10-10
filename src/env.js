// The browser's canvas factory, handed to every style so the engine itself never touches the DOM.
export const env = {
  makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  },
};

// Make sure the canvas fonts are really loaded before anything is drawn with them.
const SPECS = [
  '400 20px "JetBrains Mono"',
  '700 20px "JetBrains Mono"',
  '500 20px "DM Mono"',
  '900 20px "Hanken Grotesk"',
  '400 20px "Bodoni Moda"',
];
let fontsPromise = null;
export function ensureFonts() {
  if (fontsPromise) return fontsPromise;
  if (!document.fonts || !document.fonts.load) return (fontsPromise = Promise.resolve());
  const all = Promise.all(SPECS.map((s) => document.fonts.load(s, 'AaBbCc0123 .:-=+*#%@').catch(() => null)));
  const timeout = new Promise((r) => setTimeout(r, 2500));
  fontsPromise = Promise.race([all, timeout]);
  return fontsPromise;
}
