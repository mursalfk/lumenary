// src/data/theory-extra/d-light.js
// Section D, light, colour and glass: the fuller story of each treatment.
export const EXTRA_LIGHT = {
  glassmorphism: {
    facts: { from: 'Operating systems and interface design', era: '2000s, named around 2020', bestOn: 'Colourful backgrounds with soft shapes' },
    why: 'Frosted glass is a window that hides detail but keeps colour. Put a translucent panel over a vivid picture and the panel inherits its hues while staying calm enough to hold text. This treatment builds that effect from layers: a soft shadow, a blurred copy of the picture, a tint, a diagonal sheen and a fine border that catches light on two corners.',
    how: [
      'Blur the picture by shrinking it by an amount set by the frost slider and enlarging it back in doublings with smoothing.',
      'Draw a soft shadow, then clip to a rounded rectangle for each panel.',
      'Inside the panel draw the blurred picture, then a translucent tint, white for light glass or near black for smoke.',
      'Add a diagonal sheen that fades from bright to nothing.',
      'Draw a one pixel border whose brightness varies along the diagonal, and place panels from a fixed layout nudged by the seed.',
    ],
    history: 'Translucent interface glass appeared in Windows Vista’s Aero in 2006 and 2007, and Apple’s iOS 7 in 2013 used blur behind panels. The designer Michal Malewicz popularised the name glassmorphism around 2020, when macOS Big Sur and many apps and websites adopted frosted cards.',
    uses: ['App and dashboard mock-ups', 'Hero sections for websites', 'Cards for music and weather screens', 'Wallpapers with floating panels'],
    tips: [
      { text: 'Smoked glass with strong frost reads as a dark mode card.', set: { tint: 'smoke', blur: 85 } },
      { text: 'One large panel is a clean frame for a title.', set: { panels: 1, radius: 40 } },
      { text: 'Low frost keeps the picture clear behind the glass.', set: { blur: 15, opacity: 20 } },
    ],
    terms: [['Low-pass filter', 'A filter that removes fine detail and keeps only broad shapes, which is what blur does.'], ['Sheen', 'A soft highlight across a surface.'], ['Over operator', 'The standard rule for laying a translucent layer over another.']],
    related: ['frosted-ice', 'glass-refraction', 'gradient-mesh'],
  },

  'gradient-mesh': {
    facts: { from: 'Vector illustration software and modern interfaces', era: '1998 tool, 2020s trend', bestOn: 'Colourful scenes without fine detail' },
    why: 'A gradient mesh forgets the shapes of a picture and keeps only where its colours are. The picture is reduced to a small grid of colour points and the program draws a smooth surface through them, so what remains is mood: a soft field in your picture’s own palette. Slow warping makes the colours drift like oil on water.',
    how: [
      'Reduce the picture to a small grid of colour points.',
      'Push each colour a little: more saturation, and more contrast around mid lightness.',
      'Build a smooth surface by blending the four nearest mesh points with eased weights, so there are no creases.',
      'Warp where the surface is read with two nested sine waves that change slowly with time.',
      'Compute at no more than 180 pixels wide, enlarge it, and lay a film of noise on top to prevent banding.',
    ],
    history: 'The Gradient Mesh tool arrived in Adobe Illustrator in 1998, giving illustrators smooth, hand-controlled colour transitions. In the 2020s soft mesh gradients became a common background in websites, wallpapers and music apps, replacing the flat colours of the previous decade.',
    uses: ['Website and app backgrounds', 'Album and playlist covers', 'Phone wallpapers', 'Calm title backgrounds for videos'],
    tips: [
      { text: 'More colour points follow the picture more closely.', set: { points: 9, vivid: 55 } },
      { text: 'A slow drift with little warp feels like breathing.', set: { speed: 15, warp: 25 } },
      { text: 'Strong grain gives a printed, risograph feel.', set: { grain: 90 } },
    ],
    terms: [['Mesh', 'A grid of points that carry colours or positions.'], ['Interpolation', 'Working out values between known points.'], ['Banding', 'Visible steps in a smooth gradient caused by too few shades.']],
    related: ['aurora', 'liquid-morph', 'duotone'],
  },

  holographic: {
    facts: { from: 'Optics, then packaging and fashion', era: '1947 hologram, 1980s foils, 2010s trend', bestOn: 'Dark pictures with bright shapes' },
    why: 'Holographic foil is covered in microscopic grooves that split light into colours, so the colour you see depends on the angle you look from. A screen has no angle, so this treatment makes up a stand-in coordinate from brightness, position and time and reads a rainbow from it. Because brightness is part of the coordinate, the rainbow follows the shapes in your picture.',
    how: [
      'Mix three things into one coordinate: the pixel’s brightness, its position across a tilted axis, and time.',
      'Wrap the coordinate into the range 0 to 1 and use it as a hue, looked up in a table of 512 saturated colours.',
      'Mix the foil colour with the base picture by the intensity slider, weighted by brightness so shadows stay dark.',
      'Sweep a soft white band, shaped like a Gaussian bell, across the tilted axis. Hovering moves it to the cursor.',
      'Every tenth of a second, set a tiny random share of the brighter pixels to white for sparkle.',
    ],
    history: 'Dennis Gabor invented holography in 1947 and won the Nobel Prize for it in 1971. Embossed holograms became familiar on credit cards in the 1980s as a hard-to-copy security feature. Iridescent foil later spread to packaging, trading cards and fashion, and had a strong revival in the 2010s.',
    uses: ['Trading card and sticker style art', 'Packaging mock-ups', 'Poster and cover art with a shimmer', 'Fashion and beauty branding'],
    tips: [
      { text: 'Spread the colours wide for a full rainbow across the picture.', set: { spread: 3, intensity: 80 } },
      { text: 'Keep the original colours under the foil for a subtler sheen.', set: { base: 'color', intensity: 35 } },
      { text: 'Turn the sparkle up for glitter foil.', set: { sparkle: 100 } },
    ],
    terms: [['Iridescence', 'Colour that changes with the viewing angle.'], ['Diffraction grating', 'A surface with fine grooves that splits light into its colours.'], ['Gaussian', 'A smooth bell shaped curve.']],
    related: ['chrome', 'aurora', 'gold-foil'],
  },

  'neon-glow': {
    facts: { from: 'Neon sign making', era: '1910s onward', bestOn: 'Pictures with clear outlines, such as portraits and architecture' },
    why: 'A neon sign is a thin tube of gas that glows along its whole length, so what you see is a line with a soft halo. This treatment keeps only the edges of the picture and draws each as a tube. The glow comes from adding shrunk, smoothed copies of the line layer back at full size, which behaves like a wide halo around a hard core.',
    how: [
      'Blur the picture and find its edges with the Sobel pipeline.',
      'Keep pixels whose edge strength is above a threshold set by the detail slider and colour them with a diagonal gradient between your two neons.',
      'Shrink the line layer four times, each by half, and draw every smaller copy back at full size with additive blending.',
      'Add a faint copy of the original underneath if you want it.',
      'Flicker the whole sign with two sine waves of different frequency and an occasional dip to 45 percent.',
    ],
    history: 'Georges Claude showed neon lighting at the Paris Motor Show in 1910, and neon signs reached the United States in the early 1920s. Their colours dominated city nights for fifty years and still say “open late” to most of us. The glow trick used here is related to the mipmap pyramid, introduced by Lance Williams in 1983.',
    uses: ['Nightlife and music posters', 'Cafe and bar signage mock-ups', 'Gaming and streaming backgrounds', 'Sci-fi and cyberpunk visuals'],
    tips: [
      { text: 'High detail with strong glow turns a portrait into a sign.', set: { detail: 90, glow: 95 } },
      { text: 'Source colours keep the picture’s own palette in the tubes.', set: { mode: 'source' } },
      { text: 'Switch off the flicker for a steady sign.', set: { flicker: false } },
    ],
    terms: [['Additive blending', 'Combining lights by adding their brightness, so overlaps get brighter.'], ['Mipmap', 'A stack of the same image at half, quarter and smaller sizes.'], ['Sobel', 'A way of measuring how quickly brightness changes, which is large on an edge.']],
    related: ['cyberpunk', 'futuristic', 'aurora'],
  },

  aurora: {
    facts: { from: 'The polar skies', era: 'Seen for all of human history', bestOn: 'Pictures with bright shapes against darker areas' },
    why: 'An aurora is a curtain of glowing gas that hangs from a bright lower edge and fades upward. This treatment lets the bright parts of your picture be the source of that glow. From each source it sends a curtain up the page that fades at a steady rate, then streaks it with noise and colours it by how far it has risen from its source.',
    how: [
      'Stretch and heavily blur the picture, and turn brightness into source strength with a smoothstep from 0.22 to 0.85.',
      'Walk each column from bottom to top carrying a value that is replaced by a stronger source or fades by a constant factor.',
      'Multiply it by two layers of value noise that change fast from left to right and slowly from bottom to top, for streaks.',
      'Colour by distance from the source: green, then teal, violet and pink.',
      'Add the light onto a dark blue sky, scatter stars where the sky is dark, and draw two rows of near black pines.',
    ],
    history: 'Galileo gave the northern lights their name, aurora borealis, in 1619. The Norwegian scientist Kristian Birkeland argued in the early 1900s that they come from charged particles streaming from the Sun and guided by the Earth’s magnetic field. The greens and reds come from oxygen high in the atmosphere, and blues and purples from nitrogen.',
    uses: ['Travel and nature posters', 'Wallpapers and calm backgrounds', 'Fantasy and music cover art', 'Winter greeting cards'],
    tips: [
      { text: 'Crimson with tall curtains is a rare storm.', set: { palette: 'crimson', length: 90 } },
      { text: 'Polar colours with strong ray streaks look cold and crisp.', set: { palette: 'polar', rays: 90 } },
      { text: 'Hide the pines for pure light.', set: { trees: false } },
    ],
    terms: [['Aurora', 'Light made when charged particles from the Sun strike gases in the upper atmosphere.'], ['Smoothstep', 'A curve that turns a straight ramp into an S shape, easing in and out.'], ['Value noise', 'Smooth random variation made by blending random numbers on a grid.']],
    related: ['gradient-mesh', 'neon-glow', 'bohemian'],
  },

  duotone: {
    facts: { from: 'Offset printing', era: '20th century, popular in digital branding since the 2010s', bestOn: 'Pictures with strong light and shade' },
    why: 'Duotone throws away colour and keeps tone, then pours the tone into two inks. Every pixel is brightness only, mixed between a shadow colour and a highlight colour. That constraint is why duotone ties a set of mixed photographs together so well: whatever the original colours, they all end up in the same pair.',
    how: [
      'Turn each pixel into a single brightness value.',
      'Bend it with a power curve so the midpoint slider decides which brightness lands halfway between the two colours.',
      'Add or remove contrast.',
      'Mix between the shadow and highlight colours by that value.',
      'Add a little film grain to prevent banding in smooth gradients.',
    ],
    history: 'In printing a duotone uses two inks, often black and a spot colour, to give a photograph a richer tonal range than black alone. In the 2010s brands such as Spotify popularised bold digital duotones for imagery, and the technique became a staple of social and music graphics.',
    uses: ['Brand imagery with a consistent look', 'Album and playlist covers', 'Website hero images', 'Poster series with a shared palette'],
    tips: [
      { text: 'Ocean tones are cool and calm.', set: { preset: 'ocean' } },
      { text: 'Acid colours with high contrast look like a club flyer.', set: { preset: 'acid', contrast: 70 } },
      { text: 'Move the midpoint toward the shadows to brighten the picture.', set: { mid: 30 } },
    ],
    terms: [['Spot colour', 'A single ink printed by itself rather than mixed from others.'], ['Midpoint', 'The brightness that falls exactly halfway between the two colours.'], ['Banding', 'Visible steps in a smooth gradient.']],
    related: ['risograph', 'cyanotype', 'gradient-mesh'],
  },

  chrome: {
    facts: { from: 'Car design and computer graphics', era: '1950s cars, 1990s CGI', bestOn: 'Pictures with smooth shapes and bright highlights' },
    why: 'Chrome is a mirror, so what you see in it is the room around it, not the object. To fake that, brightness is treated as a height map, bright parts are hills, and each pixel looks up a different part of an imaginary sky: dark overhead, bright near the horizon, then a darker ground. Steeper slopes reflect other parts of the sky, and that is what makes the metal look liquid.',
    how: [
      'Mix two blurs of different size, so shapes are smooth but keep some fine detail.',
      'Read the slope of the map to get a surface normal, an arrow pointing out of the surface.',
      'Work out the reflected direction, and use its up and down part to choose a position on a strip that stands for the world.',
      'Shift where flat areas land on the strip with the horizon slider.',
      'Add a small hard highlight from a light at the top left. Gold and cobalt use different strips.',
    ],
    history: 'Chrome trim defined cars of the 1950s. In computer graphics, James Blinn and Martin Newell described reflection mapping in 1976, the method of looking up a surrounding picture from a surface’s angle. The liquid metal villain of the film Terminator 2 in 1991 brought the look to a worldwide audience.',
    uses: ['Poster and title lettering with a metal finish', 'Y2K and futuristic design', 'Album and fashion graphics', 'Product style renders'],
    tips: [
      { text: 'Gold with deep relief looks like a cast medal.', set: { metal: 'gold', depth: 90 } },
      { text: 'Cobalt with lower smoothness has more crisp, electric ridges.', set: { metal: 'cobalt', smooth: 25 } },
      { text: 'Switch off the sharp gleam for a satin finish.', set: { gleam: false } },
    ],
    terms: [['Surface normal', 'A unit arrow pointing straight out of a surface.'], ['Environment map', 'A picture of the surroundings that a shiny surface reflects.'], ['Specular highlight', 'A small bright spot where a surface mirrors a light.']],
    related: ['holographic', 'gold-foil', 'y2k'],
  },

  'glass-refraction': {
    facts: { from: 'Architectural glass and optics', era: 'Optics theory 10th and 17th centuries, reeded glass in 20th century design', bestOn: 'Pictures with clear colours and strong shapes' },
    why: 'Glass bends light, so what you see through it comes from somewhere else. Ribs squeeze and mirror slices of the scene, beads show tiny upside-down copies, and bubbles magnify their middles. Because glass bends blue more than red, each colour channel is bent a little differently and edges pick up coloured fringes.',
    how: [
      'For each output pixel decide where in the picture to look, and take that colour.',
      'For ribbed glass, run the sampling point across a wider part of the picture than the rib itself, and backwards, so each rib shows a squeezed, mirrored slice.',
      'For beads, do the same in two directions on a hexagonal grid. For bubbles, magnify the middle of each disc.',
      'Sample the three colour channels with slightly different strengths for the coloured fringes.',
      'Shade each lens with a darker rim and a small bright window reflection, drawing lenses one at a time inside their bounding boxes.',
    ],
    history: 'The law of refraction was written down by Ibn Sahl around 984 and rediscovered by Willebrord Snell in the early 1600s. Isaac Newton showed in 1666 that a prism splits white light into colours. Fluted and reeded glass became a favourite of Art Deco interiors and returned as a popular detail in modern homes and shops.',
    uses: ['Interior and architecture style mock-ups', 'Abstract privacy glass looks', 'Poster and cover art', 'Light and optics illustrations'],
    tips: [
      { text: 'Wide ribs with strong bend look like a shower screen.', set: { mode: 'reeded', size: 12, bend: 85 } },
      { text: 'Tiny beads turn the picture into a glittering mosaic.', set: { mode: 'ball', size: 5 } },
      { text: 'Bubbles with a strong colour split look like soap film.', set: { mode: 'bubbles', split: 80 } },
    ],
    terms: [['Refraction', 'The bending of light as it passes from one material into another.'], ['Dispersion', 'Different colours bending by different amounts, which splits white light.'], ['Lens', 'A shaped piece of glass that bends light to focus or spread it.']],
    related: ['frosted-ice', 'glassmorphism', 'chromatic-aberration'],
  },

  'frosted-ice': {
    facts: { from: 'Cold windows', era: 'Always', bestOn: 'Pictures with a clear subject near the middle' },
    why: 'Frost scatters light, so a frozen window blurs everything behind it and leaves crystal ridges that look like cracks and feathers. A clear patch wiped by a hand shows the scene sharply for a moment. This treatment blurs the picture strongly, grows crystals from layered noise, and wipes one patch clean.',
    how: [
      'Blur each colour channel strongly with two box blurs.',
      'Bend the coordinates with two layers of smooth value noise.',
      'Compute a ridged version of the noise, 1 minus the absolute value of 2n minus 1, at two scales, so lines appear where the noise crosses its middle.',
      'Raise it to the fifth power to keep only the strongest ridges, add sparkle, and push the colours toward pale blue, thicker near the edges of the pane.',
      'Wipe a curved patch where the sharp picture shows, with its edge wobbled by noise and a brighter ridge just outside.',
    ],
    history: 'Window frost forms when water vapour freezes directly onto cold glass, without becoming liquid first. Wilson Bentley photographed snow crystals through a microscope from 1885, and in the 1930s Ukichiro Nakaya began growing and classifying them in a laboratory. Frost patterns have inspired ornament for centuries, from lace to engraved glass.',
    uses: ['Winter greeting cards and posters', 'Cosy social posts', 'Backgrounds for seasonal campaigns', 'Mood and weather illustrations'],
    tips: [
      { text: 'Heavy frost with a small clear patch hides almost everything.', set: { frost: 95, size: 25 } },
      { text: 'Move the wiped patch to the side to reveal another part of the scene.', set: { x: 25, y: 70 } },
      { text: 'Light frost with low blur is a gentle misting.', set: { frost: 35, blur: 6 } },
    ],
    terms: [['Ridged noise', 'Noise folded so that its middle value becomes a sharp ridge.'], ['Domain warp', 'Bending the coordinates before looking something up.'], ['Scatter', 'The spreading of light in many directions by a rough or crystalline surface.']],
    related: ['glassmorphism', 'glass-refraction', 'aurora'],
  },

  'liquid-morph': {
    facts: { from: 'Film effects and creative coding', era: '1988 morphing, 1990s liquid metal', bestOn: 'Portraits and strong colour shapes' },
    why: 'The picture is never changed, only looked up in a different place. A smooth, slowly moving field of offsets tells each pixel where to read from, so everything seems to flow. The field is built from sines whose phases are bent by other sines, so the motion never quite repeats.',
    how: [
      'Compute a vector field of offsets from sine waves whose phases are themselves bent by other sines.',
      'Calculate it only at nodes six pixels apart and blend it up to every pixel bilinearly.',
      'For every output pixel read the source at the shifted position.',
      'Add a ripple at the cursor, a ring shaped wave that decays with distance and travels outward.',
      'Read red, green and blue at slightly different strengths of the offset for the colour split, and brighten or dim by the field’s vertical slope for sheen.',
    ],
    history: 'Computer morphing made its film debut in Willow in 1988, built at Industrial Light and Magic, and became a sensation in Terminator 2 and the Black or White music video in 1991. Warping coordinates with layered noise, often called domain warping, was later taught widely by shader artists such as Inigo Quilez.',
    uses: ['Fluid background loops', 'Music visualisers and album art', 'Playful avatar effects', 'Transitions between images'],
    tips: [
      { text: 'High strength with fine waves looks like water.', set: { strength: 85, scale: 3 } },
      { text: 'Very slow, wide waves feel like a lava lamp.', set: { speed: 15, scale: 0.8 } },
      { text: 'Maximum colour split turns it into a prism.', set: { split: 100 } },
    ],
    terms: [['Vector field', 'A map that assigns an arrow, here an offset, to every point.'], ['Domain warping', 'Bending the coordinates used to look something up.'], ['Bilinear interpolation', 'Blending the four nearest values by distance.']],
    related: ['gradient-mesh', 'surreal', 'domain-warp'],
  },
};
