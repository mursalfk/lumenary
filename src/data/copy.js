export const AUTHOR = { name: 'Mursal', site: 'https://mursalfk.vercel.app' };

export const MANIFESTO =
  'A photograph is a grid of numbers. Each treatment here is a different way of reading them: ' +
  'some trace the edges, some turn brightness into height, some set it in type or print it in dots. ' +
  'Twenty readings of the same picture, all computed in your browser, none of it uploaded.';

export const METHOD = {
  title: 'Every treatment is arithmetic.',
  text:
    'Brightness, gradients, noise and a little trigonometry. The theory page explains the mathematics ' +
    'behind all twenty, using the equations the code actually runs.',
  tex: String.raw`L \;=\; 0.2126\,R \;+\; 0.7152\,G \;+\; 0.0722\,B`,
  note: 'Brightness of a pixel. Nearly every treatment begins here.',
};
