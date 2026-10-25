// src/data/theory-world.js
// Theory entries for the treatments of section K, World cultural.
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_WORLD = {
  'ukiyo-e': {
    paragraphs: [
      'A woodblock print is made one colour at a time. The carver cuts a block of cherry wood for the black key line and one more block for every colour, and the printer presses damp paper onto each block in turn, lining the sheet up against two small notches in the bench. Because each block can only lay down a flat colour, the picture has to be reduced to a few areas of solid colour before anything else is done. Here the picture is blurred (radius 0.9 × the simplify slider) and its saturation is raised a little, then every pixel is matched to the nearest of eight pigments an Edo printer would have had: Prussian blue, vermilion, ochre, sage, pink, grey-brown, paper and sumi ink. A majority filter over a 5 × 5 neighbourhood, run twice, removes the specks that a knife could never cut.',
      'The key line is drawn where the colour index changes and wherever the gradient of the lightly blurred brightness is steep. Bokashi, the graded wash a printer wipes onto the block with a damp cloth, is a blend toward Prussian blue over the top 38% of the sheet and toward pink over the bottom 18%. The wood grain shows through the pigment as long streaks (noise stretched about 87 times further along x than along y) and darkens it by up to about 20%. Misregistration is the tell of a real print: the colour layer is read from a position shifted by a pixel or two while the key line stays where it is.',
    ],
    equations: [
      { tex: T`k(\mathbf x)=\arg\min_j\ d\big(\mathbf c'(\mathbf x),\,\mathbf p_j\big),\qquad s'=1.15\,s+0.04`, note: 'Each pixel takes the index of the nearest pigment p_j to its blurred colour c′ (saturation s raised to s′), using a redmean-weighted colour distance.' },
      { tex: T`k'(\mathbf x)=\arg\max_j\ \big|\{\mathbf y\in N(\mathbf x):\ k(\mathbf y)=j\}\big|`, note: 'The majority filter: the most common index among the neighbours N(x) wins.' },
      { tex: T`\lambda=\max\!\Big(e_{\text{idx}}\,\big(0.5+0.5\,w\big),\ w\,\operatorname{smoothstep}\big(\tau,\,2.1\tau,\,\lVert\nabla L\rVert\big)\Big),\qquad \tau=0.24-0.17\,w`, note: 'The key line: e_idx is 1 on a boundary between colours, ‖∇L‖ the gradient of the lightly blurred brightness and w the key line slider (0 to 1). The ink is mixed in with strength λ, at most 0.95.' },
      { tex: T`t_{\text{top}}=b\Big(1-\tfrac{y}{0.38H}\Big)_+^{1.5}\big(0.5+0.2\,n\big),\qquad C\leftarrow(1-t)\,C+t\,C_{\text{blue}}`, note: 'Bokashi at the top: b is the slider and n a slow noise that makes the edge of the fade uneven.' },
    ],
  },
  'papel-picado': {
    paragraphs: [
      'Papel picado, “punched paper”, is made by stacking fifty or so sheets of tissue and tapping steel chisels through them with a mallet. The banners are strung across streets and altars for fiestas and for the Day of the Dead. In the program each banner is a rectangle of width w and height 1.18 w with a zigzag lower edge (seven teeth, depth 0.07 h) and a fold at the top where the string runs. Rows of banners hang from straight lines, alternate rows are shifted by half a banner, and each one is tilted by a few hundredths of a radian.',
      'The cuts are made by painting in destination-out mode, so they remove paper and show whatever is behind. A border of small holes runs inside the edge, and the middle is a 7 × 7 lattice of cells. At the centre of each cell the program reads the blurred brightness t of your picture and sets the hole radius from it, so bright places get wide holes and dark places get pin-pricks. The tissue is thin, so a share of the picture is also painted over the paper itself, and a soft shadow falls behind the whole sheet.',
    ],
    equations: [
      { tex: T`r=\frac{c}{2}\,\big(0.1+0.95\,t^{0.85}\big)\,\big(0.5+h\big),\qquad r\le 0.62\,c`, note: 'Hole radius in a lattice cell of side c: t is the picture’s brightness there and h the hole size slider (0.3 to 1). Holes under 0.9 px are skipped.' },
      { tex: T`\phi\approx\frac{\pi r^2}{c^2}=\frac{\pi}{4}\,\big(0.1+0.95\,t^{0.85}\big)^2\,(0.5+h)^2`, note: 'The fraction of each cell that is open, for round holes. It is how much of the picture shows through.' },
      { tex: T`C=(1-\alpha)\,C_{\text{paper}}+\alpha\,C_{\text{picture}},\qquad \alpha=0.55\,\sigma`, note: 'The tissue is a little see-through: σ is the see-through slider.' },
    ],
  },
  'chinese-paper-cut': {
    paragraphs: [
      'Jianzhi is cut from a single sheet, with scissors or a small knife, and red is the colour of luck. Everything must stay joined to the rest of the sheet, so fine detail is made from slits, crescents and teeth rather than from loose islands. The program works from darkness v = 1 − L, where L is the blurred brightness. Where v is below a lower threshold T₀ the paper is cut away. Above it, a cut amount k rises smoothly as the picture gets lighter, and k decides how wide each slit or how big each crescent is. Dark areas therefore stay solid, midtones turn to lace and light areas open out completely.',
      'The four cut patterns are written as simple conditions on the pixel position, with q the pattern size. In every one, k = 0 cuts nothing and a larger k cuts more, so the open fraction follows the picture. The edge of the sheet is a frame: a solid rim, then a band of diamond-shaped holes with small round holes between them, and a flower of eight cut petals in each corner. The paper layer is blurred by one pixel and thresholded to give clean edges, textured with fine fibres and dropped onto a cream backing with a shadow.',
    ],
    equations: [
      { tex: T`k=\operatorname{smoothstep}\big(T_1+0.3,\ T_0,\ v\big),\qquad T_1=\tfrac{p}{100},\ \ T_0=T_1-\tfrac{f}{100}`, note: 'The cut amount: p is the “paper left” slider and f the fine cutting range. Below T₀ everything is cut.' },
      { tex: T`\Big|\operatorname{frac}\!\Big(\tfrac{x+y+\frac{q}{2}\sin\frac{x}{1.8q}}{q}\Big)-\tfrac12\Big|<\tfrac{k}{2}`, note: 'A slit: diagonal stripes with a slight wobble. A stripe of width k leaves exactly a fraction 1 − k of the paper.' },
      { tex: T`\operatorname{frac}\!\big(\tfrac{y}{q}\big)<0.92\,k\,(1-\tau_w),\qquad \tau_w=2\Big|\operatorname{frac}\!\big(\tfrac{x}{q}+\tfrac{\lfloor y/q\rfloor}{2}\big)-\tfrac12\Big|`, note: 'Teeth: rows of triangles whose height grows with k.' },
    ],
  },
  'aboriginal-dot-painting': {
    paragraphs: [
      'The acrylic dot paintings of the Western Desert began at Papunya in 1971, when men of several language groups began to paint on boards and canvas the designs that belonged to their Country and its stories. Dots were used in part to cover the sacred meaning of a design from people who were not meant to read it. This treatment borrows only the visual technique, rows of dots in earth colours on dark ground, and cannot carry what a real work carries, so please read it as a tribute and not as a copy.',
      'To build the rings the picture’s brightness is blurred heavily to a smooth field F. Marching squares finds the contour lines where F crosses each of n evenly spaced levels, the segments are chained into curves, and dots of radius R are placed along each curve every 2.3 R of arc length, with a little jitter. Each dot is a disc with a small highlight and a small shadow so it reads as a blob of paint. Because the contours of a smooth field crowd together where it changes quickly, dots bunch up along the edges of your picture and thin out across flat areas. Fine dots on a staggered lattice fill the ground between the rings.',
    ],
    equations: [
      { tex: T`\{\mathbf x:\ F(\mathbf x)=\ell_i\},\qquad \ell_i=0.07+0.86\,\frac{i+\tfrac12}{n}`, note: 'The ring i is the contour of the blurred brightness F at level ℓᵢ.' },
      { tex: T`\Delta=2.3\,R,\qquad N\approx\frac{\Lambda}{\Delta}`, note: 'Dots sit Δ apart along a contour of length Λ, so a longer ring simply holds more of them.' },
      { tex: T`\delta x\approx\frac{0.86}{n\,\lVert\nabla F\rVert}`, note: 'The spacing between neighbouring rings: it shrinks where the gradient of F is large, which is why dots crowd at edges.' },
      { tex: T`j=\min\big(5,\ \lfloor 6\,\ell\rfloor\big)`, note: 'Dot colour by light level: ℓ picks one of six ochres from deep red up to cream.' },
    ],
  },
  batik: {
    paragraphs: [
      'Batik is a way of keeping dye out of cloth. Hot wax is drawn on with a canting, a small copper cup with a spout, and where the wax lies the cloth stays the colour it was. Dyeing then proceeds from light to dark, with more wax added between baths. Java’s courts developed strict patterns in soga brown and indigo, and the coast favoured brighter colours. The program matches your picture to a cream (the undyed cloth) and six dyes, cleans the regions with a majority filter, and then adds what the wax-worker does by hand.',
      'Outlines are cream, the wax-resist line, and there are two zones around every boundary: a thin continuous line and a wider zone that holds a lattice of dots, as canting dots do. Each dye region is filled with its own small mark (dots, dashes, crosses, rings, waves or triangles, chosen by the dye), a filling called isen-isen. Finally the wax cracks. Cracks are found with a Worley cellular noise: the difference between the distances to the nearest and second nearest seed points is small along cell borders, and where it is below the vein width the dye is let in.',
    ],
    equations: [
      { tex: T`g=F_2(\mathbf x)-F_1(\mathbf x),\qquad \text{vein where } g<w=(0.7+1.2\,c)\,\mathrm{sc}`, note: 'Crackle: F₁ and F₂ are the distances to the nearest and second nearest seed. g is zero on the boundary between two cells.' },
      { tex: T`q=0.8\Big(1-\frac{g}{w}\Big),\qquad C\leftarrow C+q\,(C_{\text{dark}}-C)`, note: 'Dye creeping in: darkest in the middle of the crack and fading to nothing at its edge. It only applies where slow noise exceeds 0.62 − 0.4c.' },
      { tex: T`\Big\lVert\operatorname{frac}\!\big(\tfrac{\mathbf x}{q}\big)-\tfrac12\Big\rVert<0.17`, note: 'The simplest isen-isen mark: a dot in every square of side q. The others are similar conditions on the same coordinates.' },
    ],
  },
  kente: {
    paragraphs: [
      'Kente is woven by the Asante and the Ewe of Ghana on a narrow loom that makes a band only a hand’s breadth wide. The long bands are cut and sewn edge to edge, and a large cloth uses a couple of dozen of them. In a warp-faced band the lengthwise threads hide the weft completely, so the colour you see is the colour of the warp, and where the weaver wants a pattern a block of weft is floated across on the surface instead. The program follows that structure. Each strip is four cells wide, the cells are as tall as 1.2 of their width, and odd strips are offset by half a cell so that the blocks do not line up across seams.',
      'Every cell takes the nearest of seven cloth colours (gold, red, green, black, blue, white, orange) to your picture’s colour. Inside a strip, blocks of three units in height (a unit is half the strip width) are either warp-faced, drawn as vertical threads with an accent thread on every sixth one, or weft-float blocks that carry a small diamond, zigzag, check or cross motif in the strip’s accent colour. Threads are shaded across their width so each looks like a rounded yarn, and the seam between strips is a dark line at half brightness.',
    ],
    equations: [
      { tex: T`y'=y+\tfrac{h_c}{2}\,(s\bmod 2),\qquad h_c=1.2\,\tfrac{w_s}{4}`, note: 'Odd strips s are offset by half a cell height h_c; w_s is the strip width.' },
      { tex: T`P(\text{weft block})=0.75\,m,\qquad f=1-0.3\,\rho\,\big(1-\sin\pi u\big)`, note: 'The chance that a block is a float motif (m is the slider), and the rounded-thread shading: u runs 0 to 1 across one thread and ρ is the thread relief slider. The coefficient is 0.3 for floats and 0.32 for warp threads.' },
      { tex: T`k=\arg\min_j\ d\big(\mathbf c',\mathbf p_j\big),\qquad \mathbf c'=\operatorname{boost}\big(\bar{\mathbf c}\big)`, note: 'The cell colour: the blurred picture colour with saturation raised by 1.5, matched to the cloth palette.' },
    ],
  },
  adinkra: {
    paragraphs: [
      'Adinkra cloth comes from the Akan peoples of Ghana and Côte d’Ivoire. Symbols are carved into pieces of calabash and stamped onto cotton with a dark dye boiled from tree bark. The cloth was first worn at funerals, and the word is often given as meaning “goodbye”. Each symbol carries a saying: the heart of patience and tolerance, the fern of endurance, the ram’s horns of strength and humility. The program carries ten of them (rings, heart, sankofa, horns, star, fern, twist, comb, handcuffs and tree), drawn with strokes and fills and cut with small details.',
      'The cloth is divided into squares by three-line rules made with a comb, as on the real cloth. In each square the program reads the shade v of your picture, which is its darkness on light cloth and its brightness on dark cloth, and stamps a symbol whose size grows with v. Very light squares are left bare. Since a stamp’s area grows as the square of its size, the ink on the cloth rises quickly with darkness, which gives the picture its depth. The ink is never even: its opacity is multiplied by a fine noise, so some of it is thin or missing, as with a real stamp.',
    ],
    equations: [
      { tex: T`u=0.45\,s\,\big(1-f+f\,(0.3+0.7\,v)\big),\qquad \text{stamp only if } v\ge 0.12`, note: 'Half the stamp size: s is the square size and f the size-follows-shade slider.' },
      { tex: T`\rho_{\text{ink}}\propto\frac{u^2}{s^2}\propto\big(0.3+0.7\,v\big)^2`, note: 'The share of a square covered by ink, for filled symbols.' },
      { tex: T`a=\operatorname{clamp}\big(0.55+0.9\,n(\mathbf x),\,0,\,1\big)`, note: 'Uneven inking: the alpha of the stamped layer is scaled by a noise n of wavelength about 5 px.' },
      { tex: T`C_{\text{cloth}}\leftarrow C_{\text{cloth}}\,\big((1-\beta)+\beta\,C_{\text{picture}}\big)`, note: 'A multiply blend with strength β = 0.7 × the tint slider, which dyes light cloth with the picture. Indigo and red cloth use a screen blend at 0.35 instead.' },
    ],
  },
  mudcloth: {
    paragraphs: [
      'Bogolanfini, “mud cloth”, is made by the Bamana of Mali. Cotton woven in narrow strips is soaked in a tea of leaves rich in tannin, designs are painted on with mud that has been fermented in a jar for months, and the iron in the mud reacts with the tannin to give a deep black that does not wash out. The background is then bleached, which leaves the black motifs on pale cloth. The strips are sewn together side by side, and the seams show.',
      'Here the picture sets a level from 0 to 4, rising with darkness, and a majority filter keeps regions clean. Each level has its own motif: bare cloth, dots, zigzag rows, crosses, and solid mud pricked with small holes. Where two levels meet, the pattern is cleared within about 3.4 px of the boundary and a mud line about 1 px either side of it is drawn, like the outlines a painter draws first. The pattern coordinates are bent by a smooth noise (up to about 2.5 px) to give the unsteadiness of a hand, and the mud is thinner at its edges. Every 96 px a seam of stitches divides a strip from the next.',
    ],
    equations: [
      { tex: T`\ell=\min\big(4,\ \lfloor 5\,v\rfloor\big),\qquad v=1-L\ \ (\text{or } L \text{ if inverted})`, note: 'The level from the blurred brightness L.' },
      { tex: T`\bar m_\ell\approx\{\,0,\ 0.07,\ 0.26,\ 0.41,\ 0.955\,\}`, note: 'The share of cloth the motif of each level covers: nothing; dots of radius 0.15 q; a band 0.26 q wide; a cross with arms 0.3 q × 0.84 q; and solid mud with holes of radius 0.12 q.' },
      { tex: T`m_2:\ \Big|\operatorname{frac}\!\Big(\tfrac{y+\frac{q}{2}\tau}{q}\Big)-\tfrac12\Big|<0.13,\qquad \tau=2\,\Big|\operatorname{frac}\tfrac{x}{q}-\tfrac12\Big|`, note: 'The zigzag motif: a band bent by the triangle wave τ.' },
    ],
  },
  azulejo: {
    paragraphs: [
      'The word comes from the Arabic for “small polished stone”. Spain and Portugal took up painted tiles in the sixteenth century, and in Portugal blue and white came to cover churches, stations and the fronts of houses. The painter works with cobalt oxide on an unfired glaze of tin that is white and opaque. The cobalt sinks in as the tile is fired and cannot be changed, so the thickness of the paint sets how dark the blue is. The program mimics that. The picture is blurred twice and mapped to a four-stop ramp from deep cobalt through a mid blue and a pale wash to white glaze, with a streak of noise that stands in for the brush.',
      'Tiles are laid on a grid with a thin grout line and a small bevel that is lit from the top left. A pattern is painted on every tile in which the corner of one tile holds a quarter of a rosette, so four tiles together make a whole flower, and a small flower sits in the middle of each. The pattern is blended in the dark pigment on the light parts of the picture and in white glaze on the dark parts, so it is never lost. Edge detection adds a fine brush outline, and a Worley crackle gives the glaze its hairline cracks.',
    ],
    equations: [
      { tex: T`a=\min(u,1-u),\quad b=\min(v,1-v),\quad \rho=\sqrt{a^2+b^2},\quad \theta=\operatorname{atan2}(b,a)`, note: 'Distances from the nearest tile corner, in tile units (u and v run 0 to 1 across the tile).' },
      { tex: T`\text{petal if } \rho<0.3\,\big(0.56+0.44\,|\cos 4\theta|\big),\qquad \text{ring if } |\rho-0.4|<0.014`, note: 'The quarter rosette. |cos 4θ| has eight lobes round a full circle, so four tiles meeting make eight petals.' },
      { tex: T`C\leftarrow C+q\,(P-C),\qquad q=0.15+0.8\,p,\quad P=\begin{cases}\text{cobalt}&\text{wash}>\tfrac12\\ \text{glaze}&\text{otherwise}\end{cases}`, note: 'The painted pattern: p is the slider, and P the pigment chosen so it always contrasts with the wash beneath.' },
    ],
  },
  'delft-blue': {
    paragraphs: [
      'Delftware was the Dutch answer to Chinese porcelain in the seventeenth century. It is earthenware coated with white tin glaze and painted in cobalt before the glaze is fired. The painter’s brush follows the form of the thing being drawn, and darker passages are built up by going over them more than once. The program does the same. It blurs your picture heavily to a smooth brightness field F, finds at every point the direction along which F does not change, which is perpendicular to its gradient, and lays strokes along those lines so they curve round shapes.',
      'Seeds are scattered on a jittered grid and shuffled. In each of the layers a seed paints only if the brightness there is below a threshold that falls from 0.70 by 0.17 for each layer, so a dark place is painted over several times and a light place once or not at all. A stroke follows the field in both directions for the chosen length, flipping the field’s sign when needed so that it keeps going the same way. The plate has a painted rim of ticks and dots between rings, a soft highlight on the glaze, and a net of cracks from Worley noise, 16 px across, bent slightly so that the lines are not straight.',
    ],
    equations: [
      { tex: T`\mathbf t=\frac{\big(-\partial_y F,\ \partial_x F\big)}{\lVert\nabla F\rVert},\qquad \mathbf x_{n+1}=\mathbf x_n+\Delta\,\mathbf t(\mathbf x_n)`, note: 'A stroke follows the isophote, the line of equal brightness. Δ is 2.6 px and the sign of t is chosen to agree with the previous step. Where the gradient is nearly zero a fixed angle of about 0.7 radians takes over.' },
      { tex: T`\text{paint if } T(\mathbf x_0)\le\theta_\ell+0.08\,(\xi-\tfrac12),\qquad \theta_\ell=0.70-0.17\,\ell`, note: 'Layer ℓ threshold, tested on T, a lightly blurred brightness (the heavy blur F only steers the strokes). ξ is a random number per seed, so the limit is a little ragged.' },
      { tex: T`\alpha=0.2+0.5\,\frac{\theta_\ell-T}{\theta_\ell},\qquad w=w_0\,\big(0.7+0.5\,(1-T)\big)`, note: 'The darker the place, the more opaque and the wider the stroke.' },
    ],
  },
  talavera: {
    paragraphs: [
      'Talavera de Puebla is tin-glazed earthenware with a protected name. It descends from Spanish majolica, and its palette of cobalt, yellow, green and orange is limited by what survives the kiln. The tiles are painted by hand, so no two are quite alike: the motif is a little off-centre, a little tilted, and the line wavers. The program makes a tile for every cell of a grid and chooses the ground by brightness, from cobalt in the shadows through green, orange and yellow to white glaze in the lights.',
      'Two accent colours are painted on each ground, chosen to contrast: yellow and white on cobalt, for example, and cobalt with orange on white. Which of the two leads is decided by the warmth of the picture at that tile (red above blue means warm), so the hues of your picture reach the tile in a small way. A tile carries either an eight-petal flower with four leaves in its corners, or two eight-pointed stars with four round bosses. A thin painted border runs inside the edge, and a glaze shine covers the lot.',
    ],
    equations: [
      { tex: T`g=\min\big(4,\ \lfloor 5\,t\rfloor\big)\ \in\ \{\text{cobalt, green, orange, yellow, glaze}\}`, note: 'The ground of a tile from its blurred brightness t.' },
      { tex: T`\mathbf v_k=r_k\,\Big(\cos\tfrac{k\pi}{8},\ \sin\tfrac{k\pi}{8}\Big),\qquad r_k=\begin{cases}R_1&k\ \text{even}\\ R_2&k\ \text{odd}\end{cases}`, note: 'The vertices of an eight-pointed star: tips at R₁ and notches at R₂ (0.85 u and 0.42 u for the large star, 0.5 u and 0.26 u for the small one).' },
      { tex: T`\text{lead colour}=\begin{cases}\text{fg}_1&R>B\\ \text{fg}_2&\text{otherwise}\end{cases}`, note: 'The warm-or-cool rule: R and B are the red and blue values of the picture’s boosted colour at the tile.' },
    ],
  },
  sashiko: {
    paragraphs: [
      'Sashiko means “little stabs”. It began as a way for farming families in Japan to mend and strengthen cloth with white thread on indigo, and the stitch patterns became beautiful in their own right. Hitomezashi, “one-stitch”, is the simplest kind. You stitch every row and every column on a grid with running stitches that are as long as the gaps between them, and you start each row and each column either on the beat or half a beat off. That is all, and yet squares, crosses and diamonds appear.',
      'There is a tidy reason for this. Write r_j and c_i for the starting beat of row j and column i. The stitch on row j between points i and i + 1 is drawn if i + r_j is even, and the stitch on column i between j and j + 1 is drawn if j + c_i is even. At any grid point exactly one of the two horizontal stitches next to it is drawn, and exactly one of the two vertical ones, so every point is a right-angle bend. The stitches therefore form paths that never cross or branch. In the program the thread is thicker and brighter in the light parts of the picture and thin and dim in the dark ones.',
    ],
    equations: [
      { tex: T`h_{i,j}=\big[(i+r_j)\bmod 2=0\big],\qquad v_{i,j}=\big[(j+c_i)\bmod 2=0\big]`, note: 'Whether the horizontal stitch (i, j) and the vertical stitch (i, j) are drawn. The bits r and c are random, alternating, or taken from a wave or a step pattern.' },
      { tex: T`h_{i-1,j}+h_{i,j}=1,\qquad v_{i,j-1}+v_{i,j}=1`, note: 'Each grid point has one horizontal and one vertical stitch, which is why the lines turn at every point and never meet.' },
      { tex: T`w=s\,\big(0.05+0.34\,\omega\,t^{1.4}\big),\qquad k=0.3+0.7\,t`, note: 'Thread width and brightness: s is the stitch length, ω the weight slider and t the brightness of the picture under the stitch.' },
    ],
  },
  kintsugi: {
    paragraphs: [
      'Kintsugi, “golden joinery”, mends broken pottery with lacquer mixed with gold powder, and it leaves the break visible, even celebrated. The program breaks your picture the way a bowl breaks: with cracks that wander. It first bends the coordinates with smooth noise, by up to about 0.35 of the shard size at full jaggedness, and then finds the Worley cells of the bent plane. Where the distance to the nearest seed equals the distance to the second nearest, two shards meet, and that line is the crack. The width of the gold is set where the difference g = F₂ − F₁ is below the seam width w.',
      'Each shard is put back a little out of true: it reads the picture from a point shifted by up to the misalignment amount, with its own random shift, and it has its own slight brightness. Close to a seam the glaze thickens and darkens, and right at the edge the pale body of the pot shows through. A random share of shards, set by the lost-pieces slider, is missing altogether and filled in gold. The gold is a four-stop ramp from dark bronze to pale yellow, lit as two soft ridges on either side of the crack, with a fine noise to give the surface a hammered texture.',
    ],
    equations: [
      { tex: T`g(\mathbf x)=F_2(\mathbf x)-F_1(\mathbf x),\qquad \text{gold where } g<w`, note: 'Worley cells of side S with their distances F₁ ≤ F₂ to the two nearest seeds. g = 0 on the shared boundary of two shards.' },
      { tex: T`\mathbf x'=\mathbf x+J\Big(2\,\big(\operatorname{fbm}(2\mathbf x/S)-\tfrac12\big)+\tfrac12\,\big(\operatorname{vnoise}(8.3\,\mathbf x/S)-\tfrac12\big)\Big)`, note: 'The wandering crack: the coordinates are displaced by a broad noise and a finer ripple before the cells are found (the y shift uses a second copy of the noise). J is 0.35 S times the jaggedness slider.' },
      { tex: T`\mathbf x_{\text{src}}=\mathbf x+2\,\delta\,\big(h_1-\tfrac12,\ h_2-\tfrac12\big),\qquad \delta=7\,\mu\,\mathrm{sc}`, note: 'Each shard reads the picture from a shifted place: h₁ and h₂ are fixed random numbers for the shard and μ the misalignment slider.' },
      { tex: T`\text{gold}=\operatorname{ramp}\big(0.35+0.5\,b(f)+\eta\big),\qquad f=\frac{g}{w},\quad b(\tfrac12)=\tfrac{\sqrt2}{2},\ b(0)=b(1)=0`, note: 'Lit gold: b is zero on the crack and on the seam’s edge and highest between, giving a rolled bead. η is fine noise.' },
    ],
  },
  'celtic-knot': {
    paragraphs: [
      'Interlace is the signature of insular art, the style of the Book of Kells and the great stone crosses of Ireland: ribbons that pass over and under each other for ever. The simplest way to draw it is a plait, a lattice of straight strands at ±45° where each strand goes over the next one it meets, then under, then over. The program draws exactly that, at the pixel level. Two coordinates u = (x + y)/c and v = (x − y)/c run along the two diagonals. The strand going one way sits where u is near the middle of its unit cell, and the other where v is.',
      'Where the two overlap, the strand on top is decided by the parity of the cell, ⌊u⌋ + ⌊v⌋. Walking along a strand one cell at a time changes one of the two integers by one, so the parity flips at every crossing and the strand alternates over and under without ever having to be told. Each length of strand between two crossings takes its colour from the picture at its middle. Each strand is shaded as a cylinder, with a highlight, a dark outline at its edges, and a shadow on the lower strand next to the crossing. A gold stud sits in the diamond-shaped gap at each lattice point.',
    ],
    equations: [
      { tex: T`u=\frac{x+y}{c},\qquad v=\frac{x-y}{c},\qquad \Big|\operatorname{frac}(u)-\tfrac12\Big|<h\ \ \text{or}\ \ \Big|\operatorname{frac}(v)-\tfrac12\Big|<h`, note: 'The two families of strands, with h half the ribbon width (the width slider divided by 200).' },
      { tex: T`\text{strand }u\text{ is on top}\iff(\lfloor u\rfloor+\lfloor v\rfloor)\ \text{is even}`, note: 'Over and under, set by the cell parity.' },
      { tex: T`s=\frac{d}{h},\qquad f=0.55+0.5\sqrt{1-s^2}-0.18\,s+0.25\,e^{-\left(\frac{s+0.38}{0.16}\right)^2}`, note: 'Cylinder shading: s runs −1 to 1 across the ribbon, with a soft highlight just off centre. The outline darkens where |s| passes 0.78.' },
    ],
  },
  rosemaling: {
    paragraphs: [
      'Rosemaling, “rose painting”, grew up in the valleys of Norway in the eighteenth century, where country painters decorated chests, bowls and walls in imitation of the grander baroque and rococo styles of the towns. It is built from a few brush strokes (the C-scroll, the S-scroll, the teardrop petal, the leaf), and the painter loads the brush with two colours so that every stroke has a light edge and a dark one. The program lays motifs on a staggered grid of spacing g and decides which motif by the brightness v of your picture there: a flower where v is above 0.62, a pair of scrolls from 0.32 to 0.62, and a spray of three leaves below that.',
      'Size follows brightness too: R = g (0.3 + 0.34 v). The colour is the nearest of six folk paints (red, ochre, green, blue, cream and brick) to the picture’s colour, and each paint has a partner for the flower’s centre. Scrolls are tapering ribbons that spiral inward, drawn in pairs turning opposite ways, flowers have petals that are ellipses laid around the centre with a pale highlight, and every shape has a thin dark outline. Scrolls are drawn first, then leaves, then flowers, smallest first, so the largest blossoms sit on top.',
    ],
    equations: [
      { tex: T`\text{kind}=\begin{cases}\text{flower}&v>0.62\\ \text{scroll}&0.32<v\le0.62\\ \text{leaves}&\text{otherwise}\end{cases},\qquad R=g\,(0.3+0.34\,v)`, note: 'Motif choice and size (each size is also multiplied by a random 0.92 to 1.08). Places with v below 0.07 (1.4 − d), where d is the density slider, are left bare.' },
      { tex: T`r(t)=R\,(1-0.78\,t),\qquad \varphi(t)=\varphi_0\pm 1.35\,(2\pi)\,t,\qquad w(t)=R\big(0.34\,(1-t)^{0.8}+0.05\big)`, note: 'A scroll: a spiral inward over 1.35 turns, drawn as a ribbon that tapers from thick to thin.' },
      { tex: T`\varphi_i=\frac{2\pi i}{n}-\frac{\pi}{2},\qquad i=0,\dots,n-1`, note: 'The directions of the n petals of a flower, starting from the top.' },
    ],
  },
  mandala: {
    paragraphs: [
      'The Sanskrit word means “circle”. In the Buddhist and Hindu traditions a mandala is a plan of a sacred world, built from the centre outward in rings, and the sand mandalas of Tibet are made grain by grain and then swept away. The program has no meaning of its own to give them, but it builds the geometry faithfully. The centre is the middle of the canvas, the rings reach to the corners, and there are K of them, each of thickness Δ = R_max/(K + 0.7). The symmetry is n₀-fold rotational: every ring repeats its motif a whole multiple of n₀ times.',
      'A ring’s count is chosen so its motifs are about as wide as the ring is thick, and every second ring is turned by half a step so petals sit in the gaps of the ring before it. Six motifs take turns: lotus petals, beads, triangles, scallops, diamonds and leaf pairs. Each is drawn in the colour of your picture at its own place (or, if you choose to mirror the colours, at the matching place in a single wedge so that the colour pattern is symmetrical too), outlined in gold, with a lighter inner shape. At the heart is a star of n₀ points.',
    ],
    equations: [
      { tex: T`\rho_o(k)=R_{\max}-k\,\Delta,\qquad \Delta=\frac{R_{\max}}{K+0.7},\qquad R_{\max}=\tfrac12\sqrt{W^2+H^2}`, note: 'The outer radius of ring k.' },
      { tex: T`n_k=n_0\,\max\!\Big(1,\ \operatorname{round}\frac{2\pi\,\rho_m}{1.15\,n_0\,\Delta}\Big)`, note: 'The number of motifs in a ring of mid radius ρ_m: a multiple of n₀, so each ring is as symmetric as the whole.' },
      { tex: T`\vartheta'=\min\big(\vartheta_s,\ \tfrac{2\pi}{n_0}-\vartheta_s\big),\qquad \vartheta_s=\big(\vartheta+\tfrac{\pi}{2}\big)\bmod\tfrac{2\pi}{n_0}`, note: 'Mirrored colours: an angle is folded into a single wedge, where the picture is read, so the colours repeat as the shapes do.' },
    ],
  },
  'maori-koru': {
    paragraphs: [
      'The koru is the unfurling frond of a silver fern, a young leaf curled into a spiral and about to open. It stands for new life and is used in the painted rafter patterns of Māori meeting houses, kōwhaiwhai, where spirals repeat along a beam in red, white and black. In the program a koru is a ribbon that starts as a short stem arriving from the side and swells into a spiral of 1.2 turns that tapers to a small round bulb. The turn is an Archimedean spiral, r falling in a straight line with the angle, which is not quite the logarithmic spiral of a real frond but draws the same loop.',
      'Korus sit on a staggered grid. In flowing mode the orientation alternates by a half turn from one to the next, with a slight tilt that changes from row to row, so that pairs make S-shaped chains; in mirrored mode neighbours reflect each other; and in the ring mode every koru turns to face round the centre. Size grows with the light of the picture, R = 0.46 g (1 − 0.6 f + 0.9 f v). Bright places are white, mid-tones are red and dark places are left bare, each with a line along the middle in a contrasting colour, on a black wood-grain ground.',
    ],
    equations: [
      { tex: T`r(q)=R\,(1-0.74\,q),\qquad \varphi(q)=\tfrac{\pi}{2}+1.2\,(2\pi)\,q,\qquad q\in[0,1]`, note: 'The spiral part: centre at the origin, radius falling linearly with the angle.' },
      { tex: T`w(q)=R\big(0.36\,(1-q)^{0.9}+0.13\big),\qquad r_{\text{bulb}}=0.14\,R`, note: 'Width along the body and the bulb at the end. The stem is a gentle swell from 0.22 R to 0.36 R.' },
      { tex: T`\text{fill}=\begin{cases}\text{white}&v>0.55\\ \text{red}&0.06\le v\le0.55\\ \text{none}&v<0.06\end{cases}`, note: 'The traditional paints, by the light of the picture where the koru sits (on the cream ground the white becomes black).' },
    ],
  },
  'navajo-weave': {
    paragraphs: [
      'Diné, or Navajo, weaving is done on an upright loom, and the tradition says that Spider Woman taught the people to weave. Every block of colour is a short run of weft pulled tight, so edges that are not square have to be stepped, and a diagonal becomes a staircase. Regional styles are known by their wool: the red grounds of Ganado, the natural greys and browns of Two Grey Hills. The program lays a grid of cells (the yarn blocks) over the picture and gives each the nearest colour of the chosen wool, or, for the natural greys, a grey picked by its brightness.',
      'Symmetry is made by reading the picture folded: for left-to-right mirroring the sample x becomes min(x, W − x), and for four-way symmetry y is folded as well. Serrating shifts the sample point a quarter of a cell one way on even rows and the other way on odd rows (half a cell between neighbours), so that vertical edges turn into the zigzag teeth of real rugs. A border can be added: stripes, or the stepped zigzag, which is a triangle wave z(a) of the position a along the edge, and the red cells are those whose distance d from the border satisfies d − 2 = z or d − 2 = 4 − z, making a chain of diamonds. Each cell shows rows of yarn, a little fuzz and a slight darkening where one block meets the next, and fringe hangs from the ends.',
    ],
    equations: [
      { tex: T`x'=\min(x,\ W-x),\qquad y'=\min(y,\ H-y)`, note: 'Mirroring in the sample point: the right-hand side of the rug is a reflection of the left, and with four-way symmetry the bottom of the top.' },
      { tex: T`z(a)=\min\big(a\bmod 8,\ 8-(a\bmod 8)\big),\qquad \text{red if } d-2\in\{z(a),\ 4-z(a)\}`, note: 'The stepped zigzag border. d is the distance in cells from the rug’s edge and a the cell’s position along it.' },
      { tex: T`f=\Big(0.74+0.26\sin\big(\pi\,\operatorname{frac}(2\,y_c)\big)\Big)\,\big(0.93+0.14\,\xi\big),\qquad y_c=\tfrac{y-y_0}{c}`, note: 'Yarn: two ridges of weft per cell (y_c is the position across the cell) with a fuzz noise ξ.' },
    ],
  },
  'aztec-glyphs': {
    paragraphs: [
      'The Mexica carved in stone, and the best known piece is the Sun Stone, a disc whose rings hold the twenty signs for the days of the ritual count. Twenty signs run against thirteen numbers to give the 260 days of the sacred year. The program makes a wall of square tablets, each with a raised plate, a raised border and one of eleven glyphs (the spiral of wind, the five-dot movement sign, the stepped fret, the sun, the serpent, the flower, water, the flint, the house, the face and an eight-pointed star), drawn with strokes of different widths. The plate is higher where your picture is brighter: its height is 0.18 + 0.4 t, the border adds 0.22 and the glyph 0.42.',
      'The heights are painted on a hidden grey canvas, blurred by about a pixel, and lit as a relief. The slope of the surface is found from differences of height. Light from the chosen direction brightens the faces that look toward it. Cracks and corners are darkened by an occlusion term, which is large where the surface is lower than its own blur. A wash of the picture’s colours is mixed into the stone, and the glyphs carry stronger paint, because the Mexica painted their stone. Weathering adds long streaks and patches of lichen.',
    ],
    equations: [
      { tex: T`H=\rho\,h_{\text{canvas}}+0.25\,\bar L,\qquad h_{\text{plate}}=0.18+0.4\,t`, note: 'The height map: ρ is the depth slider, h_canvas the drawn heights and L̄ a broad blur of the picture’s brightness, which gives the whole wall a gentle swell.' },
      { tex: T`f=\operatorname{clamp}\big(0.74+0.7\,(\mathbf s\cdot\mathbf l),\ 0.3,\ 1.45\big)\,(1-a),\qquad \mathbf s=-k\,\nabla H`, note: 'Relief lighting: l = (cos α, sin α) is the direction to the light and k = 22 + 70 ρ scales the slope.' },
      { tex: T`a=\operatorname{clamp}\big(2.4\,(\bar H-H),\ 0,\ 0.55\big)`, note: 'Occlusion: where the height H is below its own blur H̄ (a groove) the surface is darkened by up to 55%.' },
    ],
  },
  hieroglyphs: {
    paragraphs: [
      'The Egyptians cut their writing in two ways. In raised relief the background is cut away and the signs stand out. In sunk relief the signs are cut into the surface, which lets them be read in the strong light of an outside wall, where a hollow throws a clear shadow. Both were painted, in lapis blue, red ochre, malachite green, yellow ochre and black. The program writes in sunk relief: columns of signs, divided by double rules, with a horizontal band every six lines, and signs that face alternate ways in neighbouring columns, since hieroglyphs face the start of the line.',
      'Twelve signs are drawn (the ankh, the eye, water, the feather, the sun disc, the djed pillar, the was sceptre, a snake, a duck, an owl, a lotus and a basket). Each is cut in with a dark stroke on a middle-grey plate, so after blurring the signs sit lower than their surroundings, and the double rules are cut as raised ridges. A broad blur of the picture’s brightness lifts the whole surface slightly where it is bright. A sign is drawn larger the brighter the picture is under it, from half to full size. The paint that fills a sign is the nearest of the five pigments to the picture’s colour, and a wash of the picture tints the stone.',
    ],
    equations: [
      { tex: T`H=\rho\,\big(0.59-0.49\,\chi\big)+0.18\,\bar L,\qquad \chi\in\{0,1\}\ \text{inside a sign}`, note: 'Sunk relief: the plate is at 150/255, a sign is cut down to 25/255 (a depth of 0.49 ρ) and L̄ is a broad blur of brightness.' },
      { tex: T`u=\tfrac{s}{2}\,\big(0.5+0.5\,t\big)`, note: 'The half-size of a sign in a cell of height s, from the picture’s brightness t.' },
      { tex: T`f=\operatorname{clamp}\big(0.74+0.7\,(\mathbf s\cdot\mathbf l),\ 0.3,\ 1.45\big)\,(1-a),\qquad \mathbf s=-k\,\nabla H`, note: 'Lit as in the Aztec relief: with the light from the chosen direction and an occlusion term a that darkens the grooves.' },
    ],
  },
  'greek-meander': {
    paragraphs: [
      'The meander takes its name from the river Maiandros, which winds. The key pattern runs round Greek pots from the geometric period onward. In black-figure vases the painter draws in a slip that fires black on the red-orange clay. In red-figure vases the ground is painted black and the figures are left in the colour of the clay, and the program offers both, together with a white-ground style. A key unit is drawn in a band six units high. Its line goes up the left side, along the top, down the right, back toward the left, up again and then a short way right, and sits on a rule at the bottom. The unit repeats every eight units, and alternate bands are mirrored and shifted by half a period.',
      'The width of the paint follows the picture. Each segment of the pattern reads the shade v at its middle, which is the darkness of the picture for black paint and the brightness for red-figure, and draws its line with a width between 0.18 and about 1.2 units. Dark places get thick, heavy fret and light places a thread. The hook is made of straight segments of lengths 6, 5, 4, 3, 2 and 1.5, which is 21.5 units, and with the rule underneath and the pair of border rules the paint covers a fraction of the band that grows with the line width. The clay itself is mottled, and a share of the picture is multiplied into it (screened on the black ground of the red-figure style).',
    ],
    equations: [
      { tex: T`w=u\,\Big(0.18+\beta\,\big(1-f+f\,v^{0.9}\big)\Big),\qquad u=\frac{\text{key size}}{6}`, note: 'Line width at a segment: β is the weight slider and f the weight-follows-picture slider.' },
      { tex: T`\ell_{\text{hook}}=6+5+4+3+2+1.5=21.5\,u,\qquad \ell_{\text{cell}}=21.5\,u+8\,u+16\,u`, note: 'Length of line in one 8 u by 9 u cell: the hook, the rule it stands on, and the two border rules.' },
      { tex: T`\phi\approx\frac{\ell_{\text{cell}}\,w}{8u\cdot 9u}=0.63\,\frac{w}{u}`, note: 'The share of the clay covered by paint: about 11% at the thinnest line and up to 75% at the heaviest, which is how the line weight draws the picture.' },
    ],
  },
  'byzantine-mosaic': {
    paragraphs: [
      'The mosaics of Ravenna and Constantinople are made of tesserae, small cubes of coloured glass and stone, and of gold tesserae in which a leaf of gold is sealed between two layers of glass. The setters pushed each cube into wet plaster at a slight angle, so the surface glitters as the viewer moves, and they laid the cubes in rows that follow the shapes, a flow called andamento. The program works the same way. It blurs the picture to a smooth brightness F and finds at each point the direction that runs along its contours, perpendicular to the gradient. Where F is nearly flat the direction fades to a gentle slant, so rows go on across empty areas.',
      'Seeds are tried in random order, first on a grid of spacing 1.05 tessera widths and then on a finer one. From a free seed a row grows both ways in steps of 1.03 tessera widths for as long as the next place is free, meaning no other tessera lies within 0.98 widths, and for at most 90 cubes. Each cube is a square of about 0.88 widths, turned to the direction of the row with a small random tilt. Cubes in the brightest places are gold, and where the picture has a sharp edge they are black. All others take the nearest of eight glass colours, or the picture’s own colour if you ask for it. A light edge and a dark edge on every cube make each look like a facet of glass.',
    ],
    equations: [
      { tex: T`\mathbf d=\frac{w\,\hat{\mathbf t}+(1-w)\,\hat{\mathbf b}}{\big\lVert w\,\hat{\mathbf t}+(1-w)\,\hat{\mathbf b}\big\rVert},\qquad w=\operatorname{smoothstep}\big(0.003,\,0.03,\,\lVert\nabla F\rVert\big)`, note: 't̂ is the unit contour direction, b̂ a slight slant (0.3 rad) and w how strong the gradient is.' },
      { tex: T`\mathbf x_{n+1}=\mathbf x_n+1.03\,s\,\mathbf d(\mathbf x_n),\qquad \text{place only if } \min_j\lVert\mathbf x_{n+1}-\mathbf x_j\rVert\ge 0.98\,s`, note: 'Growing a row of tesserae of size s.' },
      { tex: T`\text{gold if } L>1-0.5\,g-0.1+0.12\,(\xi-\tfrac12)`, note: 'Gold in the light: g is the gold slider and ξ a random number per cube, so the edge of the gold is ragged.' },
    ],
  },
};
