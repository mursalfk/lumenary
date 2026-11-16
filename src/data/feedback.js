// src/data/feedback.js
// Where visitors are sent to leave feedback, and the words around it.
// `url` empty = no pop-up and no link in the top bar, so a half-set-up form can never show.
export const FEEDBACK = {
  url: 'https://tally.so/r/2jAE1M',
  label: 'Feedback',
  title: 'Two new treatments need your eyes',
  text: 'Lumenary now has 214 ways to see an image. Try a few on your own photo or a short clip, then tell me what worked and what did not. The form takes about two minutes.',
  newsTitle: 'What is new',
  news: [   // one line each; an empty list hides the section. Replace these when the next update ships.
    'Subject aware: Type Behind and Split Treatment find the subject of your picture, on your device, and treat it apart from the background.',
    '12 treatments from the last update: CCTV, Pin Art, Rotoscope, Slit-scan, Dust Snap, Tiny Planet, Phulkari and more.',
    'Bring a short video and save the result as an MP4.',
  ],
  note: 'Your pictures stay on your device. The form asks only for what you type into it.',
  open: 'Open the feedback form',
  later: 'Not now',
  delay: 900,        // milliseconds after the page opens before the pop-up appears
  snoozeDays: 7,     // "Not now" keeps the pop-up away for this many days; the top-bar link stays
};
