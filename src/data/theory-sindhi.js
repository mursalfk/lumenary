// src/data/theory-sindhi.js
// Theory entries for the treatments of section L, Sindhi design.
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_SINDHI = {
  ajrak: {
    paragraphs: [
      'Ajrak is the block-printed cloth of Sindh. It is made by pressing carved wooden blocks onto cotton in stages: a resist paste goes on first, wherever the cloth is meant to stay pale, and the cloth is then dyed in indigo and in red from madder root. The paste keeps the dye out, so the white lines in the finished shawl are the places where nothing reached the cotton. Many Sindhis point to the trefoil-patterned shawl on the Mohenjo-daro bust as a distant ancestor, a story told with affection and not proved.',
      'The program lays out one block per square of side s = W / n, where n is the number of blocks across. Inside a block a polar test decides which of three things lies under each pixel: ground, star colour or resist. The star has eight points, drawn with the star polygon formula below, with a resist outline, a resist ring, a resist centre, and a diamond with small resist dots at each corner. Each block is dyed in one of three states, chosen by the tone of your picture where it sits: dark blocks carry a deep ground with a red star, midtones swap the two, and light blocks have a pale ground. Block size follows the picture too, from 82% to 100%. A real print is never perfect, so the resist is printed from a block shifted by up to 1.5 px, and only the shifted copy shows white.',
    ],
    equations: [
      { tex: T`r(\theta)=\frac{R_1\,p_y}{p_y\cos t-p_x\sin t},\quad t=\text{fold}(\theta)\in\big[0,\tfrac{\pi}{n}\big],\quad \begin{aligned}p_x&=R_2\cos\tfrac{\pi}{n}-R_1\\ p_y&=R_2\sin\tfrac{\pi}{n}\end{aligned}`, note: 'The outline of an n-pointed star (n = 8 here, R₁ = 0.94 σ, R₂ = 0.55 σ): a straight line from a tip to the next notch, written in polar form. σ is the block size factor.' },
      { tex: T`k=\begin{cases}0&t<0.36\\ 1&0.36\le t<0.66\\ 2&t\ge0.66\end{cases},\qquad \sigma=0.82+0.18\,(1-t)`, note: 'The dye state k and block size σ from the tone t of the picture in that block. With probability 1 − f (f is “colour follows picture”) the state is a chequerboard (i + j) mod 2 instead.' },
      { tex: T`z=\begin{cases}\text{resist}&Z(\mathbf x+\boldsymbol\delta)=\text{resist}\\ \text{ground}&Z(\mathbf x)=\text{resist},\ Z(\mathbf x+\boldsymbol\delta)\ne\text{resist}\\ Z(\mathbf x)&\text{otherwise}\end{cases}`, note: 'Misregistration: the block zone map Z is read twice, the second time shifted by δ = (1, 0.7) × 1.5 px × the hand-printed slider. White shows only where the shifted copy says so.' },
    ],
  },
  'hala-blue-pottery': {
    paragraphs: [
      'Hala, a town in the Matiari district, is one of the places where blue pottery is still made in Sindh. It shares a tradition with Multan and with Persia: a white glaze painted in cobalt blue and turquoise, then fired once, so the colour sinks into the glaze and cannot be changed. The designs are vines, leaves and small flowers. The program paints your picture as a cobalt wash and then lays vines along it.',
      'The wash comes first. The picture is blurred twice (radius smooth × 0.9 px) to a field T, and the glaze colour is blended toward cobalt by v = 0.78 w (1 − T)^1.5, where w is the wash slider, so shadows turn deep blue and highlights stay white. Vines are the contour lines of T at evenly spaced levels, found by marching squares, joined into curves and drawn with a width that falls from 3.9 px at the darkest contour to 1.7 px at the lightest. Leaves sit on alternate sides of each vine about every 24 px, turned 0.95 radians (about 54°) from the tangent, in turquoise and cobalt by turns. Flowers (five oval petals round a turquoise centre) are placed on a jittered grid, only where the picture is dark enough. Old glaze cracks, and the program finds the cracks with Worley noise.',
    ],
    equations: [
      { tex: T`C=C_{\text{glaze}}+\big(C_{\text{cobalt}}-C_{\text{glaze}}\big)\,v,\qquad v=0.78\,w\,(1-T)^{1.5}`, note: 'Cobalt wash. T is the doubly blurred brightness and w the wash slider (0 to 1).' },
      { tex: T`\{\mathbf x:\ T(\mathbf x)=\lambda_k\},\quad \lambda_k=\frac{k}{N},\ \ k=1,\dots,N-1,\qquad w_k=(1.7+2.2\,(1-\lambda_k))\,\mathrm{sc}`, note: 'Vine k is a contour of T at level λₖ. N is the “vines” slider; darker contours are drawn thicker.' },
      { tex: T`e=F_2-F_1<1.1\,\mathrm{sc}\ \Rightarrow\ C\leftarrow C\,\big(1-0.3\,c\,(1-\tfrac{e}{1.1\,\mathrm{sc}})\big)`, note: 'Crackle: F₁ and F₂ are the distances to the nearest and second nearest Worley points (cell 54 px), and c is the crackle slider. The line darkens the glaze.' },
      { tex: T`\text{flower if } T(\mathbf x)\le 0.34\,(0.4+q)\ \text{ and }\ \xi\le q`, note: 'Where a flower may sit: q is the flowers slider and ξ a random number per grid point.' },
    ],
  },
  'ralli-patchwork': {
    paragraphs: [
      'A ralli is a quilt made from scraps, and in Sindh it is a women’s art: cloth from old clothes is cut into squares and triangles, laid out in bold patterns, and stitched down with rows of running thread, often in several layers. The word is said to come from a verb meaning to mix, which suits a cloth made of many colours. The program cuts your picture into patches and gives each one a colour from a bright palette of nine (or an earthy one).',
      'The quilt is a square grid of side s. When the “on the diagonal” setting is chosen, the point (x, y) is turned by 45° to (u, v) = ((x + y), (y − x))/√2 before the grid is applied, so the squares stand on their points. A square can be kept whole, cut into two triangles by its diagonal, or into four by both. Each piece takes the colour of the picture at its own centre (saturation raised by 1.5), snapped to the nearest cloth colour, and some pieces are printed cotton with dots, stripes, checks or diamonds. Stitching lies 4.6 px inside every seam as dashes, in a thread that is lighter than dark patches and darker than light ones. A dark line marks the seam itself, and the patch is shaded to look puffed near it.',
    ],
    equations: [
      { tex: T`u=\frac{x+y}{\sqrt2},\qquad v=\frac{y-x}{\sqrt2},\qquad (i,j)=\big(\lfloor u/s\rfloor,\ \lfloor v/s\rfloor\big)`, note: 'Cell index on the diagonal grid. With “square on” the rotation is skipped.' },
      { tex: T`d_{\text{diag}}=\frac{|a+b|}{\sqrt2}\ \ (\text{halves}),\qquad d_{\text{diag}}=\frac{\big||a|-|b|\big|}{\sqrt2}\ \ (\text{quarters}),\qquad a=f_u-\tfrac12,\ b=f_v-\tfrac12`, note: 'The distance, in cell units, from the cut line. (f_u, f_v) is the position inside the cell. |a + b|/√2 is the distance from a point to the line a + b = 0.' },
      { tex: T`d_{\text{seam}}=s\,\min\!\big(d_{\text{edge}},\,d_{\text{diag}}\big),\qquad f=0.82+0.2\,\operatorname{smoothstep}\big(0,\,10\,\mathrm{sc},\,d_{\text{seam}}\big)`, note: 'Distance to the nearest seam and the puffing of each patch: 18% darker at the seam.' },
      { tex: T`\big|d_{\text{seam}}-4.6\,\mathrm{sc}\big|<0.55\,\mathrm{sc}\ \ \wedge\ \ \operatorname{frac}\!\Big(\frac{0.8x+1.3y}{6.5\,\mathrm{sc}}\Big)<0.55`, note: 'The stitch: a band 1.1 px wide, broken into dashes (55% on).' },
    ],
  },
  'sindhi-mirror-embroidery': {
    paragraphs: [
      'Abhla bharat is mirror embroidery: small discs of reflective glass or mica are held to the cloth with a lattice of stitches that cross over the edge, and then the thread is worked round them in rings. It is done on shirts, cushions, camel decorations and the cloth of the bride. The program lays mirrors on a triangular lattice. Each row is 0.866 s below the last (that is √3/2, the height of an equilateral triangle) and every other row is shifted by half a spacing, so every mirror has six neighbours at the same distance.',
      'Thread colours are taken from the picture under each mirror. The colour is pushed to higher saturation (× 1.7) and gives the main thread c₁, scaled by 0.92 + 0.28 t. The partner thread c₂ has its hue turned by 0.45 of a full circle (162°, close to the opposite), and the petal thread c₃ is pale. Around each mirror go ten leaf-shaped stitches and then a ring of short spokes, alternating c₁ and c₂, and between neighbouring mirrors small crosses of seed stitch fill the gaps at the centres of the lattice triangles. The mirror itself shows a piece of your picture: a square 6.8 mirror radii wide is shrunk into the disc and flipped left to right, as a curved glass would show it, with a highlight and a darker rim.',
    ],
    equations: [
      { tex: T`\mathbf p_{i,j}=\Big(i\,s+\tfrac{s}{2}\,(j \bmod 2),\ \ j\,\tfrac{\sqrt3}{2}\,s\Big)`, note: 'The mirror lattice. Row j sits √3/2 s below row j − 1 and odd rows are shifted by half a step.' },
      { tex: T`r_m=0.37\,s\,\mu,\qquad \phi=\frac{\pi r_m^2}{s\cdot\frac{\sqrt3}{2}s}=\frac{2\pi}{\sqrt3}\,(0.37\,\mu)^2`, note: 'Mirror radius (μ is the mirror size slider, 0.25 to 0.8) and the fraction of the cloth that is glass.' },
      { tex: T`\mathbf q_1=\mathbf p+\big(\tfrac{s}{2},\ \tfrac{\sqrt3}{6}s\big),\qquad \mathbf q_2=\mathbf p+\big(s,\ \tfrac{\sqrt3}{3}s\big)`, note: 'The seed stitches sit at the centres of the two triangles that each lattice point owns (one third and two thirds of the way down a triangle of height dy).' },
      { tex: T`\text{magnification}=\frac{2\,r_m}{2\times3.4\,r_m}=\frac{1}{3.4},\qquad h_2=h_1+0.45`, note: 'The mirror shrinks the surrounding picture by a factor of 3.4. The second thread’s hue h₂ is the first hue plus 0.45 of a turn.' },
    ],
  },
  'sindhi-topi': {
    paragraphs: [
      'The Sindhi topi is a round cap with a notch cut for the forehead. It is embroidered all over in rings of triangles, diamonds and tiny mirrors, and it is worn with the ajrak at weddings and on Sindhi Cultural Day. The program draws it as if you were looking down on the crown, where the rings are circles and the pattern is easiest to see. There are K rings between an inner radius r₀ = 0.11 R and 0.96 R, each of width h = (0.96 R − r₀)/K, and four kinds of ornament take turns going outward: triangles, diamonds, zigzags and mirrors.',
      'Each ring is cut into n cells, with n = 2 ⌈(2π ρ / (c h)) / 2⌉, where ρ is the ring’s middle radius and c the cell shape slider. n is always even so triangles can alternate pointing out and in. Odd rings are turned by half a cell, as in real caps. A cell’s colour is chosen from the eight thread colours of the topi by finding the nearest to the picture’s (saturated) colour at the middle of the cell. The ground of the ring alternates between cream and black. In the centre a ring of twelve petals surrounds a larger mirror, and the edge is a scalloped rim of round beads.',
    ],
    equations: [
      { tex: T`h=\frac{0.96\,R-r_0}{K},\qquad r_0=0.11\,R,\qquad \rho_k=r_0+\big(k+\tfrac12\big)h`, note: 'Ring width and the middle radius of ring k (k = 0 is innermost).' },
      { tex: T`n_k=\Big\lceil \tfrac12\max\!\Big(8,\ \operatorname{round}\frac{2\pi\rho_k}{c\,h}\Big)\Big\rceil\times 2,\qquad \alpha_j=\frac{2\pi j}{n_k}+(k \bmod 2)\frac{\pi}{n_k}`, note: 'Number of cells in ring k, made even, and the start angle of cell j. Odd rings are shifted by half a cell.' },
      { tex: T`\text{ornament}(k)=\{\text{triangle, diamond, zigzag, mirror}\}[\,k \bmod 4\,]`, note: 'The order of ornaments from the centre outward.' },
      { tex: T`r_{\text{scallop}}=\frac{2\pi\,(0.99\,R)}{N_s}\cdot\frac{1}{2.2},\qquad N_s=\operatorname{round}\frac{2\pi(0.99\,R)}{0.9\,h}`, note: 'The beads on the rim are a little larger than half their spacing, so they overlap into a scallop.' },
    ],
  },
  'hala-lacquerware': {
    paragraphs: [
      'Lacquerware from Hala is turned on a lathe. While the wooden piece spins, a stick of lac (a resin that softens with heat) is held against it and friction melts a thin layer onto the wood. The turner can lay on one colour after another, and fine lines are scratched through the top coat to show the colour beneath. This is why the bands of colour run round the piece in rings. The program makes this as a picture of a lathe-turned piece in the dark: a vase, a cylinder or a jar, with a soft shadow at its foot.',
      'Everything depends on one idea. A cylinder seen from the front maps a pixel at horizontal offset dx from the axis to an angle φ = arcsin(dx/ρ) on its surface, where ρ is the piece’s half-width at that height. The picture is wrapped round the piece by reading it at x = W (½ + φ/π), so it takes half a turn to run across your picture, and near the edge of the piece the picture is squeezed, as it would be on a real cylinder. Every band (as tall as the band slider times 1.3 px) takes the average colour of its row of the picture, and a share of the local colour is mixed in. The result is matched to the nearest of seven lac colours. The edges of the picture are scratched in gold. A diffuse term cos φ darkens the sides of the piece and two narrow highlights stand for the shine of the polish.',
    ],
    equations: [
      { tex: T`u=\frac{x-x_c}{\rho(y)},\qquad \varphi=\arcsin u,\qquad x_{\text{src}}=W\Big(\tfrac12+\frac{\varphi}{\pi}\Big)`, note: 'Wrapping the picture round a cylinder. u runs from −1 to 1 across the piece and x_src is where the picture is read. Without “wrap” it is read at x.' },
      { tex: T`\frac{dx}{d\varphi}=\rho\cos\varphi\ \ \Rightarrow\ \ \text{picture density}\propto\frac{1}{\cos\varphi}`, note: 'Why the picture looks squeezed near the sides: equal steps of angle cover less and less width on screen.' },
      { tex: T`\rho_{\text{egg}}(t)=0.45\,W\,\sin^{0.55}\!\big(\pi(0.04+0.92\,\hat t)\big),\qquad \rho_{\text{cyl}}=0.33\,W`, note: 'Two of the three profiles; t̂ runs 0 to 1 over the height of the piece. The vase profile is a sum of smoothstep curves.' },
      { tex: T`f=(0.3+0.7\cos\varphi)\,\big(1-0.45\operatorname{smoothstep}(0.82,1,|u|)\big),\qquad s=0.75\,e^{-\left(\frac{u+0.42}{0.16}\right)^2}+0.3\,e^{-\left(\frac{u-0.68}{0.07}\right)^2}`, note: 'Shading and the two highlights, a broad one on the left and a narrow one on the right. The highlight is added with weight equal to the polish slider.' },
    ],
  },
  'makli-carving': {
    paragraphs: [
      'The Makli necropolis, near Thatta, is one of the largest burial grounds in the world, and its tombs from the fourteenth to the eighteenth centuries are carved in sandstone and limestone with rosettes, lozenges, arcades and flowing foliage. The soft stone has been worn by the sun, by rain and by the salt in the air. The program fills the page with a repeating cell of relief and lights it like a wall.',
      'The relief is a height map. In the eight-petal rosette, the outer edge of the flower is at radius p(θ) = 0.8 (0.52 + 0.48 |cos 4θ|), the petals are raised to 0.62 with a thin groove along their middle, a boss rises to 0.95 at the centre, a ring surrounds the flower, and corner ornaments rise to 0.55. The lozenge pattern has a diamond plate, a groove, a centre boss and corners. In both, the picture sets how deep the carving is: the height of the pattern is multiplied by 0.12 + 1.15 T², where T is the blurred brightness, so bright regions are deeply cut and dark regions are shallow. Light from the chosen direction, a darkening where the surface is lower than its own blur (ambient occlusion), a stain of the picture’s colour, long water streaks and patches of lichen finish the surface.',
    ],
    equations: [
      { tex: T`p(\theta)=0.8\,\big(0.52+0.48\,|\cos4\theta|\big),\qquad h_{\text{petal}}=0.62\,\operatorname{smoothstep}\big(-w,\,w,\,p(\theta)-\rho\big)`, note: 'The rosette’s outline and petal height. w = 0.05 is the softness of the edge, and ρ the distance from the cell’s centre (cell coordinates from −1 to 1).' },
      { tex: T`H=P\,\big(0.12+1.15\,T^2\big)+0.9\,T_s+\eta`, note: 'The final height map: P is the carved pattern, T the picture’s blurred brightness, T_s a much broader blur (which gives a gentle swell) and η a fine noise.' },
      { tex: T`f=\operatorname{clamp}\!\big(0.74+0.7\,(\mathbf s\cdot\mathbf l),\ 0.3,\ 1.45\big)\,(1-a),\qquad a=\operatorname{clamp}\big(2.4\,(\bar H-H),\,0,\,0.55\big)`, note: 'Lighting by the slope s = −k∇H (k = 70 × depth) against the light direction l, and occlusion a where the height is below its own blur H̄.' },
    ],
  },
  'indus-seal': {
    paragraphs: [
      'Thousands of small square seals were found at Mohenjo-daro and the other cities of the Indus civilization, which flourished from about 2600 to 1900 BCE. They are mostly carved in steatite, a soft stone, with a line of signs along the top and a figure below, often a bull, an elephant or a tiger. The script has never been deciphered. Most seals are read from right to left, since the signs crowd toward the left end when the carver ran out of room, so the program sets them out that way. When the seal is pressed into wet clay, the carved lines stand out in relief on the clay.',
      'The picture is the figure. A square of side 0.8 W is drawn on a hidden canvas, with a frame, a band for the signs along the top (0.2 of the seal’s height), and a row of n signs chosen at random from eleven strokes, set from the right. Below the band, lines are drawn from the picture itself: edges, found with a Sobel operator on a blurred copy; hatching with thickness rising as the picture darkens, in rows 4.6 px apart; and a cross-hatch where the picture is very dark. The result is a map C that is 1 on a cut line. In clay mode the seal’s area is pressed down and the lines stand up from it. In steatite mode the lines are cut into the pale stone and filled with dark. Either way the map becomes a height map, and light from the upper left gives it relief.',
    ],
    equations: [
      { tex: T`C=\max\big(C_{\text{signs}},\ e,\ h\big),\qquad e=\operatorname{smoothstep}(0.05,0.15,\lVert\nabla T\rVert)\,(0.4+0.6\,\varepsilon)`, note: 'The cut lines: the signs and frame, the outline e of the picture (ε is the engraving slider), and the hatching h.' },
      { tex: T`h=\Big[\operatorname{frac}\!\big(\tfrac{y}{p}\big)<\theta\Big],\qquad \theta=\varepsilon\,\operatorname{clamp}\big(1.5\,(0.6-T),\,0,\,0.78\big)`, note: 'Hatching: lines every p = 4.6 px whose thickness θ rises as the tone T falls below 0.6.' },
      { tex: T`H_{\text{clay}}=-0.24\,[\text{inside}]+0.34\,C,\qquad H_{\text{steatite}}=-0.3\,[\text{outside}]-0.3\,C`, note: 'Heights before blurring: the clay is pressed down under the seal and the cut lines leave ridges; on the stone the surround is cut away and the lines cut in.' },
      { tex: T`x_i=x_0+S-7\,\mathrm{sc}-\big(i+\tfrac12\big)\,\frac{S-14\,\mathrm{sc}}{n}`, note: 'The centre of sign i, counted from the right-hand end of the band.' },
    ],
  },
  'sindhi-script': {
    paragraphs: [
      'Sindhi is written in the Arabic script with extra letters of its own, for sounds that Arabic does not have: ٻ ڀ ٽ ٿ ڄ ڃ ڇ ڌ ڏ ڙ ڪ ڳ ڱ ڻ and others. The letters join, and each takes a different shape at the start, the middle and the end of a word. The program does not do the joining itself; it gives each word to the browser, which shapes it with the Noto Naskh Arabic font, and sets the text right to left. The word list is short and is made of everyday words: Sindh, the Indus, love, peace, earth, light, a friend, language, book, water, sun, moon, art, poem, melody, knowledge, gift and lamp. It was drafted without a native proofread, so treat the spelling as provisional.',
      'Each line has a pitch of 1.45 times the letter size. Words fill the line from the right, one after another, with a gap of 0.32 to 0.42 of the font size. The size of each word follows your picture: the program measures the word at the base size, reads the tone v of the picture at its middle (the brightness on a dark page, the darkness on a cream one) and sets the size again from v. The words are bold where v is above 0.45. Where the picture is bright, the words are large and heavy; where it is dark, small and thin. The page therefore reads as a calligraphic portrait.',
    ],
    equations: [
      { tex: T`f_s=s\,\big(1-\tfrac{\kappa}{2}+\kappa\,v\big),\qquad \text{weight}=\begin{cases}700&v>0.45\\ 400&\text{otherwise}\end{cases}`, note: 'Font size from tone: s is the letter size and κ the “size follows light” slider. v = 0 gives half size at κ = 1, and v = 1 gives one and a half.' },
      { tex: T`x_{n+1}=x_n-w_n-f_s\,(0.32+0.1\,\xi),\qquad w_n=\text{measured width of word } n`, note: 'Setting a line from right to left. ξ is a random number per word.' },
      { tex: T`y_r=(r+1)\cdot1.45\,s,\qquad N_{\text{lines}}\approx\frac{H}{1.45\,s}`, note: 'Line positions.' },
      { tex: T`k_{\text{ink}}=0.45+0.6\,v\ \ (\text{gold}),\qquad k_{\text{ink}}=0.75+0.4\,v\ \ (\text{picture colours, dark page})`, note: 'Ink brightness also follows tone, so the bright areas are lit from within.' },
    ],
  },
};
