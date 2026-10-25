// src/data/theory-design.js
// Theory entries for the treatments of section A, Design movements and styles (the ones added after the first twenty).
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_DESIGN = {
  minimalism: {
    paragraphs: [
      'Minimalism here is a posterise with a lot of room around it. The picture is blurred first, so that fine texture cannot create stray specks, then its brightness is stretched to use the whole range from the darkest to the lightest value actually present. Without that stretch a dull, low-contrast photograph would collapse into one or two tones.',
      'The stretched brightness is cut into n equal bands, and each band is assigned one flat colour, found by walking in a straight line from the ink colour to the paper colour. The lightest band is paper, so it simply disappears into the margin. The accent option swaps one mid-tone for a single colour, which is the only colour on the page.',
    ],
    equations: [
      { tex: T`v=\operatorname{clamp}\!\left(\frac{L_b-L_{\min}}{\max(0.05,\;L_{\max}-L_{\min})}\right)`, note: 'Blurred brightness stretched to 0 to 1.' },
      { tex: T`C_i=\mathrm{ink}+\frac{i}{n-1}\,(\mathrm{paper}-\mathrm{ink}),\qquad i=\min\big(n-1,\ \lfloor v\,n\rfloor\big)`, note: 'The colour of band i, on the line from ink to paper.' },
    ],
  },
  maximalism: {
    paragraphs: [
      'Maximalism refuses to leave anything empty. The brightness (with a little extra contrast) is cut into n bands. Each band gets two colours that are far apart on the colour wheel, and a repeating pattern decides, pixel by pixel, which of the two shows: stripes, checks, dots, waves, diagonals or diamonds. Neighbouring bands use different patterns, so the picture is drawn entirely out of clashing textures.',
      'The colours are spread round the wheel in equal steps and then moved by the seed, so the remix button changes the whole scheme but keeps the structure. Darker bands are also darker colours. A border of alternating beads, each with a pale centre, frames the whole thing.',
    ],
    equations: [
      { tex: T`h_i=\left(h_0+0.92\,\frac{i}{n}+0.137\,\text{seed}\right)\bmod 1,\qquad h_i'=h_i+0.38`, note: 'Hue of the two colours of band i.' },
      { tex: T`\text{stripe}(x,y)=\left\lfloor\frac{x+y}{s}\right\rfloor\bmod 2,\qquad \text{check}(x,y)=\left(\left\lfloor\frac{x}{s}\right\rfloor+\left\lfloor\frac{y}{s}\right\rfloor\right)\bmod 2`, note: 'Two of the seven pattern functions. The pattern value picks one of the two colours.' },
    ],
  },
  futuristic: {
    paragraphs: [
      'The picture becomes a heads-up display. Brightness is mapped through a five-stop ramp, from near-black through deep blue to the chosen tint and finally almost white, so the darkest areas stay dark and only the highlights glow. A faint grid and brackets in the corners sit on top.',
      'The brightest region is found on purpose: the brightness is blurred heavily (radius one fortieth of the width) so that a single hot pixel cannot win, and the position of the maximum becomes the target. Concentric rings, tick marks and a crosshair are drawn there, and the readout prints the target’s position as fractions of the width and height together with its brightness. Edges are found with the Sobel pipeline and drawn as glowing lines.',
    ],
    equations: [
      { tex: T`(t_x,t_y)=\operatorname*{arg\,max}_{x,y}\;(L*B_r)(x,y),\qquad r=\frac{W}{40}`, note: 'The target is the maximum of the blurred brightness.' },
      { tex: T`\text{readout}=\left(\frac{t_x}{W},\ \frac{t_y}{H},\ 100\,L_b(t)\right)`, note: 'What the X, Y and LUM numbers show.' },
    ],
  },
  retro: {
    paragraphs: [
      'This is a 1970s screen print. A palette of six warm colours is thinned to n of them, evenly spaced, and the brightness (with adjustable contrast) is cut into n bands, one colour per band. Real screen prints never register perfectly, so before the cut a tiny ordered offset is added to each pixel. It breaks the edge between bands into a slightly ragged line instead of a ruler-straight one.',
      'Three swooping stripes, a layer of film grain and a cream border with rounded corners finish the look. The border is a rectangle with a rounded hole cut out of it, filled with the even-odd rule.',
    ],
    equations: [
      { tex: T`d(x,y)=0.045\left(\frac{4\,(x\ \&\ 3)+(y\ \&\ 3)}{16}-\tfrac12\right)`, note: 'Ordered offset from a 4 × 4 pattern; & 3 keeps the low two bits.' },
      { tex: T`\text{band}=\operatorname{clamp}\big(\lfloor (c(L)+d)\,n\rfloor,\ 0,\ n-1\big)`, note: 'c(L) is the brightness after the contrast slider.' },
    ],
  },
  cyberpunk: {
    paragraphs: [
      'The base is a duotone-plus: a five-stop ramp from black through the first neon, the second neon and a hot highlight. Two edge maps are then drawn as glowing lines, a fine one in the second neon and a wider one in the first, offset by a fraction of a pixel so they never quite overlap, which gives the lines a coloured fringe.',
      'Rain is a few hundred short slanted strokes of random length and transparency. The glitch shifts some thin horizontal bands sideways by copying their pixels. Scanlines darken every third row. The neon sign is the same text drawn three times, with a wide blur, a narrow blur and finally sharp white, and it sometimes flickers.',
    ],
    equations: [
      { tex: T`C=\operatorname{ramp}\!\big(L^{0.9};\ \text{black},\ 0.35A,\ A,\ B,\ C_{\mathrm{hi}}\big)`, note: 'Brightness through the five-stop ramp.' },
      { tex: T`\text{row } y \text{ darkened by } 18\% \ \text{ when }\ y \bmod 3=0`, note: 'The scanline rule.' },
    ],
  },
  'pop-art': {
    paragraphs: [
      'Pop art comes from comic printing. The brightness is divided into n bands and each band is printed in one flat ink. To soften the jump from one band to the next, the Ben-Day trick is used: inside a band, the next ink appears as dots that grow as the pixel gets closer to the next band, just as a printer’s dots grow in a darker tint.',
      'The dots sit on a staggered grid (every second column is shifted by half a cell). A dot’s radius is proportional to how far through the band the pixel is. Outlines come from the edge strength with a threshold, drawn in the darkest ink. The grid layout repeats the picture four times in a 2 × 2 panel with a different set of inks for each, the way Warhol did.',
    ],
    equations: [
      { tex: T`u=n\,c(L),\qquad b=\min(n-1,\lfloor u\rfloor),\qquad f=u-b`, note: 'Band b and the position f (0 to 1) inside it.' },
      { tex: T`\text{dot}:\ \ (x_c)^2+(y_c)^2<\big(0.72\,s\,f\big)^2`, note: 'A pixel is inside a dot of the next ink when its distance from the cell centre is less than 0.72·s·f.' },
      { tex: T`\lvert\nabla L\rvert>0.35-0.28\cdot\text{outline}`, note: 'Where the outline ink replaces everything else.' },
    ],
  },
  editorial: {
    paragraphs: [
      'The cover is built like a layout program would build it. The photograph fills the page; for the monochrome and warm options its pixels are first converted in code (a weighted grey with extra contrast, or a mix of the original and a sepia colour matrix), so the result does not depend on browser filters. Dark gradients at the top and bottom keep the white type readable whatever the picture is.',
      'The masthead is measured and scaled so that it spans exactly the width of the page. The headline is wrapped greedily on spaces; if it needs more than three lines the type shrinks by 10% until it fits. The barcode is a run of bars with random widths from a fixed seed, so it is the same every time.',
    ],
    equations: [
      { tex: T`\begin{aligned}R'&=0.393R+0.769G+0.189B\\G'&=0.349R+0.686G+0.168B\\B'&=0.272R+0.534G+0.131B\end{aligned}`, note: 'The sepia colour matrix. The warm option blends 45% of it with the original colour.' },
      { tex: T`s=\min\!\Big(19u,\ \frac{0.88\,W}{w_{100}}\cdot 100\Big)`, note: 'Masthead size s: w₁₀₀ is the measured width of the word at size 100, and u is one percent of the shorter side.' },
    ],
  },
  y2k: {
    paragraphs: [
      'Y2K design is glossy, pale and slightly translucent. Brightness goes through a colour ramp for the chosen scheme (with a gentle power curve that lifts the shadows), a white highlight fades from the top over a curved edge like light on plastic, and sparkles are scattered where the picture is bright. A sparkle is a four-pointed star, drawn with a soft white glow.',
      'The optional window is a rectangle with a rounded hole cut into a brushed-metal gradient, a title bar in two of the scheme’s colours and three traffic-light buttons. Sparkle positions are chosen by trying random points and keeping those where the brightness beats a randomised threshold between 0.62 and 0.87.',
    ],
    equations: [
      { tex: T`C=\operatorname{ramp}\!\big(L^{0.85};\ \text{scheme stops}\big)`, note: 'Brightness through the scheme’s colour ramp.' },
      { tex: T`\text{keep a sparkle at }(x,y)\ \text{if}\ L(x,y)>0.62+0.25\,\xi,\quad \xi\sim U(0,1)`, note: 'Rejection sampling: random points are kept only on bright places.' },
    ],
  },
  'swiss-design': {
    paragraphs: [
      'Swiss design is built on a grid, and this treatment puts the photograph on one. The page has a six-column grid; the picture takes columns two to six in the upper part. It is drawn as a line screen: a set of horizontal lines, each one a row of thin vertical bars whose height is the local darkness. Bright areas have no bars and dark areas fill the row, so the picture is made only of straight black marks.',
      'One red shape straddles the edge of the picture. The title is set in a heavy sans-serif, flush left on the margin, at the size that makes it span the picture’s width; small lines of set text, a rule and a page number are placed on the same grid.',
    ],
    equations: [
      { tex: T`h(x,y_i)=0.98\,\big(1-L(x,y_i)\big)\,\Delta y,\qquad \Delta y=\frac{h_{\text{img}}}{N_{\text{lines}}}`, note: 'Height of the bar at column x on line i; the lines are Δy apart.' },
      { tex: T`s=\min\!\Big(24u,\ \frac{0.98\,(w_{\text{img}}+c)}{w_{100}}\cdot100\Big)`, note: 'Title size: c is the column width and w₁₀₀ the title’s measured width at size 100.' },
    ],
  },
  surreal: {
    paragraphs: [
      'The picture melts. Every pixel is drawn from a point higher up in the original, so the image appears to slide downwards, and the slide grows towards the bottom. How far a column slides varies smoothly from side to side because it is driven by value noise; the drips slider changes the width of the noise, so more drips means narrower tongues.',
      'A dream grade pulls the colours toward a tint, more at the top (sky) than the bottom, then a pale second sun with a halo and a faint reflection and a few flat-bottomed clouds are drawn on top.',
    ],
    equations: [
      { tex: T`\Delta(x,y)=A\,S(0.18,1,t)\,\big(0.25+0.75\,(0.75\,n_1+0.25\,n_2)\big)\,(t+0.2),\qquad t=\frac{y}{H}`, note: 'How far the pixel is pulled down. A = melt × 0.34 H, S is smoothstep and n₁, n₂ are value noise at two scales.' },
      { tex: T`C_{\text{out}}=C\,(1-k-s_k)+T\,L\,k+S(t)\,s_k\,1.4,\quad k=0.28,\ s_k=0.22\,(1-t)`, note: 'The colour grade: T is the tint, S(t) the sky colour at height t.' },
    ],
  },
  bohemian: {
    paragraphs: [
      'Boho colour is earthy and soft, and its signature shape is the rainbow arch. The picture is shown inside an arch window, and the arches around it get wider by a fixed gap each ring and take their colours in turn from an earthy palette. A warm tone is laid over the photograph by multiplying it with a pale orange, then a faint brown on top.',
      'A pale sun with rays sits behind the arches, a row of dots marks the ground, and the pampas grass at each side is a fan of curved strokes with small feathery ellipses along their outer half, each one randomly longer or shorter.',
    ],
    equations: [
      { tex: T`r_i=r_0+i\,g,\qquad i=1,\dots,n_{\text{rings}}`, note: 'Radius of ring i: the window radius plus i times the gap g.' },
      { tex: T`C'=C\,\big((1-a)+a\,\tfrac{T}{255}\big),\qquad a=0.85\cdot\text{warmth}`, note: 'Multiply blend with the tint T; the blend strength a follows the warm tone slider.' },
    ],
  },
  victorian: {
    paragraphs: [
      'A steel engraving builds tone from lines. The portrait is drawn as many horizontal lines whose thickness follows the darkness underneath, so a dark area is a row of fat lines that nearly touch, and a light one has hairlines or gaps. The lines wander gently up and down with a sine wave, which gives the hand-cut look.',
      'In the darkest places a second set of diagonal lines is added (cross-hatching), but each diagonal pen stroke lifts wherever the picture is lighter than a threshold. The cameo is clipped to an oval, framed by two rules and a ring of 72 beads; the page has a double border with a rosette in each corner and a caption between two rules.',
    ],
    equations: [
      { tex: T`t(x,i)=1.05\,\big(1-L(x,y_i)\big)\,\Delta y`, note: 'Thickness of line i at column x; Δy is the line spacing.' },
      { tex: T`y(x,i)=y_i+0.18\,\Delta y\,\sin(0.045\,x+0.7\,i)`, note: 'The gentle waver of each line.' },
      { tex: T`\text{hatch where}\quad L<0.4\cdot\text{cross}+0.05`, note: 'Cross-hatching is only drawn on dark places.' },
    ],
  },
  graffiti: {
    paragraphs: [
      'The wall is drawn first: a brick pattern with each brick slightly lighter or darker than the others. The picture is then turned into a stencil with three paint colours and a part left bare. The thresholds are not fixed numbers; they are the 20th, 40th and 58th percentiles of this picture’s own brightness, so every photograph leaves about forty percent of the wall showing, whatever its tones.',
      'Real spray paint is not crisp, so a blurred copy of the stencil is added at low opacity as overspray, and a fine scatter of dots falls around the painted edges. Drips start where painted pixels have bare wall directly below, and run down as a short line with a round end. The tag is outlined, then filled with the light colour and a glow.',
    ],
    equations: [
      { tex: T`\text{level}=\begin{cases}3&L<q_{0.20}\\2&L<q_{0.40}\\1&L<q_{0.58}\\0&\text{otherwise (bare wall)}\end{cases}`, note: 'q is a quantile of the picture’s brightness values.' },
      { tex: T`C=(1-\alpha)\,C_{\text{sharp}}+\alpha\,C_{\text{blur}},\qquad \alpha=0.35\cdot\text{overspray}`, note: 'Overspray: the blurred copy is blended over the sharp one.' },
    ],
  },
  vaporwave: {
    paragraphs: [
      'Vaporwave takes a sunset palette to extremes. Brightness goes through a ramp from deep violet through magenta to cyan and near-white. A chromatic offset then takes the red of each pixel from a few pixels to the left and the blue from a few pixels to the right, which splits the colours at every edge like a misaligned print.',
      'The sun is a disc with a vertical gradient, with horizontal bars cut out of it (the bars get thicker lower down). The floor is a perspective grid: lines run from a vanishing point on the horizon to equally spaced points along the bottom edge, and horizontal lines are bunched together near the horizon with a power law. The caption is converted to full-width characters, the wide letters of vaporwave, by shifting each character’s code.',
    ],
    equations: [
      { tex: T`y_k=h+(H-h)\left(\frac{k}{14}\right)^{2.1},\qquad k=1,\dots,13`, note: 'Height of the k-th horizontal grid line below the horizon h.' },
      { tex: T`R=R_{\text{src}}(x-s),\quad G=G_{\text{src}}(x),\quad B=B_{\text{src}}(x+s)`, note: 'Colour shift of s pixels.' },
      { tex: T`\text{full-width}(c)=c+\mathrm{0xFEE0}`, note: 'The Unicode full-width form of a Latin letter or digit.' },
    ],
  },
  memphis: {
    paragraphs: [
      'The Memphis Group of the 1980s used loud shapes on speckled backgrounds. The picture is posterised into four tones using four colours of the scheme (darkest tone to the darkest colour) and placed in a panel (rounded, arch or circle) with a hard offset shadow in solid ink, with no blur at all.',
      'Around it, small triangles, rings, squiggles, half circles, crosses and rows of dots are scattered at random positions, sizes and angles, and a few more are placed on the panel’s edge so that they overlap it. The seed decides everything random, so the shuffle button re-arranges the confetti.',
    ],
    equations: [
      { tex: T`k=\min\big(3,\ \lfloor 4L\rfloor\big),\qquad C=P_k`, note: 'Four equal brightness bands, one palette colour each.' },
      { tex: T`y_{\text{squiggle}}(t)=0.35\,s\,\sin(5\pi t),\qquad t\in[0,1]`, note: 'The squiggle is two and a half sine waves.' },
    ],
  },
  mondrian: {
    paragraphs: [
      'Mondrian’s grids are made here by repeatedly cutting a rectangle. Start with the whole page; at each step choose the rectangle that has the most going on (its variance of brightness times the square root of its area, with a little randomness) and cut it, in the direction of its longer side, at the place where the average brightness on the two sides differs most. The cuts therefore land on the edges of the picture.',
      'All the statistics are cheap because of a summed-area table: a table in which each entry is the sum of everything above and to the left, so the sum of any rectangle is four lookups. The cells are then ranked by their average brightness: some of the darkest become black, and red, yellow and blue go to a share of the others. The grid lines are a fixed black width and never drawn on the outer border.',
    ],
    equations: [
      { tex: T`S(x,y)=\sum_{i<x,\,j<y}L_{ij},\qquad \Sigma(R)=S(x_1,y_1)-S(x_0,y_1)-S(x_1,y_0)+S(x_0,y_0)`, note: 'Summed-area table S and the sum of any rectangle R.' },
      { tex: T`\operatorname{Var}(R)=\frac{\Sigma_{L^2}(R)}{n}-\left(\frac{\Sigma_L(R)}{n}\right)^{2}`, note: 'Variance from two tables, one of L and one of L².' },
      { tex: T`\text{cut}=\operatorname*{arg\,max}_{c}\ \lvert\mu_A-\mu_B\rvert\,\sqrt{\min(n_A,n_B)}`, note: 'Choose the cut c giving the biggest difference of mean brightness between the two halves A and B.' },
    ],
  },
  constructivist: {
    paragraphs: [
      'Constructivist posters are red, black and cream, with strong diagonals. The photograph is reduced to two tones with a hard threshold, black below and cream above. The threshold is the median of the picture’s own brightness (nudged by the contrast slider), so that about half the picture is black, however light or dark the original.',
      'It is then clipped into a rectangle rotated by the poster angle, with a red wedge multiplied across it, a black frame, two heavy red bars and a black disc. The slogan sits in a black slab set on a smaller slant than the picture.',
    ],
    equations: [
      { tex: T`C=\begin{cases}\text{black}&L<q_{\,0.5-\text{contrast}/600}\\\text{cream}&\text{otherwise}\end{cases}`, note: 'Two-tone threshold at a quantile q of the picture’s brightness.' },
      { tex: T`\begin{bmatrix}x'\\y'\end{bmatrix}=\begin{bmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix}`, note: 'The rotation applied to the photo, wedge and bars (θ is the poster angle).' },
    ],
  },
  'vector-art': {
    paragraphs: [
      'Vector illustrations are flat areas of colour with clean edges, and the way to get that from a photograph is to cut the picture into a small palette. First the picture is blurred (so that grain does not produce islands) and its saturation is raised. Then k-means clustering finds the k colours that best describe it: start with k random colours from the picture, assign every pixel to the nearest one, move each colour to the average of its pixels, and repeat.',
      'Every pixel then takes its cluster’s colour. The edges between clusters are still stair-stepped, so the flat image is blurred and each pixel is snapped back to the nearest palette colour, which rounds the corners. Finally the pixels whose neighbour belongs to a different cluster are darkened to draw the outline. The blurs are written as arithmetic on the pixel arrays rather than as browser filters, so they work in every browser.',
    ],
    equations: [
      { tex: T`c_i\leftarrow\frac{1}{\lvert S_i\rvert}\sum_{p\in S_i}p,\qquad S_i=\{\,p:\ \lVert p-c_i\rVert\le\lVert p-c_j\rVert\ \forall j\,\}`, note: 'One k-means step: assign each pixel to its nearest centre, then move the centre to the mean of its pixels.' },
      { tex: T`C'=\ell+s\,(C-\ell),\qquad \ell=0.299R+0.587G+0.114B`, note: 'Saturation s: each channel moves away from (s > 1) or towards (s < 1) the grey value ℓ.' },
    ],
  },
  'collage-art': {
    paragraphs: [
      'The photograph is cut into a grid of pieces, and each piece is drawn as a torn rectangle: its outline is a rectangle with 28 points, each moved by a random amount, so the edge wobbles like torn paper. The torn shape is filled with the matching part of the picture, a little larger than its cell so neighbours overlap, and a shadow below it makes the paper look lifted.',
      'Pieces are rotated and moved by random amounts scaled by the scatter slider, and drawn in random order so that some lie over others. Underneath, scraps of plain coloured paper and a speckled desk give the scene depth. Strips of translucent tape are placed on a few pieces.',
    ],
    equations: [
      { tex: T`\text{source rect}=\left(\frac{(i+\tfrac12)c_w-0.53\,c_w}{0.86},\ \frac{(j+\tfrac12)c_h-0.53\,c_h}{0.86},\ \frac{1.06\,c_w}{0.86},\ \frac{1.06\,c_h}{0.86}\right)`, note: 'The part of the photograph shown on piece (i, j) of size c_w × c_h; the photograph fills 86% of the page.' },
      { tex: T`\theta=0.7\,(\xi-\tfrac12)\cdot\text{scatter},\qquad \xi\sim U(0,1)`, note: 'The random rotation of each piece.' },
    ],
  },
};
