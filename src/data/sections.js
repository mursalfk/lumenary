// src/data/sections.js
// The master roadmap. Every treatment, grouped into sections, in the order it appears on the site.
//
// - `enabled: true`  the section is live: its treatments appear on the homepage, the theory page and as routes.
// - `enabled: false` the section is planned: nothing here is shown yet. Flip the flag when its treatments are built.
// - `items` are display names. A name becomes the route id with `slugify`, and must match the `id` of a file in
//   src/engine/styles (for example "Pop Art" -> pop-art -> src/engine/styles/pop-art.js).
//   A name with no matching file is simply skipped, so a section can ship in parts.

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const SECTIONS = [
  {
    id: 'design', letter: 'A', enabled: true,
    title: 'Design movements and styles',
    blurb: 'Whole design languages laid over your picture. Each one brings its own palette, grid and furniture, like a small room from another decade.',
    items: [
      'Art Deco', 'Bauhaus', 'Neo-Brutalism', 'Minimalism', 'Maximalism', 'Futuristic', 'Retro', 'Cyberpunk',
      'Pop Art', 'Editorial', 'Y2K', 'Swiss Design', 'Surreal', 'Bohemian', 'Victorian', 'Graffiti', 'Vaporwave',
      'Memphis', 'Mondrian', 'Constructivist', 'Comic Book', 'Vector Art', 'Collage Art',
    ],
  },
  {
    id: 'digital', letter: 'B', enabled: true,
    title: 'Digital and technical',
    blurb: 'Machines reading, and sometimes misreading, your picture: terminals, sensors, codecs, screens and plotters, all humming quietly.',
    items: [
      'ASCII Art', 'Pixel Art', 'Blueprint', 'Wireframe 3D', 'Retro VHS', 'Scanlines CRT', 'Glitch', 'Pixel Sorting',
      'Datamosh', 'Dithering', 'Night Vision', 'Thermal Camera', 'Circuit Board', 'QR Barcode Art', 'Matrix Rain',
      'Oscilloscope', 'Depth Parallax', 'Isometric', 'Low-poly', 'Lego Voxel',
    ],
  },
  {
    id: 'type', letter: 'C', enabled: true,
    title: 'Typographic',
    blurb: 'Pictures built from letters: set, written, flipped and printed, one glyph at a time.',
    items: ['Kinetic Type', 'Split-Flap', 'Handwritten', 'Calligraphy Portrait', 'Newspaper', 'Letterpress', 'Ticker Text'],
  },
  {
    id: 'light', letter: 'D', enabled: true,
    title: 'Light, colour and glass',
    blurb: 'Light doing what it does best: glowing, bending and bouncing through glass, ice and colour.',
    items: [
      'Glassmorphism', 'Gradient Mesh', 'Holographic', 'Neon Glow', 'Aurora', 'Duotone', 'Chrome', 'Glass Refraction',
      'Frosted Ice', 'Liquid Morph',
    ],
  },
  {
    id: 'physical', letter: 'E', enabled: true,
    title: 'Physical and 3D feel',
    blurb: 'Materials you could almost pick up: clay, leather, foil, cloth and folded paper, lit by a single lamp.',
    items: ['Clay 3D', 'Plasticine', 'Embossed Leather', 'Gold Foil', 'Fabric Folds', 'Rubber Stamp', 'Origami Folds'],
  },
  {
    id: 'craft', letter: 'F', enabled: true,
    title: 'Print and craft',
    blurb: 'Ink, thread, paper and glass: slow, handmade things, rebuilt from arithmetic.',
    items: [
      'Halftone', 'Risograph', 'Linocut', 'Banknote Engraving', 'Screen Print', 'Mezzotint', 'Cyanotype', 'Cross-stitch',
      'Embroidery', 'Knitted Pattern', 'Quilt Patchwork', 'Tapestry Weave', 'Paper Cut-out', 'Stained Glass',
    ],
  },
  {
    id: 'painterly', letter: 'G', enabled: true,
    title: 'Painterly and drawn',
    blurb: 'Brush, pencil, chalk and ink: marks that pool, bleed and build up, much as they do on a table by a window.',
    items: [
      'Watercolour', 'Oil Impasto', 'Charcoal Sketch', 'Pointillism', 'Impressionist', 'Gouache', 'Pencil Hatching',
      'Ink Wash', 'Pastel Chalk', 'Blind Contour',
    ],
  },
  {
    id: 'optical', letter: 'H', enabled: true,
    title: 'Photographic and optical',
    blurb: 'Lenses, film and light leaks: what a camera adds when light passes through glass and chemistry.',
    items: [
      'Lomography', 'Film Grain', 'Infrared', 'Tilt-shift', 'Kaleidoscope', 'Anaglyph 3D', 'Bokeh', 'Double Exposure',
      'Cross-processed', 'Daguerreotype', 'Chromatic Aberration', 'Lenticular',
    ],
  },
  {
    id: 'generative', letter: 'I', enabled: true,
    title: 'Geometric and generative',
    blurb: 'Small rules, repeated patiently, that grow a picture the way frost grows across a pane.',
    items: [
      'Particles', 'Truchet Tiles', 'Op Art Moire', 'Spirograph', 'Hexagon Mosaic', 'Voronoi Mosaic', 'Penrose Tiling',
      'Fractal Flame', 'Mandelbrot Fill', 'Reaction-diffusion', 'Flow Field', 'Circle Packing', 'String Art',
      'Lissajous Curves', 'Metaballs', 'Warped Grid', 'Wave Function Collapse', 'L-system Trees', 'Phyllotaxis',
      'Hilbert Curve', 'Cellular Automata', 'Physarum', 'Differential Growth', 'Strange Attractors', 'Fourier Epicycles',
      'Contour Lines', 'Poisson Stippling', 'Space Colonization', 'Boids', 'Domain Warp',
    ],
  },
  {
    id: 'motion', letter: 'J', enabled: true,
    title: 'Motion and live',
    blurb: 'Weather and small lights in motion: rain, haze, fireflies, ink and snow drifting over your picture.',
    items: ['Rain on Glass', 'Heat Haze', 'Fireflies', 'Ink in Water', 'Snowfall'],
  },
  {
    id: 'world', letter: 'K', enabled: true,
    title: 'World cultural',
    blurb: 'Patterns and crafts from around the world, studied with care.',
    items: [
      'Ukiyo-e', 'Papel Picado', 'Chinese Paper Cut', 'Aboriginal Dot Painting', 'Batik', 'Kente', 'Adinkra', 'Mudcloth',
      'Azulejo', 'Delft Blue', 'Talavera', 'Sashiko', 'Kintsugi', 'Celtic Knot', 'Rosemaling', 'Mandala', 'Maori Koru',
      'Navajo Weave', 'Aztec Glyphs', 'Hieroglyphs', 'Greek Meander', 'Byzantine Mosaic',
    ],
  },
  {
    id: 'sindhi', letter: 'L', enabled: true,
    title: 'Sindhi design',
    blurb: 'The patterns, crafts and scripts of Sindh, kept close to home.',
    items: [
      'Ajrak', 'Hala Blue Pottery', 'Ralli Patchwork', 'Sindhi Mirror Embroidery', 'Sindhi Topi', 'Hala Lacquerware',
      'Makli Carving', 'Indus Seal', 'Sindhi Script',
    ],
  },
  {
    id: 'southasia', letter: 'M', enabled: true,
    title: 'South Asian and Islamic',
    blurb: 'Folk art and sacred geometry across South Asia and the Islamic world.',
    items: ['Truck Art', 'Mughal Jali', 'Persian Miniature', 'Girih', 'Madhubani', 'Warli', 'Kolam'],
  },
];

export const ENABLED_SECTIONS = SECTIONS.filter((s) => s.enabled);
export const TOTAL_PLANNED = SECTIONS.reduce((n, s) => n + s.items.length, 0);
