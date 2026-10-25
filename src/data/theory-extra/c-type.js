// src/data/theory-extra/c-type.js
// Section C, typographic: the fuller story of each treatment.
export const EXTRA_TYPE = {
  'kinetic-type': {
    facts: { from: 'Film titles and motion graphics', era: '1950s onward', bestOn: 'Colourful, busy pictures that fill the frame' },
    why: 'Type is usually something you read, but set huge and moving it becomes a window. This treatment fills the screen with heavy words that slide in alternating directions, and lets the picture show only through the letters. Because every row travels at its own speed and starts at its own phase, the composition never repeats exactly.',
    how: [
      'Set the words in an extra heavy typeface and repeat them along each row with a gap.',
      'Slide every row at its own speed, alternating direction, with each row starting at a different phase.',
      'Draw all filled rows in white on a separate mask.',
      'Brighten the picture with a gamma curve and keep it only where the mask is opaque.',
      'Draw the outline rows as strokes on top of the background.',
    ],
    history: 'Moving type became a craft in the 1950s and 60s through title designers such as Saul Bass, whose opening for North by Northwest in 1959 is often cited as an early landmark. Desktop animation software in the 1990s opened it to everyone, and lyric videos, sports promos and social media captions now rely on it constantly.',
    uses: ['Opening titles and lyric videos', 'Event and festival promos', 'Social media headline graphics', 'Looping website banners'],
    tips: [
      { text: 'Fewer, bigger rows let the picture read through clearly.', set: { rows: 4, lift: 70 } },
      { text: 'Many rows at high speed feel like a ticker wall.', set: { rows: 11, speed: 80 } },
      { text: 'Use your own word.', set: { text: 'HELLO' } },
    ],
    terms: [['Kinetic typography', 'Text that moves as part of the design.'], ['Mask', 'A shape that decides which parts of an image stay visible.'], ['Gamma curve', 'A curve that brightens or darkens mid tones without changing black and white.']],
    related: ['ticker-text', 'split-flap', 'newspaper'],
  },

  'split-flap': {
    facts: { from: 'Railway stations and airports', era: '1950s to the 2000s', bestOn: 'High contrast pictures with simple shapes' },
    why: 'A split-flap board has no screen: each character is a drum of flaps, and to change a letter the drum clatters through every character in between. This treatment recreates that. A cell showing a target number flips that many times, and since cells start with different delays the picture resolves as a ripple across the board.',
    how: [
      'Turn the picture into a grid of cells and read the brightness of each.',
      'Pick a target position on the drum from the brightness: a ten symbol drum from blank to heavy, or letters and digits.',
      'Flip each cell through that many flaps at 70 milliseconds a flap.',
      'Delay each cell according to its row, column and a little random hash, so the picture appears in a diagonal wave.',
      'Draw each flap in two halves: the top shrinks towards the hinge, then the new bottom opens out.',
    ],
    history: 'Flap displays were developed in the 1950s, and the Italian company Solari di Udine made them a fixture of railway stations and airports across the world. Their rhythm of clacking was one of the sounds of travel until LED and LCD boards replaced most of them in the 2000s and 2010s. Some are still kept for their charm.',
    uses: ['Departure board style title graphics', 'Retro station and travel themed posters', 'Intros and countdowns', 'Reveal animations'],
    tips: [
      { text: 'Letters and digits make the picture spell out its tones.', set: { charset: 'alnum' } },
      { text: 'More tiles give a sharper reveal.', set: { cols: 70 } },
      { text: 'Original colours turn it into a flipping mosaic.', set: { color: 'original', cols: 30 } },
    ],
    terms: [['Drum', 'The rotating spool of flaps that carries the characters.'], ['Hinge', 'The line along which each flap turns.'], ['Hash', 'A function that gives repeatable pseudo-random numbers from inputs.']],
    related: ['ticker-text', 'kinetic-type', 'lego-voxel'],
  },

  handwritten: {
    facts: { from: 'Notebooks and calligrams', era: 'Ancient, with calligrams from 1918', bestOn: 'Portraits and high contrast scenes' },
    why: 'When we write by hand we press harder, and write bigger, when we are in a hurry or mean something strongly. This treatment turns that human variation into tone. Dark parts of the picture get large, heavy, dark letters, and light parts are left as bare paper, so a picture appears out of a handwritten sentence.',
    how: [
      'Draw the page: paper, ruled lines or grid, a red margin and three binder holes.',
      'Stretch the picture so its darkest 2 percent are black and its lightest 2 percent white, then blur it.',
      'Write the sentence one letter at a time, line after line, starting again when it runs out.',
      'For each letter, read the darkness above its baseline and make it larger, bolder and more opaque where it is dark.',
      'Lift the pen where the picture is very light, and turn each letter a couple of degrees at random so it does not look typeset.',
    ],
    history: 'Shape poetry, in which words form the thing they describe, goes back to ancient Greek poets. Guillaume Apollinaire gave it a modern name in 1918 with his Calligrammes. Pictures made of writing appear in many scripts, and notebook doodles of the same kind are among the oldest habits of anyone with a pen.',
    uses: ['Gifts and cards with a personal message', 'Poetry and lyric posters', 'Journal and notebook style graphics', 'Portraits made from a favourite quote'],
    tips: [
      { text: 'Black ink on a plain page is the cleanest version.', set: { ink: 'black', paper: 'plain' } },
      { text: 'More lines of writing give a finer portrait.', set: { lines: 65 } },
      { text: 'Use your own sentence.', set: { text: 'for you, with love' } },
    ],
    terms: [['Calligram', 'A poem or text arranged so that it forms a picture of its subject.'], ['Baseline', 'The invisible line that letters sit on.'], ['Tone', 'How light or dark a part of a picture is.']],
    related: ['calligraphy-portrait', 'newspaper', 'letterpress'],
  },

  'calligraphy-portrait': {
    facts: { from: 'Calligraphic traditions of Europe, the Middle East and East Asia', era: 'Centuries old', bestOn: 'Portraits and strong silhouettes' },
    why: 'A calligrapher builds tone with layers of ink. Here the letters swell and overlap in the dark parts of the picture, so they pile into black, and stay small and thin in the light parts, where the parchment shows between them. The whole portrait is made of one sentence and one idea: more letters on top of each other means darker.',
    how: [
      'Draw a parchment page with faint stains and a double ink border.',
      'Letter the sentence in a flowing script on lines that rise or fall by the chosen slant.',
      'Make letters very large and heavy where the picture is dark, and small and thin where it is light.',
      'Advance each letter by only about 62 percent of its own width, so neighbours overlap and ink builds up.',
      'Turn letters to follow the baseline with a tiny random wobble, and stamp an optional red seal.',
    ],
    history: 'Writing arranged into images is a long tradition. Greek poets shaped words into wings and altars more than two thousand years ago, and Persian and Ottoman calligraphers composed names and verses into the outlines of birds, boats and lions. Red seals, small stamps of a name, mark a finished work in many East Asian traditions.',
    uses: ['Commemorative gifts and wedding keepsakes', 'Quote and poetry prints', 'Book and album covers', 'Cultural heritage themed art'],
    tips: [
      { text: 'Indigo ink with a steeper slant feels like a fountain pen.', set: { ink: 'indigo', slant: 10 } },
      { text: 'More lines make a finer, more photographic portrait.', set: { lines: 38 } },
      { text: 'Add your own words in place of the sentence.', set: { text: 'a name, a line, a promise' } },
    ],
    terms: [['Calligraphy', 'The art of beautiful writing.'], ['Slant', 'The angle at which letters lean from vertical.'], ['Seal', 'A small stamp in red ink that signs a work.']],
    related: ['handwritten', 'letterpress', 'victorian'],
  },

  newspaper: {
    facts: { from: 'Printing presses and newsrooms', era: 'Halftone newspapers since the 1880s', bestOn: 'Strong portraits and news-like scenes' },
    why: 'Newspapers cannot print grey. They print black dots of different sizes on pale paper and rely on your eye to blend them, so a photograph is really a field of dots. This treatment lays a lattice of such dots over the picture and builds the rest of a front page around it with a masthead, a headline, rules and columns.',
    how: [
      'Lay a lattice of dots rotated by 45 degrees, the angle where a regular pattern is least noticeable.',
      'At each lattice point read the brightness and draw a dot whose radius grows with the square root of the darkness, so inked area follows darkness.',
      'Fit the masthead to the page width by measuring and scaling it.',
      'Wrap the headline into at most three lines, shrinking it by 8 percent steps until it fits.',
      'Fill the columns with greeked text, bars standing in for words, and add paper grain and a warm vignette.',
    ],
    history: 'The first halftone photograph in a daily newspaper appeared in the New York Daily Graphic in 1880, made by Stephen Horgan. Frederic Ives patented a halftone process in 1881, and crossed-line screens soon made it routine. By the early twentieth century newspapers printed photographs every day, and the dot became so familiar that artists later made it into pop art.',
    uses: ['Parody and editorial mock-ups', 'Birthday and anniversary front pages', 'Posters with a vintage press look', 'Story and thumbnail graphics'],
    tips: [
      { text: 'Large dots on grey stock look like a coarse tabloid.', set: { dot: 10, paper: 'grey' } },
      { text: 'Fine dots make the photograph almost smooth.', set: { dot: 3 } },
      { text: 'Write your own front page.', set: { masthead: 'The Morning Post', headline: 'Local Photograph Declared Wonderful' } },
    ],
    terms: [['Halftone', 'A way of showing tone with dots whose size changes.'], ['Masthead', 'The newspaper’s name at the top of the front page.'], ['Greeking', 'Using bars or nonsense text to stand in for real words in a layout.']],
    related: ['halftone', 'letterpress', 'pop-art'],
  },

  letterpress: {
    facts: { from: 'The printing press', era: 'Since the 1450s, revived from the late 1990s', bestOn: 'Bold pictures and portraits with clear tones' },
    why: 'Letterpress is printing with a raised plate pressed into thick, soft paper, so the ink arrives with a physical dent. That dent is the whole charm: a shadow on one wall, a lit edge on the other. This treatment draws a one colour plate and then treats the paper as a height field so that the impression catches light.',
    how: [
      'Build the plate as black on transparent: a 45 degree halftone of the picture, two rules and the title.',
      'Turn the plate into an ink map between 0 and 1.',
      'Soften the map with two small blurs, the give of the paper, and measure its slope.',
      'Light from the top left, so the lower right wall of each dent is lit and the upper left wall is in shadow.',
      'Add fibre and speckle to the paper, darken ink slightly at the edges, and knock small holes in the ink for wear.',
    ],
    history: 'Johannes Gutenberg’s movable type press of around 1450 made letterpress the main way of printing for centuries. Offset printing replaced it in the twentieth century, but from the late 1990s designers rediscovered the deep impression on cotton stock, and it became a favourite for wedding invitations and business cards.',
    uses: ['Wedding and event stationery', 'Business cards and brand cards', 'Greeting cards and art prints', 'Premium packaging inserts'],
    tips: [
      { text: 'Oxblood ink on cream paper looks warm and traditional.', set: { ink: 'oxblood', paper: 'cream' } },
      { text: 'Deep impression with little wear is crisp and luxurious.', set: { depth: 95, wear: 5 } },
      { text: 'Add your own title.', set: { title: 'With thanks' } },
    ],
    terms: [['Impression', 'The dent a raised plate leaves in paper.'], ['Height field', 'An image whose values are read as heights.'], ['Cotton stock', 'A thick soft paper made from cotton fibre, ideal for deep impressions.']],
    related: ['newspaper', 'halftone', 'rubber-stamp'],
  },

  'ticker-text': {
    facts: { from: 'Stock exchanges and news signs', era: '1860s onward', bestOn: 'Contrasty pictures with bright subjects' },
    why: 'A ticker wall is rows of text sliding sideways, each carrying symbols, prices and arrows. Individually they are noise, but if every letter lights up according to the brightness of the picture it passes over, the picture appears in the flow, as if the market itself were drawing it.',
    how: [
      'Build each row from short tokens of your symbols, a price and an arrow, repeated until it is wider than the screen.',
      'Alternate the direction of the rows and give each its own speed.',
      'Sample a small, contrast stretched copy of the picture at the centre of each letter as it is drawn.',
      'Make the letter brighter where the picture is brighter, with a glow on the brightest.',
      'Draw letters in batches grouped by intensity and hue so the fill colour changes only a couple of dozen times a frame.',
    ],
    history: 'The stock ticker was invented in the 1860s: Edward Calahan’s version of 1867 printed prices on a paper tape, and Thomas Edison improved it soon after. Electric signs followed. The New York Times building in Times Square carried a moving news sign from 1928, and scrolling displays have been a symbol of fast information ever since.',
    uses: ['Finance and business themed visuals', 'News and sports style overlays', 'Title cards with a data feel', 'Looping backgrounds for streams and talks'],
    tips: [
      { text: 'Amber on black is an old terminal tape.', set: { colour: 'amber' } },
      { text: 'Maximum picture strength shows the portrait clearly.', set: { picture: 100, rows: 48 } },
      { text: 'Swap in your own symbols.', set: { text: 'ART SUN SEA SKY' } },
    ],
    terms: [['Ticker', 'A device or display that shows a running stream of prices or news.'], ['Token', 'A short chunk of text treated as one unit.'], ['Batching', 'Grouping similar drawing operations so they run faster.']],
    related: ['kinetic-type', 'split-flap', 'matrix-rain'],
  },
};
