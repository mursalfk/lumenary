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
  'soft-3d': {
    paragraphs: [
      'The picture is first simplified into a handful of flat shapes: smoothing that keeps edges, a small palette found by k-means, and a majority filter that rounds the shapes off. Height is then invented for each shape. A map that is 0 on every outline and 1 elsewhere is blurred twice, so the zeros spread inward as a slope, and the result is raised to the power 2.2. Each shape ends up with the cross-section of a cushion: low at the seam, level in the middle. The inflation slider sets the blur radius, that is, how far in from the seam the swelling reaches.',
      'The slopes of that height map give a surface normal at every pixel, and the normal is lit. Diffuse light is wrapped, so the side turned away from the lamp is dim, not black, as on a soft translucent toy. The sheen is the Blinn-Phong highlight computed twice, once tight and once broad. Seams are darkened, each shape drops a small shadow on its neighbour on the side away from the light, and a rim of cool light is added where the surface turns away from the viewer. The colour underneath is four parts flat paint to one part smoothed picture, so faces keep a little of their gradient.',
    ],
    equations: [
      { tex: T`h=\Big(B_{r/2}^{2}\,B_{r}^{2}\,[\text{not an outline}]\Big)^{2.2}`, note: 'Height: B² is two box blurs of the given radius; r runs from 4 to 11 pixels with the inflation slider.' },
      { tex: T`d=\operatorname{clamp}\big(0.62\,(\mathbf n\cdot\mathbf l)+0.42\big),\qquad \mathbf n=\frac{(s_x,\ s_y,\ 1)}{\sqrt{s_x^{2}+s_y^{2}+1}}`, note: 'Wrapped diffuse light from the normal n, built from the slopes of h, and the light direction l.' },
      { tex: T`s=g\,\big(0.85\,(\mathbf n\cdot\mathbf h)^{46}+0.12\,(\mathbf n\cdot\mathbf h)^{7}\big),\qquad \mathbf h=\frac{\mathbf l+\mathbf v}{\lvert\mathbf l+\mathbf v\rvert}`, note: 'Sheen: a tight and a broad highlight around the half vector h; v points at the viewer, g is the sheen slider.' },
    ],
  },
  sticker: {
    paragraphs: [
      'There is no trained model here to find the subject, so it is guessed from two cheap clues. The colour of the frame’s border is averaged over a band 4% wide, and every pixel is scored by how unlike that colour it is, plus a little for being near the middle. The score is blurred and cut at a threshold set by the slider. Of the patches that survive, the largest connected one is kept, found by flood fill, and its holes are closed by flooding the outside from the border and keeping whatever the flood could not reach. If the patch is under 5% or over 90% of the frame the guess has failed, and a rounded square is used.',
      'The white border is the shape grown outward. Blurring the shape and taking a low level of the blur does that, and rounds every notch on the way, which is how a cutting plotter treats a sticker too. The artwork is the flat-colour cartoon of the picture, with a dark keyline where it meets the border. The sticker is built on a sheet larger than the picture, so the border has room where the subject runs off the frame. Gloss is a slanted band of light kept to the sticker’s own pixels, and the peel is a true reflection: everything beyond a diagonal line is removed and drawn again mirrored in that line, in grey.',
    ],
    equations: [
      { tex: T`\text{score}=0.8\,\operatorname{clamp}\!\Big(\frac{\lVert C-C_{\text{edge}}\rVert_{1}}{300}\Big)+0.2\,\big(1-\operatorname{clamp}(u^{2}+v^{2})\big)`, note: 'How likely a pixel is to be subject: distance of its colour C from the border’s average, and closeness to the centre (u, v from −1 to 1).' },
      { tex: T`\text{border}=S_{0.035,\,0.075}\!\Big(B_{b}^{2}\,B_{4}^{2}\,M\Big)`, note: 'The sticker’s outline: the mask M blurred, then blurred again by the border width b, and cut at a low level.' },
      { tex: T`(x,\ y)\ \mapsto\ (c-y,\ c-x)`, note: 'The peel: reflection in the fold line x + y = c.' },
    ],
  },
  'marble-museum': {
    paragraphs: [
      'A relief keeps the big forms of its subject and only hints at the small ones. The height map is therefore mostly a well-blurred copy of the brightness with a share of the sharp picture mixed in, set by the “fine chisel work” slider. Slopes of that map give a normal at every pixel. Marble lets light a little way in before scattering it back, so the diffuse term is gentle and clamped well above black. Hollows collect shade: where the surface lies below its own local average it is darkened by up to half. Polish adds a tight highlight and a faint broad one.',
      'The stone itself is three layers of noise. Soft clouding blends the two body colours. Veins appear where a warped fractal noise crosses its middle value: folding the noise about one half turns that crossing into a ridge, and a high power thins the ridge to a line. A second, finer set is added the same way. On the gallery wall the slab is drawn at four fifths of the width with a shadow thrown away from the spotlight, its cut edges are lit or dimmed according to the side the light comes from, and a brass plate carries the title.',
    ],
    equations: [
      { tex: T`h=(1-\tfrac12 q)\,B_{7}^{2}L+\tfrac12 q\,B_{1.5}L`, note: 'Height: broad forms plus a share q of fine detail (the chisel slider, 0 to 1).' },
      { tex: T`I=\operatorname{clamp}\big(0.36+0.84\,(\mathbf n\cdot\mathbf l),\ 0.2,\ 1.3\big)\cdot\Big(1-\operatorname{clamp}\big(3.2\,(\bar h-h),\,0,\,0.5\big)\Big)`, note: 'Shading: soft diffuse light times the darkening of hollows; h̄ is the local average height.' },
      { tex: T`\text{vein}=\operatorname{clamp}\Big(1.1\,\big(1-\lvert 2N_1-1\rvert\big)^{9}+0.5\,\big(1-\lvert 2N_2-1\rvert\big)^{12}\Big)`, note: 'N₁ and N₂ are warped fractal noises at two scales; the fold makes a ridge where each crosses one half.' },
    ],
  },
  'felt-story': {
    paragraphs: [
      'The picture is cut into a few pieces of felt: smoothing that keeps edges, a small palette, and a majority filter applied twice so that every piece is a simple shape. Felt is dyed wool, strong in colour but never glossy, so each colour loses some saturation and its lightness is squeezed toward the middle. Scissors do not cut felt cleanly, so the boundary of every piece is displaced by fine noise before anything is drawn. The nap is three noises of different size added to the brightness, with the odd lighter hair.',
      'Stitching needs to know how far each pixel is from the edge of its piece. A one-pixel outline, blurred twice with a box of radius r, becomes a ridge whose height falls off in a straight line with distance; multiplied by the box width it runs from 1 on the edge to 0 about 2r pixels in. The running stitch is the band where that value corresponds to six and a half pixels from the edge. It is broken into dashes by the pixel’s position along whichever axis the edge runs, and the thread is light on dark felt and dark on light. Layers are told apart by shadow: a pixel is shaded when the felt three pixels up and to the left is a different piece.',
    ],
    equations: [
      { tex: T`n=(2r+1)\,B_{r}^{2}E\ \approx\ 1-\frac{d}{2r+1}`, note: 'Nearness to the edge: E is the one-pixel outline, B² two box blurs of radius r = 5, d the distance from the edge in pixels.' },
      { tex: T`\text{stitch}\iff\Big\lvert n-\Big(1-\frac{6.5}{2r+1}\Big)\Big\rvert<\frac{1.1}{2r+1}\ \ \text{and}\ \ \operatorname{frac}\frac{a}{\ell}<0.58`, note: 'A dashed line 6.5 px in from the edge: a is the position along the edge and ℓ the dash length.' },
      { tex: T`f=1+0.12\,(N_{0.9}-\tfrac12)+0.10\,(N_{0.22}-\tfrac12)+0.09\,(\eta-\tfrac12)`, note: 'The nap: two value noises and a per-pixel hash η, as a factor on the felt’s colour.' },
    ],
  },
  'pin-art': {
    paragraphs: [
      'Each pin is a damped spring chasing a target height. The target comes from the brightness l of the picture over the pin, with the contrast lifted: t = clamp(1.3 (l - 0.5) + 0.5)^0.8, or 1 minus that if the dark parts should stand out, plus a travelling ripple 0.08 w sin(2 pi (1.3 x/n_x + 0.9 y/n_y) - 1.5 tau), with w the ripple slider and tau the time. The height h obeys h\'\' = k (t - h) - c h\', stepped in pieces of at most 16 ms. The springiness slider sets k between 60 and 14 and the damping c from just over critical to about a third of it, which is the difference between a pin that creeps into place and one that rebounds.',
      'The cursor is a Gaussian of width 0.075 of the picture. Where it is, a pin is pushed down at once to a cap of 1 - g, where g is the Gaussian times a hold factor that eases to 1 while the cursor is inside; its velocity is cut so that it does not bounce upward, and the spring takes it back as the cursor moves on. Each pin is then drawn in its cell as a sphere of radius rho = 0.6 + 0.33 H, where H is its height times the relief slider. The normal at offset (u, v) is (u, v, sqrt(rho^2 - u^2 - v^2)) / rho; the diffuse term is its dot product with the light direction (-0.42, -0.52, 0.74), normalised, and the highlight is (2 n_z (n . L) - L_z)^36, stronger for tall pins. The head is brightened by (0.3 + 0.9 diffuse)(0.3 + 1.05 H), and the gap between pins is near black with a thin rim of light on the shaft of tall ones.',
    ],
    equations: [
      { tex: T`h''=k\,(t-h)-c\,h',\qquad k\in[14,60],\quad c=2\sqrt{k}\,\big(1.05-0.73\,s\big)`, note: 'A pin chases its target t; s is the springiness slider (0 to 1).' },
      { tex: T`\rho=0.6+0.33\,H,\qquad \mathbf n=\Big(\tfrac{u}{\rho},\ \tfrac{v}{\rho},\ \sqrt{1-\tfrac{u^{2}+v^{2}}{\rho^{2}}}\Big)`, note: 'A head’s radius grows with its height H, and its normal follows the sphere.' },
      { tex: T`B=(0.3+0.9\,\mathbf n\!\cdot\!\mathbf L)(0.3+1.05\,H),\qquad S=(2n_z\,\mathbf n\!\cdot\!\mathbf L-L_z)^{36}`, note: 'Brightness of a head and its specular highlight.' },
    ],
  },
};
