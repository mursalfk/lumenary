// src/data/theory-extra/m-southasia.js
// Section M, South Asian and Islamic traditions: the fuller story of each treatment.
// These are living crafts and art forms. The programs borrow how they look, never what they mean.
export const EXTRA_SOUTHASIA = {
  'truck-art': {
    facts: { from: 'Pakistan, and its long roads', era: 'Flourishing since the mid twentieth century', bestOn: 'Bold, colourful pictures and portraits' },
    why: 'A Pakistani truck is a moving canvas. It is covered from bumper to roof in flat enamel colour, painted flowers, birds and poetry, and a frame of chains and rosettes, with strips of shiny reflective tape (chamak patti) that glitter in headlights. Every part is made by a specialist: the painter, the woodcarver and the metalworker. Nothing is left plain, because the truck is the driver’s home, pride and calling card.',
    how: [
      'Blur the picture (radius = simplify × 1.2 px) and raise its saturation by half.',
      'Give each pixel the nearest of nine enamel colours, using the redmean distance, which weights red, green and blue the way the eye does.',
      'Run a majority filter over a 5 by 5 window twice so regions are flat, as brush-painted ones are.',
      'Draw a black outline wherever the colour index changes and grow it by up to 2 px, then cross the brightest places (tone above 0.74) with diagonal bands of white, like chrome.',
      'Wrap everything in a frame as wide as 11 percent of the shorter side, with a red rim, a yellow field of flowers and leaves, a row of pearls and a twelve-petal rosette in each corner.',
    ],
    history: 'Decorating lorries, buses and rickshaws grew with the long-distance road trade of the twentieth century, drawing on Mughal and Persian ornament and on local styles such as Peshawar’s carved wooden fittings and Karachi’s painted panels. Painters often learn as apprentices and work in small workshops. Truck art has been shown in museums and festivals abroad, and a new generation of artists now paints on canvas, walls and buildings as well.',
    uses: ['Poster, packaging and street art', 'Fashion and product graphics', 'Heritage festivals and museum shows', 'Teaching colour reduction and outlining'],
    tips: [
      { text: 'The Peshawar palette is hot and high contrast.', set: { palette: 'peshawar', gloss: 75 } },
      { text: 'Heavy outlines and strong simplification look like fresh enamel.', set: { simplify: 7, outline: 90 } },
      { text: 'A wide frame turns the whole picture into a truck panel.', set: { frame: 100, palette: 'karachi' } },
    ],
    terms: [['Chamak patti', 'Shiny reflective tape used to decorate trucks.'], ['Enamel', 'A glossy, hard-wearing paint.'], ['Redmean', 'A formula that measures colour difference more like the eye does than plain RGB distance.']],
    related: ['pop-art', 'maximalism', 'hala-lacquerware'],
  },

  'mughal-jali': {
    facts: { from: 'Mughal India and Pakistan', era: 'Sixteenth to eighteenth century', bestOn: 'Landscapes and scenes with distance' },
    why: 'Jali means a net or a lattice. The Mughals carved them from single slabs of marble and red sandstone to screen windows, tombs and balconies. They let in air and a broken light and hide the people behind them. Standing in front of one, you see the world through a pattern, and the sun throws that pattern in shadow across the floor. Here the stone is a slab with openings, your picture is the scene behind, and the sun throws the lattice across it.',
    how: [
      'Describe each opening with a margin function in pixels that is positive inside the hole and negative in the stone.',
      'For the eight-point star, take the star’s polar radius (the same star polygon formula as the Ajrak page) minus the distance from the cell’s centre, combined with a diamond at the corners.',
      'For the six-point star, split the plane into hexagons: turn the point (x, y) into hexagonal coordinates, round to the nearest hexagon and draw the star about it. The lotus has its own petal outline.',
      'Shade the stone with a bevel whose depth follows the thickness slider, and cast the shadow of the lattice across the scene in the chosen sun direction.',
      'Let the scene glow where the light falls through the holes.',
    ],
    history: 'Jali screens are found in Shah Jahan’s marble screen round the cenotaphs at the Taj Mahal and in the windows of Salim Chishti’s tomb at Fatehpur Sikri, and the tradition continued in the Rajput palaces such as the Hawa Mahal in Jaipur, built in 1799. They served as ventilation, privacy and decoration at once, and they cooled interiors by softening the sun. Modern architects have returned to the idea for facades in hot climates.',
    uses: ['Architecture, facades and interior screens', 'Lighting and lamp design', 'Cut-metal and laser-cut panel design', 'Pattern and tile design'],
    tips: [
      { text: 'Lotus openings are softer and floral.', set: { pattern: 'lotus', cells: 6 } },
      { text: 'Thick stone with a low sun casts deep shadows.', set: { depth: 90, light: 200 } },
      { text: 'Small openings feel like a private, carved window.', set: { hole: 40, glow: 90 } },
    ],
    terms: [['Jali', 'A pierced screen of stone or wood with a repeating pattern.'], ['Cenotaph', 'A tomb-like monument that does not hold the body.'], ['Margin function', 'A function that is positive inside a shape and negative outside it.']],
    related: ['girih', 'makli-carving', 'stained-glass'],
  },

  'persian-miniature': {
    facts: { from: 'Persia and the Timurid, Safavid and Mughal courts', era: 'Thirteenth to seventeenth century and later', bestOn: 'Portraits, gardens and scenes with clear shapes' },
    why: 'A Persian miniature is a small painting made for a book. The painter uses flat areas of mineral colour, draws fine ink outlines, and does not cast shadows. Space is made by stacking things up the page, and meadows are pricked with tufts of grass and small flowers. Its jewel-like colour and its calm, flat world are the opposite of a photograph, and the recipe is easy to follow.',
    how: [
      'Blur the picture (simplify × 1.1 px), make it 25 percent more saturated, and snap each pixel to one of nine pigments by the redmean distance.',
      'Remove specks with a majority filter run twice over a 5 by 5 window.',
      'Draw outlines in dark brown ink where the colour index changes, with a strength of 0.8 × the ink slider.',
      'Use fine parallel hatching for depth where the picture is dark, in place of shadows.',
      'Add gold leaf, tufts of grass and a frame of gold rules and a blue band with gold teardrops on ivory paper.',
    ],
    history: 'The pigments included lapis lazuli from the mines of Badakhshan, vermilion, malachite green, turmeric yellow and burnished gold leaf. Painting for books flourished at the courts of Tabriz, Herat and Isfahan, with masters such as Kamal ud-Din Behzad in the fifteenth century, and illustrated epics such as the Shahnameh. The Mughal court developed its own school, blending Persian and Indian traditions.',
    uses: ['Book illustration and manuscript design', 'Poster, packaging and wallpaper', 'Teaching flat colour, outline and pattern', 'Heritage and museum projects'],
    tips: [
      { text: 'Strong gold and a heavy frame make an illuminated page.', set: { gold: 90, frame: 95 } },
      { text: 'Fine ink lines with little hatching look crisp and calligraphic.', set: { ink: 85, hatch: 10 } },
      { text: 'Heavy simplification gives bold flat colour.', set: { simplify: 8 } },
    ],
    terms: [['Miniature', 'A small painting, here made for a manuscript.'], ['Lapis lazuli', 'A deep blue stone ground to make pigment.'], ['Hatching', 'Fine parallel lines used to suggest tone.']],
    related: ['madhubani', 'ukiyo-e', 'byzantine-mosaic'],
  },

  girih: {
    facts: { from: 'The Islamic world, from Persia to Spain', era: 'Medieval, from about the eleventh century', bestOn: 'Colourful pictures, which tint the stars' },
    why: 'Girih, from the Persian for knot, is the strapwork of Islamic buildings: bands that appear to weave over and under to make stars and polygons. The craft knowledge was geometric and practical, and the same few steps can generate an endless range of stars. Its mathematics turned out to be close to the aperiodic tilings of modern science.',
    how: [
      'Build a Penrose tiling of two rhombs with de Bruijn’s pentagrid method, laying five families of parallel lines across the plane.',
      'Follow Hankin’s rule: from the middle of every edge of a polygon, two lines go inward at the same angle to the edge, and each meets the line from the neighbouring edge.',
      'Draw the strapwork on each rhomb, with the contact angle set by the slider, and widen the lines into straps.',
      'Weave the straps over and under, and colour them classic, from the picture or both.',
      'Turn the whole pattern by a chosen angle, and pick another patch of the tiling with the seed.',
    ],
    history: 'The Topkapı Scroll, a collection of pattern designs from the fifteenth or sixteenth century kept in the Topkapı Palace Library, shows that medieval designers used a small set of tile shapes. Ernest Hankin described a rule for drawing the lines in 1925. In 2007 Peter Lu and Paul Steinhardt showed that the girih at the Darb-i Imam shrine in Isfahan (1453) comes very close to a Penrose tiling. This program uses two shapes, and not the five girih tiles of the scrolls.',
    uses: ['Architecture, tile and ceiling design', 'Textile, jewellery and metalwork pattern', 'Laser-cut screens and panels', 'Teaching tilings and symmetry'],
    tips: [
      { text: 'A larger contact angle makes stars with fatter points.', set: { angle: 72, size: 70 } },
      { text: 'Classic colours show the traditional palette.', set: { colour: 'classic', line: 3.5 } },
      { text: 'A small tile size packs in many small stars.', set: { size: 30, line: 1.2 } },
    ],
    terms: [['Girih', 'Islamic geometric strapwork, from the Persian for knot.'], ['Strapwork', 'Decorative bands that appear to interweave.'], ['Pentagrid', 'Five families of parallel lines used to build a Penrose tiling.']],
    related: ['penrose-tiling', 'mughal-jali', 'mandala'],
  },

  madhubani: {
    facts: { from: 'Mithila, in Bihar and Nepal', era: 'Ancient tradition, on paper since the 1960s', bestOn: 'Pictures with clear shapes and bold colour' },
    why: 'Madhubani, or Mithila, painting does not like empty space. Every figure is outlined and then filled with a pattern of its own, lines, dots, scales or waves, so that the painting hums with texture. The colours come from natural pigments, and women painted them on the walls of houses, especially for weddings. This treatment does the same by colour: a region of red gets a lattice, a region of yellow gets dots.',
    how: [
      'Blur the picture and snap it to eight pigments: madder red, turmeric, leaf green, indigo, lamp black, paper, saffron and earth.',
      'Clean regions with a majority filter and outline them in black wherever two colours meet.',
      'Choose a fill pattern for each pigment: a diamond lattice on red, dots on yellow, waves on green, fish-scale arcs on blue, dots in paper white on black, concentric rings on saffron and stripes in paper white on earth.',
      'Set the pattern size and strength with the sliders.',
      'Add a double border with its own small motifs, like the decorated edge of a wall painting.',
    ],
    history: 'Madhubani painting comes from the Mithila region of Bihar and the neighbouring parts of Nepal, painted with twigs and cotton-wrapped sticks and with pigments from turmeric, indigo, soot, flowers and clay. After the Bihar earthquake of 1934 the British officer William Archer photographed wall paintings in damaged houses. From the 1960s women artists such as Sita Devi, Ganga Devi and Mahasundari Devi brought the art onto paper, and it became known across India and abroad.',
    uses: ['Wall painting, textiles and stationery', 'Illustration, packaging and station murals', 'Teaching colour and pattern filling', 'Cultural gifts that support artists'],
    tips: [
      { text: 'Strong patterns make every colour its own texture.', set: { pattern: 100, size: 9 } },
      { text: 'Few colours and thick outlines read like a folk painting.', set: { simplify: 8, line: 85 } },
      { text: 'A wide border frames the picture like a wall painting.', set: { frame: 100 } },
    ],
    terms: [['Mithila', 'The cultural region in Bihar and Nepal where Madhubani art began.'], ['Natural pigment', 'Colour made from plants, minerals and soot.'], ['Horror vacui', 'The urge to fill every empty space in an artwork.']],
    related: ['warli', 'kolam', 'persian-miniature'],
  },

  warli: {
    facts: { from: 'The Warli people of Maharashtra and Gujarat', era: 'Ancient tradition, shown on paper from the 1970s', bestOn: 'Pictures with a dark subject on a light ground' },
    why: 'Warli painting is made with a vocabulary of three shapes: a circle, a triangle and a square, which are said to come from the sun and the moon, from mountains and trees, and from a field or a hut. A person is two triangles meeting at their tips with a circle for a head and stick limbs, and a crowd of them dances in a ring. The picture decides where the crowd gathers.',
    how: [
      'Make a wall texture from two noises, a broad one 90 px across and a fine one 5 px across.',
      'Place candidate positions on a staggered grid with spacing 0.82 u (u is the figure size), each shifted by up to a quarter of the spacing.',
      'At each position let the picture’s tone t set the chance that anything is drawn: p = min(1, 1.15 d (1 − t)^1.5), where d is the crowd slider. Dark places hold a thick crowd and light ones stay empty.',
      'Draw the figures in white rice paste: dancers, animals, trees and huts, with slightly wobbly lines.',
      'Add a border of small triangles and squares.',
    ],
    history: 'Warli painting belongs to the Warli people, an Adivasi community of Maharashtra and Gujarat. It is painted on the red-brown mud walls of houses, in white rice paste, with a bamboo stick, and is often made for weddings, around a square drawn for the goddess Palaghata. In the 1970s the artist Jivya Soma Mashe brought Warli painting onto cloth and paper, and received a Padma Shri in 2011.',
    uses: ['Wall art, textiles and stationery', 'Illustration for children’s books', 'Packaging and poster design', 'Cultural education and village crafts'],
    tips: [
      { text: 'A full crowd fills the darkest parts of your picture.', set: { crowd: 100, size: 20 } },
      { text: 'Ochre walls feel like a sun-baked village.', set: { wall: 'ochre', border: true } },
      { text: 'A night wall makes the white figures glow.', set: { wall: 'night', crowd: 60 } },
    ],
    terms: [['Warli', 'An Adivasi community of western India, and its painting.'], ['Rice paste', 'The white paint made of ground rice used on the mud walls.'], ['Adivasi', 'The Indigenous peoples of India.']],
    related: ['madhubani', 'kolam', 'aboriginal-dot-painting'],
  },

  kolam: {
    facts: { from: 'Tamil Nadu and South India', era: 'Ancient, drawn every morning', bestOn: 'Pictures with clear light and dark areas' },
    why: 'In Tamil Nadu and the south of India, women draw a kolam at the door each morning in rice flour, so that ants and birds are fed as they pass. The most common kind starts with a lattice of dots, called pulli, and a line that loops round them. The patterns are made by simple rules, and the same dots can make many different drawings. Here each square of four dots chooses its figure from the tone of your picture.',
    how: [
      'Place dots on a square lattice with the chosen spacing.',
      'For each square of four dots, draw loops (quarter circles of radius s/2 about each corner, turning inward, so four neighbouring squares draw a full circle round the shared dot), a diamond joining the midpoints of the four sides, both, or nothing.',
      'Choose by the tone t (less the density slider): empty if t ≥ 0.78, loops only if 0.62 ≤ t < 0.78, diamond only if 0.4 ≤ t < 0.62, and both if t < 0.4, so dark places turn into diamonds and petals.',
      'Fold the point where the picture is read for mirror symmetry, and in four-fold symmetry fold the top and bottom as well.',
      'Draw the flour as a canvas of its own with grainy edges and a soft glow, laid over a floor texture.',
    ],
    history: 'Kolam is drawn daily, and in the month of Margazhi (December to January) streets fill with large, elaborate ones. Related floor drawings include rangoli in much of India, muggu in Andhra Pradesh and alpana in Bengal. Mathematicians and computer scientists have studied kolams since the 1970s, as pictures made by simple rules, and Gift Siromoney and colleagues in Chennai were among the first to analyse them with array grammars.',
    uses: ['Daily floor art and festival decoration', 'Pattern, textile and logo design', 'Teaching loops, symmetry and graphs', 'Computer science research on picture languages'],
    tips: [
      { text: 'Four-fold symmetry makes a classic square kolam.', set: { sym: 'four', size: 24 } },
      { text: 'Positive density clears more of the page, negative fills it.', set: { density: -20, weight: 1.4 } },
      { text: 'Picture colour on a dusk floor looks like festival flour.', set: { colour: 'picture', floor: 'dusk' } },
    ],
    terms: [['Kolam', 'A floor drawing made of rice flour or paste, drawn at the threshold.'], ['Pulli', 'The dots that form the lattice of a kolam.'], ['Array grammar', 'A set of rules for generating pictures on a grid.']],
    related: ['truchet-tiles', 'warli', 'mandala'],
  },
};
