// src/data/theory-digital.js
// Theory entries for the treatments of section B, Digital and technical (the ones added after the first twenty).
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_DIGITAL = {
  'scanlines-crt': {
    paragraphs: [
      'A cathode-ray tube has a curved face, so the picture is bent. For each pixel of the output the program works out where on the flat picture it should come from, using a barrel distortion: the further a point is from the centre, the further out it samples, and the corners fall off the edge of the picture and turn black, which gives the rounded corners. The sampled colour is an interpolation of the four nearest pixels.',
      'Three tube effects are multiplied in. The phosphor mask makes every third column favour red, green or blue (or darkens every third column, for an aperture grille). Scanlines dim a soft band once per line pair. Static is a hash of the pixel position. Finally, two blurred copies are added on top for bloom, then a vignette, a glass reflection and a bezel with a rounded window.',
    ],
    equations: [
      { tex: T`f(x,y)=\frac{1+k\,(n_x^{2}+n_y^{2})}{1+k},\qquad k=0.34\cdot\text{curve},\quad n\in[-1,1]`, note: 'Barrel distortion factor; the output pixel at normalised position n samples the source at n·f.' },
      { tex: T`s(y)=1-0.55\,\sigma\left(\tfrac12+\tfrac12\cos\frac{2\pi y}{p}\right)`, note: 'The scanline dip: σ is the scanline slider and p the line period in pixels.' },
    ],
  },
  glitch: {
    paragraphs: [
      'A glitch is a signal that was copied wrong. It starts with a channel split: the red of each pixel is taken from a few pixels to the left and the blue from a few to the right, so every edge gets a coloured fringe. A copy of this result is kept, and pieces of the copy are then drawn back over the picture.',
      'Row slices are thin horizontal strips shifted sideways by a random distance (and drawn a second time one picture-width away, so a wrapped strip leaves no gap); some are tinted cyan or magenta. Stolen blocks are rectangles copied from one place and pasted in another, a few with the difference blend mode to turn them to negatives. White hairlines and speckles finish it. Everything random comes from the seed.',
    ],
    equations: [
      { tex: T`R'(x)=R(x-d),\quad G'(x)=G(x),\quad B'(x)=B(x+d)`, note: 'Channel split of d pixels.' },
      { tex: T`\text{strip}(y_0,h):\ \ P'(x,y)=P\big((x-\Delta)\bmod W,\ y\big),\quad y_0\le y<y_0+h`, note: 'A slice displaced by Δ with wrap-around.' },
    ],
  },
  'pixel-sorting': {
    paragraphs: [
      'Pixel sorting takes runs of pixels and puts them in order. Walk along a column (or row); wherever the brightness is inside the chosen band, start collecting pixels, and stop when it leaves the band or when the run reaches a random cap (the streak length). Sort the collected pixels by a key, and write them back in sorted order. Pixels outside the band are never touched, so a sharp structure remains in the places the sorting skips.',
      'The key can be brightness, red, blue or hue. Bright regions sorted from dark to light grow a smear that gets brighter as it goes; reversing the order flips the direction. The cost is a sort per run, so it is O(N log n) for runs of length n.',
    ],
    equations: [
      { tex: T`\text{run}=\{\,p_t,\dots,p_{e-1}\ :\ \ell\le L(p_i)\le h\,\},\qquad e-t\le\text{cap}`, note: 'Pixels in the brightness band [ℓ, h], up to a maximum length.' },
      { tex: T`H=\frac{1}{6}\begin{cases}\big((G-B)/c\big)\bmod 6&\max=R\\(B-R)/c+2&\max=G\\(R-G)/c+4&\max=B\end{cases},\quad c=\max-\min`, note: 'The hue key, from 0 to 1.' },
    ],
  },
  datamosh: {
    paragraphs: [
      'Video compression stores most frames as instructions: “this block came from over there, moved by this much”. Datamoshing deletes the frame that resets the picture, so the instructions keep being applied to old pixels. The treatment imitates this. The picture is split into square blocks, and each block gets a motion vector from smooth value noise, so neighbouring blocks move together in a swirl.',
      'The picture is then run through several frames. In each one, every block is replaced by the block that lies one motion vector behind it, in the previous frame, with a little random variation. After many frames paint is dragged along the vectors, like a smear. Two things keep it from losing the picture completely: with some probability, which falls over time, a block is refreshed from the original, and at the end some blocks are shrunk to one pixel per block and enlarged, which gives the flat, blocky patches of a damaged video.',
    ],
    equations: [
      { tex: T`F_{f+1}(\mathbf b)=F_f\big(\mathbf b-\rho\,\mathbf v_{\mathbf b}\big),\qquad \rho\sim U(0.6,1.4)`, note: 'The block at position b takes the content of the block displaced backwards by its motion vector v.' },
      { tex: T`P_{\text{refresh}}(f)=\tfrac12\,\text{keep}\,\Big(1-\frac{f}{F}\Big)`, note: 'Chance that a block is restored from the original in frame f of F.' },
    ],
  },
  dithering: {
    paragraphs: [
      'A dither fakes shades with a handful of colours. The picture is first shrunk (the pixel-size slider) and stretched for contrast. For palettes of four tones or fewer, only brightness is used and the nearest palette tone is found by brightness; for colour palettes the nearest colour is found with a weighting that suits human vision.',
      'There are two families. Ordered dithering compares each pixel with a fixed pattern of thresholds (Bayer’s matrices, built by repeatedly tiling and scaling a smaller one) and rounds up or down accordingly, giving a regular crosshatch. Error diffusion rounds the pixel and pushes the rounding error onto neighbours that have not been processed yet: Floyd–Steinberg spreads it over four of them, Atkinson spreads only three quarters of it over six, which keeps highlights and shadows cleaner and is the look of the first Macintosh.',
    ],
    equations: [
      { tex: T`M_{2n}=\begin{bmatrix}4M_n&4M_n+2\\4M_n+3&4M_n+1\end{bmatrix}`, note: 'Bayer matrix recursion; the entries are then normalised to the range −½ to +½.' },
      { tex: T`e=p-q(p),\qquad p_j\leftarrow p_j+w_j\,e`, note: 'Error diffusion: p is the pixel, q(p) its palette colour and w the neighbour weights.' },
      { tex: T`\text{Floyd–Steinberg: }\tfrac{7}{16},\tfrac{3}{16},\tfrac{5}{16},\tfrac{1}{16}\qquad\text{Atkinson: }\tfrac18\ \text{ on six neighbours}`, note: 'The two diffusion kernels.' },
    ],
  },
  'night-vision': {
    paragraphs: [
      'An image intensifier collects a few photons and multiplies them electronically, so everything is a bright green with a lot of noise. The treatment lifts the shadows with a power curve whose exponent drops as gain rises, multiplies the result, adds a share of a blurred copy (the glow around bright things) and adds noise and rare, bright speckles. The result goes through a four-stop colour ramp that is nearly black, then dark green, then bright green, then almost white.',
      'A mask built from circles gives the lens: one for a monocular, two overlapping for binoculars, with a soft darkening near the rim. Every third row is slightly dimmed. The HUD is drawn in text with a crosshair.',
    ],
    equations: [
      { tex: T`v=L^{\,1-0.5g}\,(1+0.9g)+0.35\,g\,L_b+\nu`, note: 'g is the gain from 0 to 1, L_b the blurred brightness and ν noise.' },
      { tex: T`C=\operatorname{ramp}\big(\operatorname{clamp}(v);\ \text{stops}\big)`, note: 'Colour from the phosphor ramp.' },
    ],
  },
  'thermal-camera': {
    paragraphs: [
      'A thermal camera has a small sensor and shows temperature as false colour. To imitate the coarse sensor, the picture is cut into cells (the sensor pixel), and each cell takes the brightness at its centre; a very small amount of noise per cell is added. Brightness is treated as heat, with contrast stretched about the middle, and the heat value goes through the chosen colour ramp.',
      'The hot spot is the maximum of the heat over a coarse grid (it ignores the borders so the label stays on the picture) and the reading is a straight line from 18 °C to 38 °C. The scale bar draws the same ramp from top to bottom with three labels.',
    ],
    equations: [
      { tex: T`h=\operatorname{clamp}\big((L_b-\tfrac12)\,k+\tfrac12\big),\qquad k=1+1.7\cdot\text{contrast}`, note: 'Heat from the blurred brightness.' },
      { tex: T`T=18+20\,h\ \ {}^{\circ}\mathrm{C}`, note: 'The temperature shown for heat h between 0 and 1.' },
    ],
  },
  'circuit-board': {
    paragraphs: [
      'The board colour is the picture itself, tinted and darkened, so the picture is still in the soldermask. In the darkest areas a diagonal hatching of copper is added, like the ground plane of a real board. Over it, copper traces are drawn on a grid. In each cell the edge direction is measured with the Sobel operator on a blurred brightness map; the trace follows the edge, so its direction is perpendicular to the gradient, and it is snapped to the nearest of four angles (horizontal, vertical or the two diagonals), because circuit boards use 45° routing.',
      'Where traces are crowded, round pads with holes and small vias are added at random. Chips are rectangles with pins on their long sides, placed on calm parts of the picture and never overlapping each other, and silk-screen part numbers (R12, C7) are placed on empty cells.',
    ],
    equations: [
      { tex: T`\theta=\operatorname{atan2}(G_y,G_x)+\tfrac{\pi}{2},\qquad q=\operatorname{round}\!\Big(\frac{\theta}{\pi/4}\Big)\bmod 4`, note: 'The trace is along the tangent of the edge; q picks one of four directions.' },
      { tex: T`w=w_0\,\big(0.55+0.75\min(1,\,1.6\,m)\big)`, note: 'Trace width grows with the edge strength m, relative to the strongest edge.' },
    ],
  },
  'qr-barcode-art': {
    paragraphs: [
      'A QR code is a square of black and white modules with three large squares in the corners that tell a scanner where it is. This treatment keeps those finder patterns, a smaller alignment pattern and the alternating timing lines, so it looks like a code at a glance, and fills every other module from the picture. A module is black when the picture’s brightness there, shifted by a Bayer threshold, is below a half. The shifted threshold is an ordered dither, so mid-greys come out as a regular mix of black and white. It is not a working code and will not scan.',
      'In barcode mode the picture is a stack of thin bands. In each band the bars are placed at a fixed spacing along the width, and the width of each bar follows the darkness of the picture at that point, so dark places have thick bars and light places thin ones. A row of digits is printed under it.',
    ],
    equations: [
      { tex: T`\text{finder}(a,b)=\begin{cases}1&m=3\ \text{or}\ m\le1\\0&m=2\end{cases},\qquad m=\max(\lvert a-3\rvert,\lvert b-3\rvert)`, note: 'The 7 × 7 finder pattern: a ring, a gap and a centre block.' },
      { tex: T`\text{module}=1\ \Leftrightarrow\ L+0.9\,(B_{ij}-\tfrac12)<\tfrac12`, note: 'Ink when the brightness plus a Bayer offset is below a half.' },
      { tex: T`w=u\,\big(0.12+0.88\,(1-L)\big)`, note: 'Bar width in barcode mode, for a unit width u.' },
    ],
  },
  oscilloscope: {
    paragraphs: [
      'The picture is drawn as a stack of waveforms, in the manner of the well-known stacked plot of a pulsar’s pulses. There is one trace for each of n rows of the picture. Along the trace, its height above its baseline is the brightness of the picture at that point, raised to the power 1.5 so that only the brightest parts make tall peaks. Both ends are flattened to the baseline so the lines meet the frame.',
      'Traces are drawn from the back (top) to the front (bottom). To hide the parts of earlier traces that would be behind a later one, each trace fills the area below itself with the screen colour before it is stroked, which is the painter’s algorithm. The graticule has eight columns by ten rows with fine ticks on the centre lines. Glow is two blurred copies added on top.',
    ],
    equations: [
      { tex: T`y_i(t)=b_i-A\,L_b(t,\,b_i)^{1.5}\,e(t),\qquad e(t)=\min\!\big(1,\ 14\min(t,1-t)\big)`, note: 'Height of trace i at position t from 0 to 1; b is the baseline and e the taper at the ends.' },
      { tex: T`A=\Delta b\,\big(1.2+4.2\cdot\text{amp}\big)`, note: 'The amplitude, in multiples of the spacing between traces.' },
    ],
  },
  'low-poly': {
    paragraphs: [
      'The picture is turned into a mesh of triangles. First points are chosen: some along the frame, so the mesh covers the whole picture, and the rest by random trial. A trial point is kept with a probability that rises with the edge strength there, and it must be at least a minimum distance from every point already kept, with a smaller minimum near edges, so triangles are small where the picture changes quickly and large on flat ground.',
      'The points are joined by Delaunay triangulation, the unique mesh in which no point lies inside the circumscribed circle of any triangle, which avoids long thin triangles. It is built by the Bowyer–Watson method: add the points one at a time; remove every triangle whose circle contains the new point; and join the new point to the edges of the hole. Each triangle is filled with the average of four samples of the picture and a small random brightness change.',
    ],
    equations: [
      { tex: T`P_{\text{keep}}=(1-\beta)\,0.55+\beta\,(0.06+0.94\,e),\qquad r=b\,(0.95-0.62\,\beta\,e)`, note: 'Acceptance probability and minimum spacing r; β is “follow edges”, e the edge strength 0 to 1 and b = √(WH/N).' },
      { tex: T`(x-u_x)^2+(y-u_y)^2<R^2`, note: 'Point (x, y) is inside the circumcircle of a triangle with centre u and radius R.' },
      { tex: T`\begin{aligned}u_x&=\frac{a^2(b_y-c_y)+b^2(c_y-a_y)+c^2(a_y-b_y)}{D}\\u_y&=\frac{a^2(c_x-b_x)+b^2(a_x-c_x)+c^2(b_x-a_x)}{D}\end{aligned},\quad D=2\big(a_x(b_y-c_y)+b_x(c_y-a_y)+c_x(a_y-b_y)\big)`, note: 'Circumcentre of triangle a, b, c, where a² means a_x² + a_y². The circumradius follows from the distance to any corner.' },
    ],
  },
  'lego-voxel': {
    paragraphs: [
      'The picture is reduced to one pixel per stud, so a stud is an average of its patch. A brick has one of a fixed set of real brick colours, so each stud takes the nearest colour in the set. Distance between colours uses a weighting that gives the red channel more weight when the colours are bright and the blue more when they are dark, which is closer to how colours look than a plain distance. Before the nearest colour is found, a small offset from a 4 × 4 Bayer pattern is added, so that smooth gradients become a mixture of two brick colours instead of one hard step.',
      'Each stud is a short cylinder drawn with a shadow, a darker side, a lighter top and a pale arc of shine. The brick under it gets a light top and left edge and dark bottom and right edge.',
    ],
    equations: [
      { tex: T`d^2=\Big(2+\frac{\bar r}{256}\Big)\Delta R^2+4\,\Delta G^2+\Big(2+\frac{255-\bar r}{256}\Big)\Delta B^2,\qquad \bar r=\frac{R_1+R_2}{2}`, note: 'The “redmean” colour distance.' },
      { tex: T`C_{\text{stud}}\in\{0.74\,C,\ 1.07\,C\}`, note: 'The side of the stud is drawn at 74% of the brick colour and the top at 107%.' },
    ],
  },
  'matrix-rain': {
    paragraphs: [
      'The picture is reduced to one value per character cell. Each column has its own fall speed, trail length and starting offset, all fixed by the seed, so a column is a repeating drop. The head of a drop at time t is a position that moves down at that column’s speed and wraps round after it has left the bottom and its trail has gone. Behind the head the brightness falls off along the trail.',
      'The picture shows through in two ways: a drop is brighter where the picture is brighter, and even between drops the bright parts of the picture hold a faint, constant glow of characters. The characters change at random, using a hash of the column, row and time, slowly in the trail and fast at the head. The head is drawn white with a glow. Characters are batched into ten brightness levels so that the program only changes the paint colour ten times a frame.',
    ],
    equations: [
      { tex: T`h_c(t)=\big(t\,r\,s_c+o_c\big)\bmod(N+\ell_c+6)-0.2\,\ell_c`, note: 'Head position of column c in rows. r is the speed slider, s the column speed, o its offset, N the number of rows and ℓ the trail length.' },
      { tex: T`a=\left(1-\tfrac{d}{\ell}\right)^{1.6}\big(1-\sigma+\sigma\,(0.3+1.25\,B)\big)+0.62\,\sigma\,B^{1.4}`, note: 'Brightness of the character d rows behind the head. B is the picture brightness at the cell and σ the picture strength.' },
    ],
  },
  'depth-parallax': {
    paragraphs: [
      'A flat photograph has no depth, so the program invents one. Depth is a mix of two guesses: brighter things are nearer (or the reverse, if you choose), and things lower in the frame are nearer, which is true of most landscapes and tables. The brightness is blurred twice so that depth changes smoothly, not with every speck of texture.',
      'To look at the picture from a slightly different place, each point is moved sideways in proportion to how far its depth is from the focus plane, in the direction of the camera, so near and far things shift by different amounts, which is parallax. The shift is found by looking up the depth where the pixel lands, twice, because the first guess lands on a different depth than the pixel started on. The camera follows the cursor with smooth easing, or drifts on a slow figure-of-eight when the cursor is away. The warp runs on a smaller copy of the picture, which is then enlarged, to stay fast on a phone.',
    ],
    equations: [
      { tex: T`D=0.62\,L_b+0.38\,\frac{y}{H}`, note: 'The invented depth, between 0 (far) and 1 (near).' },
      { tex: T`\mathbf s=\mathbf x-\mathbf c\odot\big(\kappa,\ 0.55\,\kappa\big)\,(D-f),\qquad \kappa=\text{depth}\cdot0.075\,W_b`, note: 'Where the output pixel x reads from; c is the camera position from −1 to 1 and f the focus plane.' },
      { tex: T`\mathbf c\leftarrow\mathbf c+(\mathbf c^{*}-\mathbf c)\,\big(1-e^{-6\Delta t}\big)`, note: 'Easing of the camera towards its target c*.' },
    ],
  },
};
