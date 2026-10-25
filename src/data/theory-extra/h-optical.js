// src/data/theory-extra/h-optical.js
// Section H, photographic and optical: the fuller story of each treatment.
export const EXTRA_OPTICAL = {
  lomography: {
    facts: { from: 'A Soviet compact camera, then a Vienna photography movement', era: '1984 camera, 1990s movement', bestOn: 'Everyday scenes, street and travel snapshots' },
    why: 'Lomography celebrates what a cheap plastic camera does wrong: colours too rich, shadows too dark, corners lost, edges soft and now and then a stripe of light leaking where the camera back does not close. Each fault is recreated in turn, and together they say that the picture was taken quickly and happily, without worrying about technical quality.',
    how: [
      'Scale each colour’s distance from its own luminance to boost saturation, and multiply the channels by gains for a colour cast.',
      'Apply an S shaped contrast curve whose shoulders flatten more as it grows.',
      'Lay a blurred copy over the sharp one through a radial mask, clear in the middle and increasingly soft towards the corners.',
      'Add one or two large radial gradients near the edge, in colours matching the cast, with screen blending, which can only brighten.',
      'Darken the corners with a vignette and add grain.',
    ],
    history: 'The LOMO LC-A was a compact camera made in Leningrad from 1984. Students from Vienna found one in Prague in the early 1990s, loved its saturated, vignetted pictures and founded the Lomographic Society in 1992, with a playful list of rules such as shoot from the hip and do not think. Lomography then spread through film shops and later phone apps.',
    uses: ['Travel and street photo looks', 'Social posts with a vintage film feel', 'Event and party photo galleries', 'Moodboards and fashion snapshots'],
    tips: [
      { text: 'Strong leak and a green cast look like an expired roll.', set: { leak: 85, cast: 'green' } },
      { text: 'Heavy vignette with high contrast is the classic toy-camera look.', set: { vig: 90, contrast: 80 } },
      { text: 'Cool cast with little leak is calmer.', set: { cast: 'cool', leak: 10 } },
    ],
    terms: [['Vignette', 'Darkening toward the corners of a picture.'], ['Light leak', 'Stray light that reaches the film through a gap and leaves a bright streak.'], ['Screen blend', 'A way of combining layers that can only brighten the result.']],
    related: ['film-grain', 'cross-processed', 'retro-vhs'],
  },

  'film-grain': {
    facts: { from: 'Photographic emulsions', era: '19th century onward', bestOn: 'Portraits and street scenes with mid tones' },
    why: 'Film makes its picture from tiny silver crystals, and where there are few of them, or where they are nearly all exposed, the picture is smooth. In the middle tones the clumps show most. So grain is not uniform noise: it is strongest in the mid tones, weaker in deep shadow and bright highlights, and it picks up a faint colour from the dyes. A film stock also has its own tone curve and colour balance.',
    how: [
      'Lift the darkest level to a toe value and hold the lightest below a shoulder value, with a gentle S in between.',
      'Apply the colour balance of the chosen stock: black and white, a warm portrait film, vivid slide film or cool night film.',
      'Make grain from soft blobs at the grain size plus a fine speckle, with strength following a parabola that peaks in the mid tones.',
      'On colour stocks give each channel 60 percent shared grain and 40 percent its own.',
      'Add halation, a red-orange fringe from highlights bouncing through the film base, then dust, scratches and faded blacks.',
    ],
    history: 'Photographic film coated with light sensitive silver halide crystals replaced glass plates at the end of the nineteenth century. Kodak Tri-X, introduced in 1954, became a favourite of photojournalists for its grain and speed, and later stocks such as Fuji Velvia in 1990 and Kodak Portra in the late 1990s gave particular looks to colour. Film grain is still added to digital footage to make it feel organic.',
    uses: ['Photo and video colour grading', 'Portrait and wedding retouching looks', 'Posters with a film texture', 'Cinematic stills'],
    tips: [
      { text: 'Black and white film with coarse grain looks like 1960s reportage.', set: { stock: 'tri', size: 3.5, amount: 80 } },
      { text: 'Portra with light grain is warm and gentle.', set: { stock: 'portra', amount: 30 } },
      { text: 'Strong halation gives a glowing, dreamy red fringe.', set: { halation: 85 } },
    ],
    terms: [['Silver halide', 'The light sensitive crystals that form an image on traditional film.'], ['Halation', 'A glow around bright highlights caused by light bouncing back through the film.'], ['Toe and shoulder', 'The curved ends of a tone curve, where shadows and highlights are gently compressed.']],
    related: ['lomography', 'cross-processed', 'daguerreotype'],
  },

  infrared: {
    facts: { from: 'Scientific and fine art photography', era: '1910 onward', bestOn: 'Landscapes with trees, grass and open sky' },
    why: 'Chlorophyll reflects near-infrared light very strongly, so in infrared photography green leaves glow nearly white and a blue sky, which reflects very little, goes almost black. A screen can show only visible light, so this treatment estimates the infrared brightness from colour: how green a pixel is, and how blue, pushes it up or down.',
    how: [
      'Measure greenness as how far green leads the larger of red and blue, scaled by the foliage slider.',
      'Measure blueness as how far blue leads the larger of red and green, scaled by the sky slider.',
      'Estimate infrared brightness as mostly green with a little red and blue, boosted by greenness and pulled down by blueness.',
      'Render it as black and white, as false colour with red and blue swapped, or as pink foliage that records infrared as red.',
      'Add a dreamy glow from the highlights of a small copy screened back on, then a light vignette and grain.',
    ],
    history: 'The American physicist Robert W. Wood published the first infrared landscape photographs in 1910, and the glow of foliage is still called the Wood effect. Kodak’s Aerochrome film, developed in the 1940s for spotting camouflage, turned foliage red and later became a favourite of artists. Digital cameras can be converted to infrared today.',
    uses: ['Surreal landscape and nature art', 'Album and book cover images', 'Fashion and editorial colour looks', 'Dreamy backgrounds'],
    tips: [
      { text: 'Pink foliage is the classic dreamlike look.', set: { mode: 'pink', leaf: 85 } },
      { text: 'Black and white with a dark sky is stark and graphic.', set: { mode: 'mono', sky: 90 } },
      { text: 'High glow with low contrast feels soft and ethereal.', set: { glow: 85, contrast: 20 } },
    ],
    terms: [['Near-infrared', 'Light just beyond visible red, invisible to the eye but recorded by some sensors.'], ['Wood effect', 'The bright appearance of foliage in infrared photographs.'], ['False colour', 'Colour that does not come from the real scene but from a chosen mapping.']],
    related: ['thermal-camera', 'night-vision', 'cross-processed'],
  },

  'tilt-shift': {
    facts: { from: 'View cameras and architectural photography', era: 'Lenses from the 1900s, miniature effect from the 2000s', bestOn: 'High-angle city, harbour and crowd scenes' },
    why: 'A tilt-shift lens tips its plane of focus so that only a thin band is sharp and the rest falls quickly into blur. That is also what happens when you photograph a tiny scene up close, so a street photographed this way tricks the brain into seeing a model. Boosted colour and contrast add the gloss of a toy.',
    how: [
      'Build five versions of the picture in advance, with blur radii of 0, 1.6, 3.6, 7 and 12 pixels scaled by the blur slider.',
      'For each pixel measure its distance from the band: a straight line through the focus point, tilted by the angle slider, or an ellipse for the radial shape.',
      'Pass the distance through a smoothstep that starts at the band’s half width and ends further on, scaled to a position among the five levels.',
      'Mix the two nearest levels linearly so blur grows smoothly.',
      'Raise saturation and contrast, up to 1.85 and 1.45 times, for the look of glossy paint.',
    ],
    history: 'Tilt and shift movements on view cameras were used in the nineteenth and twentieth centuries to control perspective in architecture, using principles described by Theodor Scheimpflug in 1904. In the early 2000s photographers such as Olivo Barbieri used them on cities seen from above, and the miniature look became a popular effect in photography and video.',
    uses: ['Cityscape and travel photo effects', 'Toy and diorama style posters', 'Real estate and architecture mock-ups', 'Playful video and thumbnail looks'],
    tips: [
      { text: 'A thin band near the top feels like a tiny city seen from a roof.', set: { focus: 35, width: 10 } },
      { text: 'A radial shape keeps the middle sharp like a macro lens.', set: { shape: 'radial', blur: 85 } },
      { text: 'Tilt the band to lean the focus across the scene.', set: { angle: 20 } },
    ],
    terms: [['Plane of focus', 'The flat slice of the scene that is perfectly sharp.'], ['Scheimpflug principle', 'The rule that explains how tilting a lens tilts the plane of focus.'], ['Depth of field', 'The range of distances that appear acceptably sharp.']],
    related: ['bokeh', 'depth-parallax', 'isometric'],
  },

  kaleidoscope: {
    facts: { from: 'Optical toys', era: '1816 onward', bestOn: 'Colourful, busy pictures and flowers' },
    why: 'A kaleidoscope is two mirrors set at an angle that folds a view into repeated copies of a single wedge, each reflected from the last. That reflection is what makes the joins seamless. This treatment folds the angle of every pixel into one wedge and uses it to read the picture, so a fan shaped piece of your picture repeats all the way around.',
    how: [
      'For each pixel find its polar angle about the centre, subtract the turn, and take it modulo the wedge angle 2π divided by n.',
      'If the result lies in the second half of the wedge, mirror it back so neighbouring wedges are reflections.',
      'Use the folded angle as a direction in the source picture, and the pixel’s distance from the centre, shrunk by the zoom, as how far to look.',
      'Reflect any coordinate that leaves the picture back in, so there are no empty areas.',
      'Sample with bilinear interpolation and optionally darken the pixels near each mirror line by up to 40 percent.',
    ],
    history: 'Sir David Brewster invented the kaleidoscope in Scotland in 1816 and patented it in 1817. The name comes from Greek words meaning beautiful form to see. It was a sensation within a few years, with hundreds of thousands sold in London in months, and the same mirror symmetry underlies the patterns of tiles, textiles and mandalas.',
    uses: ['Mandala and pattern design', 'Textile and wallpaper concepts', 'Psychedelic poster and cover art', 'Backgrounds and loops'],
    tips: [
      { text: 'Twelve mirrors make a fine snowflake.', set: { n: 12, zoom: 60 } },
      { text: 'Zoom in and slide the window to find new patterns in one picture.', set: { zoom: 150, sx: 30, sy: 70 } },
      { text: 'Turn off the dark joins for a seamless fold.', set: { rim: false } },
    ],
    terms: [['Wedge', 'A pie slice of the picture that is repeated all around.'], ['Reflection', 'Flipping a shape as though in a mirror.'], ['Modulo', 'The remainder after dividing, used to wrap an angle into a range.']],
    related: ['mandala', 'truchet-tiles', 'op-art-moire'],
  },

  'anaglyph-3d': {
    facts: { from: '19th century stereoscopy', era: '1850s onward, popular in the 1950s and 2010s', bestOn: 'Landscapes and scenes with a clear foreground and background' },
    why: 'Your two eyes see a scene from slightly different places, and near things shift more between the two views than far things do. A single photograph carries no depth, so the program guesses one, shifts each eye’s view sideways by it, and then colours the two views so that a pair of coloured glasses separates them again for each eye.',
    how: [
      'Guess a depth map from a heavily blurred lightness: bright is near, dark is near, a ground plane in which lower means nearer, or a mix.',
      'Shift each pixel sideways by its depth minus the focus depth, up to 46 pixels.',
      'Look up the left view at x minus the shift, and the right view at x plus the shift, with bilinear sampling.',
      'Pixels at the focus plane do not shift and sit at the screen, while nearer and farther ones separate in opposite directions.',
      'Combine the two views by the glasses: red from the left and green and blue from the right for red and cyan, and so on, optionally keeping some original colour.',
    ],
    history: 'Charles Wheatstone described the stereoscope in 1838, and Wilhelm Rollmann made the first anaglyphs in 1853 by printing two views in complementary colours. Louis Ducos du Hauron patented the process for photographs in 1891. Red and cyan 3D appeared in books, comics and cinema in the twentieth century, and again in the 2010s on early home 3D.',
    uses: ['3D poster and comic effects', 'Retro science and sci-fi graphics', 'Teaching how depth perception works', 'Playful photos for glasses owners'],
    tips: [
      { text: 'Deep, strong 3D with mixed depth looks dramatic through glasses.', set: { depth: 90, src: 'mix' } },
      { text: 'Magenta and green glasses use another pair of colours.', set: { glasses: 'mg' } },
      { text: 'Keep more original colour to hide the red and blue fringes.', set: { keep: 90 } },
    ],
    terms: [['Parallax', 'The apparent shift of near objects against far ones when the viewpoint changes.'], ['Stereoscopy', 'Giving an illusion of depth with two slightly different images.'], ['Anaglyph', 'A picture made of two views in different colours, sorted by coloured glasses.']],
    related: ['depth-parallax', 'chromatic-aberration', 'lenticular'],
  },

  bokeh: {
    facts: { from: 'Lens optics and photography', era: 'The word spread in the 1990s', bestOn: 'Night scenes and pictures with scattered bright lights' },
    why: 'Out of focus, every point of light in a scene turns into a small image of the lens opening, and the blur that results is called bokeh. Bright points make bright discs, and the shape of the aperture decides whether they are round, hexagonal or even heart shaped. This treatment blurs the picture and then scatters discs of light where the picture is brightest.',
    how: [
      'Shrink the picture to a very small size and enlarge it again for a cheap blur, laid over a near black field.',
      'Lay a grid of cells about 1.05 times the disc size and place one candidate disc in each at a jittered position.',
      'Keep a candidate with a probability that rises steeply with the brightness of the small picture there.',
      'Give each kept disc the colour of the picture, boosted toward full brightness, and draw it with additive blending at low opacity, so overlaps add up.',
      'Draw a thin brighter ring on its rim, in the aperture shape: circle, hexagon, pentagon, star or heart.',
    ],
    history: 'The word comes from the Japanese boke, meaning blur or haze. It was popularised in English in the late 1990s by the photographer and writer Mike Johnston in Photo Techniques magazine. Photographers choose lenses partly for the character of their bokeh, which depends on the aperture blades and the lens design.',
    uses: ['Night and city photo effects', 'Festive and celebration backgrounds', 'Portrait and wedding photo looks', 'Dreamy wallpapers'],
    tips: [
      { text: 'Heart shaped lights are a ready-made romantic look.', set: { shape: 'heart', size: 55 } },
      { text: 'Many tiny discs make a field of sparkles.', set: { size: 18, density: 90 } },
      { text: 'Hexagonal discs with strong rims look like a real lens.', set: { shape: 'hex', ring: 85 } },
    ],
    terms: [['Aperture', 'The adjustable opening in a lens that lets light in.'], ['Additive blending', 'Combining lights by adding their brightness.'], ['Circle of confusion', 'The blur disc made by a point of light that is out of focus.']],
    related: ['tilt-shift', 'neon-glow', 'film-grain'],
  },

  'double-exposure': {
    facts: { from: 'Early photography and cinema', era: '1860s onward, a design trend in the 2010s', bestOn: 'Portraits and profiles against a plain background' },
    why: 'When two pictures are recorded on one frame of film, light adds, so one picture shows through wherever the other was dark. This treatment recreates that with a window: the photograph’s tones decide where a second scene shows through, and the two are toned in the same pair of inks so they feel like one image. The second scene is drawn from scratch, with distant layers lighter than near ones for depth.',
    how: [
      'Tone the photograph into two inks, a dark and a light one, with a ramp over its lightness.',
      'Compare its blurred tones with a level, using a smoothstep whose width is the softness of the window, and decide whether dark or light parts open it.',
      'Draw the second scene in the same inks: mountains from layered noise, pine rows from stacked triangles, a city from three ranks of buildings, or a moon with stars and clouds.',
      'Make each far layer lighter and each near one darker, with fog between them for aerial perspective.',
      'Inside the window mix the scene in with a screen blend, 80 percent replacement and 20 percent film, with the photograph’s lightness modulating the scene’s brightness.',
    ],
    history: 'Double exposures happened by accident in the earliest photographs and were used on purpose in the 1860s by spirit photographers who printed ghostly figures over portraits. Filmmakers such as Georges Méliès used them for early special effects. The portrait-with-a-landscape version became a design trend in the 2010s, and it was widely seen in the title sequence of the TV series True Detective in 2014.',
    uses: ['Poster and album cover art', 'Portrait and nature composites', 'Film title and social media graphics', 'Gifts and prints with a symbolic image'],
    tips: [
      { text: 'Pines in forest green make a classic woodland portrait.', set: { scene: 'pines', tint: 'forest' } },
      { text: 'A moon scene in blue is quiet and nocturnal.', set: { scene: 'moon', tint: 'blue' } },
      { text: 'Let the light parts open the window instead of the dark.', set: { fill: 'light' } },
    ],
    terms: [['Double exposure', 'Recording two images on a single frame of film.'], ['Aerial perspective', 'The way distant things look paler and bluer because of the air between.'], ['Screen blend', 'A way of combining layers so the result is never darker than either.']],
    related: ['surreal', 'duotone', 'aurora'],
  },

  'cross-processed': {
    facts: { from: 'Darkroom and lab experiments', era: '1990s fashion and art photography', bestOn: 'Street, fashion and landscape photographs with bold colour' },
    why: 'Cross processing means developing film in the chemistry meant for another kind of film. The three dye layers then respond to light in unusual ways, each with its own tone curve, so shadows lean towards one hue, highlights towards another and contrast jumps. This treatment stores each look as a curve per colour channel and applies them to your picture.',
    how: [
      'Store each look as a list of knots for each of the red, green and blue channels.',
      'Join the knots with a Catmull-Rom spline, a smooth curve that passes through every knot, and evaluate it once for each of the 256 input values to make a lookup table.',
      'Look up every channel of every pixel in its own table and mix the original with the result by the strength slider.',
      'Scale saturation around luminance and lift the blacks for the faded look.',
      'Add a vignette and grain.',
    ],
    history: 'Slide film is developed in a process called E-6 and colour negative film in C-41, and swapping them was a trick of photographers and labs for decades. It became a signature of fashion and music photography in the 1990s and was taken up by lomography fans who liked its unpredictable colour. Many phone filters imitate it.',
    uses: ['Fashion and editorial photo looks', 'Music and event photography grading', 'Social posts with a retro film feel', 'Poster and album art'],
    tips: [
      { text: 'The teal look is the modern orange and teal grade.', set: { look: 'teal', amount: 90 } },
      { text: 'Negative film in slide chemistry gives deep, contrasty colour.', set: { look: 'negative', sat: 70 } },
      { text: 'A little strength gives a gentle, subtle shift.', set: { amount: 40, fade: 30 } },
    ],
    terms: [['Cross processing', 'Developing film in chemistry meant for a different type of film.'], ['Tone curve', 'A graph that maps input brightness to output brightness.'], ['Catmull-Rom spline', 'A smooth curve that passes through all its control points.']],
    related: ['film-grain', 'lomography', 'duotone'],
  },

  daguerreotype: {
    facts: { from: 'Paris', era: '1839 to the 1860s', bestOn: 'Formal portraits and still lifes' },
    why: 'A daguerreotype is an image on a silver plate polished like a mirror. Tilt it one way and the plate reflects something dark, so the picture looks like a positive. Tilt it the other way and it reflects something bright and seems to turn into a negative. Tarnish creeping in from the edges and a brass mat give it its antique look.',
    how: [
      'Mix lightness with its inverse by the tilt slider and add a little contrast about the middle.',
      'Map the result through a ramp of dark, mid and light colours for silver, blue or gold plates.',
      'Blur by 0.5 to 3.5 pixels, since the lenses of the day were soft.',
      'Grow tarnish rings inward from the edge of the window, cycling blue, violet and amber like the interference colours of an oil slick.',
      'Add polish marks, scratches and dust, and frame it with a brass mat that has metal grain, bevel rings and a band of glare.',
    ],
    history: 'The French government announced Louis Daguerre’s process in 1839 and gave it to the world free of charge, apart from in Britain, where it was patented. Each daguerreotype was a unique plate, fragile and kept in a case. The process was replaced in the 1850s and 1860s by cheaper methods that could be copied, but its detail and mirror like depth are still admired.',
    uses: ['Historical and period style portraits', 'Heritage and museum themed graphics', 'Vintage invitations and stationery', 'Gothic and steampunk art'],
    tips: [
      { text: 'Tilt the plate to see the picture turn into a negative.', set: { tilt: 100 } },
      { text: 'A gold plate with a rectangular mat looks like a keepsake case.', set: { tone: 'gold', frame: 'rect' } },
      { text: 'Heavy tarnish with scratches looks like an heirloom.', set: { tarnish: 90, scratch: 80 } },
    ],
    terms: [['Daguerreotype', 'An early photograph made on a silvered copper plate.'], ['Tarnish', 'A dull or coloured film that forms on metal as it reacts with the air.'], ['Mat', 'The decorative border placed around a picture inside its frame.']],
    related: ['film-grain', 'victorian', 'cyanotype'],
  },

  'chromatic-aberration': {
    facts: { from: 'Optics', era: 'Understood since the 17th century', bestOn: 'High contrast edges, such as signs, branches and city lights' },
    why: 'Glass bends each colour of light by a slightly different amount, a property called dispersion, so a lens cannot bring red, green and blue into exactly the same place. The channels land a little apart, and edges split into colour. This treatment does what the lens does: it reads red, green and blue from slightly different places, and the difference grows toward the edges of the picture.',
    how: [
      'In radial mode keep the green channel where it is, read red from a point further out and blue from a point further in.',
      'Scale the shift by half the amount times one minus the edge strength plus 2.2 times the edge strength times the squared distance from the centre, so with full edge strength it grows with the square of distance.',
      'In sideways mode shift red and blue by a fixed amount along one direction, like a prism.',
      'In full spectrum mode take seven samples along the line, with red weighted from one end, blue from the other and green from the middle, each normalised to add to 1.',
      'Add an optional soft glow from a tenth-scale copy screened on.',
    ],
    history: 'Isaac Newton showed in 1666 that a prism splits white light into colours, and he built the first reflecting telescope in 1668 partly to avoid the coloured fringes of lenses. Chester Moore Hall and John Dollond developed achromatic lenses, which combine two glasses to cancel much of the fringing, in the eighteenth century. Today it is a flaw that photographers correct, and an effect designers add on purpose.',
    uses: ['Glitch and cyber aesthetics', 'Photo realism for CGI and game scenes', 'Music and event poster looks', 'Optics teaching'],
    tips: [
      { text: 'Strong radial fringing with edges maxed looks like a cheap lens.', set: { amount: 90, edge: 100 } },
      { text: 'Sideways mode with a diagonal angle looks like a glitch.', set: { mode: 'side', angle: 45 } },
      { text: 'Full spectrum smears edges into a rainbow.', set: { mode: 'spread' } },
    ],
    terms: [['Dispersion', 'Different colours bending by different amounts when light passes through glass.'], ['Lateral chromatic aberration', 'Colour fringes caused by different magnification of each colour.'], ['Achromatic lens', 'A lens made from two kinds of glass to bring two colours to the same focus.']],
    related: ['glitch', 'anaglyph-3d', 'glass-refraction'],
  },

  lenticular: {
    facts: { from: 'Printing and novelty design', era: '1940s onward, popular in the 1960s and 70s', bestOn: 'Bold pictures that change meaning when altered' },
    why: 'A lenticular print is a sheet of tiny cylindrical lenses over two pictures that have been cut into thin strips and interlaced. Each lens sends one strip to your eye from one angle and the other strip from another, so as you move, the picture flips. This treatment makes a second picture from the first, interlaces the two under virtual lenses and tilts them with your pointer.',
    how: [
      'Make the second picture from the first by a negative, a night blue ramp, opposite hues, black and white or sepia.',
      'For each lens of width w, work out how far across the lens each column is: x divided by w, modulo 1.',
      'Show picture A where that is below a split point and picture B above it, with the split following the tilt.',
      'Track the pointer across the picture with a smooth catch-up, and sway on its own with a slow sine when the pointer is away.',
      'Slide the pictures in opposite directions with the tilt, up to 1.4 lens widths, for parallax, and add a moving shine band and dark lens seams.',
    ],
    history: 'Lenticular imaging developed in the early twentieth century, and flip images and 3D cards became common novelties in the 1950s and 60s, found in cereal packets, on postcards and on album covers. The same principle is used in some glasses-free 3D displays.',
    uses: ['Flip card and collectible style graphics', 'Before and after reveals', 'Album and poster mock-ups', 'Playful packaging ideas'],
    tips: [
      { text: 'A negative flip is dramatic and graphic.', set: { alter: 'negative' } },
      { text: 'Narrow lenses and strong parallax give a deep, fine ribbing.', set: { lens: 4, depth: 80 } },
      { text: 'Switch off the sway to control the flip with the pointer only.', set: { sway: 0 } },
    ],
    terms: [['Lenticular lens', 'A cylindrical lens, one of many in a ribbed sheet.'], ['Interlacing', 'Alternating thin strips of two or more pictures.'], ['Parallax', 'The apparent shift of things at different depths when the viewpoint changes.']],
    related: ['anaglyph-3d', 'depth-parallax', 'holographic'],
  },
};
