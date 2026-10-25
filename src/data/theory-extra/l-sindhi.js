// src/data/theory-extra/l-sindhi.js
// Section L, Sindhi design: the fuller story of each treatment.
// These are living crafts of Sindh. The programs borrow how they look, never what they mean.
export const EXTRA_SINDHI = {
  ajrak: {
    facts: { from: 'Sindh, on the Indus', era: 'Centuries old, a cloth still made and worn today', bestOn: 'Pictures with a mix of light, mid and dark tones' },
    why: 'Ajrak is made by keeping dye out of the cloth. A resist paste goes on wherever the cotton is meant to stay pale, and the cloth is then dyed in indigo and in red from madder root. The paste holds the dye back, so the white lines of the finished shawl are the places where nothing reached the cotton. The eight-pointed star and the lattice repeat across the cloth like a map of the night sky.',
    how: [
      'Lay out one block for each square of side s = W / n, where n is the number of blocks across.',
      'Inside a block, use a polar test to decide what lies under every pixel: ground, star colour or resist.',
      'Draw the eight-pointed star with a star polygon formula, with a resist outline, a resist ring, a resist centre and a diamond with small resist dots at each corner.',
      'Dye each block in one of three states by the picture’s tone: dark blocks have a deep ground with a red star, midtones swap the two, and light blocks have a pale ground. Size each block from 82 to 100 percent of its square by the picture.',
      'Print the resist from a block shifted by up to 1.5 px, and show only the shifted copy as white, since a real print is never perfect.',
    ],
    history: 'Ajrak is the block-printed cloth of Sindh, pressed onto cotton by carved wooden blocks in stages. Many Sindhis point to the trefoil-patterned shawl on the Mohenjo-daro bust as a distant ancestor, a story told with affection and not proved. The shawl is given as a gift of honour to guests, worn on the shoulder, and worn on Sindhi Cultural Day, which is celebrated on the first Sunday of December. Printing families in Sindh and across the border in Kutch have kept the craft alive.',
    uses: ['Shawls, scarves and clothing', 'Gifts of honour and cultural celebrations', 'Pattern and textile design', 'Teaching resist printing and tessellation'],
    tips: [
      { text: 'The classic mix of red and indigo is the shawl most people picture.', set: { dye: 'classic', print: 70 } },
      { text: 'Indigo only gives a cool, deep night cloth.', set: { dye: 'indigo', border: 80 } },
      { text: 'Smaller blocks show finer detail from your picture.', set: { size: 30, follow: 100 } },
    ],
    terms: [['Resist', 'A paste or wax that keeps dye from reaching the cloth.'], ['Madder', 'A plant whose root gives a red dye.'], ['Block printing', 'Pressing carved wooden blocks onto cloth to print a pattern.']],
    related: ['sindhi-topi', 'batik', 'ralli-patchwork'],
  },

  'hala-blue-pottery': {
    facts: { from: 'Hala, Sindh', era: 'Centuries old', bestOn: 'Landscapes and pictures with soft shadows' },
    why: 'Blue pottery is painted on white glaze with cobalt and turquoise, then fired once, so the colour sinks into the glaze and cannot be changed. The painter has to know what each stroke will become. The designs are vines, leaves and small flowers, drawn so that every curve leads into the next. Here the picture becomes a cobalt wash, and vines follow its contours across the glaze.',
    how: [
      'Blur the picture twice (radius smooth × 0.9 px) to a field T.',
      'Blend the glaze colour toward cobalt by v = 0.78 w (1 − T)^1.5, where w is the wash slider, so shadows turn deep blue and highlights stay white.',
      'Find the contour lines of T at evenly spaced levels by marching squares, join them into curves, and draw them with a width that falls from 3.9 px at the darkest contour to 1.7 px at the lightest.',
      'Place leaves on alternate sides of each vine about every 24 px, turned 0.95 radians from the tangent, in turquoise and cobalt by turns.',
      'Add small flowers, and the fine crackle of old glaze.',
    ],
    history: 'Hala, a town in the Matiari district, is one of the places where blue pottery is still made in Sindh. It shares a tradition with Multan and with Persia, and Sindh has a long tradition of blue glazed tile, as seen on the Shah Jahan Mosque at Thatta (1647). Potters work in small family kilns, and the craft depends on knowledge passed from one generation to the next.',
    uses: ['Plates, vases and tiles', 'Mosque and shrine decoration', 'Gifts and craft markets', 'Pattern design with a cobalt palette'],
    tips: [
      { text: 'A turquoise glaze gives the bright, shallow-water look.', set: { ground: 'turquoise', wash: 40 } },
      { text: 'Many vines make a dense, floral garden.', set: { levels: 13, leaves: 90, flowers: 80 } },
      { text: 'Heavy crackle looks like an old family plate.', set: { crackle: 95, ground: 'cream' } },
    ],
    terms: [['Glaze', 'A glassy coating fired onto pottery.'], ['Cobalt', 'A mineral that gives a deep blue pigment.'], ['Crackle', 'A fine web of cracks in old glaze.']],
    related: ['azulejo', 'delft-blue', 'makli-carving'],
  },

  'ralli-patchwork': {
    facts: { from: 'Sindh and its neighbouring deserts', era: 'Traditional, made by women over generations', bestOn: 'Bright pictures with clear blocks of colour' },
    why: 'A ralli is a quilt made from scraps. In Sindh it is a women’s art: cloth from old clothes is cut into squares and triangles, laid out in bold patterns and stitched down in rows of running thread, often in several layers. Nothing is wasted, and the result is warm, bright and personal. Your picture is cut into patches, and each takes a colour from a bright palette.',
    how: [
      'Make a square grid of side s. When the diamond set is chosen, turn each point by 45° to (u, v) = ((x + y), (y − x))/√2 before applying the grid, so squares stand on their points.',
      'Keep each square whole, cut it into two triangles by a diagonal, or into four by both.',
      'Give each piece the colour of the picture at its own centre, with saturation raised by 1.5, snapped to the nearest of nine cloth colours (or an earthy set).',
      'Print some pieces as cotton with dots, stripes, checks or diamonds.',
      'Stitch dashes 4.6 px inside every seam, to hold the layers together.',
    ],
    history: 'The word is said to come from a verb meaning to mix, which suits a cloth made of many colours. Rallis are made in Sindh and in the neighbouring regions of Thar, Cholistan and Kutch, and are often made as gifts and for a daughter’s wedding. Each family has its own colours, and the ralli remembers the clothes it was made from.',
    uses: ['Bedspreads, throws and cushions', 'Wedding and dowry gifts', 'Patchwork and quilt design', 'Upcycling and sustainable fashion'],
    tips: [
      { text: 'Quarters cut in four give a lively, kaleidoscope-like quilt.', set: { split: 'quarters', size: 45 } },
      { text: 'Square set keeps the patches upright and calm.', set: { layout: 'square', split: 'whole' } },
      { text: 'Earthy cloth feels like a quilt that has been washed many times.', set: { cloth: 'earth', print: 80 } },
    ],
    terms: [['Ralli', 'A patchwork quilt of Sindh and nearby regions.'], ['Running stitch', 'A simple stitch that passes in and out of the cloth in a line.'], ['Patch', 'A piece of cloth sewn into a larger pattern.']],
    related: ['quilt-patchwork', 'sashiko', 'sindhi-mirror-embroidery'],
  },

  'sindhi-mirror-embroidery': {
    facts: { from: 'Sindh and the deserts of Thar', era: 'Traditional, worn at weddings and festivals', bestOn: 'Bright pictures with lights and shadows' },
    why: 'Abhla bharat, mirror embroidery, sets small discs of mirror or mica into dark cloth and rings each one with thread. Each disc catches the light and flashes as the wearer moves, and the thread glows in colours that talk to one another. The program lays mirrors on a lattice, lets each one reflect a patch of your picture, and takes the thread colours from the same place.',
    how: [
      'Lay mirrors on a triangular lattice: each row is 0.866 s below the last (that is √3/2, the height of an equilateral triangle) and every other row is shifted by half a spacing, so every mirror has six neighbours at the same distance.',
      'Take the main thread colour c₁ from the picture under each mirror, push the saturation up by 1.7, and scale it by 0.92 + 0.28 t.',
      'Turn the hue by 0.45 of a full circle (162°, close to the opposite) for the partner thread c₂, and use a pale petal thread c₃.',
      'Around each mirror stitch ten leaf-shaped stitches and a ring of short spokes, alternating c₁ and c₂.',
      'Fill the gaps between neighbours with small crosses of seed stitch, and add a shine to each mirror.',
    ],
    history: 'Mirror work has a long history across Sindh, Gujarat and Rajasthan. Small discs of reflective glass or mica are held to the cloth with a lattice of stitches that cross over the edge, then the thread is worked round them in rings. It decorates shirts, cushions, camel trappings and the cloth of the bride, and each community and family has its own patterns.',
    uses: ['Clothing, bags and cushion covers', 'Bridal and festive textiles', 'Surface and pattern design', 'Craft education and heritage projects'],
    tips: [
      { text: 'Large mirrors give a bold, shining cloth.', set: { mirror: 75, size: 90 } },
      { text: 'Maroon cloth feels like a wedding tray.', set: { cloth: 'maroon', thread: 85 } },
      { text: 'Little shine and close spacing look like a quiet night sky.', set: { shine: 20, size: 34 } },
    ],
    terms: [['Abhla bharat', 'Mirror embroidery in Sindhi.'], ['Mica', 'A shiny mineral that splits into thin sheets, used for the first mirrors.'], ['Seed stitch', 'Tiny scattered stitches that fill a space.']],
    related: ['sindhi-topi', 'embroidery', 'ralli-patchwork'],
  },

  'sindhi-topi': {
    facts: { from: 'Sindh', era: 'Traditional, worn today at weddings and on Sindhi Cultural Day', bestOn: 'Colourful, high contrast pictures' },
    why: 'The Sindhi topi is a round cap with a notch cut for the forehead, embroidered all over in rings of triangles, diamonds and tiny mirrors. Seen from above, the rings are circles and the pattern is easiest to read, so that is how the program draws it. Each cell is stitched in a colour taken from your picture, like a small mosaic of thread.',
    how: [
      'Make K rings between an inner radius r₀ = 0.11 R and 0.96 R, each of width h = (0.96 R − r₀)/K.',
      'Let four kinds of ornament take turns going outward: triangles, diamonds, zigzags and mirrors.',
      'Cut each ring into n cells, with n = 2 ⌈(2π ρ / (c h)) / 2⌉, where ρ is the ring’s middle radius and c the cell shape slider, so n is always even and triangles can alternate pointing out and in.',
      'Turn odd rings by half a cell, as in real caps.',
      'Choose each cell’s colour from the eight thread colours of the topi, matched to the picture, with the ground of each ring alternating between cream and black.',
    ],
    history: 'The Sindhi topi is worn with the ajrak at weddings, at festivals and on Sindhi Cultural Day, celebrated on the first Sunday of December. The notch is often explained as letting the forehead touch the ground in prayer. Caps are embroidered and sewn by hand by makers in towns and villages across Sindh.',
    uses: ['Caps, gifts and cultural celebrations', 'Embroidery and textile design', 'Radial pattern and logo design', 'Teaching polar coordinates'],
    tips: [
      { text: 'More rings give a finer and busier cap.', set: { rings: 10, cap: 120 } },
      { text: 'Maroon cloth with mirrors on looks festive.', set: { cloth: 'maroon', mirrors: true } },
      { text: 'Wider cells make bold, chunky ornaments.', set: { cut: 140, rings: 4 } },
    ],
    terms: [['Topi', 'A cap, in several South Asian languages.'], ['Ring', 'A band of pattern around the centre of the cap.'], ['Polar coordinates', 'A way of describing a point by its distance and angle from a centre.']],
    related: ['ajrak', 'sindhi-mirror-embroidery', 'mandala'],
  },

  'hala-lacquerware': {
    facts: { from: 'Hala, Sindh', era: 'Traditional craft, still practised', bestOn: 'Pictures with rich colour' },
    why: 'Lacquerware is made on a lathe. While the wooden piece spins, a stick of lac, a resin that softens with heat, is held against it, and the friction melts a thin layer onto the wood. One colour after another is laid on, and fine lines are scratched through the top coat to show the colour beneath. That is why the colour runs around the piece in rings.',
    how: [
      'Draw a lathe-turned piece in the dark: a vase, a cylinder or an egg-shaped jar, with a soft shadow at its foot.',
      'Map each pixel at horizontal offset dx from the axis to an angle φ = arcsin(dx/ρ) on the surface of the cylinder, where ρ is the piece’s half-width at that height.',
      'Wrap the picture round the piece by reading it at x = W (½ + φ/π), so it takes half a turn to run across your picture and it is squeezed near the edge.',
      'Fill every band (as tall as the band slider times 1.3 px) with a single colour averaged from the picture.',
      'Scratch fine lines through the top coat, and add the sheen of polished lac.',
    ],
    history: 'Lac is the resin made by tiny insects and used for centuries across South Asia for lacquer and sealing wax. In Sindh the craft of lacquered, lathe-turned wood is closely tied to Hala, where bed legs, cradles, toys and boxes are made. It is a craft of family workshops, and demand for it has been under pressure from cheaper goods.',
    uses: ['Furniture legs, boxes, toys and household items', 'Craft markets and cultural gifts', 'Teaching how a cylinder maps to a flat picture', 'Product mock-ups with a lacquer finish'],
    tips: [
      { text: 'An egg-shaped piece wraps the picture round a rounder form.', set: { shape: 'egg', wrap: true } },
      { text: 'Thin bands with strong scratches look finely turned.', set: { band: 3, scratch: 95 } },
      { text: 'Without wrapping, the picture stays flat on the piece.', set: { wrap: false, polish: 85 } },
    ],
    terms: [['Lac', 'A resin made by insects, used to make lacquer.'], ['Lathe', 'A machine that spins a piece of wood so it can be shaped and coated.'], ['Arcsine', 'The inverse of sine, used here to find an angle from a distance.']],
    related: ['hala-blue-pottery', 'truck-art', 'embossed-leather'],
  },

  'makli-carving': {
    facts: { from: 'The Makli hills near Thatta, Sindh', era: 'Fourteenth to eighteenth century', bestOn: 'Pictures with bright and dark regions' },
    why: 'The Makli necropolis is one of the largest burial grounds in the world, and its tombs are carved in sandstone and limestone with rosettes, lozenges, arcades and flowing foliage. The soft stone has been worn by the sun, by rain and by the salt in the air. This treatment fills the page with a repeating cell of relief and lights it like a wall, with the picture setting how deep the carving is.',
    how: [
      'Build the relief as a height map. In the eight-petal rosette the flower’s outer edge is at radius p(θ) = 0.8 (0.52 + 0.48 |cos 4θ|), the petals rise to 0.62 with a thin groove along the middle, a boss rises to 0.95 at the centre, a ring surrounds the flower, and corner ornaments rise to 0.55.',
      'Use a diamond plate, a groove, a centre boss and corners for the lozenge pattern.',
      'Multiply the height by 0.12 + 1.15 T², where T is the blurred brightness, so bright regions are deeply cut and dark regions are shallow.',
      'Light the height map from the chosen direction and shade by its slope.',
      'Add weathering, which wears the carving and stains the stone, and tint the stone from the picture.',
    ],
    history: 'Makli, near Thatta, is a UNESCO World Heritage Site, inscribed in 1981. Its tombs and mausoleums were built from the fourteenth to the eighteenth centuries under the Samma, Arghun, Tarkhan and Mughal rulers. Visitors are struck by the stone carving and by the glazed tile, and conservation work continues against the weather, salt and neglect.',
    uses: ['Relief and stone texture design', 'Architecture and heritage education', 'Tile and panel design', 'Games and illustration set in historic landscapes'],
    tips: [
      { text: 'Lozenges give a calmer, geometric carving.', set: { pattern: 'lozenge', size: 90 } },
      { text: 'Strong relief with a low sun raises each petal as a shadow.', set: { relief: 95, light: 200 } },
      { text: 'Heavy weathering looks like centuries of salt and sun.', set: { weather: 95, stone: 'limestone' } },
    ],
    terms: [['Necropolis', 'A large cemetery, from the Greek for city of the dead.'], ['Relief', 'Carving in which the design stands out from the background.'], ['Rosette', 'A circular, flower-like ornament.']],
    related: ['mughal-jali', 'hala-blue-pottery', 'embossed-leather'],
  },

  'indus-seal': {
    facts: { from: 'The Indus Valley civilisation, including Mohenjo-daro', era: 'About 2600 to 1900 BCE', bestOn: 'Animal or figure shapes with clear outlines' },
    why: 'Thousands of small square seals were found at Mohenjo-daro and the other cities of the Indus civilisation. Each is a line of signs above a figure, often a bull, an elephant or a tiger, carved in reverse so that pressing it into wet clay leaves the picture standing out. The script has never been deciphered, which makes the seals feel like messages from a very distant friend.',
    how: [
      'Draw a square of side 0.8 W on a hidden canvas, with a frame and a band for the signs along the top, 0.2 of the seal’s height.',
      'Set a row of n signs, chosen at random from eleven strokes, from the right.',
      'Below the band, draw lines from the picture itself: edges found with a Sobel operator on a blurred copy, and hatching whose thickness rises as the picture darkens, in rows 4.6 px apart.',
      'In clay mode, show the lines as relief pressed out of the clay; in steatite mode, show the cut stone.',
      'Light the surface from a corner and add the grain of the material.',
    ],
    history: 'The seals are mostly carved in steatite, a soft stone, and most are read from right to left, since the signs crowd toward the left end when the carver ran out of room. Mohenjo-daro was excavated from the 1920s and is a UNESCO World Heritage Site. The script of about four hundred signs has resisted every attempt to decipher it. The signs here are random strokes and do not spell anything.',
    uses: ['Education about ancient Sindh and the Indus civilisation', 'Stamp and seal design', 'Poster and cover illustration', 'Teaching how reversed carving prints'],
    tips: [
      { text: 'Steatite shows the seal itself, as a museum object.', set: { mode: 'steatite', relief: 80 } },
      { text: 'More signs give a longer line of text.', set: { signs: 8, engrave: 90 } },
      { text: 'Few signs and a deep relief look like a single impression.', set: { signs: 3, relief: 95 } },
    ],
    terms: [['Steatite', 'A soft stone, also called soapstone, easy to carve.'], ['Seal', 'A carved object used to stamp a mark in clay or wax.'], ['Undeciphered script', 'A writing system whose meaning we cannot yet read.']],
    related: ['sindhi-script', 'hieroglyphs', 'rubber-stamp'],
  },

  'sindhi-script': {
    facts: { from: 'Sindh', era: 'Standardised in 1853, with a poetry tradition far older', bestOn: 'Portraits and pictures with bright, clear shapes' },
    why: 'Sindhi is written in the Arabic script with letters of its own, for sounds that Arabic does not have: ٻ ڀ ٽ ٿ ڄ ڃ ڇ ڌ ڏ ڙ ڪ ڳ ڱ ڻ and others. The letters join, and each takes a different shape at the start, the middle and the end of a word. This treatment sets words in rows, right to left, and lets your picture decide how large and heavy each word is, so the page reads as a calligraphic portrait.',
    how: [
      'Give each word to the browser, which shapes and joins it with the Noto Naskh Arabic font, and set the text right to left.',
      'Give each line a pitch of 1.45 times the letter size and fill it from the right, one word after another, with a gap of 0.32 to 0.42 of the font size.',
      'Measure each word at the base size and read the tone v of the picture at its middle (the brightness on a dark page, the darkness on a cream one).',
      'Set the size again from v, and make the word bold where v is above 0.45.',
      'Colour the words from the picture, in gold, or in plain ink.',
    ],
    history: 'In 1853 the British administration adopted an Arabic-based alphabet of 52 letters for Sindhi, after a period in which several scripts were in use. Sindhi is also written in Devanagari in India. The language carries a great poetic tradition, notably Shah Abdul Latif Bhittai in the eighteenth century, whose verses are still sung at his shrine. The built-in word list here was drafted without a native proofread, so treat its spelling as provisional.',
    uses: ['Posters, cards and cultural projects', 'Calligraphy practice and type design', 'Learning to recognise Sindhi letters', 'Portrait gifts with a name or poem'],
    tips: [
      { text: 'Gold ink on an indigo page makes a festival poster.', set: { ink: 'gold', paper: 'indigo' } },
      { text: 'Strong size following the light builds a clear portrait.', set: { contrast: 100, size: 24 } },
      { text: 'Letters mode shows the shapes of the alphabet itself.', set: { source: 'letters' } },
    ],
    terms: [['Naskh', 'A clear, rounded style of Arabic script, good for reading.'], ['Joining forms', 'The different shapes a letter takes at the start, middle or end of a word.'], ['Right to left', 'The direction in which Arabic-script languages are written.']],
    related: ['calligraphy-portrait', 'indus-seal', 'handwritten'],
  },
};
