// src/data/theory-extra/g-painterly.js
// Section G, painterly and drawn: the fuller story of each treatment.
export const EXTRA_PAINTERLY = {
  watercolour: {
    facts: { from: 'European and East Asian painting', era: 'Centuries old, English school of the 18th and 19th centuries', bestOn: 'Landscapes, flowers and soft portraits' },
    why: 'Watercolour is thin pigment carried by water, so the white of the paper shows through it and a stroke can only ever darken what lies beneath. That one fact explains the whole look: bright areas are simply left unpainted, colours bleed into one another, and pigment pools in dark rims where a wash dried. This treatment works in pigment laid over a paper colour for exactly that reason.',
    how: [
      'Blur the picture by an amount set by the bleed slider to stand in for water spreading.',
      'Read it from slightly displaced places, nudged by slow noise, for the wobble of a wet brush.',
      'Pull each channel part way toward the nearest of seven levels, because washes settle in flat tonal steps.',
      'Compute pigment as darkness times small effects: nothing in the lightest areas, uneven blooms from broad noise, granulation from fine noise, and pooling at edges.',
      'Darken the paper with that pigment, then add an optional unpainted border and a faint fibre pattern.',
    ],
    history: 'Painting with water-based colour is ancient, but the English school of the eighteenth and nineteenth centuries, with artists such as Thomas Girtin and J. M. W. Turner, made it a major art of landscape. Albrecht Dürer had already painted detailed watercolour studies of plants and animals around 1500. Portable paint boxes later put watercolour in the hands of travellers and amateurs.',
    uses: ['Illustration and greeting cards', 'Wedding and stationery designs', 'Nature and travel journal imagery', 'Soft wall art and book covers'],
    tips: [
      { text: 'High bleed and light colour make a loose, dreamy wash.', set: { bleed: 90, wash: 45 } },
      { text: 'Strong rims with rough paper look like a quick plein air sketch.', set: { rim: 90, paper: 'rough' } },
      { text: 'Turn off the border to let the picture fill the page.', set: { margin: false } },
    ],
    terms: [['Wash', 'A thin, even layer of watery paint.'], ['Granulation', 'Pigment that settles into the hollows of the paper and gives a speckled texture.'], ['Wet-on-wet', 'Painting onto paper that is still damp, so colours spread and blend.']],
    related: ['ink-wash', 'gouache', 'impressionist'],
  },

  'oil-impasto': {
    facts: { from: 'European oil painting', era: '17th century onward, famous in the 1880s', bestOn: 'Landscapes and portraits with strong light' },
    why: 'Thick oil paint stands up from the canvas, and most of what we read as paint is light and shadow on that relief. So this treatment builds two pictures from the same brush strokes: a colour map and a height map. Each stroke is a small ridged landscape with bristle furrows and piled-up lips, and one light does the rest.',
    how: [
      'Scatter short fat strokes over a jittered grid, with a second pass at half the size for details.',
      'Give each stroke the colour of the blurred picture at its centre, varied by 6 percent, and an angle that mixes the picture’s edge direction with a loose random direction.',
      'In the height map, make each stroke a base height with three thin bristle furrows and bright lips on both sides where paint piles up.',
      'Blur the map slightly and take its slopes by finite differences, scaled by the thickness slider.',
      'Light the result with a diffuse term for broad shading and a highlight for the wet shine.',
    ],
    history: 'Oil paint became the main medium of European painting in the fifteenth century, and Rembrandt used thick paint to make highlights rise from a flat ground. Impasto was pushed much further by Vincent van Gogh in the 1880s. The collapsible metal paint tube, patented by John Goffe Rand in 1841, let painters carry colours outdoors.',
    uses: ['Fine art style prints and posters', 'Painterly book and album covers', 'Gallery style wall decor', 'Texture-rich portrait gifts'],
    tips: [
      { text: 'A large brush with thick paint is bold and sculptural.', set: { size: 80, relief: 90 } },
      { text: 'A small brush that follows shapes closely keeps detail.', set: { size: 15, flow: 95 } },
      { text: 'Move the light to the top to change every shadow.', set: { angle: 270 } },
    ],
    terms: [['Impasto', 'Paint applied so thickly that brush strokes stand out.'], ['Finite difference', 'Estimating a slope by subtracting nearby values.'], ['Bristle furrow', 'A thin groove left by one hair of the brush.']],
    related: ['impressionist', 'pointillism', 'clay-3d'],
  },

  'charcoal-sketch': {
    facts: { from: 'Drawing studios, and cave walls before that', era: 'Prehistoric to today', bestOn: 'Portraits and strong light and shade' },
    why: 'Charcoal is a powder that sticks to the bumps of the paper and slides off the hollows, so whether a pixel turns black depends on the paper’s tooth as well as on the picture. A light touch catches only the peaks and shows grain, and a heavy one fills everything. Sketchy, doubled outlines and a smudged ground complete the hand-drawn feel.',
    how: [
      'Model the tooth of the paper as a mix of smooth and white noise.',
      'Compute the stick’s pressure from the darkness of the lightly blurred picture, multiplied by the pressure slider and by diagonal streaks like a hand shading back and forth.',
      'Ink the pixel where pressure beats the tooth, so light pressure only catches the peaks.',
      'Read the edge map three times at places displaced by slow noise and keep the strongest reading, so outlines wander and double.',
      'Add a heavily blurred copy as smudge, then tint everything as charcoal, conté, sanguine or graphite.',
    ],
    history: 'Charcoal is among the oldest drawing materials, used on cave walls for tens of thousands of years. Renaissance artists drew studies in red chalk, or sanguine, and Nicolas-Jacques Conté invented the conté crayon in 1795. Charcoal remains the standard material for quick figure studies, because it can be rubbed out and redrawn in a moment.',
    uses: ['Quick portrait and figure studies', 'Sketchbook style illustrations', 'Dramatic monochrome posters', 'Art class and teaching materials'],
    tips: [
      { text: 'Sanguine on cream paper looks like an old master study.', set: { medium: 'sanguine', paper: 'cream' } },
      { text: 'Heavy smudge and strong pressure make a moody drawing.', set: { smudge: 85, pressure: 90 } },
      { text: 'Graphite with light pressure feels like a quiet pencil sketch.', set: { medium: 'graphite', pressure: 35 } },
    ],
    terms: [['Tooth', 'The roughness of paper that grips the drawing material.'], ['Sanguine', 'A red-brown chalk used for drawing, from the Latin for blood.'], ['Conté', 'A hard drawing crayon made of pigment and clay, named after its inventor.']],
    related: ['pencil-hatching', 'pastel-chalk', 'mezzotint'],
  },

  pointillism: {
    facts: { from: 'Paris, Neo-Impressionism', era: '1880s and 1890s', bestOn: 'Sunlit landscapes and scenes with soft colour' },
    why: 'Seurat’s idea was to stop mixing paint on a palette and put pure dots of colour side by side, leaving your eye to mix them. Seen from a distance, blue and yellow dots give a vibrating green that is brighter than mixed paint. This treatment throws thousands of dots of the picture’s own colours onto a plain ground and lets the mixing happen in the viewer.',
    how: [
      'Blur the picture to about the scale of one dot.',
      'Throw dots at random positions and sizes, enough that a pixel lies under two to six of them on average.',
      'Give each dot the colour of the blurred picture under its centre, lifted in saturation.',
      'Wander each dot a little in hue, saturation and lightness, with up to 7 percent taking a complementary hue for the flecks that make shadows vibrate.',
      'Let some of the plain ground show through where dots happen not to overlap.',
    ],
    history: 'Georges Seurat painted A Sunday Afternoon on the Island of La Grande Jatte in 1884 to 1886, and Paul Signac helped develop the method, called divisionism or pointillism. They drew on nineteenth century colour theory, including Michel Eugène Chevreul’s work on simultaneous contrast. The principle returns every time an image is made of dots, from halftone printing to a screen’s pixels.',
    uses: ['Fine art style portraits and landscapes', 'Posters and prints with a vibrating colour', 'Teaching colour theory', 'Textured album and book covers'],
    tips: [
      { text: 'Tiny dots with full coverage are close to a photograph.', set: { dot: 10, cover: 100 } },
      { text: 'Big dots with strong jitter look like a classic divisionist canvas.', set: { dot: 70, vivid: 85 } },
      { text: 'A dark canvas makes the colours glow.', set: { ground: 'dark' } },
    ],
    terms: [['Optical mixture', 'Colour mixed in the eye from small separate patches, not in the paint.'], ['Complementary colour', 'The colour opposite another on the colour wheel.'], ['Divisionism', 'The practice of dividing a painting into separate patches of pure colour.']],
    related: ['impressionist', 'halftone', 'poisson-stippling'],
  },

  impressionist: {
    facts: { from: 'Paris', era: '1870s and 1880s', bestOn: 'Landscapes, gardens and water' },
    why: 'Impressionist painters worked quickly outdoors, laying down short visible strokes of colour to catch the light before it changed. The program does the same in three passes: big brushes for the broad colour, then smaller ones only where the picture still differs from the canvas. Strokes run along lines of equal brightness, so they follow edges instead of cutting across them.',
    how: [
      'In the first pass paint over a very blurry copy of the picture enlarged to the canvas.',
      'In the second and third passes compare the canvas with the picture blurred to half the brush radius.',
      'On a grid of cells, sample five random points, and place a stroke at the worst one if the average colour error is above a threshold.',
      'Make each stroke follow the isophote, the line of equal brightness, by turning the brightness gradient by 90 degrees and stepping along it until the colour drifts too far.',
      'Tone each stroke in the impressionist spirit: more saturation, lighter lightness, and shadows pushed toward violet.',
    ],
    history: 'The movement is named after Claude Monet’s Impression, Sunrise, shown in 1874 at the first independent exhibition of the group in Paris. Cheap paint tubes let painters work outdoors, and the group’s short strokes of broken colour replaced the smooth finish of the academies. The layered stroke method used here was described by Aaron Hertzmann at SIGGRAPH in 1998.',
    uses: ['Fine art style prints', 'Soft, painterly posters and greeting cards', 'Travel and garden imagery', 'Backgrounds with brushwork'],
    tips: [
      { text: 'Large brushes and low detail give a loose, early morning scene.', set: { brush: 75, detail: 25 } },
      { text: 'Small brushes with high detail are closer to a finished canvas.', set: { brush: 20, detail: 85 } },
      { text: 'Long strokes flow along the shapes like wind.', set: { length: 85 } },
    ],
    terms: [['Isophote', 'A line along which brightness is constant.'], ['Plein air', 'Painting outdoors, in front of the subject.'], ['Broken colour', 'Colours placed side by side in small strokes instead of being blended.']],
    related: ['pointillism', 'oil-impasto', 'watercolour'],
  },

  gouache: {
    facts: { from: 'Illuminated manuscripts, miniatures and illustration studios', era: 'Medieval onward, mid 20th century illustration', bestOn: 'Posters, landscapes and portraits with clear colour shapes' },
    why: 'Gouache is opaque and matte: the colour comes from the paint itself, not from the paper behind it, so a painter works from a few mixed pots and fills flat shapes. This treatment chooses a small palette from the picture, makes the colours a little chalky, and lets the shapes wobble where a hand and a wide brush would.',
    how: [
      'Find a palette by k-means clustering of the picture’s colours, then make each pot chalkier.',
      'Blur the picture, label each pixel with its nearest palette colour, and tidy the regions with two passes of a majority filter.',
      'Read each pixel’s label from a place displaced by smooth noise, so boundaries wobble the same way on both sides.',
      'Show bare paper where a different label lies a few pixels away, the thin gap between flat areas.',
      'Add long streaks of noise for brush drag and a few dry-bristle flecks.',
    ],
    history: 'The word comes from the Italian guazzo. Opaque water-based paint was used in medieval manuscripts and in Indian and Persian miniature painting, and gouache became the favourite of poster artists and illustrators in the twentieth century. Henri Matisse painted sheets of paper with gouache to make his cut-outs, and mid-century concept artists such as Mary Blair used it for bold colour.',
    uses: ['Poster and book illustration', 'Concept art and storyboards', 'Packaging and brand illustration', 'Flat, retro style prints'],
    tips: [
      { text: 'Few colours with a lot of wobble look hand painted.', set: { colours: 4, wobble: 80 } },
      { text: 'More colours and smooth shapes read as a detailed poster.', set: { colours: 10, smooth: 80 } },
      { text: 'No gaps and no drag make flat digital colour.', set: { gaps: 0, streaks: 0 } },
    ],
    terms: [['Opaque', 'Not letting light through, so it covers what lies underneath.'], ['Palette', 'The set of colours chosen for a painting.'], ['Majority filter', 'A filter that gives each pixel the most common label among its neighbours.']],
    related: ['paper-cut-out', 'vector-art', 'watercolour'],
  },

  'pencil-hatching': {
    facts: { from: 'Illustration, engraving and drawing', era: 'Renaissance onward', bestOn: 'Objects and portraits with strong form' },
    why: 'An illustrator builds tone from layers of parallel strokes: one set in one direction, a second across it, more where the shadow is deepest. A light area has none, a mid tone has one set and the deepest shadow is crossed four times. This treatment stacks up to four layers at different angles, each appearing only once the picture is dark enough.',
    how: [
      'Set up to four layers of strokes at 45, 135, 0 and 90 degrees, all turned together by the turn slider.',
      'Let a layer appear only when the darkness passes its threshold of 0.16, 0.34, 0.54 or 0.74.',
      'For each layer, divide the position across the strokes by the line spacing, with slow noise for the hand’s wobble, and take the integer part as the stroke index.',
      'Make each stroke thicker the further the darkness is past the threshold, with its own random width and pressure seeded by its index.',
      'Combine layers by taking the strongest, lighten with paper tooth, and add optional soft outlines.',
    ],
    history: 'Hatching and cross-hatching were developed in drawing and engraving long before photography, by artists such as Albrecht Dürer, who used them to model form in prints. Graphite was found at Borrowdale in England in the 1560s, and the modern pencil followed. Today hatching is used in comics, manga, technical illustration and architectural sketches.',
    uses: ['Sketchbook and editorial illustration', 'Architectural and product studies', 'Comic and manga style shading', 'Art lessons on tone'],
    tips: [
      { text: 'Two layers with a bold turn is a quick, graphic sketch.', set: { layers: 2, angle: 30 } },
      { text: 'Red lead on cream paper feels like an old study.', set: { lead: 'red', paper: 'cream' } },
      { text: 'Tighter spacing and full layers give a smooth, almost photographic result.', set: { space: 3.5, layers: 4 } },
    ],
    terms: [['Hatching', 'Parallel lines used to suggest shade.'], ['Cross-hatching', 'A second set of lines crossing the first to make a darker tone.'], ['Tooth', 'The grain of paper that catches the pencil.']],
    related: ['charcoal-sketch', 'victorian', 'linocut'],
  },

  'ink-wash': {
    facts: { from: 'China and Japan', era: 'Tang dynasty onward, Zen painting from the 14th century', bestOn: 'Mountains, trees, flowers and calm portraits' },
    why: 'Sumi-e builds every tone from a few dilutions of one ink and leaves most of the paper bare. The empty space is not a gap but part of the picture, and a stroke is meant to be seen as a gesture. This treatment gives the picture a few flat washes, lets the ink bleed into damp paper, drags a dry brush across the darks and adds a red seal.',
    how: [
      'Measure the picture’s darkness, stretched and blurred, and rescale it from a lower bound that moves with the how-much-is-inked slider.',
      'Multiply by the number of tone levels and let the integer part be the tone, with a smoothstep ramp up to the next tone.',
      'Blur the result twice to show ink soaking sideways, and wobble the lookup a little with the bleed slider.',
      'Darken the ink where it has an edge, the tide-line a drying wash leaves.',
      'Remove ink with long dry-brush streaks in the dark areas, and multiply an optional red seal onto the lower right corner.',
    ],
    history: 'Ink painting flourished in China under the Tang and Song dynasties and was carried to Japan by Zen monks, where Sesshū Tōyō (1420 to 1506) became its great master. Its tools are called the four treasures: brush, ink, paper and inkstone. The aesthetic of empty space, and of capturing the spirit of a subject in a few strokes, influenced Western painting and graphic design.',
    uses: ['Calm posters and wall art', 'Tea house, wellness and brand imagery', 'Greeting cards and invitations', 'Book covers with an Eastern feel'],
    tips: [
      { text: 'Few layers of ink with lots of paper is the most meditative.', set: { tones: 2, amount: 35 } },
      { text: 'Indigo ink on white paper looks cool and modern.', set: { ink: 'indigo', paper: 'white' } },
      { text: 'Heavy dry brush leaves the white skips of a quick stroke.', set: { dry: 95 } },
    ],
    terms: [['Sumi-e', 'Japanese for ink picture: painting in black ink.'], ['Chop', 'A carved seal stamped in red ink to sign a painting.'], ['Dry brush', 'A stroke made with little ink, leaving gaps where the paper shows.']],
    related: ['watercolour', 'charcoal-sketch', 'cyanotype'],
  },

  'pastel-chalk': {
    facts: { from: 'European portraiture and studio drawing', era: '16th century onward, popular in the 18th and 19th centuries', bestOn: 'Portraits, skies and flowers' },
    why: 'Pastel is used on toned paper. The paper’s own colour supplies the shadows and middle tones, and the chalk goes on mostly for the lights, which is why pastel pictures glow. This treatment lays short wide strokes of lifted colour, only where the picture is light, and breaks each stroke on the grain of the paper.',
    how: [
      'Paint a layer of short, wide strokes in two passes, the second half the size, along a main direction with a spread of about 0.35 radians.',
      'Give each stroke the colour of the blurred picture with saturation raised by 12 percent and lightness set to 0.9 l plus 0.1, so chalk comes out brighter and softer.',
      'Decide how much chalk stays from how light the picture is there, times the pressure, times a slow noise, so shadows are left to the paper.',
      'Break each stroke with the paper tooth, a mix of smooth and white noise, which spatters it into dots.',
      'Add a few specks of loose dust and mix paper and chalk by the final coverage.',
    ],
    history: 'Artists drew with dry coloured chalks as early as the fifteenth and sixteenth centuries, and pastel portraiture flourished in the eighteenth century with painters such as Rosalba Carriera and Jean-Étienne Liotard. Edgar Degas used pastel boldly in the 1870s to 1890s. Its soft, powdery finish is still prized for portraits and skies.',
    uses: ['Portrait and landscape prints', 'Soft posters and cards', 'Book and album covers', 'Warm, textured backgrounds'],
    tips: [
      { text: 'Navy paper makes the chalk look like moonlight.', set: { paper: 'navy' } },
      { text: 'Heavy tooth with low pressure gives a dry, sparkling texture.', set: { tooth: 90, pressure: 45 } },
      { text: 'Kraft paper with large strokes feels like a sketchbook.', set: { paper: 'kraft', size: 65 } },
    ],
    terms: [['Toned paper', 'Paper that is coloured, so the ground shows through the drawing.'], ['Tooth', 'The grain of paper that catches the chalk.'], ['Soft pastel', 'Pure pigment pressed into a stick with very little binder.']],
    related: ['charcoal-sketch', 'gouache', 'watercolour'],
  },

  'blind-contour': {
    facts: { from: 'Art school drawing exercises', era: '20th century', bestOn: 'Objects and faces with clear outlines' },
    why: 'In a blind contour drawing the artist looks only at the subject and never at the page, with the pen kept on the paper. The line wanders and lands near the edge but not on it, and the result is more alive than a careful tracing. This treatment finds the edges, chains them into one continuous pen line and lets it drift.',
    how: [
      'Find the picture’s edges with the Sobel gradient of a lightly blurred, stretched lightness.',
      'Divide the picture into small cells and keep the strongest edge pixel in each if it passes a threshold.',
      'Chain the points: start at one, jump to the nearest unused point within 2.6 cells, and repeat until none is near enough, then lift the pen and start again.',
      'Drop lines shorter than four points.',
      'Add drift to every point, smooth noise along the drawing plus a little jitter, and join them with quadratic curves through the midpoints so the line has no corners.',
    ],
    history: 'The exercise was popularised by the art teacher Kimon Nicolaïdes in his 1941 book The Natural Way to Draw, and later by Betty Edwards’s Drawing on the Right Side of the Brain. It trains the eye to see edges as they are rather than as we assume them to be, and it has become a common warm-up in art classes.',
    uses: ['Line drawing posters and cards', 'Editorial and sketchbook style art', 'Art class demonstrations', 'Minimal portrait prints'],
    tips: [
      { text: 'High drift gives a nervous, expressive line.', set: { drift: 90, weight: 2 } },
      { text: 'More detail draws more of the picture.', set: { detail: 90 } },
      { text: 'Blue ink on white paper looks like a pen sketch.', set: { ink: 'blue', paper: 'white' } },
    ],
    terms: [['Contour', 'The outline of a shape.'], ['Quadratic curve', 'A smooth curve defined by two end points and one control point.'], ['Pen lift', 'A break in a line where the pen leaves the paper.']],
    related: ['pencil-hatching', 'charcoal-sketch', 'contour-lines'],
  },
};
