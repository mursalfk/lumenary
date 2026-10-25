// src/data/theory-extra/j-motion.js
// Section J, motion and live: the fuller story of each treatment.
export const EXTRA_MOTION = {
  'rain-on-glass': {
    facts: { from: 'Weather, physics and cinema', era: 'Timeless, a shader favourite since the 2010s', bestOn: 'Cityscapes and landscapes with soft colour' },
    why: 'A misted window hides the world behind a soft blur, and a drop of water that runs down it clears a trail of sharp glass. Each drop is also a tiny lens, which shows the scene behind it upside down. The mood is one of shelter: the weather outside, a quiet view in, and your finger drawing a line through the fog.',
    how: [
      'Make the mist from the picture shrunk to a tenth of its size and enlarged again, tinted pale blue-grey, with opacity from 0.12 to 0.62 set by the mist slider.',
      'Keep a hidden mask of where the glass has been cleared, and draw the sharp picture over the mist wherever the mask is white.',
      'Let small drops sit still and larger ones run down in jerks, leaving a trail that clears the mask.',
      'Draw each drop as a little lens that shows the scene upside down, with a highlight and a shadow.',
      'Every 0.12 seconds reduce the mask by 3.5 percent so the mist slowly returns, and wipe a soft stroke 7 percent of the width wide where the pointer moves.',
    ],
    history: 'Condensation and raindrops on windows are as old as glass, and photographers have long used them to frame a mood, from film noir streets to the wet neon cities of science fiction. In computer graphics, a rain-on-glass shader became a popular exercise in the late 2010s because it combines lenses, blur and simple physics in a few lines.',
    uses: ['Film and game atmospheres', 'Calming screensavers and backgrounds', 'Photo and video overlays', 'Teaching refraction with water drops'],
    tips: [
      { text: 'Heavy rain on thick mist hides the view almost completely.', set: { rain: 90, fog: 90 } },
      { text: 'Big, slow drops show the upside-down scene clearly.', set: { size: 150, run: 20 } },
      { text: 'Wind slants the trails like a storm.', set: { wind: 35, rain: 80 } },
    ],
    terms: [['Condensation', 'Water vapour turning to liquid on a cool surface.'], ['Refraction', 'The bending of light as it passes from one material to another.'], ['Mask', 'A hidden layer that says where an effect is applied.']],
    related: ['frosted-ice', 'glass-refraction', 'ink-in-water'],
  },

  'heat-haze': {
    facts: { from: 'Optics and atmospheric science', era: 'Understood since the 17th century', bestOn: 'Landscapes, roads and skylines' },
    why: 'Warm air is thinner than cool air, and thinner air bends light a little less. Over a hot road the air is a shifting mix of slightly different densities, so the rays of light that cross it are bent from moment to moment and the view wobbles. The ripples rise because the warm air itself rises.',
    how: [
      'Use the Gladstone-Dale relation n − 1 = Kρ: the refractive index depends on density, and density depends on temperature, ρ ∝ 1/T at constant pressure.',
      'Build a displacement field from fractal noise stretched vertically (horizontal frequency 1.3 times the vertical 0.45, in units of ripple size).',
      'Scroll the noise upward as time passes, so the ripples rise.',
      'Read the picture at each pixel’s displaced position, stronger near the heat source (the bottom, the centre, or everywhere).',
      'Shift the red and blue channels slightly apart for colour fringes, and add a warm tint where it is hottest.',
    ],
    history: 'In the seventeenth century Robert Hooke noticed that hot air rising from a candle bends light, and in 1864 August Toepler built the schlieren method to photograph such invisible flows. Mirages on deserts and roads are the same effect on a bigger scale. Stars twinkle for a similar reason, and astronomers call the blur the seeing.',
    uses: ['Heat shimmer over roads, engines and fires in film and games', 'Schlieren photography of airflow and shock waves', 'Teaching refraction and mirages', 'Dreamy or desert atmospheres'],
    tips: [
      { text: 'Heat from everywhere shakes the whole picture.', set: { source: 'all', strength: 70 } },
      { text: 'Fine, quick ripples look like a desert road.', set: { scale: 15, speed: 80 } },
      { text: 'Strong colour fringes and a warm tint make a fierce furnace.', set: { split: 85, warm: 90 } },
    ],
    terms: [['Refractive index', 'A number that says how much a material slows and bends light.'], ['Mirage', 'An image bent by layers of air at different temperatures.'], ['Schlieren', 'A method of photographing changes in air density.']],
    related: ['rain-on-glass', 'chromatic-aberration', 'domain-warp'],
  },

  fireflies: {
    facts: { from: 'Nature and folklore', era: 'Timeless', bestOn: 'Landscapes, gardens and night pictures' },
    why: 'A firefly makes light by chemistry, with almost no heat, and blinks it as a signal. The sky of a summer night, the quiet and a few drifting sparks give a special mood, and a picture seen only by these points of light becomes a place you discover bit by bit. Each one lights the patch beneath it.',
    how: [
      'Give each firefly a position, heading and its own rhythm, and let the heading drift smoothly: its rate of change is 5 × (n − ½) where n is slow noise.',
      'Move it at the speed set by the slider with a slight upward float, and let it re-enter at the opposite edge.',
      'When the pointer is in the picture, pull fireflies in: within half the picture’s width the pull is 55 px per second at the pointer, falling off linearly.',
      'Blink each on its own period of 1.4 to 3.8 seconds and its own phase, with brightness b = lerp(1, w^2.2, blink).',
      'Darken the picture by the night value and add a soft glow from each firefly, revealing the picture beneath.',
    ],
    history: 'Fireflies produce light with luciferin and the enzyme luciferase in a reaction that gives off very little heat. In Japan, hotaru-gari, going to watch fireflies, has been a summer pastime for centuries. Some species in Southeast Asia and in the Great Smoky Mountains blink together, a synchrony that biologists and mathematicians such as Steven Strogatz have studied as an example of coupled oscillators.',
    uses: ['Atmospheric scenes in film, games and websites', 'Teaching bioluminescence and synchrony', 'Summer and fairytale designs', 'Ambient screensavers'],
    tips: [
      { text: 'A few amber fireflies on a very dark night feel like embers.', set: { count: 20, night: 95, colour: 'amber' } },
      { text: 'A big swarm with strong blinking gives a festival.', set: { count: 150, blink: 100 } },
      { text: 'Pink and wide glow looks like a fairytale.', set: { colour: 'pink', glow: 130 } },
    ],
    terms: [['Bioluminescence', 'Light produced by a living thing through chemistry.'], ['Luciferase', 'The enzyme that makes fireflies glow.'], ['Coupled oscillators', 'Rhythms that influence each other and can fall into step.']],
    related: ['bokeh', 'neon-glow', 'snowfall'],
  },

  'ink-in-water': {
    facts: { from: 'Fluid dynamics and Japanese marbling', era: 'Suminagashi, 12th century, curl noise 2007', bestOn: 'Colourful pictures, where the ink takes colour' },
    why: 'Ink in still water does two things at once. Slow currents carry it along, and diffusion spreads it out. Real water moves without bunching up or leaving gaps, so the ink curls and blooms in long wisps. The program uses a flow with that same property, and each wisp carries the colour of the picture where it was released.',
    how: [
      'Release a drop as a burst of about 380 particles (times the ink slider) in a disc 9 px across, each with a small outward push.',
      'Carry every particle with a flow from curl noise: if ψ is smooth noise, the velocity v = (∂ψ/∂y, −∂ψ/∂x) has zero divergence, so the flow is incompressible.',
      'Measure the gradient by central differences over 6 px and damp the velocity by 0.9 per step so particles follow the current.',
      'Give each particle the colour of the picture where it was released and draw up to 6,500 of them as translucent, soft sprites.',
      'Fade the ink slowly, by the linger value, so old wisps thin out.',
    ],
    history: 'Suminagashi, the Japanese art of floating ink on water and lifting the pattern onto paper, dates to the twelfth century. In 1883 Osborne Reynolds released a thread of dye in a glass pipe to show how smooth flow turns into turbulence. Robert Bridson, Jim Hourihan and Marcus Nordenstam introduced curl noise to computer graphics in 2007 as a cheap way to make convincing fluid motion.',
    uses: ['Smoke, fluid and magic effects in film and games', 'Marbling and paper art', 'Flow visualisation in engineering', 'Calming backgrounds'],
    tips: [
      { text: 'Strong currents and long lingering ink make dramatic ribbons.', set: { flow: 90, linger: 95 } },
      { text: 'Tiny curls feel like smoke.', set: { scale: 12, amount: 40 } },
      { text: 'Ink on a dark pool glows.', set: { water: 'dark', rate: 70 } },
    ],
    terms: [['Advection', 'Being carried along by a flow.'], ['Diffusion', 'Spreading out from a crowded place to an emptier one.'], ['Curl noise', 'Noise turned into a flow that never bunches up.']],
    related: ['domain-warp', 'liquid-morph', 'watercolour'],
  },

  snowfall: {
    facts: { from: 'Photography, animation and weather', era: 'Multiplane camera 1937', bestOn: 'Landscapes with depth, houses and trees' },
    why: 'A few flakes at three depths make a room of space. Near flakes are big, fast and soft, because they are out of focus, while far ones are small, slow, sharp and faint. That mix of motion parallax and atmospheric perspective is what the brain uses to judge distance, so the snow makes the picture feel deep, with a cold light settling on it.',
    how: [
      'Give each flake a depth z between 0 and 1, drawn as u^1.6 so most are far away.',
      'Make near flakes larger (radius 2.2 + 14 z² px), faster (0.35 + 1.1 z times the base speed) and more transparent and soft, with opacity from 0.45 to 0.95.',
      'Move each downward at (14 + 90 × fall) × (0.35 + 1.1 z) px per second, with a sideways drift from the wind and a gentle sway.',
      'Steer the wind with the cursor and wrap flakes at the edges.',
      'Tint the picture with a cold light and add a drift of snow along the ground.',
    ],
    history: 'The Walt Disney studio built a multiplane camera and used it for The Old Mill in 1937, placing painted glass layers at different distances to make parallax in animation. Wilson Bentley photographed snowflakes under a microscope from 1885, and Ukichiro Nakaya classified snow crystals in the 1930s. The snow globe, a favourite souvenir, goes back to the nineteenth century.',
    uses: ['Winter scenes in games, film and websites', 'Holiday cards and greetings', 'Teaching depth cues and parallax', 'Calming backgrounds'],
    tips: [
      { text: 'A blizzard needs heavy snow and strong wind.', set: { amount: 100, wind: 80, fall: 70 } },
      { text: 'Few, large, slow flakes feel quiet and dreamy.', set: { amount: 20, size: 150, fall: 15 } },
      { text: 'Strong frost and ground snow make a deep winter.', set: { frost: 90, drift: 90 } },
    ],
    terms: [['Motion parallax', 'Near things appear to move faster than far things.'], ['Atmospheric perspective', 'Distant things look paler and less sharp.'], ['Multiplane camera', 'A camera that shoots layers at different distances to create depth.']],
    related: ['fireflies', 'rain-on-glass', 'depth-parallax'],
  },
};
