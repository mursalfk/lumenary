// src/data/theory-extra/f-craft.js
// Section F, print and craft: the fuller story of each treatment.
export const EXTRA_CRAFT = {
  halftone: {
    facts: { from: 'Photoengraving and offset printing', era: '1880s onward', bestOn: 'Portraits and high contrast photographs' },
    why: 'A press can lay down ink or leave paper bare, nothing in between, so printers fake grey with dots: small for light, large for dark. Your eye blends them when they are small enough. Colour printing repeats that with four inks, each on its own lattice turned to a different angle, so the dots interleave in a neat rosette instead of fighting each other.',
    how: [
      'Rotate a square lattice by the screen angle and lay it over the picture.',
      'Sample the picture at each lattice point.',
      'Draw a circle whose area is proportional to the ink that tone needs, so the radius is the square root of the tone.',
      'In four colour mode, separate the picture into cyan, magenta, yellow and black and draw four lattices at 15, 75, 0 and 45 degrees with the multiply blend.',
      'In colour on black mode, let dots grow with brightness and take the cell’s colour.',
    ],
    history: 'Stephen Horgan printed the first halftone photograph in a daily newspaper in 1880, and Frederic Ives patented a halftone process in 1881. Four colour offset printing through the twentieth century made the dot the basis of nearly every magazine, and it is why a close look at a printed photograph shows rosettes.',
    uses: ['Newspaper and magazine style imagery', 'Poster and print design', 'Pop art and retro effects', 'Screen print separations'],
    tips: [
      { text: 'Four colour mode with large dots shows the printing process itself.', set: { mode: 'cmyk', cells: 50 } },
      { text: 'Fine dots at 45 degrees are close to a photograph.', set: { cells: 160, angle: 45 } },
      { text: 'Colour on black glows like a lit billboard.', set: { mode: 'color' } },
    ],
    terms: [['Screen angle', 'The angle at which a dot lattice is rotated.'], ['Moiré', 'A wavy interference pattern made when two regular grids overlap at nearly the same angle.'], ['CMYK', 'Cyan, magenta, yellow and black: the four inks of most colour printing.']],
    related: ['newspaper', 'pop-art', 'screen-print'],
  },

  risograph: {
    facts: { from: 'Japanese stencil duplicators', era: '1980s machine, art-print revival since the 2000s', bestOn: 'Illustrations, portraits and landscapes with clear tonal masses' },
    why: 'A risograph prints one colour per pass, so its pictures are built from two or three overlapping inks with a grainy fill and a hint of misregistration. This treatment makes two plates from the picture, one for shadows and one for almost everything, lays ink as random grain instead of dots, and multiplies the inks so overlaps mix like real transparent inks.',
    how: [
      'Make plate one from the darkness raised to the power 1.35, which carries the shadows.',
      'Make plate two from the darkness raised to the power 0.75, which carries almost everything, and read it from a position a few pixels away.',
      'Compare each plate with a threshold of 0.5 plus a mix of white and smooth noise to decide where to ink, and smooth the comparison slightly.',
      'Multiply the two inks together, so overlaps become a deeper third colour.',
      'Multiply in a faint paper fibre pattern.',
    ],
    history: 'The Japanese company Riso Kagaku developed the Risograph as a fast, cheap duplicator for schools and offices, and it reached the market in the 1980s. Illustrators and small presses adopted it in the 2000s for its soft colour, grain and low cost, and riso zines and prints are now a recognisable look.',
    uses: ['Zines, posters and art prints', 'Independent book and album covers', 'Event flyers with a handmade feel', 'Illustration portfolios'],
    tips: [
      { text: 'Teal and orange gives a punchy, warm and cool contrast.', set: { pair: 'teal-orange' } },
      { text: 'Strong misregistration looks like a rushed print run.', set: { miss: 90, grain: 80 } },
      { text: 'White paper with dense ink looks clean and modern.', set: { paper: 'white', density: 120 } },
    ],
    terms: [['Misregistration', 'When separate colour layers do not line up exactly.'], ['Spot colour', 'An ink printed by itself rather than mixed from others.'], ['Plate', 'The stencil or surface that carries one colour.']],
    related: ['screen-print', 'duotone', 'halftone'],
  },

  linocut: {
    facts: { from: 'Printmaking', era: 'Early 1900s onward', bestOn: 'Strong portraits and landscapes with clear forms' },
    why: 'A linocut is printed from a block with the light parts cut away, so tone has to come from area and line: the darkest places are left solid, middle tones become lines that thicken with darkness, and the lights are gouged out. This treatment lays lines across the picture and bends them with the picture’s brightness, so they swing round shapes the way a carver’s hand does.',
    how: [
      'Lay a set of parallel lines across the picture at the chosen angle.',
      'Bend each line’s coordinate with slow noise and with the picture’s brightness.',
      'For every pixel measure its distance from the middle of its line and ink it if that is smaller than a width that grows with darkness.',
      'Add a slow swell along each line to mimic the taper of a V-shaped gouge.',
      'Add solid ink along strong edges as carved outlines, and knock small holes in the ink with roller specks.',
    ],
    history: 'Linoleum was patented by Frederick Walton in the 1860s as a floor covering. By the early 1900s printmakers, among them the German expressionists of Die Brücke, were carving it because it was softer than wood. Pablo Picasso made a famous series of colour linocuts in the 1950s, and the technique remains popular in schools and studios.',
    uses: ['Poster and book cover art', 'Greeting cards and wrapping designs', 'Folk-art and craft styled illustration', 'Printmaking practice studies'],
    tips: [
      { text: 'Fewer, thicker cuts look bold and hand carved.', set: { lines: 36, wave: 70 } },
      { text: 'Rust ink without outlines is softer.', set: { ink: 'rust', outline: false } },
      { text: 'Rotate the cuts to a different direction.', set: { angle: 100 } },
    ],
    terms: [['Gouge', 'A curved carving tool that removes a groove of material.'], ['Relief print', 'A print made from the raised parts of a block.'], ['Block', 'The piece of lino or wood that is carved and inked.']],
    related: ['mezzotint', 'screen-print', 'rubber-stamp'],
  },

  'banknote-engraving': {
    facts: { from: 'Security printing', era: '19th century onward', bestOn: 'Portraits with clear faces' },
    why: 'Banknotes were made to be difficult to forge, so their portraits are built from fine engraved lines whose thickness changes with tone, surrounded by guilloche rosettes drawn by rolling one circle inside another. This treatment does both: thick ribbons in the shadows, hairlines in the lights, and curves that look like machined lacework.',
    how: [
      'Draw the picture as horizontal ribbons inside a rounded window.',
      'Walk along each line in short steps, read the darkness beneath, and set the half thickness to a power of that darkness, capped at half the line spacing.',
      'Shift lines down where the picture is light and up where it is dark, and add a gentle sine wave so the surface looks modelled.',
      'Add the security devices: a faint tint of fine wavering lines, a double frame, and guilloche rosettes repeated seven times with slightly different pen offsets.',
      'Set an invented numeral, serial number and title in a Bodoni face.',
    ],
    history: 'Engraved banknotes grew from the engraving of plates for books and bank bills, and the early nineteenth century saw intricate machine-turned patterns added against forgery. The first postage stamp, the Penny Black of 1840, had an engine-turned background for the same reason. Today’s banknotes still combine engraving and guilloche with newer security features. The wording in this treatment is invented, and the note is not real money.',
    uses: ['Certificates and diplomas', 'Vintage and heritage graphics', 'Portrait art with a fine line look', 'Stationery and invitation design'],
    tips: [
      { text: 'Brown ink with a high line count looks like a nineteenth century bond.', set: { ink: 'brown', lines: 130 } },
      { text: 'Strong line swing exaggerates the sculpted look.', set: { swing: 90 } },
      { text: 'Turn off the rosettes to see only the portrait.', set: { rosettes: false } },
    ],
    terms: [['Guilloche', 'An intricate pattern of interlaced curves made by machine or by a rolling circle.'], ['Intaglio', 'A printing method in which ink sits in grooves cut into a metal plate.'], ['Hypotrochoid', 'The curve traced by a point on a circle rolling inside a larger circle.']],
    related: ['victorian', 'mezzotint', 'art-deco'],
  },

  'screen-print': {
    facts: { from: 'Stencil printing in Asia, then commercial presses and art studios', era: 'Commercial use from the 1900s, pop art in the 1960s', bestOn: 'Bold portraits and graphic scenes' },
    why: 'Screen printing pushes ink through a mesh, one colour at a time. Cut the picture into brightness bands, print the lightest ink over the darkest regions and add darker inks over smaller areas, and the dark parts receive every ink in turn. Because inks are transparent they multiply, so overlaps create new colours without extra plates.',
    how: [
      'Cut the picture into bands: the lightest ink covers every pixel darker than 0.84, the next everything darker than 0.62, then 0.41, then 0.21.',
      'Print each ink as a separate flat layer.',
      'Combine the layers by multiplication, so yellow over red becomes orange and the full stack is near black.',
      'Shift each pass by its own small random offset for misregistration.',
      'Wobble the thresholds with smooth noise for ragged edges and add a faint cross-hatch from the mesh.',
    ],
    history: 'Stencil printing through silk or fine mesh was used in East Asia for centuries. Commercial screen printing spread in the early 1900s, and in the 1930s artists proposed the name serigraphy for fine art prints. Andy Warhol made the technique famous in the 1960s, and it is still the main way to print posters, t-shirts and gig bills.',
    uses: ['Poster and gig bill design', 'T-shirts and merchandise', 'Album and event artwork', 'Limited edition art prints'],
    tips: [
      { text: 'Two inks with strong misregistration is a punk poster.', set: { passes: 2, miss: 85 } },
      { text: 'The ice palette is cool, calm and modern.', set: { palette: 'ice' } },
      { text: 'Smooth edges and little mesh look like a clean commercial print.', set: { rough: 5, mesh: 10 } },
    ],
    terms: [['Serigraphy', 'The art term for fine art screen printing.'], ['Pass', 'One run of the paper under one ink.'], ['Mesh', 'The woven screen through which ink is pushed.']],
    related: ['risograph', 'pop-art', 'halftone'],
  },

  mezzotint: {
    facts: { from: 'Copper plate printmaking', era: 'Invented in 1642, popular in 17th to 19th century Europe', bestOn: 'Dark, moody pictures with soft light' },
    why: 'Mezzotint begins with darkness and works towards light. A copper plate is roughened evenly with a toothed tool so that it holds ink as a dense field of pits and prints solid black. The engraver then burnishes the plate smooth where the picture should be lighter, and smoother copper holds less ink, so tone is made from the density of tiny pits instead of lines or dots.',
    how: [
      'Make a random value for each point, a mix of 62 percent white noise per grain cell and 38 percent smooth noise, to stand for the plate’s roughness.',
      'Raise the picture’s darkness to a power set by the burnishing slider.',
      'Ink the pixel where darkness beats the roughness, softening the decision with a smoothstep of width plus or minus 0.1.',
      'Dark areas win almost everywhere and print black. Light areas win only at the roughest pits and stay mostly white with scattered specks.',
      'Add a bevelled plate mark where the plate pressed into the paper.',
    ],
    history: 'The method is credited to Ludwig von Siegen, a German officer, in 1642, and Prince Rupert of the Rhine introduced it to England. In the eighteenth century it became the English favourite for reproducing portraits and paintings, valued for its velvety darks, before photography replaced it.',
    uses: ['Dramatic portrait and still life prints', 'Gothic and moody poster art', 'Book plates and fine art reproductions', 'Backgrounds with a velvet black'],
    tips: [
      { text: 'Heavy burnishing gives bright highlights on a deep ground.', set: { burnish: 85 } },
      { text: 'Sepia ink with coarse grain feels antique.', set: { ink: 'sepia', grain: 3 } },
      { text: 'Hide the plate mark to fill the page.', set: { plate: false } },
    ],
    terms: [['Rocker', 'A toothed, curved tool rocked across a plate to roughen it.'], ['Burnisher', 'A smooth tool used to polish areas of the plate so they hold less ink.'], ['Plate mark', 'The dent a plate leaves around a print.']],
    related: ['banknote-engraving', 'victorian', 'charcoal-sketch'],
  },

  cyanotype: {
    facts: { from: 'Early photography', era: '1842 onward', bestOn: 'Silhouettes, plants and pictures with strong light and shade' },
    why: 'A cyanotype is a sun print: paper coated with iron salts turns Prussian blue where light strikes it and washes white where it does not. It has no greys other than varying blue. This treatment maps the picture’s brightness onto that chemistry and adds what hand coating always brings: blotches, brush strokes and a ragged edge where the liquid pooled.',
    how: [
      'Stretch the picture, shift it by the exposure slider and add contrast.',
      'Send the result through a five colour ramp from deep blue in the shadows to near white in the highlights. Tea and green toning swap in other ramps.',
      'Change the tone slightly with two noises, one slow and blotchy and one long and thin like a brush stroke.',
      'Stop the coating short of the sheet edge in a ragged line from two more noises, with a darker pooled edge.',
      'Show bare cream paper outside the edge and multiply a fine fibre noise over everything.',
    ],
    history: 'Sir John Herschel invented the cyanotype in 1842. In 1843 Anna Atkins used it to publish photographic records of seaweeds, often called the first book illustrated with photographs. Engineers later copied their drawings with it, producing the original blueprints, and artists and schoolchildren still make sun prints with the same chemistry.',
    uses: ['Botanical and nature prints', 'Craft and photography projects', 'Blue toned wall art and posters', 'Cover art with a handmade feel'],
    tips: [
      { text: 'Tea toning warms the blue into brown.', set: { tone: 'tea' } },
      { text: 'Overexposure bleaches the print towards white.', set: { exposure: 30 } },
      { text: 'Uneven coating with no brushed edge looks more like a full sheet.', set: { uneven: 80, brush: false } },
    ],
    terms: [['Prussian blue', 'A deep blue pigment formed in the cyanotype chemistry.'], ['Exposure', 'How long and how strongly light strikes the paper.'], ['Toning', 'Changing the colour of a photographic print with a chemical bath.']],
    related: ['blueprint', 'duotone', 'ink-wash'],
  },

  'cross-stitch': {
    facts: { from: 'Counted thread embroidery', era: 'Centuries old, charted patterns from the 19th century', bestOn: 'Bold, simple subjects with distinct colours' },
    why: 'Cross-stitch is counting: the cloth is a grid of holes, and every stitch fills exactly one square. That makes the whole craft a pixel art problem. Shrink the picture to one pixel per square, limit the colours to a box of flosses and draw an X in each square, with back threads below and front threads on top for a woven look.',
    how: [
      'Shrink the picture to one pixel per square of cloth.',
      'Find the k most representative colours with k-means, made slightly more saturated, and give each square the nearest.',
      'Optionally leave squares lighter than 0.86 bare.',
      'Draw the cloth with faint threads along every grid line and a dark hole at every corner.',
      'Draw each stitch as two strokes: back strokes first in a slightly darker shade, then a soft shadow, then the front strokes with a thin pale highlight for the twist.',
    ],
    history: 'Counted thread embroidery has been worked for many centuries. Samplers, in which girls recorded stitches, alphabets and mottoes, were made from the sixteenth century onward, and printed charts of the nineteenth century, such as Berlin wool work, spread patterns widely. Today cross-stitch is a hobby for people who enjoy slow, careful making.',
    uses: ['Craft patterns and gifts', 'Pixel art in thread', 'Nursery and home decor ideas', 'Nostalgic textile style graphics'],
    tips: [
      { text: 'A black cloth makes the colours glow.', set: { cloth: 'black', flosses: 10 } },
      { text: 'Leave the light areas bare for a sampler look.', set: { bare: true } },
      { text: 'Fewer stitches across makes a chunkier, more graphic pattern.', set: { across: 40, flosses: 6 } },
    ],
    terms: [['Aida', 'A cloth woven with a grid of holes for counted embroidery.'], ['Floss', 'Embroidery thread made of loosely twisted strands.'], ['Sampler', 'A piece of embroidery made to show off stitches or to record patterns.']],
    related: ['embroidery', 'pixel-art', 'knitted-pattern'],
  },

  embroidery: {
    facts: { from: 'Textile traditions across the world', era: 'Thousands of years old', bestOn: 'Pictures with clear edges and rich colour' },
    why: 'An embroidered picture is drawn with thousands of short threads laid in the direction the shape runs, so a face is stitched around the cheek and a leaf along the vein. This treatment follows that logic: each stroke runs along the edge it sits on, in a colour taken from the picture, and is shaded to look glossy.',
    how: [
      'Scatter a jittered grid of stroke centres over the picture and put them in random order.',
      'For each, find the direction of the edge: the thread runs perpendicular to the gradient. Where there is no edge, use a lazy angle that changes slowly.',
      'Blend the two directions by an amount that grows with edge strength and with the follow slider.',
      'Choose floss colours by k-means and give each stroke the nearest to the colour of a quarter-size copy at its centre.',
      'Draw each stroke three times: a dark offset shadow, the thread itself, and a thin lighter line to one side for sheen, on linen with a wooden hoop.',
    ],
    history: 'Embroidery is among the oldest decorative arts. The Bayeux Tapestry, made in the eleventh century, is in fact an embroidery in wool on linen. In 1828 Josué Heilmann in Alsace built an early embroidery machine, and today computerised machines stitch logos and motifs on clothing from digital files.',
    uses: ['Patches, badges and apparel logos', 'Craft and textile inspired illustration', 'Heritage and handmade brand graphics', 'Gift and keepsake designs'],
    tips: [
      { text: 'Short strokes with many flosses make a fine, painterly stitch.', set: { density: 4, flosses: 16 } },
      { text: 'Let threads follow the shapes strongly.', set: { follow: 100 } },
      { text: 'Hide the hoop to fill the whole frame.', set: { hoop: false } },
    ],
    terms: [['Floss', 'Embroidery thread made of loosely twisted strands.'], ['Satin stitch', 'Parallel stitches laid close together to cover an area smoothly.'], ['Hoop', 'A ring that holds cloth taut while it is stitched.']],
    related: ['cross-stitch', 'knitted-pattern', 'tapestry-weave'],
  },

  'knitted-pattern': {
    facts: { from: 'Hand knitting, with Nordic and Fair Isle traditions', era: 'Knitting for about a thousand years, Fair Isle patterns from the 19th century', bestOn: 'Bold, simple pictures with a few colours' },
    why: 'Plain knitting is a lattice of V shaped stitches, each made of two plump legs of yarn, and it is wider than tall. If you draw one stitch well, with round legs, plies and a shadow, you can stamp it at every grid position and it looks like a real jumper. Colour changes between stitches then give you the picture.',
    how: [
      'Reduce the picture to one pixel per stitch.',
      'Choose yarn colours by k-means and give each stitch the nearest.',
      'For each yarn colour draw one stitch as a small picture: two ellipses tilted 0.42 radians in opposite directions with a gradient that makes them look round, slanted lines for the plies and a soft shadow.',
      'Stamp that stitch at every position of the grid, which is about 1 to 0.74 in width to height.',
      'Replace the top and bottom rows with a Fair Isle border, a repeating eight by seven motif of small diamonds in the darkest and lightest yarns.',
    ],
    history: 'Knitting is known from Egypt around the eleventh century, and knitted colour patterns developed in Scandinavia and the Shetland Islands. Fair Isle gets its name from a small island in Shetland, and the style became fashionable far beyond it when the Prince of Wales wore a Fair Isle pullover in 1921.',
    uses: ['Jumper and winter themed graphics', 'Cosy seasonal cards and posters', 'Craft patterns and charts', 'Textile and pattern design ideas'],
    tips: [
      { text: 'More stitches across give a finer fabric.', set: { across: 80, yarns: 8 } },
      { text: 'Three yarn colours make it look like a classic jumper.', set: { yarns: 3 } },
      { text: 'Turn off the Fair Isle border for a plain panel.', set: { border: false } },
    ],
    terms: [['Stockinette', 'The plain knitted fabric with V shaped stitches on one side.'], ['Fair Isle', 'Stranded colour knitting with small repeating patterns.'], ['Ply', 'One of the strands twisted together to make yarn.']],
    related: ['cross-stitch', 'embroidery', 'quilt-patchwork'],
  },

  'quilt-patchwork': {
    facts: { from: 'Textile traditions worldwide', era: 'Centuries old', bestOn: 'Bold pictures with simple colour regions' },
    why: 'A quilt makes a picture from scraps: cut cloth into squares or triangles, choose the colour that best matches each part of the picture, and sew them together. The quilting stitches then pull each patch into a gentle puff, light on top and shadowed at the seams. Printed fabrics add pattern to some patches for extra life.',
    how: [
      'Divide the picture into squares, or split each square into two triangles along a randomly chosen diagonal.',
      'Choose k fabric colours by k-means and give each patch the nearest to the picture’s colour at its centre.',
      'Give a chosen fraction of patches a pattern in a lighter or darker shade of their own colour: dots, stripes, a check, florets or diagonal lines.',
      'Puff each patch with a radial gradient, white at 20 percent near the middle and black at 30 percent at the rim.',
      'Draw a thin dark seam and a dashed running stitch on a copy of the patch outline shrunk to 82 percent.',
    ],
    history: 'Patchwork and quilting appear in many cultures, from the kantha of Bengal and the ralli of Sindh to the quilts of Britain and North America, where they used up worn clothing as well as celebrated skill. The Quilts of Gee’s Bend, made by a community of women in Alabama, were shown in major museums in the 2000s and brought wide attention to the craft as art.',
    uses: ['Textile and home decor inspiration', 'Craft and sewing project plans', 'Warm, handmade looking posters', 'Pattern ideas for fabrics'],
    tips: [
      { text: 'Small squares with strong prints look like a classic quilt.', set: { shape: 'squares', across: 24, prints: 85 } },
      { text: 'Few patches make a big, bold block pattern.', set: { across: 7, fabrics: 5 } },
      { text: 'Hide the stitching for a flatter, graphic look.', set: { stitch: false } },
    ],
    terms: [['Patch', 'A single piece of cloth in a patchwork.'], ['Wadding', 'The soft layer inside a quilt that gives it body.'], ['Running stitch', 'A simple stitch that passes in and out of the cloth in a row.']],
    related: ['ralli-patchwork', 'cross-stitch', 'paper-cut-out'],
  },

  'tapestry-weave': {
    facts: { from: 'Weaving workshops of Europe, the Middle East and the Americas', era: 'Many centuries', bestOn: 'Landscapes and simple scenes with clear colour regions' },
    why: 'In tapestry the coloured weft is passed back and forth over a hidden warp and packed so tightly that the warp disappears and the picture is built of horizontal rows. A pass of wool is round, so it is bright in its middle and dark where it dips, and hand beaten rows never run quite straight. These details turn a neat mosaic into something woven.',
    how: [
      'Divide the picture into rows (passes of weft) and into cells about as wide as a row is tall, and take one colour per cell.',
      'Limit the colours to k wool colours by k-means.',
      'Shift odd rows by half a cell, as in real weaving, and wave the row boundaries a little with the wobble slider.',
      'Light each pass as a round strand, with a sine raised to the power 0.55, and alternate cells slightly in brightness to show the over and under.',
      'Show the dark warp where each row dips, and draw loose warp ends as a fringe at the bottom.',
    ],
    history: 'Woven tapestries hung in medieval castles and cathedrals. The Gobelins manufactory in Paris was established in the seventeenth century, and the Renaissance painter Raphael designed cartoons in 1515 and 1516 for tapestries for the Sistine Chapel. In the twentieth century the Bauhaus weaving workshop, with artists such as Anni Albers, made tapestry a modern art.',
    uses: ['Wall hanging and textile design ideas', 'Craft and heritage themed visuals', 'Warm, earthy poster art', 'Cover art with a handmade feel'],
    tips: [
      { text: 'Many fine passes look like a detailed Gobelins panel.', set: { rows: 140, yarns: 10 } },
      { text: 'High wobble gives a very hand-woven look.', set: { wobble: 95 } },
      { text: 'Remove the fringe for a framed tapestry.', set: { fringe: false } },
    ],
    terms: [['Warp', 'The fixed lengthwise threads on a loom.'], ['Weft', 'The crosswise thread that is woven through the warp.'], ['Cartoon', 'A full-size design used as a pattern for a tapestry or fresco.']],
    related: ['cross-stitch', 'navajo-weave', 'fabric-folds'],
  },

  'paper-cut-out': {
    facts: { from: 'Folk paper cutting and modern collage', era: 'Centuries old, cut-out painting in the 20th century', bestOn: 'Landscapes and portraits with soft tonal masses' },
    why: 'A paper cut-out landscape is a stack of layers, each a sheet cut with scissors, each throwing a soft shadow on the one below. If you cut the picture’s brightness into bands like a contour map and stack coloured sheets, the depth is created by shadow alone. Swapping the colours changes the whole mood without changing the shapes.',
    how: [
      'Blur the picture’s brightness to round off detail.',
      'Make layer i exist wherever brightness is above the threshold i divided by n, with a very short smoothstep at the edge for a sharp cut.',
      'Colour layers from dark at the bottom to light at the top, from a palette or from the picture’s own colours.',
      'For each layer, shift its mask a few pixels away from the light, blur it twice, and darken the sheets beneath wherever that shadow falls outside the layer.',
      'Composite from the bottom up, add a hairline of light at the cut edges and multiply in paper fibre.',
    ],
    history: 'Paper cutting is a folk art in China, Poland, Mexico and many other places. In the 1940s and 1950s Henri Matisse, limited by illness, cut and arranged painted paper in large works such as The Snail, and Lotte Reiniger made silhouette animated films from cut paper in the 1920s. Layered paper shadow boxes are now a popular craft.',
    uses: ['Layered landscape and poster art', 'Children’s book and craft illustration', 'Paper craft and shadow box designs', 'Greeting cards'],
    tips: [
      { text: 'Seven layers in forest greens feel like a mountain range.', set: { layers: 7, palette: 'forest' } },
      { text: 'A deeper shadow gives the layers more lift.', set: { shadow: 100, smooth: 30 } },
      { text: 'Use the picture’s own colours for the paper.', set: { palette: 'picture' } },
    ],
    terms: [['Layer', 'One sheet in a stack, each cut to a different shape.'], ['Contour', 'A line or band of equal value, as on a map.'], ['Silhouette', 'A solid dark shape seen against a lighter background.']],
    related: ['papel-picado', 'chinese-paper-cut', 'origami-folds'],
  },

  'stained-glass': {
    facts: { from: 'Medieval cathedrals and Islamic architecture', era: 'Around 1000 onward', bestOn: 'Bold pictures with clear colour' },
    why: 'Stained glass is a mosaic of coloured pieces held in dark lead, lit from behind so that the colour glows. Its irregular pieces come naturally from cellular noise: each point belongs to the nearest of a set of random sites. Lead lies where two sites are nearly equally close, and each piece is darker near the lead and brighter in the middle, as real glass is.',
    how: [
      'Scatter a random site in every square of a coarse grid and give each pixel to its nearest site, making irregular convex pieces.',
      'Take each piece’s colour from the picture, blurred to about the size of a piece and read at the site, then boost saturation and brightness.',
      'Place lead where the distances to the nearest and second nearest sites nearly match, drawn as a dark bar with a soft highlight along its crown.',
      'Make each piece darker towards the lead and brighter in the middle, with ripple from two layers of noise.',
      'Light it with a backlight that fades away from the top left.',
    ],
    history: 'Coloured glass windows filled the great cathedrals of medieval Europe, as at Chartres in the early thirteenth century and Sainte-Chapelle in Paris, finished in 1248, and pierced windows of coloured glass are also found in Islamic architecture. Louis Comfort Tiffany developed new copper foil methods in the late nineteenth century. The cellular partition behind the pieces is the Voronoi diagram, studied by Georgy Voronoy in 1908.',
    uses: ['Window and lampshade design ideas', 'Church, mosque and heritage themed graphics', 'Colourful posters and covers', 'Backgrounds with a luminous feel'],
    tips: [
      { text: 'Thick lead and larger pieces look like a church window.', set: { pieces: 12, lead: 9 } },
      { text: 'Very small pieces with fine lead give a delicate mosaic.', set: { pieces: 40, lead: 2 } },
      { text: 'Full backlight makes the glass glow.', set: { glow: 100 } },
    ],
    terms: [['Voronoi diagram', 'A division of the plane in which each point belongs to its nearest site.'], ['Came', 'The grooved lead strip that holds pieces of glass together.'], ['Backlight', 'Light shining from behind so that it passes through the material.']],
    related: ['voronoi-mosaic', 'byzantine-mosaic', 'low-poly'],
  },
};
