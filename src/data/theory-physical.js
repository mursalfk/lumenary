// src/data/theory-physical.js
// Theory entries for the treatments of section E, Physical and 3D feel (the ones added after the first twenty).
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_PHYSICAL = {
  plasticine: {
    paragraphs: [
      'Modelling clay comes in a few flat colours, so the picture is first reduced to a small box of them. The pixels are blurred a little, k-means finds the k most typical colours (made more saturated and pulled toward the middle of the lightness range, like fresh clay), every pixel takes its nearest colour, and a majority vote over neighbouring pixels removes isolated specks. What is left is a map of regions, each one piece of clay.',
      'Each region is then puffed up into its own pillow. The region’s mask (1 inside, 0 outside) is blurred twice, so it is high in the middle and falls away at the rim, and raised to the power 1.5 to round the top. Soft round hollows (thumb dents) are subtracted at random places and a little low-frequency noise adds the hand-worked unevenness. The slope of that height map gives a surface normal, which is lit with one diffuse light and a tight specular highlight (the gloss slider). Pixels whose neighbours two steps away belong to a different piece are darkened, which draws the creases between pieces.',
    ],
    equations: [
      { tex: T`h(\mathbf x)=\Big(\operatorname{blur}^{2}(m_c)\Big)^{1.5}(\mathbf x)\ \ \text{inside piece } c,\qquad h\leftarrow h-a\,e^{-\lVert\mathbf x-\mathbf c\rVert^{2}/r^{2}}`, note: 'The pillow height of piece c from its mask m_c, and a thumb dent of depth a and radius r at c.' },
      { tex: T`s=\big(0.34+0.8\,(\mathbf n\cdot\mathbf l)^{+}\big)\big(0.78+0.22\min(1,\,h+0.2)\big)\,\kappa`, note: 'Shading: κ is 0.72 on a seam and 1 elsewhere.' },
      { tex: T`\text{spec}=0.9\,g\,\left(\Big(\tfrac{\mathbf n\cdot\mathbf m}{\lVert\mathbf m\rVert}\Big)^{+}\right)^{42}`, note: 'Gloss highlight; g is the gloss slider and m the half vector between light and viewer.' },
    ],
  },
  'embossed-leather': {
    paragraphs: [
      'Leather has two surfaces at once: the pebbled grain of the hide and the shape pressed into it by a hot die. Both are one height map. The grain is cellular noise: scatter a random site in every square of a grid, and for each pixel find the distance F1 to the nearest site and F2 to the second nearest. Where F2 − F1 is small the pixel lies on the boundary between two cells, which becomes a crease; near a site it is the top of a little dome. The picture, stretched and blurred, is added on top so that bright parts stand proud.',
      'The slope of the combined height gives the normal. Light comes from the top left; leather is lit with a broad, soft highlight (a low power of the half-vector product) because its finish is satin, not mirror. A tone factor then lifts the low, pressed-in parts a little and dims the raised ones, which softens the relief so the picture stays readable. The stitching is a row of short thread dashes along a rectangle inset from the edge, each drawn three times: a dark offset shadow, a cream thread, and a thin highlight.',
    ],
    equations: [
      { tex: T`h=L_b\Big(0.7+\tfrac{e}{40}\Big)+0.07\,g\,\Big(\operatorname{smoothstep}(0,\,0.22\,s,\,F_2-F_1)\,\big(0.55+0.45\,d\big)-1\Big)`, note: 'Height: L_b is the blurred picture, e the emboss slider, g the grain slider, s the grain spacing and d the dome term below.' },
      { tex: T`d=\max\!\Big(0,\ 1-\Big(\frac{F_1}{0.75\,s}\Big)^{2}\Big)`, note: 'The dome of one pebble: highest at its site, zero at 0.75 s.' },
      { tex: T`\text{shade}=\big(0.3+0.85\,(\mathbf n\cdot\mathbf l)^{+}\big)\big(0.9+0.2\,(1-L_b)\big)`, note: 'Diffuse shading; the second bracket is the tone factor, 1.1 where the picture is dark and 0.9 where it is bright.' },
    ],
  },
  'gold-foil': {
    paragraphs: [
      'Foil stamping lays a thin metal film onto card wherever a heated die touches it. Here the die is your picture: the foil goes where the picture is bright (or, with the toggle, where it is dark). Coverage is a smoothstep around a threshold set by the coverage slider, with a ragged edge from a little noise, so the boundary looks torn, not cut. The rest of the card shows its own colour with fine grain.',
      'Foil is crumpled, so its surface is a field of creases. The program builds a height map from ridged noise, the function 1 − |2n − 1| of smooth noise, which has sharp creases where the noise crosses its middle value, at three scales (the finer two weighted less) and bends the coordinates with a slow warp so the creases wander. The slope gives a normal, and the up-and-down tilt picks a position on a strip of colours that stands for what a metal sheet reflects: dark at the edges, bright in the middle. Each tiny panel therefore flashes a different tone. A thin brighter rim is added along the edge of the stamped area.',
    ],
    equations: [
      { tex: T`c=\operatorname{smoothstep}\big(t-0.05,\ t+0.05,\ L_b+\rho\big),\qquad t=1-\tfrac{\text{cover}}{100}`, note: 'Foil coverage c; ρ is a small noise that roughens the edge.' },
      { tex: T`h_c=0.6\,R(f_0)+0.3\,R(2.3f_0)+0.1\,R(5.1f_0),\qquad R(f)=1-\lvert 2\,n(f\mathbf x)-1\rvert`, note: 'Crumple height from ridged noise R; f₀ = 1.5 × the facet slider ÷ the picture width.' },
      { tex: T`t_{\text{env}}=0.5+1.25\,n_y+0.55\,n_x+0.28\,(L-0.5)`, note: 'Position on the foil’s colour strip from the tilt (n_x, n_y) of the normal and the picture brightness.' },
    ],
  },
  'fabric-folds': {
    paragraphs: [
      'Cloth hung from above falls in folds that run in one direction. Each fold is a wave across the cloth: a sine of position, measured along the hang direction. To make the cloth drape over your picture, the picture’s brightness is added inside the sine, so the folds bend wherever the picture changes; a slow noise also nudges the position, so the folds wander. A second sine at 2.3 times the frequency, and a bump proportional to brightness, give the folds secondary ripples and make the shape of the picture stand out.',
      'The slope of this height map is the surface normal. Cloth is lit with a diffuse term plus a broad specular highlight, and one more thing that distinguishes it from stone: a soft rim of light at grazing angles, where fibres standing up scatter light, proportional to (1 − n_z)². A woven grain, a product of two cosines at a thread spacing of a couple of pixels, dims the shading slightly. The cloth is either the picture’s own colours (softened) printed on the fabric, or one chosen colour.',
    ],
    equations: [
      { tex: T`\varphi=2\pi\big(f\,u+w\,L_b\big),\qquad u=\frac{x\cos\theta+y\sin\theta}{W}+\eta`, note: 'Phase of the folds: f is the number of folds, w = 1.6 × the “picture bends the folds” slider, θ the hang direction and η the slow wander.' },
      { tex: T`h=0.62\sin\varphi+0.22\sin(2.3\,\varphi+1.3+2L_b)+0.35\,L_b`, note: 'Height map of the cloth.' },
      { tex: T`C=\text{base}\,\big(0.28+0.82\,(\mathbf n\cdot\mathbf l)^{+}\big)\,g+255\,\sigma\Big(0.45\,\big((\mathbf n\cdot\mathbf m)^{+}\big)^{18}+0.35\,(1-n_z)^{2}\Big)`, note: 'Final colour: g is the weave factor (about 0.93 to 1), σ the sheen slider, m the half vector; the last term is the rim light of standing fibres.' },
    ],
  },
  'rubber-stamp': {
    paragraphs: [
      'A rubber stamp prints one flat colour or nothing, so the picture is cut to black and white: a pixel is inked where its brightness (stretched and blurred a little) is below the “where the ink goes” slider, after adding a small random wobble so the edge is ragged. A double border and a banner with the word, cut out of the banner, are drawn on the same plate.',
      'Inking is never even. Three things remove ink from the plate: a slow noise for uneven pressure (ink strength between about 0.6 and 1), a mid-scale noise whose high values mark worn patches where the ink is almost gone, and a scatter of single-pixel pinholes. All three scale with the worn-rubber slider. The inked layer is then turned about the centre by the tilt angle and combined with the paper by multiplication, as ink soaking into the fibres darkens whatever is beneath it.',
    ],
    equations: [
      { tex: T`\text{inked}\iff L_b+0.12\,(n-\tfrac12)+0.05\,(r-\tfrac12)<\tau,\qquad \tau=\tfrac{\text{cut}}{100}`, note: 'Where the stamp carries ink; n is smooth noise and r a random number.' },
      { tex: T`\alpha=0.96\ \kappa\ \big(0.62+0.38\,n_1+0.14\,(n_2-\tfrac12)\big)\ \chi_{\text{wear}}\ \chi_{\text{pin}}`, note: 'Ink opacity: κ is 1 on the plate; χ is 0.1 on worn patches and 0 on pinholes.' },
      { tex: T`C_{\text{out}}=C_{\text{paper}}\cdot\big(1-\alpha\,(1-C_{\text{ink}}/255)\big)`, note: 'Multiply blend of ink and paper.' },
    ],
  },
  'origami-folds': {
    paragraphs: [
      'The sheet is a grid of squares. In each square the paper is folded in one of three ways, chosen at random: four small triangles meeting at the centre, or two triangles along one of the diagonals. Every triangle is a flat facet that takes its colour from the picture at its centre (slightly softened, so it looks like coloured paper), or plain white if you choose that.',
      'What makes it look folded is shading. Each facet leans in a direction (outward from the centre for the four-facet fold, perpendicular to the diagonal for the two-facet folds). A facet leaning toward the light is brightened and one leaning away is darkened, in proportion to the dot product of its direction and the light direction in the picture plane, with a random sign per square and a small random tilt per facet. Crease lines are drawn on top as a dark line with a pale line one pixel beside it, which is how a real fold looks, and a fine grain finishes the paper.',
    ],
    equations: [
      { tex: T`\text{shade}=1+\phi\,\Big(0.62\,\varepsilon\,(\mathbf d\cdot\mathbf l)+0.5\,(r-\tfrac12)\Big)`, note: 'Brightness factor of a facet: φ is the fold-strength slider, ε = ±1 per square, d the facet’s direction, l the light direction and r a random number.' },
      { tex: T`\text{fold}\ \in\ \{4\text{ triangles about the centre},\ \diagdown\ \text{split},\ \diagup\ \text{split}\},\qquad P\approx 0.34,\ 0.33,\ 0.33`, note: 'The three fold types, chosen with roughly equal chance (0.34, 0.33 and 0.33).' },
    ],
  },
};
