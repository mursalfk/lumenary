// src/data/theory-extra/n-subject.js
// Section N, subject aware: the fuller story of each treatment.
export const EXTRA_SUBJECT = {
  'type-behind': {
    facts: { from: 'Magazine covers and posters', era: 'Print for decades, short video lately', bestOn: 'A clear person or object against a calmer background' },
    why: 'Words usually sit on top of a picture. Set behind the subject they do the opposite: the person or object stands in front of the lettering, and the eye reads that overlap as depth without any 3D at all. The trick only works if the subject is cut out cleanly, which is why this treatment first asks a small neural network where the subject is. The network runs on your own device, so the picture is never uploaded.',
    how: [
      'Shrink a copy of the picture to 320 by 320 and feed it to a small neural network called U2-Net.',
      'The network returns a map in which every pixel scores how likely it is to belong to the main subject.',
      'Scale the map back to the size of the picture and soften its edge with a smooth curve.',
      'Draw the picture, darken it a little, then draw the words as large as the width allows, solid, outlined or both.',
      'Draw the subject back on top, cut out with the map, so the words disappear behind it.',
    ],
    history: 'Hiding one thing partly behind another is the oldest depth cue in painting, and magazines have long tucked the title behind the head of the person on the cover. Cutting the subject out used to mean tracing it by hand with a pen tool. Neural networks for finding the salient object in a picture made it automatic, and U2-Net, published in 2020 by Xuebin Qin and colleagues, is a small one that is light enough to run inside a web page.',
    uses: ['Magazine and album cover layouts', 'Titles and intros for short video', 'Posters and event announcements', 'Video thumbnails'],
    tips: [
      { text: 'One huge word behind a head is the classic cover look.', set: { rows: 1, look: 'fill', height: 30 } },
      { text: 'Outline only keeps the picture calm and the words light.', set: { look: 'outline', dim: 0 } },
      { text: 'A serif face gives it a magazine feel.', set: { font: 'serif', rows: 2 } },
    ],
    terms: [['Occlusion', 'When one object hides part of another, which tells the eye which one is in front.'], ['Salient object', 'The part of a picture that draws the eye first.'], ['Mask', 'A map of which pixels are kept and which are hidden.']],
    related: ['kinetic-type', 'newspaper', 'split-treatment'],
  },

  'split-treatment': {
    facts: { from: 'Darkroom masking and print design', era: 'A century of masks, automatic now', bestOn: 'A clear subject against a busy or plain background' },
    why: 'Most treatments change the whole frame the same way, which can bury the subject in its own style. Here the subject and its surroundings are treated separately: keep the person true to life and turn the room into a heat map, or print the subject as a risograph on a real background. The contrast between the two looks is what makes the subject stand out, and a thin outline can seal the cut.',
    how: [
      'Find the subject with a small neural network that runs on your own device, and get a map of where it is.',
      'Put the whole picture through the treatment chosen for the surroundings.',
      'Put the whole picture through the treatment chosen for the subject.',
      'Cut the subject out of its version using the map, with a softened edge.',
      'Grow the cutout into an outline, draw it over the surroundings, then draw the subject on top.',
    ],
    history: 'Photographers have treated parts of a print differently since the darkroom, shading areas with cut paper masks and dodging and burning by hand. Layer masks brought the same idea to software in the 1990s, and finding the subject automatically with a neural network is the newest step. What used to take a careful pen tool selection now takes a second.',
    uses: ['Portraits where the background should recede', 'Poster and cover artwork', 'Product shots with a stylised backdrop', 'Social media graphics'],
    tips: [
      { text: 'Keep yourself real and turn the room into a heat map.', set: { subject: 'original', world: 'thermal-camera' } },
      { text: 'A thick outline gives a sticker feel.', set: { line: 26 } },
      { text: 'Print the subject and keep the world real.', set: { subject: 'risograph', world: 'original', line: 0 } },
    ],
    terms: [['Layer mask', 'A map that decides where a layer shows and where it is hidden.'], ['Feathering', 'Softening the edge of a mask so the join does not look cut.'], ['Compositing', 'Combining several pictures into one.']],
    related: ['sticker', 'duotone', 'risograph'],
  },
};
