// src/data/copy.js
export const AUTHOR = { name: 'Mursal', site: 'https://mursalfk.vercel.app' };

// `count` is the number of treatments that are live, spelled out.
export const manifesto = (count) =>
  'A photograph is a grid of numbers, and each treatment here is a different way of reading them. ' +
  'Some trace the edges, some turn brightness into height, some set it in type or press it in ink. ' +
  `${count} readings of one picture, all worked out in your browser, none of it sent anywhere.`;

export const METHOD = {
  title: 'Every treatment is a small experiment.',
  text:
    'Brightness, gradients, noise and a little trigonometry. The theory pages write out the mathematics ' +
    'behind every treatment, using the very equations the code runs.',
  tex: String.raw`L \;=\; 0.2126\,R \;+\; 0.7152\,G \;+\; 0.0722\,B`,
  note: 'Brightness of a pixel. Nearly every treatment begins here.',
};
