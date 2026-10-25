// src/data/theory-extra/e-physical.js
// Section E, physical and 3D feel: the fuller story of each treatment.
export const EXTRA_PHYSICAL = {
  'clay-3d': {
    facts: { from: 'Stop-motion animation and sculpture', era: '20th century', bestOn: 'Portraits and rounded objects with soft light' },
    why: 'Clay is a lighting problem. Treat the picture’s brightness as a height map, with bright parts raised and dark parts pressed in, and light it from one side, and a flat photograph becomes a relief you could touch. A little glossy highlight, shaded hollows and fingerprint dents then persuade the eye that a hand made it.',
    how: [
      'Blur the picture twice so the surface is soft, then read brightness as height.',
      'Measure the slope at each pixel to get a surface normal, the direction the clay faces.',
      'Light the normal with one light whose direction you set, adding a diffuse term and a small, glossy highlight.',
      'Darken hollows, where the blurred brightness is low, to fake ambient occlusion.',
      'Add value noise at two scales to the slope for fingerprints, then soften and desaturate colours so they read as pigment in clay.',
    ],
    history: 'Modelling in clay is as old as pottery, and clay animation brought it to the screen in the twentieth century; the word Claymation was coined by Will Vinton’s studio in 1978. The shading used here goes back to Johann Lambert’s eighteenth century law of diffuse light and to Bui Tuong Phong’s 1973 highlight model, later simplified by Jim Blinn.',
    uses: ['Playful illustrations and kids’ media', 'Packaging and brand characters', 'Soft 3D looking social posts', 'Mood boards for craft and toys'],
    tips: [
      { text: 'Deep relief with the light from the left looks like a pressed sculpture.', set: { depth: 80, angle: 180 } },
      { text: 'A single colour of clay turns the picture into a monochrome relief.', set: { mode: 'single' } },
      { text: 'Strong fingerprints make it feel very hand-made.', set: { texture: 100 } },
    ],
    terms: [['Height map', 'An image whose brightness is read as height.'], ['Surface normal', 'A unit arrow pointing straight out of a surface.'], ['Ambient occlusion', 'Darkening in hollows, where less light can reach.']],
    related: ['plasticine', 'embossed-leather', 'gold-foil'],
  },

  plasticine: {
    facts: { from: 'Modelling clay and stop-motion films', era: '1897 invention, 1970s onward on screen', bestOn: 'Bold subjects with a few distinct colour regions' },
    why: 'Modelling clay comes in a handful of flat colours, so the picture is first reduced to a small box of them. Each region of one colour is then puffed up into its own pillow, dented with thumbs and lit, which is how a modeller builds a scene out of separate pieces pressed side by side.',
    how: [
      'Blur lightly and find the k most typical colours with k-means, made more saturated and pulled towards the middle of lightness.',
      'Give each pixel its nearest colour and remove isolated specks by a majority vote of neighbours.',
      'Treat each region as a mask, blur it twice so it is high in the middle and low at the rim, and raise it to the power 1.5 for a rounded top.',
      'Subtract soft round hollows at random places and add a little low-frequency noise for hand-worked unevenness.',
      'Light the height map with one diffuse light and a tight highlight, and darken creases where neighbouring pieces differ.',
    ],
    history: 'Plasticine was invented by William Harbutt in Bath, England, in 1897 and sold as a non-drying modelling material for schools. It later became the favourite of stop-motion animators, notably at Aardman Animations, whose character Morph appeared on British television in the 1970s and whose Wallace and Gromit films followed in 1989.',
    uses: ['Playful illustrations and covers', 'Children’s brand identities', 'Packaging with a handmade feel', 'Stop-motion style social posts'],
    tips: [
      { text: 'Fewer colours of clay give a chunkier, more toy-like picture.', set: { colours: 4, puff: 80 } },
      { text: 'High gloss and deep dents make it look freshly handled.', set: { gloss: 90, dents: 80 } },
      { text: 'Move the light to the top and see the pillows change.', set: { angle: 270 } },
    ],
    terms: [['k-means', 'A method that finds a few representative colours by repeatedly averaging groups of pixels.'], ['Specular', 'A small, bright reflection of a light on a glossy surface.'], ['Stop-motion', 'Animation made by photographing a model one small move at a time.']],
    related: ['clay-3d', 'paper-cut-out', 'lego-voxel'],
  },

  'embossed-leather': {
    facts: { from: 'Saddlery, bookbinding and leatherwork', era: 'Centuries old', bestOn: 'Bold shapes and logos' },
    why: 'Leather has two surfaces at once: the pebbled grain of the hide, and the shape pressed into it by a hot die. Both can be one height map. The grain comes from cellular noise, in which creases form wherever two cells meet, and the picture is added on top so that bright parts stand proud.',
    how: [
      'Scatter a random site in every square of a grid and find, for each pixel, the distance to the nearest site and to the second nearest.',
      'Where the two distances are nearly equal the pixel is on a crease, and near a site it is the top of a small dome.',
      'Stretch and blur the picture and add it to the grain so bright parts are raised.',
      'Light from the top left with a broad, soft highlight, since leather is satin not mirror, and lift the pressed-in parts a little so the relief stays readable.',
      'Draw a row of saddle stitches along an inset rectangle, each with a dark shadow, a cream thread and a thin highlight.',
    ],
    history: 'Embossed and tooled leather has covered books, saddles and furniture for centuries, and gold tooling on bookbindings spread through the Islamic world and Europe from the Middle Ages. The cellular noise used for the grain was described by Steven Worley in 1996, and it is closely related to the Voronoi diagrams of the early twentieth century.',
    uses: ['Journal, wallet and book cover mock-ups', 'Luxury brand and packaging concepts', 'Textured backgrounds', 'Western and heritage craft designs'],
    tips: [
      { text: 'Black leather with deep emboss looks like a premium cover.', set: { leather: 'black', emboss: 85 } },
      { text: 'Big grain on oxblood feels like old travel luggage.', set: { leather: 'oxblood', size: 13 } },
      { text: 'Switch off the stitching for a flat panel.', set: { stitch: false } },
    ],
    terms: [['Cellular noise', 'A pattern made from distances to random points, giving cells and creases.'], ['Die', 'A shaped tool pressed into a material to leave its shape.'], ['Saddle stitch', 'A hand stitch that runs a thread through each hole twice, in opposite directions.']],
    related: ['gold-foil', 'clay-3d', 'letterpress'],
  },

  'gold-foil': {
    facts: { from: 'Bookbinding and fine stationery', era: 'Gold leaf is ancient, hot stamping from the 19th century', bestOn: 'High contrast pictures and logos' },
    why: 'Foil stamping lays a thin metal film on card wherever a heated die touches it. Here your picture is the die: foil goes where the picture is bright. Crumpled foil is a field of tiny creases, each facing a different way, and so each catches a different part of the room, which is why foil sparkles.',
    how: [
      'Decide where foil goes with a smoothstep around a threshold, given a slightly ragged edge by a little noise.',
      'Show the card’s own colour and a fine grain everywhere else.',
      'Build a crumpled height map from ridged noise at three scales, with a slow warp so the creases wander.',
      'Read the up and down tilt of each facet to choose a colour from a strip that stands for what a metal sheet reflects.',
      'Add a thin brighter rim along the edge of the stamped area.',
    ],
    history: 'Gold leaf has decorated manuscripts, icons and temples for thousands of years. Hot foil stamping, pressing metallic film onto a surface with a heated die, developed with industrial printing and now decorates book covers, wedding invitations and packaging. The ridged noise behind the crumple was popularised by the graphics researcher Ken Musgrave.',
    uses: ['Wedding and event invitations', 'Premium packaging and labels', 'Book and album covers', 'Award and certificate designs'],
    tips: [
      { text: 'Rose foil on dark ink card is elegant and modern.', set: { foil: 'rose', base: 'ink' } },
      { text: 'Heavy crumple with small facets makes a glittering sheet.', set: { crumple: 100, facet: 4 } },
      { text: 'Stamp the dark parts instead of the bright ones.', set: { invert: true } },
    ],
    terms: [['Foil stamping', 'Pressing a thin metal film onto a surface with a heated die.'], ['Ridged noise', 'Noise folded so that its middle value becomes a sharp crease.'], ['Facet', 'One small flat panel of a faceted surface.']],
    related: ['chrome', 'holographic', 'embossed-leather'],
  },

  'fabric-folds': {
    facts: { from: 'Studies of drapery in painting and sculpture', era: 'Renaissance onward', bestOn: 'Pictures with smooth shapes and wide tonal range' },
    why: 'Hanging cloth falls in folds that run in one direction, and each fold is a wave across the cloth. By adding the picture’s brightness inside the wave, the folds bend wherever the picture changes, so the cloth seems to drape over the scene. Soft shading and a woven grain do the rest.',
    how: [
      'Compute each fold as a sine of the position measured along the hang direction.',
      'Add the picture’s brightness inside the sine so folds bend over its shapes, with slow noise to make them wander.',
      'Add a second sine at 2.3 times the frequency and a bump proportional to brightness for secondary ripples.',
      'Light the slope of the height map with diffuse light, a broad highlight and a soft rim of light at grazing angles where fibres scatter light.',
      'Dim the shading slightly with a woven grain made from two cosines, and print the picture on the cloth or use one chosen colour.',
    ],
    history: 'Artists have studied drapery for centuries. Leonardo da Vinci made careful studies of cloth dipped in clay and draped over models, and Renaissance workshops treated folded fabric as a test of skill in both painting and marble. The rim light used for the fibres is a standard trick for velvet and satin in computer graphics.',
    uses: ['Fashion and textile mock-ups', 'Theatre and event backdrops', 'Elegant posters and invitations', 'Soft, tactile backgrounds'],
    tips: [
      { text: 'Gold cloth with a strong sheen looks like satin.', set: { cloth: 'gold', sheen: 85 } },
      { text: 'Many fine folds read like pleated silk.', set: { folds: 20, depth: 40 } },
      { text: 'Let the picture bend the folds as much as possible.', set: { warp: 100 } },
    ],
    terms: [['Drapery', 'Cloth shown hanging or falling in folds.'], ['Rim light', 'A soft glow at the edge of a surface seen at a grazing angle.'], ['Warp and weft', 'The lengthwise and crosswise threads of a woven cloth.']],
    related: ['clay-3d', 'tapestry-weave', 'embossed-leather'],
  },

  'rubber-stamp': {
    facts: { from: 'Offices and mail rooms', era: 'Late 19th century onward', bestOn: 'High contrast pictures and bold silhouettes' },
    why: 'A rubber stamp prints one flat colour or nothing, so the picture is cut to black and white and the interest comes from imperfection: uneven pressure, worn patches, pinholes and a slightly crooked angle. Those flaws are what make a stamp look pressed by a person.',
    how: [
      'Cut the picture to black and white at the chosen threshold, after a small random wobble so the edge is ragged.',
      'Add a double border and a banner with the word cut out of it on the same plate.',
      'Remove ink with a slow noise for uneven pressure, a mid-scale noise for worn patches, and scattered single-pixel pinholes.',
      'Rotate the inked layer by the tilt angle.',
      'Combine it with the paper by multiplication, as ink soaking into fibres darkens what is beneath.',
    ],
    history: 'Seals pressed into clay or wax are thousands of years old. The rubber stamp became practical after Charles Goodyear’s vulcanisation of rubber in 1839 and was in common office use by the late nineteenth century, to date, approve and file. Today stamps are a staple of crafts, scrapbooking and printmaking.',
    uses: ['Approval and certificate style graphics', 'Passport and travel stamp looks', 'Handmade stationery and logos', 'Printmaking and scrapbook elements'],
    tips: [
      { text: 'Blue ink with heavy wear looks like a long-used stamp.', set: { ink: 'blue', wear: 85 } },
      { text: 'A bigger tilt makes it look pressed in a hurry.', set: { tilt: 12 } },
      { text: 'Stamp your own word.', set: { word: 'VERIFIED' } },
    ],
    terms: [['Vulcanisation', 'Treating rubber with sulphur and heat so that it stays elastic and firm.'], ['Pinhole', 'A tiny spot where no ink was transferred.'], ['Multiply blend', 'A way of combining layers so that the result is never lighter than either.']],
    related: ['letterpress', 'linocut', 'screen-print'],
  },

  'origami-folds': {
    facts: { from: 'Japan, with modern folding mathematics', era: 'Paper folding for centuries, modern origami from the 20th century', bestOn: 'Colourful pictures with soft shapes' },
    why: 'A folded sheet shows its structure through shading: a facet that leans towards the light is bright, and one leaning away is dark. Cover a sheet with small pyramids, colour each facet from the picture and shade it by its lean, and the picture appears in a tessellation of folded paper.',
    how: [
      'Divide the sheet into a grid of squares.',
      'Fold each square at random in one of three ways: four small triangles meeting at the centre, or two triangles along one of the diagonals.',
      'Colour each facet from the picture at its centre, slightly softened, or leave the paper white.',
      'Brighten facets that lean towards the light and darken those leaning away, in proportion to the dot product of lean and light direction, with a random sign per square and a tiny tilt per facet.',
      'Draw each crease as a dark line with a pale line one pixel beside it, and add paper grain.',
    ],
    history: 'Paper folding developed in Japan and elsewhere over centuries, and the modern art was shaped in the twentieth century by Akira Yoshizawa, who developed the notation of dashed lines and arrows still used to record folds. Today scientists and artists such as Robert Lang use folding theory in engineering, and Koryo Miura’s Miura fold has been used to pack solar panels for spacecraft.',
    uses: ['Paper craft and packaging inspiration', 'Faceted posters and wallpapers', 'Educational and geometry themed graphics', 'Calm decorative backgrounds'],
    tips: [
      { text: 'Strong folds with white paper look like a sculpture.', set: { paper: 'white', fold: 90 } },
      { text: 'Many tiny folds turn the picture into fine pleated paper.', set: { cells: 28 } },
      { text: 'Fewer folds with strong creases is graphic and bold.', set: { cells: 7, crease: 90 } },
    ],
    terms: [['Tessellation', 'A pattern that covers a surface with repeating shapes and no gaps.'], ['Facet', 'One flat face of a folded or faceted surface.'], ['Crease', 'The line where paper has been folded.']],
    related: ['paper-cut-out', 'low-poly', 'quilt-patchwork'],
  },
};
