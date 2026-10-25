// src/data/theory-extra/i-generative-1.js
// Section I, geometric and generative (first half): the fuller story of each treatment.
export const EXTRA_GENERATIVE_1 = {
  particles: {
    facts: { from: 'Computer graphics and physics simulation', era: '1980s onward', bestOn: 'High contrast pictures with one clear subject' },
    why: 'A particle system builds a picture out of thousands of tiny, simple things instead of one big shape. Each dot knows only two things: where its home is and how hard the cursor is pushing it away. Together they form the image, scatter when you disturb them and settle back, which looks alive although no dot is doing anything clever.',
    how: [
      'Divide the picture into a grid and give each cell one particle, whose home is near the cell centre, nudged by up to 0.35 of a cell so the dots do not look like a lattice.',
      'Take its colour from the picture, reduced to 4 bits per channel so the dots can be drawn in a few dozen batches.',
      'Pull every particle toward its home with a spring, and slow it with damping so it settles instead of bouncing forever.',
      'Push away any particle within 16 percent of the width of the cursor, hardest at its centre and fading to nothing at its edge.',
      'In white mode, keep one colour and let the dot size carry the brightness.',
    ],
    history: 'William Reeves of Lucasfilm described particle systems in 1983 after using them for the Genesis effect, the wall of fire in Star Trek II: The Wrath of Khan (1982). Fire, smoke, sparks and rain have been made this way in films and games ever since, and the spring and damper behind each dot goes back to Hooke’s law in the seventeenth century.',
    uses: ['Fire, smoke, sparks and rain in games and film', 'Interactive website heroes and logos', 'Data visualisation of crowds or populations', 'Physics teaching with springs and damping'],
    tips: [
      { text: 'Fewer, bigger particles make a bold pointillist portrait.', set: { density: 60, size: 2 } },
      { text: 'A very strong cursor force makes the picture explode.', set: { force: 100 } },
      { text: 'White mode shows the picture only through dot size.', set: { mode: 'white', density: 150 } },
    ],
    terms: [['Damping', 'A force that slows motion, so a spring settles instead of oscillating for ever.'], ['Target', 'The home position a particle is pulled toward.'], ['Jitter', 'A small random offset that breaks up a regular grid.']],
    related: ['boids', 'physarum', 'poisson-stippling'],
  },

  'truchet-tiles': {
    facts: { from: 'A Dominican priest in Paris', era: '1704', bestOn: 'Pictures with good light and dark contrast' },
    why: 'Truchet tiles show how a very small rule can produce endless variety. One tile, turned in one of two ways, is placed by chance, and because every arc ends at the middle of a side, arcs from neighbouring tiles always meet and join into winding paths. The picture then controls only the weight of the lines, so the paths thicken in shadows and thin out in the lights.',
    how: [
      'Draw each tile with two quarter circles, centred on opposite corners, that meet the midpoints of the sides.',
      'Choose between the two orientations with a hash of the tile’s position, so the same seed always gives the same pattern.',
      'Measure the darkness of the picture under the tile, averaged over 0.45 of a tile width.',
      'Scale the line width, or the disc radius, with that darkness, from a hairline in the lights to a bold stroke in the shadows.',
      'In busy areas, optionally split a tile into smaller ones so detail shows.',
    ],
    history: 'Sébastien Truchet, a Dominican priest and engineer, published a study of patterns made from one square tile divided along its diagonal in 1704. The work was largely forgotten until Cyril Stanley Smith and Pauline Boucher revived it in a paper in 1987. A single line of Commodore 64 BASIC called 10 PRINT, which prints one of two diagonal slashes at random, makes the same kind of pattern and became a favourite of early programmers.',
    uses: ['Maze and pattern generators', 'Textile, tile and wallpaper design', 'Game levels and textures', 'Teaching tilings and topology'],
    tips: [
      { text: 'The diagonal tile is the original, with plain zigzag paths.', set: { tile: 'diag', size: 20 } },
      { text: 'Quarter discs give a bold, graphic look.', set: { tile: 'quarter', colour: 'ink' } },
      { text: 'Full tonal weight with small tiles shows the picture clearly.', set: { weight: 100, size: 14 } },
    ],
    terms: [['Tiling', 'A way of covering a surface with shapes without gaps or overlaps.'], ['Hash', 'A function that turns a position into a repeatable pseudo random number.'], ['Topology', 'The study of how shapes are connected, regardless of their exact size.']],
    related: ['wave-function-collapse', 'hexagon-mosaic', 'penrose-tiling'],
  },

  'op-art-moire': {
    facts: { from: 'Optical art', era: '1960s', bestOn: 'Bold shapes and portraits with simple tones' },
    why: 'When two fine patterns of lines overlap, broad bands appear that are in neither of them. These are beats, the visual cousin of two close musical notes giving a slow throb. Op artists realised that these illusions seem to shimmer and move, and that a small change in the lines makes a large change in the bands, so the picture bends one set of lines and the beats follow its shapes.',
    how: [
      'Draw one plain set of lines, rings or waves with a fixed period.',
      'Draw a second set with the same period, turned a little or with a shifted centre.',
      'Shift the coordinate across the second set by up to 9 periods times the picture’s lightness minus a half, so the lines swerve around shapes.',
      'Set the thickness of the second set from the picture’s tone, mixing the duty cycle between a half and a value that follows darkness.',
      'The beats are not drawn at all: they appear where the two sets cross, and for equal period at an angle α they are p / (2 sin(α/2)) apart.',
    ],
    history: 'The word moiré is French and refers to watered silk, in which two layers of cloth make shimmering patterns. Op art, as a name, appeared in Time magazine in 1964, and the exhibition The Responsive Eye at the Museum of Modern Art in New York in 1965 made artists such as Bridget Riley and Victor Vasarely famous. Engineers also use moiré fringes to measure tiny strains and displacements.',
    uses: ['Posters, fabrics and graphic design', 'Detecting strain and deformation in engineering', 'Avoiding unwanted screen patterns in printing and photography', 'Visual perception experiments'],
    tips: [
      { text: 'Concentric rings give the classic target fringes.', set: { kind: 'rings', angle: 0 } },
      { text: 'A bigger turn of the second grid packs the bands closer.', set: { angle: 12 } },
      { text: 'Strong warp lets the picture appear in the bending lines.', set: { warp: 90, weight: 85 } },
    ],
    terms: [['Moiré', 'A pattern that appears when two regular patterns overlap.'], ['Beat', 'A slow variation that arises when two close frequencies are combined.'], ['Duty cycle', 'The share of each period that is filled with ink.']],
    related: ['kaleidoscope', 'warped-grid', 'lissajous-curves'],
  },

  spirograph: {
    facts: { from: 'Geometry and a drawing toy', era: '1965 toy, older mathematics', bestOn: 'Pictures with large areas of tone' },
    why: 'A small wheel rolls inside a larger ring and a pen sits in one of its holes. Because the wheel turns faster than it travels, the pen swings out and back in again, drawing loops. The shape depends on the ratio of the two wheels. When the ratio is a fraction of whole numbers, the curve closes after a certain number of turns, so every gear pair has its own personality.',
    how: [
      'Scale the ring to 1 and call the wheel’s relative size k, then trace the pen at (1 − k) cos t + h cos(((1 − k)/k) t), (1 − k) sin t − h sin(((1 − k)/k) t).',
      'Find how many times around the wheel must travel before the curve closes: the wheel’s teeth divided by the greatest common divisor of its teeth and the ring’s 144.',
      'Draw the curve as many short segments, 220 for each turn.',
      'Colour each segment by the picture at its midpoint.',
      'In the rosette layout, repeat the process in a grid of small spirographs with random coprime ratios and pen holes.',
    ],
    history: 'Curves made by rolling circles were studied by Dürer in the sixteenth century and by many mathematicians after him, and the Polish engineer Bruno Abakanowicz built a drawing instrument for them in the 1880s. The British engineer Denys Fisher turned the idea into the Spirograph toy, shown in 1965 and sold in the United States by Kenner from 1966. It has been a classroom favourite ever since.',
    uses: ['Decorative patterns and engraving', 'Banknote security backgrounds and guilloché', 'Gear and cam design', 'Teaching ratios and number theory'],
    tips: [
      { text: 'A single big curve with many teeth looks like fine lacework.', set: { mode: 'one', teeth: 97 } },
      { text: 'A pen hole near the centre gives a gentler, rounder rosette.', set: { hole: 30 } },
      { text: 'Fewer rosettes on a cream paper look like a printed sampler.', set: { cells: 5, paper: 'cream' } },
    ],
    terms: [['Hypotrochoid', 'The path of a point on a circle that rolls inside another circle.'], ['Coprime', 'Two whole numbers that share no factor other than 1.'], ['Guilloché', 'A pattern of fine interlacing curves, used on banknotes.']],
    related: ['lissajous-curves', 'banknote-engraving', 'string-art'],
  },

  'hexagon-mosaic': {
    facts: { from: 'Geometry and nature', era: 'Ancient to modern', bestOn: 'Wide views with soft colour' },
    why: 'The hexagon is the shape that divides a flat surface into equal cells with the least boundary. Bees, basalt columns, soap foam and graphene all use it for that reason. The program lays out a honeycomb and gives each cell the average colour beneath it, so the picture becomes tiles, and the gaps between become grout.',
    how: [
      'Space the cell centres √3 s apart in a row, with rows 1.5 s apart and every second row shifted by half a width.',
      'Average the picture over a disc of 0.75 s around each centre to find the cell’s colour.',
      'In flat mode, draw each hexagon, shrink it by the gap value, and add a gentle glaze gradient and a pale inner edge.',
      'In shrinking mode, scale the radius with the tone, 0.25 + 0.85 t, which gives a halftone.',
      'In tumbling blocks mode, cut each hexagon into three rhombi shaded 1.14, 0.86 and 0.6 times the colour, which gives the illusion of cubes.',
    ],
    history: 'The Greek mathematician Pappus suggested in the fourth century that bees choose hexagons because they use the least wax. The honeycomb conjecture was proved only in 1999 by Thomas Hales. The tumbling blocks pattern is an old quilt design, and hexagonal grids are used in board games, computer strategy games and weather and mapping systems.',
    uses: ['Wall and floor tile design', 'Hex based game maps', 'Geographic data grids and heat maps', 'Honeycomb structures in engineering'],
    tips: [
      { text: 'Tumbling blocks turn the picture into a pile of cubes.', set: { mode: 'cubes', size: 20 } },
      { text: 'Shrinking cells make a halftone from hexagons.', set: { mode: 'size', gap: 0 } },
      { text: 'Small cells on a night background glow like stained glass.', set: { size: 8, back: 'night' } },
    ],
    terms: [['Honeycomb conjecture', 'The statement that hexagons divide a plane into equal areas with the least perimeter.'], ['Grout', 'The material between tiles.'], ['Halftone', 'Tone made from dots of different sizes.']],
    related: ['quilt-patchwork', 'voronoi-mosaic', 'halftone'],
  },

  'voronoi-mosaic': {
    facts: { from: 'Mathematics and geography', era: 'Dirichlet 1850, Voronoy 1908', bestOn: 'Pictures with strong edges' },
    why: 'Scatter some points and give every spot on the page to whichever point is nearest. The result is a set of irregular cells that look like cracked glaze, giraffe skin, dried mud and soap bubbles, because nature often grows from seeds that claim the space around them. More points in the detailed parts of a picture make smaller cells there.',
    how: [
      'Place seeds by rejection sampling: accept a random point with a probability that is high at strong edges (Sobel strength) and low in flat areas.',
      'Label every pixel with its nearest seed using jump flooding, which takes about log₂ of the picture size in passes rather than checking every seed.',
      'Run Lloyd relaxation: move each seed to the weighted centre of its cell, and relabel. A few rounds even out the cells.',
      'Paint each cell with the average colour of the picture inside it.',
      'Draw borders and a faceting gradient on top for a look of glaze.',
    ],
    history: 'Descartes drew such diagrams in 1644 to show the distribution of matter in the heavens. Peter Gustav Lejeune Dirichlet used them in 1850 and Georgy Voronoy generalised them in 1908. Physician John Snow’s 1854 map of cholera deaths around the Broad Street pump is often described as an informal example. Stuart Lloyd’s relaxation was written in 1957 and published in 1982, and Adrian Secord used weighted Voronoi diagrams for stippling in 2002.',
    uses: ['Finding the nearest hospital, shop or station', 'Terrain and map generation in games', 'Crack and cell textures in 3D art', 'Mesh generation in engineering'],
    tips: [
      { text: 'Thousands of cells make a fine stained-glass portrait.', set: { cells: 2000, edge: 20 } },
      { text: 'Few cells and strong faceting look like low-poly glass.', set: { cells: 150, bevel: 85 } },
      { text: 'No relaxing leaves the cells random and uneven.', set: { relax: 0 } },
    ],
    terms: [['Voronoi cell', 'The region of points that are nearer to one seed than to any other.'], ['Lloyd relaxation', 'Moving each seed to the centre of its cell to make cells more even.'], ['Jump flooding', 'A fast way to find the nearest seed for every pixel.']],
    related: ['stained-glass', 'low-poly', 'poisson-stippling'],
  },

  'penrose-tiling': {
    facts: { from: 'Mathematical recreations and crystallography', era: '1974', bestOn: 'Pictures with smooth colour regions' },
    why: 'A tiling that repeats can be slid over itself and matched, but a Penrose tiling cannot. It never repeats and yet it is ordered, with five-fold symmetry that ordinary periodic tilings are forbidden to have. Two rhombus shapes are all it takes, and the golden ratio runs through every proportion in it.',
    how: [
      'Start with ten thin Robinson triangles arranged round the centre in a decagon.',
      'Deflate every triangle: a thin one becomes two, a thick one becomes three, with new vertices placed along the old edges in the golden ratio.',
      'Each round shrinks the edges by 1/φ and multiplies the number of triangles by about 2.618.',
      'Look up the picture at the centroid of each triangle to find its colour.',
      'Merge the triangle halves back into rhombi when drawing, with thick and thin tiles shaded in picture, two-tone or mixed mode.',
    ],
    history: 'The English mathematician and physicist Roger Penrose found these tilings in 1974, building on work by Robert Berger. In 1982 Dan Shechtman observed metal crystals with five-fold symmetry that should have been impossible, called quasicrystals, and won the Nobel Prize in Chemistry in 2011. Peter Lu and Paul Steinhardt argued in 2007 that medieval Islamic girih tilings came close to the same idea.',
    uses: ['Floor and wall design, such as paving at the Oxford Mathematical Institute', 'The study of quasicrystals in materials science', 'Cryptography and computer science research on tilings', 'Art and architecture'],
    tips: [
      { text: 'Deep subdivision with thin gold lines looks like a jewel.', set: { depth: 8, lineCol: 'gold', line: 0.6 } },
      { text: 'Two-tone mode shows the two shapes clearly.', set: { mode: 'duo', depth: 5 } },
      { text: 'Turn the pattern to find a new centre of symmetry.', set: { turn: 18 } },
    ],
    terms: [['Aperiodic', 'Never repeating, however far you look.'], ['Golden ratio', 'The number (1 + √5)/2, about 1.618, which appears in the proportions of the tiles.'], ['Quasicrystal', 'A crystal with order but no repeating unit.']],
    related: ['girih', 'mandala', 'hexagon-mosaic'],
  },

  'fractal-flame': {
    facts: { from: 'Chaos games and iterated function systems', era: '1992, published 2003', bestOn: 'Colourful pictures, which tint the flame' },
    why: 'A point jumps around the plane again and again, each time by one of a few chosen rules. Most of the points end up in a thin, tangled set, and the places the point visits often become bright. The rules include curved folds, and these give the result its smoke, silk and feather look. It is a drawing made by counting visits.',
    how: [
      'Pick a start point, then at each step choose one of three or four transforms at random, weighted.',
      'Apply it: an affine map, followed by two nonlinear variations such as sinusoidal, spherical, swirl, horseshoe or heart.',
      'Throw away the first 24 steps, then add the position to a histogram of visits for a few million steps.',
      'Keep a running colour: the point’s colour moves halfway toward the colour of the chosen transform at each step.',
      'Convert counts to brightness using a logarithm, with gamma, so both dense and faint regions are visible.',
    ],
    history: 'Scott Draves designed fractal flames in 1992 and published the algorithm in 2003, building on iterated function systems, which John Hutchinson formalised in 1981 and Michael Barnsley popularised in the 1980s. Draves also created Electric Sheep, a screen saver from 1999 in which thousands of computers dream and vote on flames. Flame fractals appear in programs such as Apophysis.',
    uses: ['Generative art and wallpaper', 'Screen savers and music visuals', 'Texture generation for film and games', 'Teaching chaos and iterated functions'],
    tips: [
      { text: 'Three-fold symmetry makes a flower-like flame.', set: { sym: 3 } },
      { text: 'Sharp folds give crystalline, feathery shapes.', set: { family: 'sharp', quality: 85 } },
      { text: 'The ember palette is the classic fire look.', set: { colour: 'ember', bright: 75 } },
    ],
    terms: [['Affine map', 'A transform made of rotation, scaling and shifting.'], ['Iterated function system', 'A set of transforms applied again and again to build a fractal.'], ['Histogram', 'A count of how often each position was visited.']],
    related: ['strange-attractors', 'mandelbrot-fill', 'aurora'],
  },

  'mandelbrot-fill': {
    facts: { from: 'Complex dynamics', era: 'Julia 1918, Mandelbrot 1980', bestOn: 'Colourful pictures with large smooth areas' },
    why: 'Take a number, square it, add a constant, and repeat. Some starting numbers fly off to infinity and some never do. The boundary between them is one of the most intricate shapes known, and zooming in reveals smaller copies of the whole. In this treatment the orbit is also a probe: when it passes through a window over the plane, it picks up the colour of your picture at that spot.',
    how: [
      'Map each pixel to a point of the complex plane, inside a chosen view such as the seahorse valley or the triple spiral.',
      'Iterate zₙ₊₁ = zₙ² + c, with c from the pixel for the Mandelbrot set, or z₀ from the pixel and a fixed c for a Julia set.',
      'Stop when |z|² passes 400 or after the chosen number of steps.',
      'Lay a window |Re z| < hₓ, |Im z| < hᵧ over the plane and stretch the picture across it: the first time an orbit passes through it, the pixel takes that colour, darkened if it arrived late.',
      'Add a glow on the edge of the set, and colour the pixels that never land from a palette.',
    ],
    history: 'Gaston Julia and Pierre Fatou studied iteration of complex functions around 1918, but without computers they could not see the shapes. Benoit Mandelbrot, working at IBM, first drew the set in 1980 and named fractals in his 1975 book, later expanded as The Fractal Geometry of Nature in 1982. Orbit traps of this kind were developed in the 1980s, including by Clifford Pickover.',
    uses: ['Computer art and wallpaper', 'Benchmarking processors and graphics cards', 'Teaching complex numbers and chaos', 'Modelling coastlines, clouds and terrain'],
    tips: [
      { text: 'The seahorse valley is the most famous close-up.', set: { view: 'seahorse', zoom: 2 } },
      { text: 'A Julia set shows a different member of the family.', set: { kind: 'julia', julia: 120 } },
      { text: 'A smaller window shows more of the original picture inside.', set: { window: 160 } },
    ],
    terms: [['Complex number', 'A number with a real part and an imaginary part, drawn as a point on a plane.'], ['Orbit', 'The sequence of points produced by applying a rule repeatedly.'], ['Orbit trap', 'A shape used to colour a point by where its orbit passes.']],
    related: ['fractal-flame', 'strange-attractors', 'domain-warp'],
  },

  'reaction-diffusion': {
    facts: { from: 'Mathematical biology', era: '1952 theory, 1990s computer art', bestOn: 'Pictures with soft light and shadow' },
    why: 'Turing asked how a uniform ball of cells could grow stripes or spots. His answer was that two chemicals that react and spread at different speeds can organise themselves. One feeds the other, and the other spreads more slowly, so small bumps grow and push each other apart. The picture steers where each pattern appears.',
    how: [
      'Keep two chemicals on a grid: a food U and an activator V.',
      'At each step, V turns U into more V (the term u v²), and V is removed at a rate f + k while U is fed at rate f.',
      'Let both spread, U at 0.21 and V at 0.105, using a five-point Laplacian with clamped edges.',
      'Make f and k vary from cell to cell with the picture’s tone, so light and dark regions sit at different places in the pattern map.',
      'Choose a preset pair of f and k: coral, worms, spots, maze or dividing cells.',
    ],
    history: 'Alan Turing published The Chemical Basis of Morphogenesis in 1952. The Belousov-Zhabotinsky reaction, shown to make spirals and rings in a dish, gave experiments to match. In 1991 Greg Turk, and separately Andrew Witkin and Michael Kass, brought reaction-diffusion to computer graphics, and in 1993 John Pearson charted the patterns of the Gray-Scott model. In 1995 Kondo and Asai showed that the stripes of angelfish move over time as such a model predicts.',
    uses: ['Modelling animal coats, shells and fingerprints', 'Procedural textures for games and film', 'Generative art and architecture', 'Chemistry and developmental biology teaching'],
    tips: [
      { text: 'Worms give long, winding stripes.', set: { preset: 'worms' } },
      { text: 'Mitosis makes cells that keep dividing.', set: { preset: 'mitosis', speed: 10 } },
      { text: 'Strong steering shows the picture more clearly.', set: { steer: 90 } },
    ],
    terms: [['Morphogen', 'A chemical that gives cells signals about form and position.'], ['Laplacian', 'A measure of how different a point is from its neighbours, which drives diffusion.'], ['Gray-Scott model', 'A pair of equations for feeding and killing two chemicals that spread.']],
    related: ['physarum', 'differential-growth', 'cellular-automata'],
  },

  'flow-field': {
    facts: { from: 'Fluid dynamics and generative art', era: '1997 method, popular from the 2010s', bestOn: 'Pictures with clear outlines' },
    why: 'A streamline is the path a speck of dust would take in a steady wind. Drawing many of them, evenly spaced, shows the whole shape of the wind. Here the wind swirls according to smooth noise, but near edges in your picture it turns to run along them, so outlines appear as places where the flow bends.',
    how: [
      'Make the direction field from fractal noise, with an angle θ = 2π × 2.2 × fbm, so it swirls without jumps.',
      'Where the picture has an edge, rotate the field toward the edge’s tangent, perpendicular to the gradient of lightness.',
      'Place seeds on a jittered grid and accept one only if it is at least 0.8 of the spacing from every existing line.',
      'Trace each line both ways in steps of 0.45 of the spacing, stopping when it comes too close to another.',
      'Draw the lines with width and colour from the picture.',
    ],
    history: 'Streamlines are old tools in fluid dynamics. Bruno Jobard and Wilfrid Lefer published the evenly spaced method in 1997 for scientific visualisation of wind and flow. In the 2010s and 2020s, flow fields became a staple of generative art, with artists such as Tyler Hobbs using them for collections like Fidenza in 2021.',
    uses: ['Wind, current and field visualisation', 'Hair and fur direction in 3D art', 'Generative art prints and plotter drawings', 'Engineering flow analysis'],
    tips: [
      { text: 'Tight spacing and strong following draw the picture in fine hair.', set: { space: 3, follow: 90 } },
      { text: 'Large swirls feel like wind over a field.', set: { scale: 85, follow: 30 } },
      { text: 'Ink lines on night paper glow like silk threads.', set: { colour: 'night' } },
    ],
    terms: [['Streamline', 'A curve that is everywhere tangent to a flow.'], ['fbm', 'Fractal Brownian motion, a sum of noise at several scales.'], ['Tangent', 'The direction along a curve at a given point.']],
    related: ['domain-warp', 'contour-lines', 'physarum'],
  },

  'circle-packing': {
    facts: { from: 'Geometry', era: 'Ancient, with modern computer methods', bestOn: 'Pictures with a clear contrast between dark and light' },
    why: 'Packing circles into a space is the problem of fitting round things as tightly as they will go. By letting the picture set how large each circle may grow, the same process draws a portrait out of bubbles, where large circles gather in the chosen tones and small ones fill the gaps.',
    how: [
      'Try random points and ask how big a circle could be centred there.',
      'Take the smallest of four limits: the radius the picture asks for, the distance to the four walls, and the distance to every neighbour minus its radius and the gap.',
      'If the answer is at least the smallest allowed radius, place the circle.',
      'Use a grid of cells as wide as the largest circle so only the nine nearest cells are searched.',
      'The wanted radius is r_min × 1.6 + (r_max − 1.6 r_min) f^0.9, where f is the tone, so large circles gather where the picture asks.',
    ],
    history: 'Apollonius of Perga described circles tangent to three others in the third century BC. René Descartes wrote a relation among four touching circles in 1643, rediscovered by Frederick Soddy in 1936 as a poem. The circle packing theorem, proved by Koebe in 1936 and later developed by Thurston in the 1980s, links packings to networks of points.',
    uses: ['Bubble charts and hierarchical data views', 'Packaging, cable bundles and pipes', 'Logo and poster design', 'Cell and foam structure studies'],
    tips: [
      { text: 'Large circles gathering in the light parts invert the look.', set: { size: 'light' } },
      { text: 'Ring mode makes bubbles with open centres.', set: { look: 'ring', gap: 3 } },
      { text: 'Tiny minimum circles fill almost every gap.', set: { min: 1.5, max: 30 } },
    ],
    terms: [['Packing', 'Placing shapes in a space without overlap.'], ['Apollonian gasket', 'A fractal made by filling gaps between circles with more circles.'], ['Tangent', 'Touching at a single point.']],
    related: ['bokeh', 'poisson-stippling', 'voronoi-mosaic'],
  },

  'string-art': {
    facts: { from: 'Mathematical teaching and craft', era: 'Curve stitching in the 1860s, computed portraits from 2016', bestOn: 'High contrast portraits' },
    why: 'A single thread wound back and forth between nails can render a face, because every pass of the thread darkens the path it covers a little, and many thin lines add up to tone. The trick is choosing the next nail so that each pass lands on the darkest part still unpainted.',
    how: [
      'Turn the picture into a target on a 240-pixel grid, where T = (1 − L)^1.2 for dark thread on a light board, or L^1.2 for pale thread on black.',
      'Place the nails on a circle or along the frame.',
      'From the current nail, test every other nail, skipping the nearest two on each side, and measure the mean target along each straight line.',
      'Pick the best, halve the score of any path used before, wind the thread there and subtract the thread strength from the target along the line.',
      'Stop at the chosen thread length or when no line scores above 0.012.',
    ],
    history: 'Mary Everest Boole, a mathematics teacher, introduced curve stitching with cards and thread in the 1860s to teach geometry. Nail and thread pictures became a craft in the twentieth century. In 2016 the artist Petros Vrellis published a portrait made with a single thread around a circular loom, which started a wave of programs that find the thread path.',
    uses: ['Portraits and wall art for gifts', 'Teaching envelopes of curves', 'CNC and robot drawing', 'Laser cut and woven designs'],
    tips: [
      { text: 'Plenty of lines and a pale thread on a dark board shine like light.', set: { colour: 'white', lines: 4500 } },
      { text: 'A frame of nails makes a rectangular portrait.', set: { shape: 'frame' } },
      { text: 'A fainter thread gives a softer, more graduated tone.', set: { strength: 8, lines: 5000 } },
    ],
    terms: [['Greedy algorithm', 'A method that picks the best-looking next step each time without looking ahead.'], ['Envelope', 'The curve that a family of straight lines seems to trace.'], ['Opacity', 'How much a layer hides what is beneath it.']],
    related: ['spirograph', 'hilbert-curve', 'charcoal-sketch'],
  },

  'lissajous-curves': {
    facts: { from: 'Acoustics and physics', era: '1857', bestOn: 'Dark backgrounds with bright centres' },
    why: 'If one point swings left and right while another swings up and down at a different rate, the pair trace a curve. Simple ratios of the two rates make loops and knots that close up. The phase decides how open the curve is, from a straight line to an ellipse and a tangled figure between.',
    how: [
      'Compute x = A sin(a t + φ) and y = B sin(b t).',
      'For whole numbers a and b, the curve closes; if they share a factor g it repeats after 2π/g.',
      'In knot mode, draw one big curve as 2,600 short segments, with the chosen number of ribbons, each with the phase advanced by 0.22 radians.',
      'Colour each segment from the picture at its midpoint and set its width from darkness.',
      'In table mode, draw a grid in which the cell in column i and row j holds the curve with frequencies (i + 1, j + 1).',
    ],
    history: 'Jules Antoine Lissajous studied the figures in 1857 by bouncing a beam of light off mirrors attached to two tuning forks. The American navigator Nathaniel Bowditch had described them in 1815. Victorian harmonographs drew similar figures with pendulums. Oscilloscopes in X-Y mode show Lissajous figures when two signals are compared, and laser shows use them.',
    uses: ['Comparing signal frequencies on an oscilloscope', 'Laser light shows', 'Decorative art and harmonograph prints', 'Teaching harmonic motion'],
    tips: [
      { text: 'Equal frequencies with a quarter-turn phase give a circle.', set: { mode: 'knot', a: 5, b: 5, phase: 90 } },
      { text: 'A 3 to 2 ratio draws a trefoil-like knot.', set: { a: 3, b: 2, ribbons: 5 } },
      { text: 'The table shows how every ratio looks at once.', set: { mode: 'table', cells: 7 } },
    ],
    terms: [['Frequency', 'The number of swings per unit time.'], ['Phase', 'How far through its cycle one swing is compared with another.'], ['Harmonograph', 'A pendulum machine that draws curves.']],
    related: ['oscilloscope', 'spirograph', 'strange-attractors'],
  },

  metaballs: {
    facts: { from: 'Computer graphics', era: '1980s', bestOn: 'Pictures with bright spots on dark ground, or the reverse' },
    why: 'Metaballs are blobs that have no outline of their own. Each ball contributes a field that fades with distance, and the fields add up. Wherever the sum is above a level, there is body. When two balls are far apart each stands alone, and as they approach, the fields add in the gap until a smooth neck of matter joins them. That melting is what makes the shape look like liquid.',
    how: [
      'Give each ball a field (1 − r²/R²)³ out to R = 2.6 times its radius, and zero beyond.',
      'Add all the fields, and call a pixel inside the body wherever the total passes the level, which moves from 0.95 (apart) to 0.28 (merged) with the slider.',
      'Choose ball positions by rejection sampling with probability 0.04 + 0.96 w^1.3, where w is the tone of the picture (light, dark or even).',
      'Light the surface by treating the field as a height and using its gradient as a normal.',
      'Take colour from the picture underneath, with an optional faint ghost of the original behind.',
    ],
    history: 'Jim Blinn introduced the blobby model in 1982 while working on ways to draw molecules, and similar ideas were developed by researchers in Japan and by the Wyvill brothers in the mid 1980s. Metaballs became a standard tool in 3D modelling programs and a classic demoscene effect, and the moving blobs of lava lamps are a physical cousin.',
    uses: ['Fluid and organic shapes in 3D modelling', 'Medical scans and isosurface visualisation', 'Demoscene and game effects', 'Interface animations that merge and separate'],
    tips: [
      { text: 'High merge makes the balls melt into one shape.', set: { goo: 90 } },
      { text: 'Low merge keeps clear bubbles apart.', set: { goo: 5, gloss: 85 } },
      { text: 'Balls gathering in the dark parts invert the portrait.', set: { where: 'dark', count: 700 } },
    ],
    terms: [['Implicit surface', 'A surface defined by where a function equals a value.'], ['Isosurface', 'The set of points where a field has the same value.'], ['Rejection sampling', 'Choosing random points and keeping each with a chosen probability.']],
    related: ['liquid-morph', 'ink-in-water', 'particles'],
  },
};
