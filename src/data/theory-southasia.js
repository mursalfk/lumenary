// src/data/theory-southasia.js
// Theory entries for the treatments of section M, South Asian and Islamic.
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_SOUTHASIA = {
  'truck-art': {
    paragraphs: [
      'Pakistani truck art covers a lorry from bumper to roof in flat enamel colour, painted flowers, birds, poetry and a frame of chains and rosettes, with strips of shiny reflective tape (chamak patti) that glitter in headlights. Every part is made by a specialist: the painter, the woodcarver and the metalworker. The program keeps the look in four steps: reduce the picture to a few loud colours, outline them in black, add glints, and wrap everything in a frame.',
      'Colour reduction first. The picture is blurred (radius = simplify × 1.2 px) and its saturation is raised by half. Each pixel then takes the nearest of nine enamel colours, using a distance that weights red, green and blue the way the eye does (the “redmean” formula below). A majority filter over a 5 × 5 window, run twice, removes specks so that regions are flat, as brush-painted ones are. A black outline is drawn wherever the colour index changes and is then grown by up to 2 px. The brightest places (tone above 0.74) are crossed by diagonal bands of white light, like chrome. The frame, as wide as 11% of the shorter side, has a red outer rim, a yellow field with a row of flowers and leaves, a row of pearls and a corner rosette of twelve petals.',
    ],
    equations: [
      { tex: T`d^2=\Big(2+\frac{\bar r}{256}\Big)\Delta r^2+4\,\Delta g^2+\Big(2+\frac{255-\bar r}{256}\Big)\Delta b^2,\qquad \bar r=\frac{r_1+r_2}{2}`, note: 'The “redmean” colour distance used to find the nearest enamel colour. It is a cheap approximation of how different two colours look.' },
      { tex: T`w=\operatorname{round}\big((0.2+2.2\,o)\,\mathrm{sc}\big),\qquad C\leftarrow(1-e)\,C+e\,C_{\text{ink}},\quad e=\min(1,\,1.4\,o)`, note: 'Outline width w and strength e from the outline slider o (0 to 1).' },
      { tex: T`g=\operatorname{smoothstep}(0.74,\,0.92,\,t)\cdot s\cdot\begin{cases}150&\operatorname{frac}\!\big(\frac{0.8x+0.6y}{7\,\mathrm{sc}}\big)<0.42\\ 40&\text{otherwise}\end{cases}`, note: 'Chrome gloss added to the colour: s is the gloss slider and t the tone. The two levels make bands of light.' },
      { tex: T`m=\operatorname{round}\big(0.11\,\min(W,H)\,\varphi\big)`, note: 'Frame width, with φ the frame slider (0 to 1). Below 6 px the frame is dropped.' },
    ],
  },
  'mughal-jali': {
    paragraphs: [
      'Jali means a net or a lattice. The Mughals carved them from single slabs of marble and red sandstone to screen windows, tombs and balconies: Shah Jahan’s screens round the cenotaphs at the Taj Mahal, and the windows of Salim Chishti’s tomb at Fatehpur Sikri. They let in air and a broken light, and they hide the people behind. The program turns this into a picture: the stone is a slab with openings, your picture is the scene behind it, and the sun throws the lattice across the scene.',
      'Each opening is described by a margin function that is positive inside the hole and negative in the stone, measured in pixels. For the eight-point star, the margin is the star’s polar radius (the same star polygon formula as in the Ajrak page) minus the distance from the cell’s centre, combined with a diamond at the corners. For the six-point star the plane is split into hexagons: the point (x, y) is turned into hexagonal coordinates, rounded to the nearest hexagon, and the star is drawn about that hexagon’s centre. The mask M is the margin passed through a smoothstep 1.8 px wide. It is blurred to give a soft stone edge, and its slope gives a bevel lit by the sun. The scene is drawn only through the openings, and each pixel looks up the mask at a point shifted along the sun’s direction by the stone’s thickness, so the scene is dark where the lattice would cast a shadow.',
    ],
    equations: [
      { tex: T`q=\frac{\frac{\sqrt3}{3}x-\frac{y}{3}}{\sigma},\qquad r=\frac{\frac23\,y}{\sigma},\qquad (q,\,-q-r,\,r)\ \to\ \text{nearest integer triple summing to }0`, note: 'Hexagonal (cube) coordinates for the six-point star lattice, σ = 0.62 s. After rounding each part, the one with the largest rounding error is reset so the three still add up to zero.' },
      { tex: T`\mathrm{margin}=\max\big(m_1,\,m_2\big)\,\frac{s}{2},\qquad m_1=r_\star(\theta)-\rho,\quad m_2=0.34\,h-\big[(1-|u|)+(1-|v|)\big]`, note: 'The eight-point opening in a cell with coordinates u, v from −1 to 1. r⋆ is the star radius with R₁ = 0.92 h and R₂ = 0.5 h, and h = 0.45 + 0.55 × the opening slider. Union of two shapes is the maximum of their margins.' },
      { tex: T`M=\operatorname{smoothstep}\big(-0.9,\,0.9,\,\mathrm{margin}\big),\qquad \text{lit}=M_b\big(\mathbf x+\mathbf l\,d\big),\quad d=26\,\mathrm{sc}\,\tau`, note: 'The mask, and the sun lookup: τ is the thickness slider, l the unit vector of the sun’s direction and M_b the blurred mask.' },
      { tex: T`f_{\text{view}}=(0.38+0.9\,g)\,(0.42+0.7\,\text{lit})`, note: 'How bright the scene is behind an opening: g is the light slider.' },
    ],
  },
  'persian-miniature': {
    paragraphs: [
      'A Persian miniature is a small painting made for a book. The painter uses flat areas of mineral colour (lapis from the mines of Badakhshan, vermilion, malachite green, turmeric yellow and burnished gold leaf), draws fine ink outlines, and does not cast shadows. Space is made by stacking things up the page, and meadows are pricked with tufts of grass and small flowers. A frame of gold rules, a blue band with gold teardrops and a ground of ivory paper surrounds the page. The program follows the same recipe.',
      'The picture is blurred (simplify × 1.1 px), made 25% more saturated, and snapped to one of nine pigments by the redmean distance used on the Truck Art page. Specks are removed by a majority filter, run twice over a 5 × 5 window. Outlines in dark brown ink are drawn where the colour index changes, with a strength of 0.8 × the ink slider. There are no shadows, but the painter’s trick for depth is fine parallel hatching, and the program uses it where the picture is dark: hatch lines every 3.1 px, at a slant, darken the colour by up to 34%. Tufts of grass (on green and turquoise, and sometimes elsewhere) and flecks of gold are scattered on a jittered grid of 30 px wherever there is no outline. The frame is built from ivory, a lapis band, gold rules, a red hairline and gold teardrops spaced 0.55 m apart, where m is the frame width.',
    ],
    equations: [
      { tex: T`f=0.93+0.14\,t-\eta\,0.34\,\operatorname{smoothstep}(0.42,\,0.15,\,t)\,\big[\operatorname{frac}\!\big(\tfrac{0.7x+y}{3.1\,\mathrm{sc}}\big)<0.26\big]`, note: 'Brightness of the flat colour. The second term is the hatching: η is the hatching slider, and it only applies where the tone t is below 0.42.' },
      { tex: T`C\leftarrow(1-\lambda)\,C+\lambda\,C_{\text{ink}},\qquad \lambda=0.8\,\iota\ \ \text{on an edge}`, note: 'Ink outline with strength λ, where ι is the ink slider (0 to 1) and C_ink is the dark brown (42, 26, 16).' },
      { tex: T`r_{\text{gold}}=(1+1.6\,\xi)\,\mathrm{sc}\,(0.6+0.6\,\gamma),\qquad \alpha=0.5+0.5\,\gamma`, note: 'Size and opacity of a fleck of gold: ξ is a random number and γ the gold slider.' },
      { tex: T`m=\operatorname{round}\big(0.1\,\min(W,H)\,\varphi\big),\qquad \text{lapis band at inset }0.64\,m,\ \text{width }0.5\,m`, note: 'The frame. It is dropped when m is under 8 px.' },
    ],
  },
  girih: {
    paragraphs: [
      'Girih, from the Persian for knot, is the strapwork of Islamic buildings: bands that appear to weave over and under to make stars and polygons. The medieval method, as far as we can tell from scrolls kept in Topkapı Palace, was to divide the plane into a few tile shapes and draw lines across them. In 1925 Ernest Hankin gave a rule for the lines that is easy to compute: from the middle of every edge of a polygon, two lines go inward at the same angle to the edge, and each meets the line from the neighbouring edge. In 2007 Peter Lu and Paul Steinhardt showed that the girih at the Darb-i Imam shrine in Isfahan (1453) comes very close to a Penrose tiling, which never repeats.',
      'The program uses that connection. It builds a Penrose tiling of two rhombs by de Bruijn’s pentagrid method and then draws the strapwork on each rhomb (this uses two shapes, and not the five girih tiles of the scrolls). Five families of parallel lines are laid across the plane, family i being the set of points z with z · eᵢ + γᵢ a whole number, where eᵢ is a unit vector at angle 2πi/5 and the offsets γᵢ add up to zero. Where a line of family r crosses a line of family s there is one rhomb, whose corners are found by rounding up z · eᵢ + γᵢ for the other families. If r and s are neighbouring directions the rhomb is the wide one, otherwise the narrow one. The random offsets are the “patch of the tiling” (shuffle). Each rhomb is then given Hankin’s lines at the chosen contact angle, which splits it into four kites and a central star, each coloured from your picture, a classic lapis or turquoise and ivory scheme, or both, with the lines drawn in gold.',
    ],
    equations: [
      { tex: T`\mathbf z\cdot\mathbf e_i+\gamma_i\in\mathbb Z,\qquad \mathbf e_i=\Big(\cos\tfrac{2\pi i}{5},\ \sin\tfrac{2\pi i}{5}\Big),\qquad \sum_{i=0}^{4}\gamma_i=0`, note: 'The pentagrid: five families of lines. The condition on the offsets γᵢ makes the dual a Penrose tiling.' },
      { tex: T`K_i=\lceil\mathbf z\cdot\mathbf e_i+\gamma_i\rceil,\qquad \mathbf v=\sum_{i=0}^{4}q_i\,\mathbf e_i,\quad q_i=\begin{cases}k_r+\{0,1\}&i=r\\ k_s+\{0,1\}&i=s\\ K_i&\text{otherwise}\end{cases}`, note: 'Corners of the rhomb for the crossing of line k_r of family r and line k_s of family s. The four choices of 0 or 1 give its four corners.' },
      { tex: T`\mathbf m_i+t\,\mathbf d_1=\mathbf m_{i+1}+u\,\mathbf d_2,\qquad \mathbf d_1=R_{\theta}(\mathbf b-\mathbf a),\quad \mathbf d_2=R_{-\theta}(\mathbf b-\mathbf c)`, note: 'Hankin’s rule for an edge ab followed by bc: the lines leaving the midpoints m_i and m_{i+1} at the contact angle θ meet where t and u are both positive. R_θ is a rotation by θ. If they do not meet, the point halfway between the midpoints is used.' },
      { tex: T`t=\frac{(\mathbf m_{i+1}-\mathbf m_i)\times\mathbf d_2}{\mathbf d_1\times\mathbf d_2},\qquad \frac{N_{\text{wide}}}{N_{\text{narrow}}}\to\varphi=\frac{1+\sqrt5}{2}`, note: 'The parameter t, using the 2D cross product, and a famous property of Penrose tilings: wide rhombs outnumber narrow ones by the golden ratio.' },
    ],
  },
  madhubani: {
    paragraphs: [
      'Madhubani, or Mithila, painting comes from the Mithila region of Bihar and the neighbouring parts of Nepal. Women painted it on the walls of houses, especially for weddings, with twigs and cotton-wrapped sticks and with pigments from turmeric, indigo, soot, flowers and clay. Its most striking habit is to leave no space empty: every figure is outlined and then filled with its own pattern of lines, dots, scales or waves. The program does this by colour. It reduces the picture to eight pigments and gives most of them a fill pattern.',
      'The picture is blurred and snapped to the eight pigments (madder red, turmeric, leaf green, indigo, lamp black, paper, saffron and earth), cleaned with a majority filter and outlined in black wherever two colours meet. Inside each region a pattern is added, chosen by the pigment: a diamond lattice on red, dots on yellow, waves on green, fish-scale arcs on blue, dots in paper white on black, concentric rings on saffron and stripes in paper white on earth. The pattern repeats every q = 1.6 × size px, and its coordinates wobble with a sine wave so that the lines look drawn by hand. A border of triangles in four colours is set round the painting between rules of black.',
    ],
    equations: [
      { tex: T`\Big|\operatorname{frac}\!\big(\tfrac{x+y}{q}\big)-\tfrac12\Big|<0.07\ \ \text{or}\ \ \Big|\operatorname{frac}\!\big(\tfrac{x-y}{q}\big)-\tfrac12\Big|<0.07`, note: 'The lattice of diagonal lines in red regions. Lines of width 0.14 q in each of two directions, so about 1 − 0.86² ≈ 26% of the region is covered.' },
      { tex: T`\Big\lVert\operatorname{frac}\!\big(\tfrac{\mathbf x}{q}\big)-\tfrac12\Big\rVert<0.17\quad(\phi=\pi\cdot0.17^2\approx0.09)`, note: 'The dot pattern: a dot in every square. Its covering fraction φ is about 9%.' },
      { tex: T`\operatorname{frac}(5\rho)<0.32,\ \ \rho=\Big\lVert\operatorname{frac}\!\big(\tfrac{\mathbf x}{1.6\,q}\big)-\tfrac12\Big\rVert<\tfrac12`, note: 'Concentric rings in saffron regions: five rings per unit of radius, each about a third of the ring spacing.' },
      { tex: T`C\leftarrow C+\tau\,\big(C_{\text{line}}-C\big),\qquad \tau=0.9\,\kappa,\quad C_{\text{line}}=\begin{cases}\text{paper}&\text{black, earth}\\ \text{ink}&\text{otherwise}\end{cases}`, note: 'The fill line is blended with strength 0.9 κ, where κ is the pattern strength slider (0 to 1), so light lines are drawn on the dark pigments and dark lines on the others.' },
    ],
  },
  warli: {
    paragraphs: [
      'Warli painting belongs to the Warli people of Maharashtra and Gujarat. It is painted on the red-brown mud walls of houses, in white rice paste, with a bamboo stick, and is often made for weddings. The vocabulary is small: a circle, a triangle and a square, said to come from the sun and the moon, mountains and trees, and a field or a hut. A human is two triangles meeting at their tips, with a circle for a head and stick limbs, and a crowd of them dances in a ring. The program fills the wall with such figures and lets the picture decide where the crowd gathers.',
      'The wall is a texture of two noises, a broad one 90 px across and a fine one 5 px across. Candidate positions lie on a staggered grid with spacing 0.82 u (u is the figure size), each shifted by a random amount of up to a quarter of the spacing. At each position the picture’s tone t sets the chance that anything is drawn there: p = min(1, 1.15 d (1 − t)^1.5), where d is the crowd slider. Dark places therefore hold a thick crowd and light places stay empty. What is drawn is chosen at random: a figure 60% of the time, a tree 16%, a bird 10%, a hut 10% and a sun 4%. Its size also follows the picture, from 0.8 u in light places to 1.2 u in dark. A border of two frames and a chain of triangles is added when it is switched on.',
    ],
    equations: [
      { tex: T`p(t)=\min\!\big(1,\ 1.15\,d\,(1-t)^{1.5}\big)`, note: 'The chance that a grid position holds a drawing, from the tone t and crowd slider d.' },
      { tex: T`N\approx\sum_{\text{sites}}p(t)\ \approx\ \frac{A}{(0.82\,u)^2}\ \overline{p}`, note: 'The expected number of drawings in an area A.' },
      { tex: T`s=u\,\big(0.8+0.4\,(1-t)\big)`, note: 'The size of a figure, from the tone.' },
      { tex: T`\text{kind}=\begin{cases}\text{person}&h<0.60\\ \text{tree}&h<0.76\\ \text{bird}&h<0.86\\ \text{hut}&h<0.96\\ \text{sun}&\text{otherwise}\end{cases}`, note: 'The pick, with h a random number fixed by the position and the seed. Figures are drawn from the top of the wall down so lower ones overlap higher ones.' },
    ],
  },
  kolam: {
    paragraphs: [
      'In Tamil Nadu and the south of India, women draw a kolam at the door each morning in rice flour, so that ants and birds are fed as they pass. The most common kind starts with a lattice of dots, called pulli, and a line that loops round them. Mathematicians and computer scientists have studied kolams since the 1970s, as pictures made by simple rules. The program places dots on a square lattice with the chosen spacing, and for each square of four dots it decides which of two figures to draw from the tone of your picture.',
      'The first figure is the loop round the dots. A quarter circle of radius s/2 is drawn about each corner of the square, turning inward, so that four neighbouring squares draw a full circle round the dot they share, and the circles of neighbouring dots touch at the middle of the edge between them. The second figure is the diamond joining the midpoints of the four sides. For the tone t (less the density slider), a square is empty if t ≥ 0.78. It has only the loops if 0.62 ≤ t < 0.78, only the diamond if 0.4 ≤ t < 0.62, and both if t < 0.4, which is why dark places turn into diamonds and petals. Symmetry is made by folding the point where the picture is read, so that the left and right (and with four-fold symmetry the top and bottom) read the same tones. The flour is a canvas of its own, with grainy edges and a soft glow, laid over a floor texture.',
    ],
    equations: [
      { tex: T`n_x=\Big\lfloor\frac{W}{s}\Big\rfloor-1,\qquad \mathbf p_{i,j}=\big(o_x+i\,s,\ o_y+j\,s\big),\quad 0\le i\le n_x,\ 0\le j\le n_y`, note: 'The dot lattice. Offsets o_x, o_y centre it on the canvas, and there are (nₓ + 1)(n_y + 1) dots.' },
      { tex: T`\text{diamond}:\ t<0.62,\qquad \text{loops}:\ t<0.78\ \wedge\ \big(t<0.4\ \vee\ t\ge0.62\big),\qquad t=T(\mathbf c)-\delta`, note: 'Which figures a square gets. T is the blurred tone at the square’s centre c, and δ is the density slider divided by 100.' },
      { tex: T`x\leftarrow x_c-|x-x_c|,\qquad y\leftarrow y_c-|y-y_c|\ \ (\text{four-fold only})`, note: 'Folding the lookup point for mirror symmetry.' },
      { tex: T`w=0.11\,s\,\omega,\qquad r_{\text{dot}}=0.075\,s\,\max(0.7,\,\omega)`, note: 'Line width and dot radius from the line weight slider ω.' },
    ],
  },
};
