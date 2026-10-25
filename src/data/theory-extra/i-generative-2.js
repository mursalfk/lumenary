// src/data/theory-extra/i-generative-2.js
// Section I, geometric and generative (second half): the fuller story of each treatment.
export const EXTRA_GENERATIVE_2 = {
  'warped-grid': {
    facts: { from: 'Data art and graphic design', era: '1970 plot, 1979 record sleeve', bestOn: 'Portraits with clear light and dark regions' },
    why: 'A picture can be shown without drawing it, simply by the way it disturbs something regular. A plain grid pushed around by light and dark looks like a sheet of rubber with a picture set in it, and stacked horizontal lines that rise over bright areas look like a mountain range. The shapes appear from the lines crowding and spreading, not from any colour being filled.',
    how: [
      'Blur the lightness over about 10 pixels and take its gradient by central differences.',
      'In grid mode, move each point of the lines to x′ = x − k ∇L, so lines crowd on one side of every light-to-dark edge and spread on the other.',
      'Give each short piece of line the picture’s colour and a thickness between 0.45 and 1.85 times the line width, from its tone.',
      'In ridges mode, stack horizontal lines and lift each one over the picture, so bright (or dark) regions form hills.',
      'Hide lines behind the ridges in front, so the hills look solid.',
    ],
    history: 'The stacked-ridge picture is best known from the cover of Joy Division’s album Unknown Pleasures (1979), designed by Peter Saville. It uses a plot of radio pulses from the pulsar CP 1919 that Harold Craft made for his Cornell thesis in 1970, reprinted in the Cambridge Encyclopaedia of Astronomy. Such stacked plots are now called joy plots or ridgeline plots in data visualisation.',
    uses: ['Record sleeves, posters and book covers', 'Ridgeline charts in data journalism', 'Terrain and signal visualisation', 'Textile and relief graphics'],
    tips: [
      { text: 'Ridges with the dark rising give a mountain portrait.', set: { mode: 'ridges', up: 'dark' } },
      { text: 'Many fine lines make the picture cleaner.', set: { lines: 120, warp: 70 } },
      { text: 'Mono lines on cream paper look like an etching.', set: { colour: 'mono', paper: 'cream' } },
    ],
    terms: [['Gradient', 'The direction and rate in which a value, such as brightness, changes fastest.'], ['Ridgeline plot', 'A set of overlapping curves stacked one above another.'], ['Pulsar', 'A spinning neutron star that sends out regular pulses of radio waves.']],
    related: ['contour-lines', 'flow-field', 'op-art-moire'],
  },

  'wave-function-collapse': {
    facts: { from: 'Constraint solving and procedural generation', era: '2016', bestOn: 'Pictures with a clear mix of light and dark' },
    why: 'The name comes from quantum mechanics, where something can be in many states until it is measured. Here every cell starts as every possible tile, and the algorithm repeatedly settles the most constrained cell. Because neighbours must agree about the edge they share, one choice forces others, and the whole sheet falls into a consistent drawing without any plan.',
    how: [
      'Treat each tile as a square with a line leaving through any of its four sides, a 4-bit number, so there are 16 tiles.',
      'Apply the one rule: two neighbouring tiles must both have a line through their shared side, or neither. The sheet’s edge is closed.',
      'Start every cell with all 16 possibilities held in a 16-bit mask.',
      'Pick the cell with the fewest tiles left (lowest entropy, plus a little random noise to break ties), then choose one of its tiles with weights from the picture.',
      'Propagate: remove from neighbours any tile that no longer fits, and repeat until all cells are settled.',
    ],
    history: 'Maxim Gumin published the algorithm in 2016, building on the model synthesis of Paul Merrell (2007) and on texture synthesis research. It spread quickly in game design, where it was used in titles such as Bad North, Caves of Qud and Townscaper to build levels and towns that always make sense.',
    uses: ['Procedural levels, maps and towns for games', 'Texture and pattern synthesis', 'Architecture and layout generation', 'Constraint puzzles such as Sudoku'],
    tips: [
      { text: 'Chamfered corners give a circuit-board look.', set: { draw: 'chamfer' } },
      { text: 'Strong picture control makes dense lines in the dark.', set: { density: 100, size: 14 } },
      { text: 'Ink on night paper makes a glowing maze.', set: { colour: 'ink', paper: 'night' } },
    ],
    terms: [['Entropy', 'Here, a measure of how many choices a cell still has.'], ['Constraint propagation', 'Passing the consequences of a choice to neighbouring cells.'], ['Bitmask', 'A number whose binary digits mark which options are possible.']],
    related: ['truchet-tiles', 'circuit-board', 'cellular-automata'],
  },

  'l-system-trees': {
    facts: { from: 'Theoretical biology', era: '1968', bestOn: 'Landscapes and pictures with bright spots for leaves' },
    why: 'Plants grow by repeating one rule at every tip: a shoot grows, then splits. An L-system captures that as a grammar, a rule that rewrites a part of the plant into more parts. Run it a few times and a trunk becomes a crown of thousands of twigs, all different, all following the same rule, which is how real trees look.',
    how: [
      'Draw a branch with a length and width, then start two children from its end (three with a 14 percent chance after the first generations).',
      'Turn each child by plus or minus the spread angle times a random factor between 0.6 and 1.4, plus a share of the wind and a little jitter.',
      'Make each child as long as the decay slider times a random 0.82 to 1.18, and 0.72 times as wide.',
      'Stop when the depth runs out or the branch is shorter than 3 px, and place a leaf there; a few leaves appear on the way.',
      'Colour each leaf from the picture and add a faint wash of the original behind.',
    ],
    history: 'The Hungarian-born biologist Aristid Lindenmayer introduced L-systems in 1968 to describe how filaments of algae grow. In 1990 Przemysław Prusinkiewicz and Lindenmayer published The Algorithmic Beauty of Plants, which showed how the method draws realistic plants. Procedural trees and plants in films and games are grown with descendants of this idea.',
    uses: ['Trees and plants in games and film', 'Botanical models of growth', 'Fractal art and plotter drawings', 'Teaching recursion in programming'],
    tips: [
      { text: 'A wide spread with short decay gives a rounded oak.', set: { spread: 45, decay: 70, depth: 11 } },
      { text: 'A strong wind leans the whole crown.', set: { wind: 28 } },
      { text: 'A forest of many small trees fills the picture.', set: { trees: 6, depth: 8 } },
    ],
    terms: [['L-system', 'A set of rewriting rules that grows a string, and from it a drawing.'], ['Recursion', 'A rule that uses itself to do its job.'], ['Generation', 'One round of applying the rule.']],
    related: ['space-colonization', 'differential-growth', 'phyllotaxis'],
  },

  phyllotaxis: {
    facts: { from: 'Botany and mathematics', era: 'Observed for centuries, explained in 1979', bestOn: 'Round compositions and portraits' },
    why: 'In a sunflower the seeds sit in curving rows that run both clockwise and anticlockwise, and the number of rows is almost always two neighbouring Fibonacci numbers. The reason is simple. If each new seed is placed a fixed angle round from the last, and that angle is the golden angle, no seed ever lines up with another for long, so the seeds pack as evenly as they can.',
    how: [
      'Place seed number i at angle i α from the centre, with α = 2π/φ², about 137.5 degrees.',
      'Place it at a distance c √(i + ½) from the centre, which gives every seed an equal share of area.',
      'Choose c = R/√n so that the n seeds just reach the picture’s edge.',
      'Look up the colour of the picture at each seed, and let the size follow the picture’s tone by an adjustable amount.',
      'Draw each as a disc, petal or square, turning petals along the radius.',
    ],
    history: 'Phyllotaxis means leaf arrangement, a word from the 1750s, and its Fibonacci numbers were noted by Karl Schimper and Alexander Braun in the 1830s. The Bravais brothers recognised the golden angle in 1837. Helmut Vogel gave the simple formula in 1979, and in 1992 Stéphane Douady and Yves Couder reproduced the pattern with drops of magnetic fluid dripping onto a dish.',
    uses: ['Natural patterns in botany and plant breeding', 'Logo, textile and jewellery design', 'Antenna and lens layouts that avoid regular gaps', 'Teaching the golden ratio'],
    tips: [
      { text: 'The exact golden angle gives crisp spirals.', set: { angle: 137.51 } },
      { text: 'A tiny change of angle breaks the spirals into rays.', set: { angle: 137.0, dots: 12000 } },
      { text: 'Petals make a flower head.', set: { shape: 'petal', size: 100 } },
    ],
    terms: [['Golden angle', 'About 137.5 degrees, the angle that divides a circle in the golden ratio.'], ['Fibonacci numbers', 'The sequence 1, 1, 2, 3, 5, 8, 13, and so on, each the sum of the last two.'], ['Parastichy', 'One of the spiral rows seen in a sunflower or pine cone.']],
    related: ['l-system-trees', 'circle-packing', 'mandala'],
  },

  'hilbert-curve': {
    facts: { from: 'Mathematics', era: '1891', bestOn: 'Pictures with fine detail' },
    why: 'The Hilbert curve is one unbroken line that visits every cell of a square grid and never crosses itself. Points that are near each other along the line are also near each other on the page, which makes it a good way to fold a long list into a flat image without tearing neighbourhoods apart. Here that line takes its colour from your picture.',
    how: [
      'Order k covers a 2ᵏ by 2ᵏ grid in 4ᵏ steps, and is built by recursion: four copies of the previous order, the two lower ones turned a quarter turn in opposite directions, joined end to end.',
      'The program skips the recursion and converts each step number into a grid position two binary digits at a time, turning and flipping the partial position as it goes.',
      'Neighbouring steps are always neighbouring cells, so the line is continuous.',
      'Draw from cell centre to cell centre, with the colour of the picture at each cell.',
      'Let the line weight follow the picture’s darkness.',
    ],
    history: 'Giuseppe Peano published the first space-filling curve in 1890, and David Hilbert found the simpler version in 1891. The curve is used to index points in databases and maps, in image processing and for cache friendly memory layouts. The webcomic xkcd used it to draw a map of the internet in 2006, since addresses close in number stay close on the map.',
    uses: ['Spatial indexing in databases', 'Mapping long lists, such as internet addresses, onto a plane', 'Image compression and halftoning', 'Plotter and laser drawings'],
    tips: [
      { text: 'A low order shows the shape of the curve itself.', set: { order: 3, line: 0.9 } },
      { text: 'A high order with a thin line draws the picture as one thread.', set: { order: 8, line: 0.4 } },
      { text: 'Butt caps give crisp, mechanical corners.', set: { cap: 'butt', colour: 'ink' } },
    ],
    terms: [['Space-filling curve', 'A line that passes through every point of a region.'], ['Locality', 'Points close along the curve are also close in the plane.'], ['Recursion', 'A rule that builds a shape from smaller copies of itself.']],
    related: ['truchet-tiles', 'string-art', 'wave-function-collapse'],
  },

  'cellular-automata': {
    facts: { from: 'Mathematics and computing', era: '1940s theory, Life in 1970', bestOn: 'Pictures with a good spread of light and dark' },
    why: 'A cellular automaton is a world made of squares that live, die or are born according to a rule about their neighbours. Nothing in the rule mentions gliders, guns or oscillators, and yet they appear. It is a small experiment in how complex behaviour can arise from very simple local rules, and the picture sets only where life starts out thickest.',
    how: [
      'Hold a grid of alive and dead cells that wraps round at the edges like a torus.',
      'Update every cell at once: a dead cell is born if its number of living neighbours is in the birth set B, and a living cell survives if the number is in the survival set S.',
      'Use the Life-like rules: Life B3/S23, HighLife B36/S23, Day and Night B3678/S34678, Coral B3/S45678 and Maze B3/S12345.',
      'Start each cell alive with a probability that rises with the picture’s tone, so the picture shows as a density of life.',
      'Fade dead cells slowly with an afterglow so you can see where life has been, and let the cursor plant new cells.',
    ],
    history: 'John von Neumann and Stanislaw Ulam explored self-reproducing cells in the 1940s. John Conway invented the Game of Life in 1970, and Martin Gardner introduced it to the public in Scientific American the same year. Stephen Wolfram surveyed one-dimensional automata in the 1980s, and Life, as well as his Rule 110, has been proved able to compute anything a computer can.',
    uses: ['Modelling growth, forest fires and traffic', 'Procedural cave and terrain generation in games', 'Teaching emergence and computation', 'Generative art and music'],
    tips: [
      { text: 'Maze grows winding corridors from a scatter.', set: { rule: 'maze', start: 12 } },
      { text: 'Coral builds slow, solid reefs.', set: { rule: 'coral', speed: 8 } },
      { text: 'A long afterglow draws trails of every moving shape.', set: { trail: 95, colour: 'phosphor' } },
    ],
    terms: [['Cellular automaton', 'A grid of cells that all update together by a local rule.'], ['Glider', 'A small pattern in Life that travels across the grid.'], ['Emergence', 'Complex behaviour that arises from simple rules.']],
    related: ['wave-function-collapse', 'reaction-diffusion', 'matrix-rain'],
  },

  physarum: {
    facts: { from: 'Biology and computing', era: 'Experiments in 2000, model in 2010', bestOn: 'Pictures with bright shapes on dark ground' },
    why: 'A slime mould is a single cell with no brain, and yet it finds short routes through a maze and builds networks that look like rail maps. Each part follows a simple rule: move toward the strongest scent of its own kind, and leave scent behind. Trails that many cells use grow stronger and trails nobody uses fade, so the best routes win.',
    how: [
      'Give each agent a position and heading, and let it sense the trail map at three points a distance d ahead: straight and 28 degrees left and right.',
      'If the middle reading is highest, go straight; if both sides are higher, turn at random; otherwise turn toward the higher side.',
      'Step one cell forward and deposit 0.3 units of chemical.',
      'Each frame blur the trail map with a small kernel and multiply by the decay factor, so trails spread and fade.',
      'Add food from the picture, so cells are drawn toward the light (or the dark) parts of it.',
    ],
    history: 'Toshiyuki Nakagaki and colleagues showed in 2000 that Physarum polycephalum can solve a maze. In 2010 Atsushi Tero and colleagues placed oat flakes in the pattern of cities around Tokyo and the mould grew a network similar to the real rail system. Jeff Jones published the agent model in 2010, and it has been used in generative art and network design research.',
    uses: ['Network and route planning research', 'Generative art and music visuals', 'Teaching self-organisation', 'Texture design with vein-like patterns'],
    tips: [
      { text: 'Long-lasting trails make thick, stable networks.', set: { decay: 98, agents: 12 } },
      { text: 'Strong attraction pulls the mould into the shape of your picture.', set: { food: 80 } },
      { text: 'Seeking the dark grows around the bright shapes.', set: { seek: 'dark', colour: 'moss' } },
    ],
    terms: [['Slime mould', 'A single celled organism that moves and feeds in a network.'], ['Agent', 'A small program with its own position and rules.'], ['Stigmergy', 'Coordination through marks left in the environment.']],
    related: ['reaction-diffusion', 'boids', 'differential-growth'],
  },

  'differential-growth': {
    facts: { from: 'Biology and generative design', era: '2010s', bestOn: 'Pictures with mid tones and shadows' },
    why: 'When a skin grows faster than what lies under it, it has to fold. The folds of a brain, a lettuce leaf, a coral and a ruffled collar all come about this way. The program models a growing line: neighbours pull together, strangers push apart, and extra points are inserted as the line stretches, so it buckles into coral. Shadows fold tighter than lights.',
    how: [
      'Hold a closed loop of points with a rest length ℓ.',
      'Add a spring to each neighbour (0.22 times the stretch), a smoothing pull toward the midpoint of the neighbours (0.06), and a repulsion from non-adjacent points closer than about 2.6 ℓ.',
      'Push points back from the picture’s margin, add a little jitter and limit each step to half a rest length.',
      'Insert a point wherever an edge has stretched beyond 1.55 ℓ, and sometimes in longer edges, so the loop lengthens.',
      'Let the picture change ℓ locally, so folds are smaller in the shadows, and use a spatial hash to keep the search fast.',
    ],
    history: 'Biologists and mathematicians have studied how growth creates folds for a long time. A 2014 gel model of the developing brain, by Tuomas Tallinen, L. Mahadevan and colleagues, showed that the folds of the cortex follow from a swelling outer layer on a core. Studios such as Nervous System and artists such as Anders Hoff brought differential growth into design from the 2010s.',
    uses: ['Jewellery, lamps and lace-like design', 'Models of brain folding and tissue growth', 'Generative art and plotter drawings', 'Organic textures for 3D art'],
    tips: [
      { text: 'Small folds make fine, brain-like coral.', set: { edge: 3, grow: 90 } },
      { text: 'Large folds make bold, ruffled shapes.', set: { edge: 13, seeds: 2 } },
      { text: 'Ink on night paper looks like lace.', set: { colour: 'ink', paper: 'night' } },
    ],
    terms: [['Cortex', 'The folded outer layer of the brain.'], ['Rest length', 'The length at which a spring pulls neither way.'], ['Spatial hash', 'A grid used to find nearby points quickly.']],
    related: ['reaction-diffusion', 'l-system-trees', 'physarum'],
  },

  'strange-attractors': {
    facts: { from: 'Chaos theory', era: '1960s onward', bestOn: 'Colourful pictures, which tint the cloud' },
    why: 'A strange attractor is the shape drawn by a point that follows a simple rule for ever. The point never repeats and never escapes, and two points that start close together move apart quickly, which is the sign of chaos, yet both stay on the same fine, filamented set. A tiny change in four numbers gives a completely different picture.',
    how: [
      'Use one of two maps: Clifford’s x′ = sin(a y) + c cos(a x), y′ = sin(b x) + d cos(b y), or Peter de Jong’s x′ = sin(a y) − cos(b x), y′ = sin(c x) − cos(d y).',
      'Each frame follow 48 points for 1,100 steps each.',
      'Add every landing to a density histogram half the size of the picture.',
      'Dim the histogram each frame by the linger factor, so the image is a running average that shows a glowing cloud.',
      'Let the four numbers drift slowly, so the attractor breathes, and tint it from the picture.',
    ],
    history: 'Edward Lorenz found chaos in a weather model in 1963, and Michel Hénon published his map in 1976. Peter de Jong’s and Clifford Pickover’s maps became popular in the 1980s and 1990s, especially through Pickover’s books on computers, pattern and chaos. Strange attractors now appear in studies of weather, circuits, heartbeats and population dynamics.',
    uses: ['Studying chaos in weather, circuits and populations', 'Generative art and screensavers', 'Music visualisation', 'Teaching sensitive dependence on initial conditions'],
    tips: [
      { text: 'De Jong gives silkier, more symmetric clouds.', set: { type: 'dejong' } },
      { text: 'A strong drift makes the attractor morph quickly.', set: { drift: 90, glow: 85 } },
      { text: 'The ember palette gives a fiery glow.', set: { colour: 'ember', fade: 94 } },
    ],
    terms: [['Attractor', 'A set that a system settles into over time.'], ['Chaos', 'Extreme sensitivity to starting conditions, in a rule that is not random.'], ['Density histogram', 'A count of how often each position was visited.']],
    related: ['fractal-flame', 'lissajous-curves', 'mandelbrot-fill'],
  },

  'fourier-epicycles': {
    facts: { from: 'Mathematics and ancient astronomy', era: 'Ptolemy’s epicycles, Fourier 1822', bestOn: 'Bold shapes with one clean outline' },
    why: 'Any closed curve can be drawn by a chain of turning circles, each riding on the rim of the one before. This is the idea behind the Fourier series: break a shape into pure rotations of different speeds and sizes. A few big circles trace the rough outline, and each additional small one adds finer detail, so the picture sharpens as circles are added.',
    how: [
      'Find a long closed contour in a lightly blurred, half-size copy of the picture with marching squares, at the level chosen by the slider.',
      'Resample it at 1,024 points of equal arc length and treat each point as a complex number z(t).',
      'Compute all 1,024 Fourier coefficients c_k once, using a discrete Fourier transform.',
      'Sort them by size and keep the largest few: z(t) = Σ c_k e^(2πikt), each a circle of radius |c_k| turning k times per cycle.',
      'Chain the circles, each starting at the rim of the one before, and trace the tip of the last one.',
    ],
    history: 'Ancient astronomers, among them Hipparchus and Ptolemy, explained the wandering of planets with circles on circles called epicycles. Joseph Fourier showed in 1822 that any periodic signal is a sum of waves. The mathematician John von Neumann is said to have joked that with four parameters he could fit an elephant, and in 2010 researchers did draw one with just a handful of Fourier terms. A 2019 video by Grant Sanderson of 3Blue1Brown made the picture of drawing with circles widely known.',
    uses: ['Audio, image and video compression', 'Signal analysis in physics and engineering', 'Teaching the Fourier transform', 'Drawing machines and animation'],
    tips: [
      { text: 'Few circles give a rough, wobbly sketch.', set: { terms: 8, trail: 100 } },
      { text: 'Many circles reproduce the outline closely.', set: { terms: 200, rings: false } },
      { text: 'A gold pen on the circles looks like an orrery.', set: { colour: 'gold', period: 24 } },
    ],
    terms: [['Epicycle', 'A circle whose centre moves along the rim of another circle.'], ['Fourier series', 'A sum of waves or rotations that rebuilds a shape or signal.'], ['Marching squares', 'A method for finding contour lines on a grid.']],
    related: ['lissajous-curves', 'oscilloscope', 'spirograph'],
  },

  'contour-lines': {
    facts: { from: 'Cartography and surveying', era: '1700s onward', bestOn: 'Pictures with smooth tonal shapes' },
    why: 'A contour line joins points of the same height, and on a map where lines crowd together the ground is steep. Reading your picture’s brightness as height turns it into a landscape and lets the same map language describe it: tight lines at sharp edges, wide gaps in the smooth parts, a heavier line at regular steps to help the eye count.',
    how: [
      'Smooth the lightness by the chosen radius and treat it as a height F(x, y).',
      'For each level k/n, find the line F = k/n with marching squares on cells about 1.5 px wide.',
      'Find where the line crosses each cell side by interpolation: t = (level − F_a)/(F_b − F_a).',
      'Chain the pieces into long polylines and draw them as smooth curves.',
      'Draw every fifth line heavier as an index contour, and tint the bands between.',
    ],
    history: 'Edmond Halley published a map of lines of equal magnetic variation in 1701, among the first uses of lines of equal value. In the 1770s, during the experiment on the Scottish mountain Schiehallion, Charles Hutton used contour lines to calculate the mountain’s volume. Contours became the standard way to show relief on topographic maps in the nineteenth century.',
    uses: ['Topographic maps and hiking guides', 'Weather charts with isobars and isotherms', 'Medical and engineering scans', 'Decorative terrain art'],
    tips: [
      { text: 'Many levels with the picture tinting each band look like a survey map.', set: { levels: 40, fill: 'picture' } },
      { text: 'Heavy smoothing turns the picture into gentle hills.', set: { smooth: 14, levels: 14 } },
      { text: 'No fill and ink lines look like a pen drawing.', set: { fill: 'none', ink: 'ink' } },
    ],
    terms: [['Contour line', 'A line joining points of equal height.'], ['Index contour', 'A heavier line drawn at regular steps for easy reading.'], ['Isoline', 'Any line of equal value, such as pressure or temperature.']],
    related: ['warped-grid', 'flow-field', 'ink-wash'],
  },

  'poisson-stippling': {
    facts: { from: 'Sampling theory and scientific illustration', era: '1980s computer graphics', bestOn: 'Portraits and engravings-style subjects' },
    why: 'Random dots clump and leave gaps, while a grid shows its rows. The eye prefers something in between: dots that are random but never too close. This is called blue noise, and it looks smooth and natural because it has no long-range pattern. Here the minimum distance shrinks in the shadows, so the dots crowd together there and thin out in the lights.',
    how: [
      'Set the minimum distance r(x) = r_max − (r_max − r_min) h^γ, where h is the darkness under the point and γ the contrast.',
      'Try random points, up to 4.5 times the area divided by r_min², at most 900,000 of them.',
      'Keep a point only if its distance from every dot kept so far is at least the mean of the two radii.',
      'Use a grid of cells r_max wide so only the nine nearest cells need checking.',
      'Draw each dot in ink, sepia or the picture’s colour.',
    ],
    history: 'Stippling is an old technique in pen and ink illustration, used for botany and anatomy. Robert Cook introduced stochastic sampling to computer graphics in 1986, and Don Mitchell and others developed blue noise sampling in the early 1990s. Robert Bridson published a fast algorithm in 2007. The psychologist John Yellott observed in 1983 that the receptor cells in a monkey’s eye are arranged in a similar pattern.',
    uses: ['Pen and ink style illustration and print', 'Sampling for ray tracing and image processing', 'Placing trees, rocks and stars in games', 'Halftoning and dithering'],
    tips: [
      { text: 'Fine spacing and small dots look like a pen drawing.', set: { fine: 1.5, dot: 25 } },
      { text: 'Sepia ink makes an old natural history plate.', set: { colour: 'sepia', paper: 'cream' } },
      { text: 'Higher contrast pushes more dots into the shadows.', set: { gamma: 180 } },
    ],
    terms: [['Blue noise', 'Random points with no clumps and no regular pattern.'], ['Poisson-disk sampling', 'Random sampling in which no two points are closer than a chosen distance.'], ['Stipple', 'To make tone by a pattern of dots.']],
    related: ['halftone', 'dithering', 'voronoi-mosaic'],
  },

  'space-colonization': {
    facts: { from: 'Computational botany', era: '2005 to 2007', bestOn: 'Dark shapes on a light ground' },
    why: 'Plants compete for light, and a branch grows toward open space. The algorithm scatters food and lets branches grow toward the nearest food they can sense. When a branch reaches a morsel it eats it, so the next branch has to reach further. This is enough to make trees, roots and the veins of a leaf, and the picture decides where the food is.',
    how: [
      'Scatter attractors (food), thicker where you want growth, and start a few nodes at the roots.',
      'Each round, every attractor finds the nearest node within the sensing distance.',
      'Every node with at least one attractor in its care grows a new node a step D away, in the direction of the sum of the unit vectors toward its attractors.',
      'Remove any attractor that comes within 2.4 D of a node.',
      'Stop when no attractor is influencing anything, after 900 rounds, or at 40,000 nodes, and thicken the branches near the root.',
    ],
    history: 'Adam Runions and colleagues described the venation algorithm for leaves in 2005, and Runions, Brendan Lane and Przemyslaw Prusinkiewicz extended it to trees in 2007. It has been used for procedural plants in films and games, and for modelling blood vessels, rivers, roads and lightning.',
    uses: ['Procedural trees, roots and leaf veins', 'Modelling rivers, blood vessels and road networks', 'Lightning and crack effects', 'Generative art'],
    tips: [
      { text: 'Roots at the bottom grow a tree upward.', set: { root: 'bottom', thick: 10 } },
      { text: 'Roots on the edges grow inward like frost.', set: { root: 'edges', density: 100 } },
      { text: 'A short reach makes dense, fine veins.', set: { reach: 6, step: 3 } },
    ],
    terms: [['Attractor', 'A point of food that branches grow toward.'], ['Venation', 'The pattern of veins in a leaf.'], ['Procedural', 'Generated by rules, not drawn by hand.']],
    related: ['l-system-trees', 'differential-growth', 'physarum'],
  },

  boids: {
    facts: { from: 'Artificial life', era: '1986', bestOn: 'Pictures with a dark background and bright shapes' },
    why: 'A flock of starlings moves as one, with no leader and no plan. Craig Reynolds showed that three rules, applied by each bird to its neighbours only, are enough to give that behaviour. Add a pull toward the light parts of a picture, and a brush for each bird, and the flock slowly paints.',
    how: [
      'Give each bird a position and velocity, and let it see neighbours within 46 px at 720 px wide, found through a hash grid.',
      'Separation: steer away from anything too close, growing strongly as it nears.',
      'Alignment: steer toward the average heading of neighbours. Cohesion: steer toward their average position.',
      'Add the gradient of the picture’s brightness, so birds climb toward light, plus a gentle push from the cursor and a little random force.',
      'Clamp the speed between 0.45 and 1 times the top speed, wrap round at the edges like a torus, and paint with the colour under each bird.',
    ],
    history: 'Craig Reynolds presented boids (bird-oid objects) in 1986 and published the paper in 1987. Flocking of this kind was used for the swarm of bats and the army of penguins in Batman Returns in 1992, and Reynolds received a Scientific and Technical Academy Award in 1998. Similar rules guide drone swarms and crowd simulations.',
    uses: ['Crowds, flocks and schools in film and games', 'Swarm robotics and drone research', 'Generative painting and music visuals', 'Studying collective animal behaviour'],
    tips: [
      { text: 'Comet mode shows each bird as a bright streak.', set: { look: 'comet', count: 900 } },
      { text: 'A tight flock swirls into dense clouds.', set: { flock: 90, speed: 60 } },
      { text: 'Strong pull toward light paints the bright shapes first.', set: { seek: 90, size: 2 } },
    ],
    terms: [['Boid', 'A simulated bird-like agent following simple flocking rules.'], ['Separation, alignment, cohesion', 'The three rules of flocking.'], ['Torus', 'A world that wraps round, so leaving one side re-enters the other.']],
    related: ['particles', 'physarum', 'flow-field'],
  },

  'domain-warp': {
    facts: { from: 'Procedural graphics', era: '2002 onward', bestOn: 'Photographs with colour and texture' },
    why: 'Instead of asking the picture for the colour at a pixel’s own place, ask for the colour at a place that noise has moved it to. Do it again to the noise itself and the result folds back on itself like marbled paper or ink in water. A small amount of bending only wobbles the picture, and a larger amount turns it into smoke.',
    how: [
      'For each pixel at p, compute a displacement d(p) from fractal noise and read the picture at p + d(p).',
      'With one layer, d is the noise q = (fbm(p), fbm(p + c₁)).',
      'With two layers, evaluate the noise again at a point q has moved: r = (fbm(p + 4q + c₂), fbm(p + 4q + c₃)). With three, repeat once more.',
      'Compute the field on a coarse lattice of 5 px cells at half size and interpolate it bilinearly to stay fast.',
      'Let time slowly shift the noise to animate it, and shade the folds for depth.',
    ],
    history: 'Inigo Quilez popularised domain warping in shader programming in the early 2000s, building on Ken Perlin’s noise function of 1983, for which Perlin received an Academy Award in 1997. The visual result is close to the old craft of marbling paper, such as Japanese suminagashi and Turkish ebru.',
    uses: ['Procedural textures for skies, marble and terrain', 'Shader art and music visuals', 'Backgrounds and animated wallpapers', 'Image distortion effects in video'],
    tips: [
      { text: 'Three layers give deep, marbled folds.', set: { layers: 3, amount: 70 } },
      { text: 'A small amount gently ripples the picture like water.', set: { amount: 15, layers: 1 } },
      { text: 'Slow speed and big swirls feel like drifting smoke.', set: { speed: 15, scale: 80 } },
    ],
    terms: [['Noise', 'Smooth random values used to create natural looking variation.'], ['fbm', 'Fractal Brownian motion, a sum of noise at several scales.'], ['Displacement', 'Moving a point from where it is to somewhere else.']],
    related: ['liquid-morph', 'ink-in-water', 'heat-haze'],
  },
};
