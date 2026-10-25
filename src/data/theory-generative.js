// src/data/theory-generative.js
// Theory entries for the treatments of section I, Geometric and generative.
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_GENERATIVE = {
  'truchet-tiles': {
    paragraphs: [
      'In 1704 the Dominican Sébastien Truchet noticed that one square tile, divided by its diagonal into a light and a dark half, makes endless patterns when the copies are turned at random. In the arc version used here each tile carries two quarter circles of radius s/2, centred on opposite corners, which meet the midpoints of the sides. The tile is placed in one of two orientations, chosen by a hash of its position, and because every arc ends at a side midpoint, arcs of neighbouring tiles always join into winding paths. Quarter discs and plain diagonals use the same grid.',
      'The picture decides how heavy each tile is. Its darkness under the tile, averaged over a radius of 0.45 tile widths, scales the line width (or the disc radius), from a hairline in the lights to a bold stroke in the shadows. The picture shows through slider mixes between a uniform weight and the full tonal weight, and on the night paper the roles reverse (light is heavy). Colour comes from the picture, a little darker than the original, or from a single ink. With smaller tiles in detail on, a tile whose four quarters differ strongly in tone, with variance above 0.006, is replaced by four half-size tiles.',
    ],
    equations: [
      { tex: T`w=s\,\big(0.06+0.5\,\hat t\big),\qquad \hat t=(1-\beta)\,\tfrac12+\beta\,t`, note: 'Line width of a tile of side s: t is the picture’s darkness under it (1 minus lightness on light paper), β the picture-shows-through slider.' },
      { tex: T`\sigma^{2}=\sum_{i=1}^{4}\big(t_i-\bar t\big)^{2}>0.006\ \Longrightarrow\ \text{split into four tiles of side } s/2`, note: 'The quadtree rule: t_i is the tone of the i-th quarter of the tile.' },
      { tex: T`\text{flip}=\big[\,h(\text{tile}_x,\ \text{tile}_y,\ \text{seed})\ge\tfrac12\,\big]`, note: 'The random orientation of each tile comes from a hash h of its position, so the pattern is the same each time you redraw with the same seed.' },
    ],
  },
  'op-art-moire': {
    paragraphs: [
      'When two sets of fine regular lines overlap, broad dark and light bands appear that are in neither set. They are the beats of the two patterns, the same effect as two close musical notes giving a slow throb. The program draws two sets. The first is a plain set of parallel lines (or rings, or gentle waves) of period p. The second has the same period but is turned by the angle slider, or has its centre shifted for rings. For two sets of equal period at an angle α the bands are p / (2 sin(α/2)) apart, so a small turn makes wide, dramatic fringes.',
      'The picture enters in two ways. First it bends the second set: the coordinate across its lines is shifted by up to 9 periods times (L − ½), where L is the lightness, so the lines swerve around shapes and the beats trace them. Second, it sets the weight: the duty cycle of the second set is mixed between ½ and 0.12 + 0.76 (1 − L), so lines are thick in the dark and thin in the light. Each stripe is anti-aliased with a smoothstep one pixel wide, and the two sets combine as ink coverage, as if printed one over the other.',
    ],
    equations: [
      { tex: T`\Lambda=\frac{p}{2\sin(\alpha/2)}`, note: 'Spacing of the moiré bands for equal periods p and a relative turn α.' },
      { tex: T`u_2'=u_2+\omega\,\big(L-\tfrac12\big),\qquad \omega=9\,\text{warp}`, note: 'The picture bends the second set: u₂ is the coordinate across its lines, in periods.' },
      { tex: T`\text{cov}=1-(1-A)(1-B),\qquad A=1-\operatorname{smoothstep}\!\big(\tfrac{\delta_A}{2}-a,\ \tfrac{\delta_A}{2}+a,\ \operatorname{dist}(u_1)\big)`, note: 'Ink coverage of the union; dist(u) = |u − ⌊u⌋ − ½| is the distance to the nearest stripe centre, a = 0.8 px / period the anti-alias width, δ the duty cycle.' },
    ],
  },
  spirograph: {
    paragraphs: [
      'A spirograph curve is a hypotrochoid: the path of a pen held in a hole of a small wheel (radius r) that rolls without slipping around the inside of a larger ring (radius R). With the ring scaled to 1 and k = r/R, the pen is at (1 − k) cos t + h cos(((1 − k)/k) t) horizontally and (1 − k) sin t − h sin(((1 − k)/k) t) vertically, where h is the pen’s distance from the wheel’s centre. The curve closes when the wheel has gone round q = N / gcd(n, N) times, for a wheel of n teeth in a ring of N = 144 teeth, and that is the number of turns drawn.',
      'In the single-curve layout one large curve is drawn as many short segments (220 per turn). Each segment is coloured by the picture at its midpoint, so the picture appears through the weaving. The rosettes layout is a grid of small spirographs, each with a random wheel ratio from a list of coprime pairs (2/5, 3/7, 3/8 and so on) and a random pen hole. Each is scaled to fit its cell, using the largest radius the curve reaches, (1 − k) + h, and its colour is that of the picture at the cell’s centre. With size follows the picture the rosette is smaller in the highlights or the shadows, so the grid forms a halftone.',
    ],
    equations: [
      { tex: T`\begin{aligned}x(t)&=(1-k)\cos t+h\cos\!\Big(\tfrac{1-k}{k}\,t\Big)\\ y(t)&=(1-k)\sin t-h\sin\!\Big(\tfrac{1-k}{k}\,t\Big)\end{aligned}\qquad k=\frac{n}{N}`, note: 'The hypotrochoid for a wheel of n teeth in a ring of N = 144; h = 1.6 k × the pen-hole slider.' },
      { tex: T`q=\frac{N}{\gcd(n,\,N)},\qquad t\in[0,\ 2\pi q]`, note: 'The curve closes after q turns.' },
      { tex: T`\rho_{\max}=(1-k)+h,\qquad R_{\text{cell}}=\frac{c\,f}{2\,\rho_{\max}}`, note: 'Scale for a rosette: c is the cell size, f the size-follows-picture factor (0.42 to 1).' },
    ],
  },
  'hexagon-mosaic': {
    paragraphs: [
      'A honeycomb is the tiling of the plane by regular hexagons, the shape that covers a surface with the least edge. With the hexagon’s corner-to-centre distance s, the centres of a row are √3 s apart, the rows are 1.5 s apart, and each odd row is shifted by half a width. The corner angles are π/6 + mπ/3. Each cell is given the colour of the picture averaged over a disc of radius 0.75 s around its centre, so a cell is one flat, glazed tile.',
      'Three ways of drawing the cells are offered. Flat tiles fill each cell, with a gap slider that shrinks the hexagon and lets the colour behind show as grout, and a glaze that adds a diagonal gradient (from about 20% brighter to 22% darker) and a thin pale inner edge. In shrinking cells the radius scales with the tone, 0.25 + 0.85 t, which turns the honeycomb into a halftone. In tumbling blocks each hexagon is cut into three rhombi shaded 1.14, 0.86 and 0.62 times the cell colour, which reads as a cube seen from a corner, the old tumbling-blocks quilt pattern.',
    ],
    equations: [
      { tex: T`\mathbf c_{ij}=\Big(\sqrt3\,s\,\big(j+\tfrac12\,(i\bmod 2)\big),\ \ \tfrac32\,s\,i\Big),\qquad \theta_m=\tfrac{\pi}{6}+\tfrac{m\pi}{3}`, note: 'Hexagon centres (row i, column j) and corner angles.' },
      { tex: T`r=s\,(1-g)\,\big(0.25+0.85\,t\big)`, note: 'Radius in the shrinking-cells mode: g is the gap slider and t the tone (1 − tone on a cream ground).' },
      { tex: T`C_{\text{face}}=k_f\,C_{\text{cell}},\qquad (k_1,\ k_2,\ k_3)=(1.14,\ 0.86,\ 0.62)`, note: 'Shading of the three faces of a tumbling block.' },
    ],
  },
  'voronoi-mosaic': {
    paragraphs: [
      'The Voronoi cell of a seed is the set of points nearer to that seed than to any other. Here the seeds are scattered by rejection sampling: a random point is accepted with probability equal to an importance value that is high where the picture has strong edges (the Sobel strength, scaled to its maximum and boosted ×2.2) and low (0.06) where it is flat, so cells crowd together around the detail. The gather-in-detail slider mixes this importance with a uniform 1. Every pixel is given the label of its nearest seed by jump flooding, which finds nearest seeds in about log₂ of the picture size passes instead of comparing against all of them.',
      'Lloyd relaxation then moves each seed to the centroid of its cell, weighted by the importance squared, and the labels are recomputed. A few rounds even out the cells and give the soft, almost organic look of a cracked glaze, while still keeping more of them where the picture is detailed. Each cell is painted with the mean colour of the picture within it. The faceting slider adds a gentle dome of light across each cell, and the borders slider darkens the pixels next to a neighbouring cell by up to 55%.',
    ],
    equations: [
      { tex: T`\lambda(\mathbf x)=\arg\min_{i}\ \lVert\mathbf x-\mathbf s_i\rVert,\qquad P(\text{accept }\mathbf s)=\text{imp}(\mathbf s)`, note: 'Cell labels, and the rejection rule for seeds.' },
      { tex: T`\text{imp}=(1-\delta)+\delta\,\Big(0.06+0.94\,\min\!\big(1,\ 2.2\,\tfrac{E}{E_{\max}}\big)\Big)`, note: 'Importance: E is the edge strength, δ the gather-in-detail slider.' },
      { tex: T`\mathbf s_i\leftarrow\frac{\sum_{\mathbf x\in V_i}w(\mathbf x)\,\mathbf x}{\sum_{\mathbf x\in V_i}w(\mathbf x)},\qquad w=\text{imp}^{2}+0.002`, note: 'One round of Lloyd relaxation.' },
    ],
  },
  'penrose-tiling': {
    paragraphs: [
      'The Penrose tiling uses two rhombi, a thin one with angles of 36 and 144 degrees and a thick one with 72 and 108, which together cover the plane without ever repeating. It has local five-fold symmetry, which no periodic tiling can have. The program builds it from Robinson triangles, the halves of the rhombi. It starts with ten thin triangles arranged round the centre in a decagon, then repeatedly deflates every triangle into smaller ones. A thin triangle becomes two (one of each kind) and a thick one becomes three, with the new vertices dividing the old edges in the golden ratio φ = (1 + √5)/2.',
      'Each deflation shrinks the edges by 1/φ and multiplies the number of triangles by φ² ≈ 2.618, the larger eigenvalue of the substitution matrix. The subdivisions slider sets how many rounds are made. For colour, each triangle looks up the picture at its centroid. In picture mode the thick tiles are made 4% lighter and the thin ones 6% darker, so the two shapes can be told apart; in duo mode they take gold and teal, shaded by the picture’s tone; in mixed mode the picture colour and the duo colour are mixed 60:40. Optional lines trace the triangles’ outer edges.',
    ],
    equations: [
      { tex: T`P=A+\frac{B-A}{\varphi},\qquad Q=B+\frac{A-B}{\varphi},\qquad R=B+\frac{C-B}{\varphi},\qquad \varphi=\frac{1+\sqrt5}{2}`, note: 'The new vertices when a triangle ABC is deflated.' },
      { tex: T`\begin{pmatrix}n_0'\\ n_1'\end{pmatrix}=\begin{pmatrix}1&1\\ 1&2\end{pmatrix}\begin{pmatrix}n_0\\ n_1\end{pmatrix},\qquad \lambda=\frac{3\pm\sqrt5}{2}=\varphi^{2},\ \varphi^{-2}`, note: 'Counts of thin (n₀) and thick (n₁) triangles; the growth per round is φ² ≈ 2.618.' },
      { tex: T`N_k\approx 10\,\varphi^{2k},\qquad \ell_k=\ell_0\,\varphi^{-k}`, note: 'Number of triangles and edge length after k deflations.' },
    ],
  },
  'fractal-flame': {
    paragraphs: [
      'A fractal flame (Scott Draves, 2003) is found by a game of chance. Pick a point. Choose one of three or four transforms at random (each with its own weight), apply it, and plot where the point lands; repeat a few million times. Each transform is an affine map (a rotation, scale and shift) followed by two nonlinear variations V mixed with weights w₁ + w₂ = 1. The variations are named, familiar curves: sinusoidal, spherical (dividing by r²), swirl, horseshoe, polar, handkerchief, heart, disc, spiral, julia, bubble and fisheye. They fold the plane, and the folds are what makes a flame look like smoke and fabric. The first 24 steps are thrown away, and the points are accumulated in a histogram.',
      'Colour is carried by a running mean: each transform has a colour index c_i and the point’s colour moves halfway toward it at every step, so a pixel’s colour is the average of the routes by which it was reached. Since many random sets of transforms make dull or empty pictures, the program tries up to 60 seeds. For each it plots 30,000 points, finds the middle 94% of their range, and keeps the candidate only if it is a real picture (a decent extent and at least 130 of 24 × 24 cells occupied); the view is then fitted to that range. The histogram is shown by log-density tone mapping, the standard flame trick that lets a dense core glow and faint filaments remain visible, with a white-hot core added where the density is highest. With rotational symmetry s > 1, each point is rotated by a random multiple of 2π/s.',
    ],
    equations: [
      { tex: T`(x,y)\ \leftarrow\ w_1\,V_{j_1}\!\big(A_i(x,y)\big)+w_2\,V_{j_2}\!\big(A_i(x,y)\big),\qquad A_i(x,y)=(a\,x+b\,y+e,\ c\,x+d\,y+f)`, note: 'One step of the chaos game with the randomly chosen transform i.' },
      { tex: T`V_{\text{sph}}=\frac{(x,\,y)}{r^{2}},\qquad V_{\text{swirl}}=\big(x\sin r^{2}-y\cos r^{2},\ \ x\cos r^{2}+y\sin r^{2}\big)`, note: 'Two of the twelve variations (spherical and swirl), with r² = x² + y².' },
      { tex: T`t=\operatorname{clip}\!\Big[\Big(\frac{\ln(1+n)}{\ln(1+n_{\max})}\Big)^{0.72}B\Big],\qquad C=(1-t)\,C_{\text{bg}}+1.25\,\frac{t}{n}\sum c\ +\ 0.35\cdot255\,t^{3.5}`, note: 'Log-density tone mapping: n is the hit count of a pixel, B the brightness slider, Σc the sum of the colours that landed there.' },
    ],
  },
  'mandelbrot-fill': {
    paragraphs: [
      'The Mandelbrot set is the set of complex numbers c for which the orbit z₀ = 0, zₙ₊₁ = zₙ² + c stays bounded. A Julia set uses the same rule with c fixed (here at distance 0.7885 from the origin, at the angle set by the Julia-shape slider) and the starting point z₀ taken from the pixel. Every pixel is mapped to a point of the complex plane inside a chosen view (the whole set, the seahorse valley, the elephant valley, the triple spiral or a small copy), widened or narrowed by the zoom, and its orbit is followed for up to the detail number of steps. The orbit is declared escaped when |z|² passes 400.',
      'The picture comes in as an orbit trap. A window |Re z| < hₓ, |Im z| < hᵧ around the origin is laid over the plane and your picture is stretched across it. The first time an orbit passes through the window, the pixel takes the colour of the picture at that spot, and a late arrival is darkened: the factor is 0.5 + 0.5 e^(−n/7). Because orbits near the set’s boundary wander, they sample the picture at scattered points, and the picture appears in thousands of distorted copies. The pixels whose orbits never touched the window but escaped get a smooth iteration count, ν = n + 1 − log₂(log₂|zₙ|), run through a cyclic colour ramp, with a glow near the edge that fades as e^(−n/14); orbits that never escape and never touch the window are left near black.',
    ],
    equations: [
      { tex: T`z_{n+1}=z_n^{2}+c,\qquad \text{Mandelbrot: } z_0=0,\ c=\text{pixel};\quad \text{Julia: } z_0=\text{pixel},\ c=0.7885\,e^{i\alpha}`, note: 'The two kinds of orbit.' },
      { tex: T`\text{colour}=C_{\text{picture}}\!\Big(\tfrac12\big(\tfrac{\operatorname{Re}z_n}{h_x}+1\big)W,\ \ \tfrac12\big(1-\tfrac{\operatorname{Im}z_n}{h_y}\big)H\Big)\cdot\big(0.5+0.5\,e^{-n/7}\big)`, note: 'The orbit trap: n is the first step with |Re z| < hₓ and |Im z| < hᵧ.' },
      { tex: T`\nu=n+1-\log_2\!\big(\log_2\lvert z_n\rvert\big)`, note: 'Smooth escape count, used for the colour of pixels that escaped without touching the window.' },
    ],
  },
  'reaction-diffusion': {
    paragraphs: [
      'Alan Turing proposed in 1952 that two chemicals that react and spread at different speeds can organise themselves into spots and stripes. This is the Gray-Scott model. A food chemical U is fed in at rate f. An activator V turns U into more V (the reaction U + 2V → 3V, which gives the term u v²) and is removed at rate f + k. Both spread, the food faster than the activator (Dᵤ = 0.21, Dᵥ = 0.105 in grid units). Depending on f and k the same rules grow coral, worms, spots, mazes or cells that divide; the preset sets the pair, and each step is one explicit Euler step on a grid about 1/2.8 of the picture’s width with a five-point Laplacian and clamped edges.',
      'The picture steers the chemistry. f and k are not constants but vary from cell to cell by the picture’s tone, f = f₀ + s (tone − ½) × 0.02 and k = k₀ + s (tone − ½) × 0.005, so bright and dark regions sit at different places in the pattern map and grow different textures, spots on one side and stripes on the other, and the picture emerges from the growth. The grid starts as U = 1 with scattered 3 × 3 patches (2% of cells) where U = 0.5 and V ≈ 0.25. Pressing and dragging seeds the same kind of patch under the pointer. V is shown through a smoothstep as ink, as an ember colour ramp, or as the picture’s own colours.',
    ],
    equations: [
      { tex: T`\begin{aligned}\frac{\partial u}{\partial t}&=D_u\nabla^{2}u-u\,v^{2}+f\,(1-u)\\[2pt] \frac{\partial v}{\partial t}&=D_v\nabla^{2}v+u\,v^{2}-(f+k)\,v\end{aligned}`, note: 'The Gray-Scott equations; D_u = 0.21 and D_v = 0.105.' },
      { tex: T`\nabla^{2}u\approx u_N+u_S+u_E+u_W-4\,u,\qquad u\leftarrow u+\Delta t\,\dot u,\ \ \Delta t=1`, note: 'The discrete Laplacian on the grid and the Euler step.' },
      { tex: T`f=f_0+0.02\,s\,\big(\tau-\tfrac12\big),\qquad k=k_0+0.005\,s\,\big(\tau-\tfrac12\big)`, note: 'The picture’s steering: τ is the tone (0 to 1), s the steering slider.' },
    ],
  },
  'flow-field': {
    paragraphs: [
      'A streamline is a curve that is everywhere tangent to a vector field. The field here is made of a direction angle θ taken from smooth noise, θ = 2π × 2.2 × fbm(νx), so that it swirls without ever jumping. Where the picture has an edge, the field is bent toward the tangent of the edge, the direction perpendicular to the gradient of the lightness, with a weight w = follow × smoothstep(0.015, 0.12, |∇L|). Streamlines then run along outlines instead of across them, and the picture’s shapes appear as the places where the flow turns.',
      'To keep the lines evenly spaced and uncrossed the program uses the method of Jobard and Lefer (1997). Seeds are laid on a jittered grid and shuffled. A seed is accepted only if it is at least 0.8 of the spacing from every existing line point. From it a line is traced both ways in steps of 0.45 of the spacing (up to 260 each way), and it stops as soon as the next point would come too close to another line, or to its own older points (the most recent 14 steps are exempt, so it does not stop itself). The check looks only in a 5 × 5 neighbourhood of a grid with cells of spacing/√2. Each line is drawn as a smooth curve whose width follows the tone at its middle and whose colour is the picture’s there.',
    ],
    equations: [
      { tex: T`\mathbf d=\frac{(1-w)\,(\cos\theta,\ \sin\theta)+w\,\mathbf t}{\big\lVert(1-w)\,(\cos\theta,\ \sin\theta)+w\,\mathbf t\big\rVert},\qquad \mathbf t=\frac{(-\partial_y L,\ \partial_x L)}{\lVert\nabla L\rVert}`, note: 'Field direction: θ from noise, t the edge tangent, w the follow weight.' },
      { tex: T`\mathbf x_{j+1}=\mathbf x_j+h\,\mathbf d(\mathbf x_j),\qquad h=0.45\,s`, note: 'One step of a streamline; s is the line spacing.' },
      { tex: T`\text{stop if }\ \lVert\mathbf x_{j+1}-\mathbf y\rVert<0.8\,s\ \ \text{for any other line point }\mathbf y`, note: 'The separation rule that keeps the lines evenly spaced.' },
    ],
  },
  'circle-packing': {
    paragraphs: [
      'The program fills the picture with circles that never overlap, each as large as the room allows. It tries random points, and at each one asks how big a circle could be. The answer is the smallest of four things: the radius the picture asks for, the distances to the four walls, and the distance to every neighbouring circle minus its radius and the gap. If the answer is at least the smallest allowed radius, the circle is placed. A grid with cells the size of the largest circle means only the nine nearest cells need to be searched, and the number of attempts grows with the area divided by the smallest circle’s area.',
      'The picture decides the radius it asks for. With size following the light or the dark, the wanted radius is r_min × 1.6 + (r_max − 1.6 r_min) f^0.9, where f is the tone (or one minus it), so large circles gather in the chosen tones and small ones fill everything else. Each circle takes the picture’s colour at its centre. Circles can be drawn as flat discs, as rings whose stroke is 0.28 of the radius, or as glossy beads with a radial gradient lit from the upper left, brightened ×1.4 + 50 at the highlight and darkened to 0.62 at the rim.',
    ],
    equations: [
      { tex: T`r=\min\Big(r_{\text{want}},\ x,\ W-x,\ y,\ H-y,\ \min_k\big[\lVert\mathbf p-\mathbf p_k\rVert-r_k-g\big]\Big),\qquad \text{accept if } r\ge r_{\min}`, note: 'The largest circle that fits at point p, given the other circles (centres p_k, radii r_k) and the gap g.' },
      { tex: T`r_{\text{want}}=1.6\,r_{\min}+\big(r_{\max}-1.6\,r_{\min}\big)\,f^{0.9}`, note: 'The radius the picture asks for; f is the tone, or 1 − tone when the dark parts should be large.' },
    ],
  },
  'string-art': {
    paragraphs: [
      'String art makes a picture from one long thread wound between nails on a board, and the program winds it greedily. The picture becomes a target T on a 240-pixel grid: T = (1 − L)^1.2 for a dark thread on a light board, or L^1.2 for a pale thread on black, so T is large where thread is wanted. The nails stand on a circle or on the edge of a rectangle. At each turn, from the nail where the thread now is, every other nail is tried (the two nearest nails on either side are skipped) and the mean target along the straight line to it is measured. The best nail is chosen, a path used before has its score halved, and the thread is wound there.',
      'Winding a line uses up some of the target, since that darkness is now covered: the strength slider s is subtracted from T along the line (never below 0). The winding stops when the chosen number of lines is reached or no line scores above 0.012. When the thread is drawn, the lines are blended by multiplying (dark thread) or adding (pale thread) with opacity a = 1.15 s (kept between 0.05 and 0.6), so the density builds up with overlap just as real threads do. In the picture-colour option each segment takes the colour of the picture at its midpoint.',
    ],
    equations: [
      { tex: T`j^{*}=\arg\max_{j}\ \frac{1}{\ell_{ij}}\sum_{\mathbf x\in\text{line}(i,\,j)}T(\mathbf x),\qquad T=\begin{cases}(1-L)^{1.2}&\text{dark thread}\\ L^{1.2}&\text{pale thread}\end{cases}`, note: 'The next nail j from the current nail i; ℓ is the length of the line in grid steps.' },
      { tex: T`T(\mathbf x)\leftarrow\max\big(0,\ T(\mathbf x)-s\big)\quad\text{along the chosen line}`, note: 'The target is used up by the thread laid down.' },
      { tex: T`\tau_k=(1-a)^{k}`, note: 'Light that survives k overlapping threads of opacity a, the reason overlapping threads build tone.' },
    ],
  },
  'lissajous-curves': {
    paragraphs: [
      'A Lissajous curve is the path of a point that swings horizontally with frequency a and vertically with frequency b: x = A sin(a t + φ), y = B sin(b t). When a and b are whole numbers the curve closes and forms loops and knots; the ratio a : b gives the number of lobes along each side, and the phase φ opens or closes the figure from a line to an ellipse. If a and b share a factor g, the curve repeats after 2π/g.',
      'Two layouts are offered. The knot is one large curve, drawn as 2,600 short segments, with the chosen number of ribbons: copies with the phase advanced by 0.22 radians each, nested like a twisted band. Each segment takes the colour of the picture at its midpoint, and its width follows the darkness, from half to twice the line width. The table is the classic Lissajous chart: a grid in which the cell in column i and row j holds the curve of frequencies (i + 1, j + 1). The cell’s curve is sized by the tone beneath it, R = 0.42 c (0.55 + 0.45 √(0.2 + h)), where c is the cell width and h the heaviness (darkness), and coloured by the picture.',
    ],
    equations: [
      { tex: T`x(t)=A\sin(a\,t+\varphi),\qquad y(t)=B\sin(b\,t),\qquad t\in[0,2\pi]`, note: 'The curve; A and B are 47% of the width and height in the knot layout.' },
      { tex: T`T=\frac{2\pi}{\gcd(a,\,b)}`, note: 'The period of the curve for whole-number frequencies.' },
      { tex: T`(a,\ b)_{ij}=(i+1,\ j+1),\qquad R_{ij}=0.42\,c\,\big(0.55+0.45\sqrt{0.2+h_{ij}}\big)`, note: 'The table: frequencies for the cell at column i, row j, and its size from the picture’s heaviness h.' },
    ],
  },
  metaballs: {
    paragraphs: [
      'Metaballs are blobs defined by a field, not by a surface. Each ball contributes a smooth field that falls to zero at a finite radius, f(r) = (1 − r²/R²)³ for r < R, with R = 2.6 times the ball’s radius. The fields of all the balls are added into one field F, and the body of the shape is wherever F is above a level. Where two balls are far apart each stands alone; as they come close the fields add up in between and the two bodies join with a smooth neck. The how-readily-they-merge slider moves the level between 0.95 (balls stay apart) and 0.28 (they melt together).',
      'Balls are placed by rejection sampling. A random point is accepted with probability 0.04 + 0.96 w^1.3, where w is the picture’s tone there (for light places), its complement (for dark places) or 1 (anywhere), and the ball’s radius also grows with w. The surface is lit by treating F as a height: its gradient gives a normal n = (−∂ₓF, −∂ᵧF, 0.22/(0.3 + level)), normalised, with a diffuse term from a light at upper left and a tight specular highlight (power 22). The colour of the ball is the picture’s own, multiplied by 0.45 to 1.15 with the light. The edge is antialiased with a smoothstep of ±0.03 around the level.',
    ],
    equations: [
      { tex: T`f(r)=\Big(1-\frac{r^{2}}{R^{2}}\Big)^{3}\ \ (r<R),\qquad F(\mathbf x)=\sum_i f_i\big(\lVert\mathbf x-\mathbf p_i\rVert\big)`, note: 'The kernel of one ball and the total field.' },
      { tex: T`\text{inside}=\operatorname{smoothstep}\big(\lambda-0.03,\ \lambda+0.03,\ F\big),\qquad \lambda=0.95-0.67\,g`, note: 'The body: g is the merge slider.' },
      { tex: T`\mathbf n=\frac{(-F_x,\ -F_y,\ \nu)}{\lVert(-F_x,\ -F_y,\ \nu)\rVert},\quad \nu=\frac{0.22}{0.3+\lambda},\qquad C=C_{\text{pic}}\,(0.45+0.7\,\mathbf n\cdot\mathbf l)+178\,G\,(\mathbf n\cdot\mathbf h)^{22}`, note: 'Shading from the field’s gradient; l and h are the light and highlight directions, G the gloss slider.' },
    ],
  },
  'warped-grid': {
    paragraphs: [
      'Two quite different drawings use the same idea, that a picture can be shown as the way it disturbs something regular. In the grid layout, a set of horizontal and vertical lines is pushed around by the picture’s gradient: each point is moved to x′ = x − k ∇L, where L is the lightness blurred over about 10 px and ∇L is taken by central differences. The strength k is the strength slider times 1,080 pixels (at 800 px wide). The lines crowd together on one side of every light-to-dark edge and spread on the other, as if the picture were a lens set in the page, and so the picture’s shapes appear without any of its colours being drawn. Each short piece of line takes its colour from the picture and its thickness (0.45 to 1.85 times the line width) from the tone.',
      'The ridges layout is the old stacked-lines portrait of the pulsar radio signal made famous by the cover of Unknown Pleasures. Horizontal lines are lifted by A v^1.4, where v is the tone (light or dark, your choice) and A is up to 5.2 line spacings, tapered to 35% at the left and right edges. The lines are drawn from the top down, and each one is filled underneath with the paper colour, so that it hides the lines behind it. That hidden-line removal is the painter’s algorithm: nearer things are painted over farther ones.',
    ],
    equations: [
      { tex: T`\mathbf x'=\mathbf x-k\,\nabla L(\mathbf x),\qquad k=1080\,\sigma\,\frac{W}{800},\qquad \partial_xL\approx\frac{L(x+2)-L(x-2)}{4}`, note: 'Grid mode: σ is the strength slider and L the blurred lightness.' },
      { tex: T`y_j(x)=y_j-A\,v(x)^{1.4}\,e(x),\qquad e(x)=0.35+0.65\,\operatorname{smoothstep}\!\Big(0,\ 0.12,\ \frac{\min(x,\,W-x)}{W}\Big)`, note: 'Ridges mode: A = 5.2 σ × the line spacing; e tapers the ridge toward the sides.' },
    ],
  },
  'wave-function-collapse': {
    paragraphs: [
      'Wave function collapse (Maxim Gumin, 2016) borrows its name and its picture of a superposition from quantum mechanics, but it is a constraint-solving algorithm. Here a tile is a square with a line leaving through any of its four sides (north, east, south, west), a 4-bit number, so there are 16 tiles. The single rule is that two neighbouring tiles must agree on the side they share: either both have a line through it or neither does. The edge of the sheet is closed, so no line leaves the picture. At the start every cell may be any of the 16 tiles, a set held as a 16-bit mask.',
      'The solver picks the cell with the fewest tiles still possible (its lowest entropy, with a little random noise of 0.4 to break ties) and collapses it: one of its remaining tiles is chosen by chance. The chances come from the picture. Each tile k has a weight exp(−(n_k − target)²/1.1), where n_k is the number of line ends on the tile and the target is higher in the heavy, dark parts of the picture and lower in the light, set by the density slider; the empty tile has its weight multiplied by 0.3. The choice is then propagated: neighbours lose the tiles that no longer agree, and so do their neighbours, until nothing more changes. A cell left with no possibility is drawn blank. The tiles are drawn as straight lines, rounded corner arcs or chamfered corners.',
    ],
    equations: [
      { tex: T`c^{*}=\arg\min_{c\ \text{uncollapsed}}\big(\,\lvert D_c\rvert+0.4\,u\,\big)`, note: 'The next cell to collapse: |D_c| is the number of tiles still possible there, u a random number in [0, 1].' },
      { tex: T`w_k=m_k\,\exp\!\Big(-\frac{(n_k-\tau)^{2}}{1.1}\Big),\qquad \tau=(1-\delta)\,1.6+\delta\,(0.3+3.2\,h)`, note: 'Chance weight of tile k: n_k its line ends, m_k = 0.3 for the empty tile and 1 otherwise, h the heaviness of the picture under the cell, δ the density slider.' },
      { tex: T`k'\ \text{allowed next to }k\ \text{on side }d\iff\big[k\ \&\ b_d\neq0\big]=\big[k'\ \&\ b_{d+2}\neq0\big]`, note: 'The adjacency rule on bits: the shared side must either have a line on both tiles or on neither (d + 2 is the opposite side).' },
    ],
  },
  'l-system-trees': {
    paragraphs: [
      'Aristid Lindenmayer introduced L-systems in 1968 as a grammar for the growth of plants: a string is rewritten again and again, and a drawing is made from the result. A branching tree is the rule “a branch becomes a branch with two branches on its end”, and the program draws it by recursion. A branch of length ℓ and width w is drawn, and then two children start from its end (and, with a 14% chance beyond the first two generations, three). The children turn by ± the spread angle times a random factor between 0.6 and 1.4, plus a share (0.35) of the wind angle and a little jitter, are the decay slider times a random 0.82 to 1.18 as long, and 0.72 times as wide. The number of generations is the depth of the recursion.',
      'A branch ends when the depth runs out or when its length falls below 3 px; there a leaf is placed, and a few leaves appear on the way (5%) near the tips. If the lengths shrink by a factor δ each generation, a tip cannot rise higher than the geometric sum ℓ₀/(1 − δ) above the root, which is why a tree stays inside the frame. All leaves are shuffled and drawn as translucent discs (82% opacity) with the colour of the picture at their position, so the tree’s crown becomes a loose, pointillist portrait. The first three generations (the trunk and main boughs) are drawn a little darker, and the faint picture behind is an option.',
    ],
    equations: [
      { tex: T`\ell_{k+1}=\delta\,u\,\ell_k\ (u\in[0.82,\,1.18]),\qquad w_{k+1}=0.72\,w_k,\qquad a_{k+1}=a_k\pm s\,(0.6+0.8\,u')+0.35\,\omega`, note: 'Length, width and direction of the children; δ the decay, s the spread, ω the wind.' },
      { tex: T`N\approx\sum_{k=0}^{g}2^{k}=2^{g+1}-1,\qquad H\le\frac{\ell_0}{1-\delta}`, note: 'The number of branches for g generations, and the bound on a tree’s height.' },
    ],
  },
  phyllotaxis: {
    paragraphs: [
      'In a sunflower the seeds are packed in spirals that run both ways, and the number of spirals is nearly always two neighbouring Fibonacci numbers, such as 34 and 55. Helmut Vogel showed in 1979 that this follows from one simple rule: seed number i is placed at the angle iα from the centre and at the distance c√(i + ½), where α is the golden angle, 2π/φ² ≈ 137.5°. The square root puts the seeds at equal density, since the area inside radius r_i is π r_i² = π c² (i + ½), which grows by the same amount for each seed.',
      'The golden angle is the most irrational of all angles, in the sense that its continued fraction [0; 2, 1, 1, 1, …] is the slowest to approximate by a fraction. No two seeds line up along a ray for long, and the spirals are only the near-alignments, which come at Fibonacci counts. The constant c is chosen so that the n seeds reach the corner of the picture: c = R/√n, with R half the diagonal. The turn between seeds slider lets you leave the golden angle and see the spiral give way to rays, which shows how special it is. Each seed is a disc, a square turned with its angle or an elliptical petal, with a size set by the spacing and by the picture’s tone, and it takes the picture’s colour.',
    ],
    equations: [
      { tex: T`\theta_i=i\,\alpha,\qquad r_i=c\sqrt{i+\tfrac12},\qquad \alpha=\frac{2\pi}{\varphi^{2}}\approx137.5^{\circ}`, note: 'Vogel’s model: seed i in polar coordinates.' },
      { tex: T`c=\frac{R}{\sqrt n},\qquad \bar d=c\sqrt{\pi}`, note: 'The scale that makes n seeds fill the radius R, and the mean spacing between seeds.' },
      { tex: T`\rho_i=\tfrac12\,\bar d\;\sigma\;1.35\,\big[\,(1-f)+f\,(0.15+h_i)\,\big]`, note: 'Seed radius: σ is the seed size slider, f the size-follows-picture slider, h_i the heaviness of the picture at the seed.' },
    ],
  },
  'hilbert-curve': {
    paragraphs: [
      'David Hilbert described in 1891 a curve that passes through every cell of a square grid and never crosses itself. The curve of order k covers a 2ᵏ × 2ᵏ grid in 4ᵏ steps. It is built by recursion: divide the square into four quarters, draw a curve of the next lower order in each (the two at the bottom turned by a quarter turn, one clockwise and one anti-clockwise), and join them end to end. The program does not recurse. It converts the step number d, two binary digits at a time, into a grid position: for s = 1, 2, 4, …, take rx = (t >> 1) & 1 and ry = (t xor rx) & 1, turn and flip the partial position if ry = 0, add s·rx and s·ry, and shift t by two bits.',
      'Neighbouring steps are always neighbouring cells, so the line is continuous. Its useful property is locality: points close along the curve are close in the plane (the converse is not always true). The line is drawn from cell centre to cell centre, with the width set by the weight slider and made to follow the picture’s heaviness, and each segment takes the colour of the picture at its midpoint. The total length of the line is (4ᵏ − 1) cells of width W/2ᵏ, almost 2ᵏ times the width of the picture, which is why high orders look like a dense engraving.',
    ],
    equations: [
      { tex: T`n=2^{k},\qquad \text{cells}=n^{2}=4^{k},\qquad \text{length}=\big(4^{k}-1\big)\frac{W}{2^{k}}\approx2^{k}\,W`, note: 'Grid, number of cells and the length of the line for order k.' },
      { tex: T`r_x=\big\lfloor t/2\big\rfloor\,\&\,1,\quad r_y=(t\oplus r_x)\,\&\,1,\quad (x,y)\leftarrow(x+s\,r_x,\ \ y+s\,r_y)`, note: 'One step of the conversion from the number along the curve to its place (after the rotation of the partial position when r_y = 0).' },
      { tex: T`w=c\,\lambda\,\big[(1-f)+f\,(0.2+1.1\,h)\big]`, note: 'Line width: c is the cell width, λ the weight slider, f the follow slider, h the heaviness beneath.' },
    ],
  },
  'cellular-automata': {
    paragraphs: [
      'A cellular automaton is a grid of cells, each alive or dead, that all update together by a rule that looks only at its eight neighbours. The rules here are of the “Life-like” kind: a dead cell becomes alive if its number of living neighbours is in the birth set B, and a living cell stays alive if the number is in the survival set S. Conway’s Life is B3/S23, HighLife B36/S23, Day and Night B3678/S34678, Coral B3/S45678 and Maze B3/S12345. The grid wraps at the edges, like the surface of a torus.',
      'The picture sets where life begins: each cell is alive at the start with probability clip(d (0.25 + 1.5 τ)), where d is the crowding slider and τ the picture’s tone (stretched to the full range), so the picture appears as a density of life, thicker in the light parts. The generations per second slider sets the speed (at most six generations per frame). Dead cells remember: the afterglow value h is 1 while a cell lives and then shrinks each frame by the afterglow factor, which draws fading ghosts behind the moving patterns. If the sheet becomes quiet, with less than 5% alive when the generation count is a multiple of 60, a scatter of new cells (12% × tone) is added. Pressing and dragging plants a 7 × 7 patch of random cells (55% of them alive).',
    ],
    equations: [
      { tex: T`s_{t+1}(i)=\begin{cases}[\,n_i\in S\,]&\text{if } s_t(i)=1\\[2pt] [\,n_i\in B\,]&\text{if } s_t(i)=0\end{cases},\qquad n_i=\sum_{j\in\text{8 neighbours}}s_t(j)`, note: 'The update rule; B and S are the birth and survival sets of the chosen rule.' },
      { tex: T`P(s_0=1)=\operatorname{clip}\big[\,d\,(0.25+1.5\,\tau)\,\big]`, note: 'Initial state, with the tone τ of the picture and the crowding d.' },
      { tex: T`h_{t+1}=\begin{cases}1&\text{alive}\\ \gamma\,h_t&\text{dead}\end{cases}`, note: 'The afterglow, with γ the afterglow slider.' },
    ],
  },
  physarum: {
    paragraphs: [
      'The slime mould Physarum polycephalum has no brain, and yet it finds short routes between food sources and builds networks that resemble railway maps. Jeff Jones (2010) modelled it with agents that follow one another’s scent. Each agent has a position and a heading. It senses the trail map at three points a distance d ahead: straight on, and 28 degrees to the left and to the right. If the middle reading is the highest it goes straight on. If both sides are higher than the middle it turns at random one way or the other by the turning angle. If one side is higher it turns toward that side. Then it steps one cell forward and deposits 0.3 units of chemical there.',
      'The trail map is a field in its own right. After every step it is blurred with the kernel (1 1 1 / 1 4 1 / 1 1 1) divided by 12, which spreads the scent a little, and multiplied by a decay factor, so old trails fade. What the agents sense is the trail plus 0.7 × the attraction slider × a food map, and the food map is the picture’s tone stretched to the full range (light or dark, your choice). The picture is the landscape of nutrients, and the mould builds its channels toward it. Two steps are made per frame, the agents are as many as a share of the grid cells, and pressing and dragging drops a burst of chemical, which agents follow.',
    ],
    equations: [
      { tex: T`S_{\pm}=T\big(\mathbf x+d\,(\cos(\alpha\pm\beta),\ \sin(\alpha\pm\beta))\big)+\kappa\,F,\qquad \beta=28^{\circ}`, note: 'The left and right sensor readings (and the centre one with β = 0); T is the trail, F the food map and κ = 0.7 × the attraction slider.' },
      { tex: T`\alpha'=\begin{cases}\alpha&S_0>S_{-},\,S_{+}\\ \alpha\pm\tau\ (\text{random sign})&S_0<S_{-},\,S_{+}\\ \alpha\pm\tau\ (\text{toward the larger})&\text{otherwise}\end{cases}`, note: 'The steering rule; τ is the sharpness of turns.' },
      { tex: T`T\ \leftarrow\ \delta\;\frac{\big(\begin{smallmatrix}1&1&1\\1&4&1\\1&1&1\end{smallmatrix}\big)\ast T}{12}`, note: 'Diffusion and decay of the trail map after each step; δ is the trail-length slider.' },
    ],
  },
  'differential-growth': {
    paragraphs: [
      'Many natural folds, from the cortex of a brain to a lettuce leaf or a coral, come from growth that is not matched to the space available. The program models it with a closed loop of points. Each point feels a spring to its two neighbours that pulls it to a rest length ℓ (the force is 0.22 times the stretch), a smoothing pull toward the midpoint of its neighbours (0.06), a repulsion from every other non-adjacent point closer than about 2.6 ℓ (of strength (1 − d/R)² × 0.5 ℓ), a push back from the picture’s margin, and a tiny random jitter. The step of a point is limited to half a rest length. A spatial hash keeps the repulsion search close to linear in the number of points.',
      'Growth is the insertion of points. Wherever an edge has stretched beyond 1.55 ℓ a point is added at its midpoint, and any edge longer than 0.7 ℓ may get one with a probability of 3.5% per round. The loop lengthens but has to fit in the same sheet, so it buckles, and the repulsion makes it fold rather than cross itself. The picture sets the rest length: ℓ is reduced where the picture is heavy (dark on light paper), down to 0.55 times, so shadows fold into finer, tighter detail and the lights stay open. Each edge is then drawn with a width (0.55 to 1.65 times the line width) and a colour from the picture. The run takes 180 to 540 rounds, or stops at 3,000 to 14,000 points.',
    ],
    equations: [
      { tex: T`\mathbf F_i=0.22\sum_{j\in\{i-1,\,i+1\}}\big(\lVert\mathbf p_j-\mathbf p_i\rVert-\ell_i\big)\,\hat{\mathbf e}_{ij}+0.06\Big(\tfrac{\mathbf p_{i-1}+\mathbf p_{i+1}}{2}-\mathbf p_i\Big)`, note: 'Springs to the two neighbours and the smoothing pull; ê is the unit vector from i to j.' },
      { tex: T`\mathbf F^{\text{rep}}_i=\sum_{j}\Big(1-\frac{d_{ij}}{R_{ij}}\Big)^{2}0.5\,\ell_i\,\hat{\mathbf e}_{ji},\qquad R_{ij}=1.3\,(\ell_i+\ell_j),\ \ d_{ij}<R_{ij}`, note: 'Repulsion from the other points that are not neighbours on the loop.' },
      { tex: T`\ell(\mathbf x)=\ell_0\big[(1-f)+f\,\big(0.55+1.0\,(1-h)\big)\big]`, note: 'The picture sets the rest length: h is the heaviness at x and f the tightness slider.' },
    ],
  },
  'strange-attractors': {
    paragraphs: [
      'A strange attractor is the shape drawn by a point that follows a simple rule forever: the point never repeats and never escapes, and nearby starting points move apart exponentially (the sign of chaos) while still staying on one fine, filamented set. Two such maps are used. Clifford’s is x′ = sin(a y) + c cos(a x), y′ = sin(b x) + d cos(b y); Peter de Jong’s is x′ = sin(a y) − cos(b x), y′ = sin(c x) − cos(d y). A small change in the four numbers a, b, c and d gives a completely different picture, and three sets that are known to make good pictures are provided for each map.',
      'Each frame 48 points are followed for 1,100 steps each, and every landing is added to a density histogram the size of half the picture. The histogram is dimmed by the linger factor on every frame, so the image is a running average that shows the attractor as a glowing cloud. Because |x′| and |y′| cannot be bigger than 1 + |c| and 1 + |d| for Clifford (and 2 for de Jong), the picture is scaled to fit those bounds exactly. The four numbers drift in time, each by a sine of its own speed and an amount set by the drift slider (up to 0.22), so the attractor breathes; the pointer adds up to ±0.3 to a and b. The brightness is a log-density tone map, and either a flame ramp or the picture’s own colours (each cell’s average) give the colour.',
    ],
    equations: [
      { tex: T`\begin{aligned}x'&=\sin(a\,y)+c\cos(a\,x)\\ y'&=\sin(b\,x)+d\cos(b\,y)\end{aligned}\qquad\qquad \begin{aligned}x'&=\sin(a\,y)-\cos(b\,x)\\ y'&=\sin(c\,x)-\cos(d\,y)\end{aligned}`, note: 'Clifford (left) and de Jong (right) maps.' },
      { tex: T`a(t)=a_0+0.22\,\delta\,\sin(\omega_a t+\phi_a)+0.6\,\big(p_x-\tfrac12\big),\qquad\text{similarly }b,\ c,\ d`, note: 'The drifting parameters: δ is the drift slider, p the pointer position (the pointer acts on a and b only).' },
      { tex: T`v=\operatorname{clip}\Big[\Big(\frac{\ln(1+n)}{\ln(1+n_{\max}/2)}\Big)^{1.2}G\Big]`, note: 'The log-density tone map: n is the number of landings in a cell and G the glow slider.' },
    ],
  },
  'fourier-epicycles': {
    paragraphs: [
      'Any closed curve can be built from circles. Write the curve as a complex number z(t) and the Fourier series says z(t) = Σ c_k e^(2πikt), where each term is a circle of radius |c_k| turning k times per cycle (backwards for negative k), and each rides on the rim of the one before it. This is the old idea of epicycles, which Ptolemy used for the planets, made exact. The program finds an outline in your picture by marching squares on a lightly blurred, half-size copy at a level chosen by the slider, preferring a long closed contour (an open one is traced there and back, so it closes). It resamples the outline at 1,024 points of equal arc length and computes all 1,024 coefficients by a direct discrete Fourier transform, once.',
      'The coefficients are sorted by size, and the circles slider keeps the largest ones. The sum of the squares of the coefficients left out is exactly the mean-square error of the drawing (Parseval’s identity), so every extra circle adds detail in order of importance; with a handful the outline is a smooth blob, with a few hundred it is a drawing. The positions of the pen tip are worked out for 1,400 moments of the cycle, and the visible trail is the most recent part of them (the trail length slider), fading with age. With show the circles on, the chain of turning circles and their spokes is drawn from the biggest to the smallest. The period slider is the number of seconds for one full drawing.',
    ],
    equations: [
      { tex: T`z(t)=\sum_{k}c_k\,e^{\,2\pi i\,k\,t},\qquad c_k=\frac{1}{M}\sum_{m=0}^{M-1}z_m\,e^{-2\pi i\,k\,m/M},\quad M=1024`, note: 'The series and its discrete coefficients; the circle k has radius |c_k| and turns k times per cycle.' },
      { tex: T`\varepsilon^{2}=\frac1M\sum_{m}\big\lvert z_m-\hat z_m\big\rvert^{2}=\sum_{k\notin K}\lvert c_k\rvert^{2}`, note: 'Parseval: the squared error of a drawing with the set K of kept circles.' },
    ],
  },
  'contour-lines': {
    paragraphs: [
      'A contour line joins the points of a landscape that have the same height. The program reads the picture’s lightness as height, F(x, y), after smoothing it by the slider’s radius, and draws the lines F = k/n for k = 1, …, n − 1, where n is the number of heights. To find a line it uses marching squares: the picture is covered by little cells (about 1.5 px wide), and the cells whose corners are partly above and partly below the level are crossed by the line. Its position on a side comes from linear interpolation, t = (level − F_a)/(F_b − F_a). The pieces are chained into long polylines and drawn as smooth quadratic curves. Where the picture changes quickly the lines crowd together, since their spacing is about 1/(n |∇F|), as on a map where the hill is steep.',
      'Mapmakers draw every fifth or so line heavier (an index contour) and tint the bands between. Both are here: the heavier line is 1.9 times as thick, set by the heavier-line-every slider. The tint is a hypsometric ramp from green through ochre and brown to snow-white, evaluated at the middle of each band, or the picture’s own colours flattened to the band by scaling each colour by (0.55 + 0.6 b)/(0.55 + 0.6 F). Lines can be ink, brown like old maps, or the colour of the picture darkened.',
    ],
    equations: [
      { tex: T`C_k=\Big\{\mathbf x:\ F(\mathbf x)=\tfrac{k}{n}\Big\},\qquad \Delta s\approx\frac{1}{n\,\lVert\nabla F\rVert}`, note: 'The contour of height k/n and the spacing between neighbouring lines.' },
      { tex: T`t=\frac{\lambda-F_a}{F_b-F_a}`, note: 'Where a contour crosses a cell side between corner values F_a and F_b, for the level λ (marching squares).' },
      { tex: T`b=\frac{\lfloor nF\rfloor+\tfrac12}{n}`, note: 'The band value that picks the tint between two lines.' },
    ],
  },
  'poisson-stippling': {
    paragraphs: [
      'Stippling makes tone from dots. Placing them at random leaves clumps and gaps that look wrong, whereas placing them on a grid shows the grid. Poisson-disk sampling is in between: dots are random, but no two are closer than a minimum distance. Here the minimum distance is not fixed but follows the picture: r(x) = r_max − (r_max − r_min) h^γ, where h is the heaviness (darkness on light paper) and γ the contrast slider. Random points are tried (up to 4.5 times the area divided by r_min², at most 900,000), and a point is kept if its distance to every dot already kept is at least the mean of the two radii, (r_p + r_q)/2. A grid of cells r_max wide means only the nine nearest cells are searched.',
      'The result is blue noise: even in texture, with no long-range pattern. Because each dot excludes a disc of about r around it, the number of dots per unit area goes roughly as 1/r², so the density rises quickly as the spacing shrinks, and the shadows are dark. The dots are also larger in the shadows, by up to 1.95 times (1 + 0.95 h²), and their colour is black, sepia, cream on night paper or the picture’s own, darkened.',
    ],
    equations: [
      { tex: T`r(\mathbf x)=r_{\max}-\big(r_{\max}-r_{\min}\big)\,h(\mathbf x)^{\gamma}`, note: 'The local minimum spacing; h is the heaviness of the picture at x.' },
      { tex: T`\text{keep }\mathbf p\ \Longleftrightarrow\ \lVert\mathbf p-\mathbf q\rVert\ \ge\ \tfrac12\big(r(\mathbf p)+r(\mathbf q)\big)\quad\text{for every kept }\mathbf q`, note: 'The acceptance rule of the dart throwing.' },
      { tex: T`\rho(\mathbf x)\propto\frac{1}{r(\mathbf x)^{2}},\qquad \rho_{\text{dot}}=r_p\,k\,\big(1+0.95\,h^{2}\big)`, note: 'Approximate density of dots, and the drawn dot radius (k is the dot size slider).' },
    ],
  },
  'space-colonization': {
    paragraphs: [
      'In 2007 Adam Runions and colleagues described how veins in a leaf and branches in a tree can be grown by competition for space. Scatter a cloud of attractors (the food), thick where you want growth. Start a few nodes at the roots. Each round, every attractor finds the nearest node within a sensing distance (the reach slider, a share of the picture’s width), and every node with at least one attractor in its care grows a new node: a step D away in the direction of the sum of the unit vectors to its attractors, with a tiny jitter. Any attractor that comes within 2.4 D of a node is eaten. The loop ends when no attractor is influencing anything, after 900 rounds, or at 40,000 nodes.',
      'The picture decides where the food is: an attractor is kept with probability (1 − f) + f (0.03 + 0.97 h^1.4), where h is the heaviness of the picture there, so branches grow toward the dark parts and the picture appears as the density of the network. The roots can be along the bottom, in the middle (a vein network) or all around the edge. For thickness the program counts the descendants of each node, and draws a branch with a width proportional to the square root of that count: the cross-section area then adds up at every junction, which is Leonardo da Vinci’s rule for tree branches. Each segment takes the picture’s colour.',
    ],
    equations: [
      { tex: T`\mathbf n_v=\sum_{a\in S(v)}\frac{\mathbf a-\mathbf v}{\lVert\mathbf a-\mathbf v\rVert},\qquad \mathbf v_{\text{new}}=\mathbf v+D\,\frac{\mathbf n_v}{\lVert\mathbf n_v\rVert}`, note: 'Growth of node v toward the attractors S(v) that it is nearest to (within the sensing distance).' },
      { tex: T`\text{eat }\mathbf a\ \text{ if }\ \min_v\lVert\mathbf a-\mathbf v\rVert<2.4\,D`, note: 'The kill distance.' },
      { tex: T`w_i=1.5\,w_0\sqrt{\frac{c_i}{c_{\max}}},\qquad c_i=1+\sum_{j\in\text{children}(i)}c_j`, note: 'Branch width from the number c of nodes it feeds, so that areas add up at junctions.' },
    ],
  },
  boids: {
    paragraphs: [
      'Craig Reynolds showed in 1986 that the flocking of birds needs no leader, only three rules that each bird applies to its neighbours: separation (steer away from those too close), alignment (steer toward their average heading) and cohesion (steer toward their average position). The program applies them to birds that see the neighbours within 46 px (at 720 px wide), found through a hash grid. Alignment has strength 1.6 times the flocking slider, cohesion 1.2 times it, and separation is a push away from anything within 0.38 of the sensing distance, growing to 220 as it nears. A little random force is added, and the speed is clamped between 0.45 and 1 times the top speed. The world wraps round like a torus.',
      'Two forces come from the picture and from you. The pull toward light is the gradient of the picture’s normalised lightness (a Sobel gradient), times the pull slider, so birds climb toward the bright parts. The pointer attracts birds within 40% of the picture’s width, and repels them while pressed. Most of all, each bird paints. On every step it draws a line from its last position to its new one on a persistent canvas, in the colour of the picture beneath it, and the flock slowly paints the picture. The comet look fades that canvas by 14% each step so only trails remain, and shows the birds as small arrowheads. The painting is done inside the step, so the first-frame thumbnail has paint on it.',
    ],
    equations: [
      { tex: T`\mathbf f_i=1.6\,\Phi\,(\bar{\mathbf v}-\mathbf v_i)+1.2\,\Phi\,(\bar{\mathbf x}-\mathbf x_i)+220\sum_{j:\,d_{ij}<0.38\,\rho}\Big(1-\frac{d_{ij}}{0.38\,\rho}\Big)\frac{\mathbf x_i-\mathbf x_j}{d_{ij}}`, note: 'Alignment, cohesion and separation; Φ is the flocking slider, ρ the sensing distance, and the bars are averages over neighbours.' },
      { tex: T`\mathbf f_i\mathrel{+}=\sigma\,\nabla L(\mathbf x_i)+\text{noise},\qquad \mathbf v_i\leftarrow\mathbf v_i\,\frac{\operatorname{clip}\big(\lVert\mathbf v_i\rVert,\ 0.45\,v_{\max},\ v_{\max}\big)}{\lVert\mathbf v_i\rVert}`, note: 'The pull toward light (σ the pull slider) and the speed limit.' },
    ],
  },
  'domain-warp': {
    paragraphs: [
      'Domain warping is a technique popularised by Inigo Quilez: rather than computing a value f(p) of noise, compute it at a point that noise has moved, f(p + h(p)). Here the idea is turned toward a picture. Each pixel asks the picture for its colour not at its own place but at a displaced one, x + d(x), and the displacement d is made from fractal noise. With one layer d is the noise q = (fbm(p), fbm(p + c₁)). With two layers the noise is evaluated again at a point that q has moved, r = (fbm(p + 4q + c₂), fbm(p + 4q + c₃)). With three layers the process is repeated once more. Each warp feeds into the next, which gives the folded, marbled flow. The fractal noise fbm is a normalised sum of three octaves with amplitudes ½, ¼, ⅛.',
      'To keep the animation fast the field is computed on a coarse lattice of 5 px cells, at half the size of the picture, and interpolated bilinearly. Time slowly shifts the offsets c in different directions, so the folds drift, and the pointer smoothly moves the noise’s origin, so you can steer the pattern. A lookup that would leave the picture is mirrored back in, so it never runs out. The shading adds a little light and dark following the noise value itself, k = 1 + s (f − ½) × 0.9, which makes the folds look like dyed marbling.',
    ],
    equations: [
      { tex: T`\mathbf q=\big(\operatorname{fbm}(\mathbf p),\ \operatorname{fbm}(\mathbf p+\mathbf c_1)\big),\qquad \mathbf r=\big(\operatorname{fbm}(\mathbf p+4\mathbf q+\mathbf c_2),\ \operatorname{fbm}(\mathbf p+4\mathbf q+\mathbf c_3)\big)`, note: 'Two layers of warping; a third repeats the step with r in place of q.' },
      { tex: T`C(\mathbf x)=k\;I\Big(\mathbf x+2A\,\big(\mathbf w-\tfrac12\big)\,W_h\Big),\qquad k=1+0.9\,s\,\big(f-\tfrac12\big)`, note: 'The warped lookup: w is the last layer’s noise, A = 0.34 × the amount slider, W_h the width of the working picture, f the noise value that shades the folds and s the shading slider.' },
    ],
  },
};
