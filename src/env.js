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
  '600 20px "Bodoni Moda"',
  '500 20px "Caveat"',
  '700 20px "Caveat"',
  '400 20px "Pinyon Script"',
];
// The Arabic-script face used for Sindhi text; it is a separate subset, so it needs its own sample characters.
const ARABIC = ['400 20px "Noto Naskh Arabic"', '700 20px "Noto Naskh Arabic"'];
let fontsPromise = null;
export function ensureFonts() {
  if (fontsPromise) return fontsPromise;
  if (!document.fonts || !document.fonts.load) return (fontsPromise = Promise.resolve());
  const all = Promise.all([
    ...SPECS.map((s) => document.fonts.load(s, 'AaBbCc0123 .:-=+*#%@').catch(() => null)),
    ...ARABIC.map((s) => document.fonts.load(s, '\u0633\u0646\u068c\u0627').catch(() => null)),
  ]);
  const timeout = new Promise((r) => setTimeout(r, 2500));
  fontsPromise = Promise.race([all, timeout]);
  return fontsPromise;
}
