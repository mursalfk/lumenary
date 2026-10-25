// src/data/theory-optical.js
// Theory entries for the treatments of section H, Photographic and optical.
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_OPTICAL = {
  lomography: {
    paragraphs: [
      'Lomography is the look of a cheap plastic camera and film that was never meant to be pushed this far: colours too rich, shadows too dark, corners lost, the edges of the frame soft, and now and then a stripe of light that has crept in where the back of the camera does not close. Each of those faults is made in turn. Saturation scales every colour’s distance from its own luminance (by 0.6 to 1.9). A colour cast multiplies the three channels by gains, for example warm is (1.06, 1.0, 0.84). Contrast is an S-shaped curve whose shoulders flatten more as it grows.',
      'The cheap lens is a blurred copy of the picture (one sixth of the size, enlarged) laid over the sharp one through a radial mask: clear inside a circle of 0.28 of the short side, then rising to 35% to 100% opacity at the corners, so only the middle is sharp. Light leaks are one or two large radial gradients, warm or coloured to match the cast, placed near the edge and added with screen blending, which can only brighten. The dark corners (a vignette) and the grain are added last.',
    ],
    equations: [
      { tex: T`c'=\operatorname{clip}\Big(g_c\,\big[\,l+\sigma\,(c-l)\,\big]\Big),\qquad \sigma=0.6+1.3\,s`, note: 'Saturation s and the colour cast gain g_c for each channel c; l is the luminance.' },
      { tex: T`y=\tfrac12+\frac{x}{1+1.1\,(k-1)\,\lvert x\rvert}\,\big(1+0.28\,(k-1)\big),\qquad x=k\,(v-\tfrac12)`, note: 'The contrast curve for a contrast factor k = 1 + 1.1 × the slider.' },
      { tex: T`C=1-(1-C_0)\,(1-C_{\text{leak}})`, note: 'Screen blending of a light leak over the picture.' },
    ],
  },
  'film-grain': {
    paragraphs: [
      'A film stock is a recipe of three things: a tone curve, a colour balance and a grain. The tone curve here lifts the darkest level to a toe value and holds the lightest below a shoulder value, with a gentle S in between made by mixing a straight line (55%) with a smoothstep (45%). Four stocks are modelled: a black-and-white 400, a portrait colour film that is a little desaturated and warm, a vivid slide film, and a cool, grainy night film. The faded blacks slider then lifts everything toward grey by up to 12%, the milky shadows of an old print.',
      'Grain is silver crystals clumped together, so it is not uniform noise. Its strength follows the parabola 0.2 + 3.2 l (1 − l), strongest in the mid-tones and weaker in deep shadow and bright highlights, where the film is nearly empty or nearly saturated. It is made of soft blobs (smooth noise at the grain size) plus a fine speckle (white noise). On colour stocks each channel receives 60% of a shared grain and 40% of its own, so the grain is faintly coloured. Halation is the red-orange fringe made when bright light bounces back through the film base: the picture is shrunk to one eighth, its highlights are kept and tinted, and the result is blown up and screened back. Dust, hairs and long scratches are drawn at random on top.',
    ],
    equations: [
      { tex: T`f(v)=t_0+(t_1-t_0)\,\big[\,0.55\,v+0.45\,\operatorname{smoothstep}(0,1,v)\,\big]`, note: 't₀ is the stock’s toe and t₁ its shoulder.' },
      { tex: T`n=A\,\mu(l)\,\Big[\,1.5\,\big(\nu-\tfrac12\big)+0.9\,\big(r-\tfrac12\big)\Big],\qquad \mu(l)=0.2+3.2\,l\,(1-l)`, note: 'Grain: ν smooth noise at grain size, r white noise, A = 0.27 × the amount slider × the stock’s grain factor.' },
      { tex: T`H=\operatorname{smoothstep}(0.62,\ 0.95,\ L_{1/8})\cdot(1,\ 0.38,\ 0.16)`, note: 'Halation: the highlights of the one-eighth-scale picture, tinted red-orange (grey for black and white film).' },
    ],
  },
  infrared: {
    paragraphs: [
      'Chlorophyll reflects near-infrared light very strongly, so in infrared photography green leaves glow nearly white, and a blue sky, which reflects little, goes almost black. A screen can only show the visible spectrum, so the program estimates the infrared brightness from colour. The greenness is how far the green channel leads the larger of red and blue, γ = clip((G − 0.85 max(R, B)) × 3.2), scaled by the foliage slider. The blueness is clip((B − 0.9 max(R, G)) × 3), scaled by the sky slider. The estimate is mostly green and a little red and blue, boosted by the greenness and pulled down by the blueness.',
      'Three renderings are offered. Black and white simply shows that estimate. False colour makes the channel swap used in digital infrared photography, in which red and blue exchange roles and infrared feeds the blue, so foliage turns pale cyan-white. Pink foliage records infrared as red, which makes leaves pink and shifts red objects toward yellow. A dreamy glow follows: highlights of a copy at one seventh the size are kept and screened back on. A light vignette and grain finish it.',
    ],
    equations: [
      { tex: T`\gamma=\operatorname{clip}\big[\,3.2\,(G-0.85\max(R,B))\,\big]\,\lambda,\qquad \beta=\operatorname{clip}\big[\,3\,(B-0.9\max(R,G))\,\big]\,\kappa`, note: 'Greenness γ and blueness β; λ is the foliage slider and κ the sky slider.' },
      { tex: T`\iota=\operatorname{clip}\big(0.18\,R+0.62\,G+0.1\,B+0.65\,\gamma-0.5\,\beta\big)`, note: 'The estimated infrared brightness: leaves up, sky down.' },
      { tex: T`(R',G',B')=\Big(0.9\,(1-0.35\,\beta)\,B+0.12\,\iota,\ \ 0.55\,G+0.45\,\iota,\ \ 0.55\,R+0.55\,\iota+0.2\,\gamma\Big)`, note: 'False colour: red and blue are swapped and infrared leads the blue channel.' },
    ],
  },
  'tilt-shift': {
    paragraphs: [
      'A tilt-shift lens tips its plane of focus, so only a thin band is sharp and the rest falls quickly into blur. That is the cue we associate with macro photography of a tiny scene, which is why a street photographed this way looks like a model. The program builds five versions of the picture in advance (blur radii 0, 1.6, 3.6, 7 and 12 px, all scaled by the blur slider) and chooses between them for each pixel by its distance from the band. For a straight band this is the distance to a line through the focus point tilted by the angle slider; for the radial shape it is an ellipse, slightly squeezed horizontally.',
      'The distance passes through a smoothstep, starting at the half-width of the band and ending 0.38 of the picture height further on, and is scaled to a position between 0 and 4 along the five levels. The pixel is a linear mix of the two nearest levels, so the blur grows smoothly. Finally colour and contrast are raised (saturation up to 1.85 times, contrast up to 1.45), the glossy paint of a toy.',
    ],
    equations: [
      { tex: T`t=4\,\operatorname{smoothstep}\!\Big(h,\ h+0.38\,H,\ \big\lvert(\mathbf x-\mathbf c)\cdot\mathbf n\big\rvert\Big),\qquad \mathbf n=(-\sin\alpha,\ \cos\alpha)`, note: 'Position along the blur levels; h is half the band width, c the focus point, α the tilt. For the radial shape the distance is √((1.15 Δx)² + Δy²).' },
      { tex: T`C=(1-\phi)\,B_{\lfloor t\rfloor}+\phi\,B_{\lfloor t\rfloor+1},\qquad \phi=t-\lfloor t\rfloor`, note: 'B₀ is the sharp picture, B₁ to B₄ the blurred ones.' },
      { tex: T`C'=\tfrac12+k_c\Big(l+k_s\,(C-l)-\tfrac12\Big)`, note: 'The model-making boost: saturation k_s and contrast k_c.' },
    ],
  },
  kaleidoscope: {
    paragraphs: [
      'A kaleidoscope is two mirrors set at an angle of π/n, which fold the view into n copies of one wedge, alternately reflected. For each pixel the program works out its polar angle φ about the centre, subtracts the turn, and takes it modulo the wedge angle 2π/n. If the result lies in the second half of the wedge it is mirrored back (2π/n minus the value), so neighbouring wedges are reflections of each other and their joins are seamless.',
      'That folded angle is then used as a direction in the source picture. The point looked up is a window centre (the look-left-to-right and up-and-down sliders) plus the pixel’s distance from the centre, shrunk by the zoom, along the direction (cos, sin) of the folded angle plus the rotation of the wedge. In other words the wedge is a fan-shaped piece of the picture. When the lookup would leave the picture its coordinate is reflected back in, as with a mirror, so the pattern has no empty areas. The picture is sampled with bilinear interpolation. The optional dark joins darken the pixels within a few pixels of each mirror line by up to 40%.',
    ],
    equations: [
      { tex: T`\varphi'=\big(\varphi-\tau\big)\bmod\frac{2\pi}{n},\qquad \psi=\begin{cases}\varphi' & \varphi'\le \pi/n\\[2pt] 2\pi/n-\varphi' & \text{otherwise}\end{cases}`, note: 'Folding the angle: τ is the turn of the pattern, n the number of mirrors.' },
      { tex: T`\mathbf s=\mathbf c_0+2\,k\,r\,\big(\cos(\psi+\sigma),\ \sin(\psi+\sigma)\big)`, note: 'The source point: c₀ the window centre, r the distance from the pattern’s centre, k half the zoom, σ the wedge rotation.' },
      { tex: T`\operatorname{refl}_L(v)=L-\big\lvert\,L-(v\bmod 2L)\,\big\rvert`, note: 'Reflecting a coordinate back into the picture of width (or height) L.' },
    ],
  },
  'anaglyph-3d': {
    paragraphs: [
      'The two eyes see a scene from slightly different places, and nearer things shift more between the two views than farther ones (parallax). A single photograph carries no depth, so the program guesses a depth map d from a heavily blurred lightness (two box blurs of about 6 px at 800 px). You choose the guess: bright is near, dark is near, a ground plane in which lower in the frame means nearer, or a mix of lightness (55%) and ground (45%). Each pixel is then moved sideways by s = (d − d_focus) × up to 46 px. The left view looks up the picture at x − s and the right at x + s, with bilinear sampling. Pixels at the focus plane do not shift at all and sit at the screen; nearer and farther ones separate in opposite directions.',
      'Coloured glasses then sort the two views to the two eyes. Red and cyan: the red filter passes only the red channel, so the output takes red from the left view and green and blue from the right. Magenta and green take red and blue from the left and green from the right. Amber and blue take red from the left, blue from the right and mostly the left’s green. The keep-colour slider mixes each view with its own luminance first: at 0 each view is grey and only the fringes carry colour, at 1 the full colour of the picture is kept (and the eyes argue a little).',
    ],
    equations: [
      { tex: T`s=(d-d_f)\cdot 46\,\kappa\,\frac{W}{800},\qquad d=\begin{cases}L_b & \text{bright is near}\\ 1-L_b & \text{dark is near}\\ y/H & \text{ground}\\ 0.55\,L_b+0.45\,y/H & \text{mixed}\end{cases}`, note: 'Disparity: d is the guessed depth from the blurred luminance L_b, d_f the focus plane and κ the depth slider.' },
      { tex: T`\mathbf a=C(x-s,\ y),\qquad \mathbf b=C(x+s,\ y),\qquad \mathbf a'=l_a+k\,(\mathbf a-l_a)`, note: 'The two views (left a, right b) and the keep-colour mixing with each view’s own luminance l.' },
      { tex: T`(R,G,B)_{\text{red-cyan}}=\big(a'_R,\ \ b'_G,\ \ b'_B\big)`, note: 'What the glasses combine; for the other pairs the channels are assigned as described above.' },
    ],
  },
  bokeh: {
    paragraphs: [
      'Out of focus, every point of light in a scene becomes a small image of the lens opening, and the blur that results is called bokeh. The program first makes a cheap blur: the picture is shrunk to between about 35 and 200 pixels across (the out-of-focus slider sets how far) and enlarged again, laid at 78% on a near-black field. Then it places discs of light. A grid of cells of about 1.05 times the disc size is laid over the picture and each cell is given one candidate disc at a jittered position. The candidate is kept with a probability that rises steeply with the brightness of the small picture at that point, scaled by the how-many-lights slider, so highlights become discs and shadows stay dark.',
      'A kept disc takes the colour of the picture there, boosted toward full brightness, and is drawn with additive blending at low opacity, so where discs overlap their light adds up. A thin brighter ring is drawn on its rim, as in lenses whose bokeh is brighter at the edge. The aperture shape is a regular polygon (a hexagon for six blades, a pentagon for five), a ten-point star whose points alternate between the full radius and 0.48 of it, a heart made of two Bézier curves, or a plain circle. Each disc has a random size (0.45 to 1.3 times the size slider, a bit bigger when the light is bright) and a random rotation.',
    ],
    equations: [
      { tex: T`P(\text{disc})=\operatorname{smoothstep}\big(0.7\,\vartheta,\ \vartheta+0.35,\ l\big)\,\big(0.04+0.62\,\delta\big)`, note: 'The chance that a cell holds a disc: l is the lightness of the small picture, ϑ the lights-come-from threshold, δ the density.' },
      { tex: T`\mathbf v_j=\mathbf c+\rho_j\big(\cos(\theta_0+\tfrac{2\pi j}{m}),\ \sin(\theta_0+\tfrac{2\pi j}{m})\big),\qquad \rho_j=\begin{cases}r & \text{polygon}\\ r,\ 0.48\,r\ \text{alternately} & \text{star}\end{cases}`, note: 'The vertices of a disc: m is 6, 5 or 10 and θ₀ a random turn.' },
      { tex: T`C=\min\Big(255,\ \sum_i \alpha_i\,\mathbf c_i\,\mathbb 1_{\text{disc}_i}(\mathbf x)\Big),\qquad \alpha_i=0.05+0.15\,g\,\big(0.5+0.5\,l_i\big)`, note: 'Additive blending of the discs over the blurred picture; g is the brightness slider.' },
    ],
  },
  'double-exposure': {
    paragraphs: [
      'In a double exposure two pictures are recorded on one frame. Light adds on the film, so one picture shows through wherever the other was dark. The program imitates it with a window. The photograph is toned into two inks (a dark and a light one, chosen by the ink slider) by a ramp over its lightness. Its tones, blurred twice at about 5 px, are then compared with a level: where the tone passes the level, by a smoothstep whose width is the softness of the window, the window is open. You choose whether the dark or the light parts open it.',
      'The second scene is drawn from scratch, in the same two inks. Mountains are six ridgelines made of layered noise, pines are rows of stacked triangles, a city is three ranks of buildings with scattered lit windows, and the moon is a disc with stars and bands of cloud. Each far layer is lighter and each near one darker, with a gradient of fog between them, the aerial perspective that makes the depth. Inside the window the scene replaces the photograph and is mixed with a screen blend, 80% replacement and 20% film. The photo detail slider lets the lightness of the photograph modulate the brightness of the scene, so its face or its shapes are still readable.',
    ],
    equations: [
      { tex: T`m=\operatorname{smoothstep}\big(\lambda-\sigma,\ \lambda+\sigma,\ v\big),\qquad v=\begin{cases}L_b&\text{light opens}\\ 1-L_b&\text{dark opens}\end{cases}`, note: 'The window: λ is the level slider and σ = 0.02 + 0.5 × the softness slider.' },
      { tex: T`s'=s\cdot\operatorname{clip}\big(0.87+0.9\,D\,(L-\tfrac12),\ 0,\ 1.15\big)`, note: 'The scene’s brightness follows the photograph’s lightness L; D is the photo detail slider.' },
      { tex: T`C=0.8\Big[(1-0.96\,m)\,b+0.96\,m\,s'\Big]+0.2\Big[255-\frac{(255-b)\,(255-0.55\,m\,s')}{255}\Big]`, note: 'The base b (the toned photograph) with the scene inside the window, plus a screen blend of the two.' },
    ],
  },
  'cross-processed': {
    paragraphs: [
      'Cross processing means developing a film in the chemistry meant for another kind of film. The three dye layers then respond to light in unusual ways, each with its own tone curve, so the shadows lean toward one hue, the highlights toward another and the contrast jumps. The program stores each look as a list of knots for each channel, for example the blue curve of slide film in colour-negative chemistry starts at 0.17 and ends at 0.74, and joins them with a Catmull-Rom spline, a smooth curve that passes through every knot. The curve is evaluated once for each of the 256 input values and kept as a lookup table.',
      'Each channel of each pixel is looked up in its own table, and the strength slider mixes the original with the result. Saturation is then scaled around the luminance (0.7 to 1.6) and blacks can be lifted by up to 10% for the faded look. A vignette and grain complete the film. The three looks are slide film in colour chemistry, negative film in slide chemistry, and a teal and amber grade.',
    ],
    equations: [
      { tex: T`y(t)=\tfrac12\Big[\,2p_1+(p_2-p_0)\,t+(2p_0-5p_1+4p_2-p_3)\,t^2+(3p_1-p_0-3p_2+p_3)\,t^3\Big]`, note: 'Catmull-Rom spline through the knots p₀ … p₃; t runs from 0 to 1 between p₁ and p₂.' },
      { tex: T`c'=(1-a)\,c+a\,\operatorname{LUT}_c(c)`, note: 'Each channel c through its own table, mixed by the strength a.' },
      { tex: T`C=f+(1-f)\operatorname{clip}\big(l+\sigma\,(c'-l)\big),\qquad \sigma=0.7+0.9\,s,\ \ f\le 0.1`, note: 'Saturation s around the luminance l, then faded blacks f.' },
    ],
  },
  daguerreotype: {
    paragraphs: [
      'A daguerreotype is an image on a silver plate polished like a mirror. Tilted one way the plate reflects something dark and the picture looks like a positive; tilted the other way it reflects something bright and the picture seems to turn into a negative. The tilt slider mixes the lightness with its inverse, v = (1 − 0.92 t) L + 0.92 t (1 − L), then adds a little contrast about the middle. Three tones (silver, blue and gold) are each a ramp of a dark, a mid and a light colour. The lenses of the day were soft, so the picture is blurred by 0.5 to 3.5 px.',
      'Tarnish creeps in from the edge of the plate. Let e be the distance to the edge of the window (0 at the edge, 1 in the middle). A ring is open where e plus a noise is below a reach that grows with the tarnish slider, and its colours cycle through blue, violet and amber as sin(16 e + 5 n + offset) with the three colour channels one third of a turn apart, the same kind of thin-film interference as an oil slick. Polish marks, scratches and dust are added to the plate, and a brass mat (a gradient with metal grain, bevel rings and a band of glare) frames it in an oval or a rectangle.',
    ],
    equations: [
      { tex: T`v=\operatorname{clip}\Big(1.18\,\big[(1-0.92\,\tau)\,L+0.92\,\tau\,(1-L)-\tfrac12\big]+\tfrac12\Big)`, note: 'The mirror: τ is the tilt slider and L the softened lightness.' },
      { tex: T`\text{ring}=\operatorname{smoothstep}\big(\rho,\ 0,\ e+0.22\,(n-\tfrac12)\big),\qquad \rho=0.04+0.34\,T`, note: 'Where the tarnish reaches; T is the tarnish slider and n noise.' },
      { tex: T`c_j=\tfrac12+\tfrac12\sin\!\Big(16\,e+5\,n+\tfrac{2\pi j}{3}\Big),\qquad j=0,1,2\ \ (R,G,B)`, note: 'The iridescent colour of the tarnish: three phases of a thin-film interference.' },
    ],
  },
  'chromatic-aberration': {
    paragraphs: [
      'A glass lens bends each colour of light by a slightly different amount, a property called dispersion. The result is lateral chromatic aberration: the red, green and blue images are enlarged by slightly different factors, so they separate more the farther they are from the centre of the picture. The program does what the lens does. In the radial mode the green channel stays where it is, the red channel is read from a point u further out, and the blue from a point u further in. The shift has the size A/2 × [(1 − e) + 2.2 e ρ²], where ρ is the distance from the centre divided by the half-diagonal and e the strongest-at-the-edges slider, so with e = 1 it grows with the square of the distance.',
      'The sideways mode shifts red and blue by a fixed amount along one direction (the angle slider), like a prism, optionally growing toward the edges. The full-spectrum mode takes seven samples along the line from −u to +u. Red takes its weight from the + end, blue from the − end and green from the middle, and each channel’s weights are normalised to add up to 1, so a flat colour comes through unchanged and an edge is smeared into a rainbow. A soft glow (a tenth-scale copy, screened on) is optional.',
    ],
    equations: [
      { tex: T`\lvert\mathbf u\rvert=\frac{A}{2}\Big[(1-e)+2.2\,e\,\rho^{2}\Big],\qquad \mathbf u\parallel(\mathbf x-\mathbf c),\quad \rho=\frac{\lVert\mathbf x-\mathbf c\rVert}{R}`, note: 'Radial shift: A is the amount in pixels, e the edge slider, c the centre and R the half-diagonal.' },
      { tex: T`R'(\mathbf x)=R(\mathbf x+\mathbf u),\qquad G'(\mathbf x)=G(\mathbf x),\qquad B'(\mathbf x)=B(\mathbf x-\mathbf u)`, note: 'The three channels are sampled at different places (bilinear interpolation).' },
      { tex: T`C'_c(\mathbf x)=\sum_{k=0}^{6} w_c(k)\;C_c\!\Big(\mathbf x+\mathbf u\,\big(\tfrac{k}{3}-1\big)\Big),\qquad w_c\propto\max\big(0,\ 1-\gamma_c\lvert t_k-t_c\rvert\big)`, note: 'Full-spectrum mode: t_k = k/6; t_c = 1, ½, 0 and γ_c = 1.7, 2.3, 1.7 for red, green and blue; weights add up to 1.' },
    ],
  },
  lenticular: {
    paragraphs: [
      'A lenticular print is a sheet of tiny cylindrical lenses laid over two pictures that have been cut into thin strips and interlaced, A B A B. Each lens sends the A strip to your eye from one viewing angle and the B strip from another, so as you move the picture seems to flip. The program makes the second picture from the first by one of five alterations (a negative, a night-blue ramp, the opposite hues, black and white or sepia), then for each lens of width w it works out how far across the lens each column is, u = (x/w) mod 1. The lens shows picture A where u is below a split point and B above it. The split point follows the tilt: split = ½ (1 + θ).',
      'The tilt θ is a number between −1 and 1. It follows your pointer across the picture (the left edge is −1, the right edge 1) with a smooth, exponential catch-up, and when the pointer is away it sways by itself as a slow sine wave. The two pictures also slide in opposite directions with the tilt, by up to 1.4 lens widths, which is the parallax that makes a lenticular look deep. The lens shine adds a bright band that moves across each lens, darkens the lens edges and the seam, so the strips read as ribbed plastic.',
    ],
    equations: [
      { tex: T`u=\frac{x}{w}\bmod 1,\qquad \text{show B if }\ u\ge\tfrac12\,(1+\theta)`, note: 'w is the lens width in pixels and θ the tilt.' },
      { tex: T`\theta\ \leftarrow\ \theta+(\theta^{*}-\theta)\,\big(1-e^{-7\,\Delta t}\big),\qquad \theta^{*}=\begin{cases}2p_x-1&\text{pointer inside}\\ 0.95\,s\,\sin(0.75\,t)&\text{otherwise}\end{cases}`, note: 'The tilt eases toward its target; p_x is the pointer’s horizontal position (0 to 1) and s the sway slider.' },
      { tex: T`x_{\text{src}}=x\mp\theta\,\delta,\quad \delta=1.4\,P\,w;\qquad k=1+S\Big(0.3\,e^{-(u-h)^{2}/0.018}-0.12\,\operatorname{smoothstep}(0.62,\,1,\,\lvert 2u-1\rvert)\Big)`, note: 'Parallax shift (minus for A, plus for B; P the parallax slider) and the shine multiplier; h = ½ + 0.38 θ is where the glint sits in each lens, S the shine slider.' },
    ],
  },
};
