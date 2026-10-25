// src/data/theory-painterly.js
// Theory entries for the treatments of section G, Painterly and drawn.
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_PAINTERLY = {
  watercolour: {
    paragraphs: [
      'A watercolour wash is thin pigment carried by water. You see the paper through it, so a stroke can only ever darken the white underneath, and the program works in pigment (how dark each colour channel is) laid over a paper colour. The picture is first blurred, with a radius of 2 to 11 px set by the bleed slider, to stand in for water spreading. Each pixel then reads that blurred picture from a place nudged by slow noise (about ±3.5 px), the wobble of a wet brush, and each channel is pulled 55% of the way toward the nearest of seven levels, because washes settle in flat tonal steps.',
      'The pigment at a pixel is the darkness times a handful of small effects. Very light areas get nothing at all, since a painter leaves the paper bare for the highlights. Broad noise (±21%) makes the wash bloom unevenly, and fine noise makes the pigment granulate, settling in the hollows of the paper. Where the picture has an edge the pigment pools, as it does at the rim of a drying wash, and the dark rims slider controls how much. The result darkens the paper colour; an optional unpainted border with a ragged inner edge, and a faint fibre pattern, finish the sheet.',
    ],
    equations: [
      { tex: T`\tilde v=v+0.55\left(\frac{\operatorname{round}(7v)}{7}-v\right)`, note: 'Each channel v (0 to 1) of the blurred picture is flattened toward seven levels.' },
      { tex: T`m=\operatorname{clip}\Big[(1-\tilde v)\;s\;\ell\;b\;g\;\big(1+1.1\,\rho\,e\big)\Big]`, note: 's is the colour strength (0.45 to 1.2), ℓ = 1 − smoothstep(0.8, 0.97, L) the lift that keeps highlights bare, b bloom, g granulation, ρ the rim slider and e = smoothstep(0.015, 0.09, edge strength) the pooling at edges.' },
      { tex: T`C=C_{\text{paper}}\,\big(1-0.94\,m\big)`, note: 'The pigment only darkens the paper beneath it, channel by channel.' },
    ],
  },
  'oil-impasto': {
    paragraphs: [
      'Thick oil paint stands up from the canvas, and most of what we read as paint is light and shadow on that relief. So two pictures are made with the same brush strokes: a colour map and a height map. Short fat strokes are scattered over a jittered grid (spacing about 0.95 of the brush size), with a second pass at half the size covering a third of the grid for the details. Each stroke takes the colour of the blurred picture at its centre, varied by ±6%, and lies at an angle that mixes two directions: along the picture’s edges (the gradient direction turned by 90 degrees) and a loose random direction near −40 degrees. The mix weight is the follow-the-shapes slider times the local edge strength.',
      'In the height map each stroke is a little ridged landscape: a base height, three thin parallel bristle furrows along its length, and bright lips at both sides where paint piles up. The map is blurred slightly and its slopes are taken by finite differences, scaled by the thickness slider. From the slopes comes a surface normal, and the light does the rest: a diffuse term for the broad shading and a Blinn-Phong highlight for the wet shine, with the light direction set by the angle slider.',
    ],
    equations: [
      { tex: T`\theta=\arg\Big(w\,e^{\,i(\varphi+\pi/2)}+(1-w)\,e^{\,i\theta_0}\Big),\qquad w=f\cdot\operatorname{clip}\big(12\,\lVert\nabla L\rVert\big)`, note: 'Stroke angle: φ is the gradient direction, θ₀ the loose random direction, f the follow-the-shapes slider.' },
      { tex: T`\mathbf n=\frac{(s_x,\;s_y,\;1)}{\sqrt{s_x^2+s_y^2+1}}`, note: 's_x and s_y are the slopes of the height map, magnified by 1 to 9 with the thickness slider.' },
      { tex: T`C=C_{\text{paint}}\Big(0.5+0.62\,\frac{\max(0,\mathbf n\cdot\mathbf l)}{l_z}\Big)+140\,\sigma\,\max\!\big(0,\ \mathbf n\cdot\hat{\mathbf h}\big)^{26}`, note: 'Diffuse shading plus a specular glint. l is the unit light direction (l_z = 0.7 before normalising), h its half-vector with the viewer, σ the wet shine slider.' },
    ],
  },
  'charcoal-sketch': {
    paragraphs: [
      'Charcoal is a powder that sticks to the bumps of the paper and slides off the hollows, so darkness alone does not decide whether a pixel turns black. The paper’s tooth does too. The program models the tooth as a mix of smooth and white noise (55% and 45%) and compares the stick’s pressure with it. The pressure itself is the darkness of the lightly blurred picture, multiplied by the pressure slider and by streaks: noise stretched along the 45 degree diagonal, which gives the direction of a hand shading back and forth. Where the pressure is high the stick reaches the hollows and the pixel is solid; where it is low only the peaks catch, and the grain shows.',
      'The outlines are drawn more than once, the way a sketcher restates a contour. The edge map is read three times at places displaced by slow noise (2 to 12 px, from the sketchy-outlines slider) and the strongest reading wins, so lines wander and double. Smudging is a heavily blurred copy of the picture: dark regions dust the paper a little grey, as if a thumb had dragged the powder around. Four media are only different ink colours (charcoal, conté, sanguine and graphite), mixed over the paper by the final coverage.',
    ],
    equations: [
      { tex: T`\text{cov}=\operatorname{smoothstep}\big(0.6\,\tau-0.25,\ 0.6\,\tau+0.35,\ a_0\big),\qquad \tau=0.55\,n+0.45\,r`, note: 'The paper tooth τ (smooth noise n, white noise r) decides which pressure values a_0 stick.' },
      { tex: T`\ell=\max_{k=1,2,3}\ \operatorname{smoothstep}\big(0.045,\ 0.16,\ E(\mathbf x+\boldsymbol\delta_k)\big)`, note: 'The redrawn outline: the edge strength E sampled at three noise-shifted positions.' },
      { tex: T`C=(1-a)\,C_{\text{paper}}\,(1-0.55\,w)+a\,C_{\text{ink}}`, note: 'a is the final coverage, w the smudge dusting taken from a blurred copy of the picture.' },
    ],
  },
  pointillism: {
    paragraphs: [
      'Seurat’s idea was not to mix paint on the palette but to put pure dots side by side and let the viewer’s eye mix them (optical mixture). The program blurs the picture to the scale of one dot, then throws dots of random position and size onto a plain ground. The number of dots is set so that, on average, a given pixel lies under 2 to 6 of them (the coverage slider). The radius is 1.5 to 7 px, and each dot varies from 0.72 to 1.22 times that.',
      'Every dot takes the colour of the blurred picture under its centre and then wanders a little in hue, saturation and lightness (HSL), by an amount set by the colour jitter slider. Saturation is lifted so the colours are purer than the photograph, hue shifts by up to ±0.045 of the colour wheel, and lightness by ±0.1. Up to 7% of the dots (at full jitter) take the opposite hue at lower saturation, the flecks of complement that make a shadow vibrate in the divisionist manner. Because dots overlap at random, a few spots of ground show through, and the chance of that is a Poisson one.',
    ],
    equations: [
      { tex: T`n=\frac{(2+4c)\,W\,H}{\pi\,r^{2}}`, note: 'Number of dots for coverage slider c (0 to 1) and nominal radius r.' },
      { tex: T`P(\text{bare})\approx e^{-\lambda},\qquad \lambda\approx 0.96\,(2+4c)`, note: 'Chance that a pixel is under no dot at all (the 0.96 allows for the spread of dot sizes).' },
      { tex: T`h'=h+0.09\,v\,(u_1-\tfrac12),\quad s'=s\,(1.08+0.3\,v)+0.04,\quad l'=l+0.2\,v\,(u_2-\tfrac12)`, note: 'The jitter in hue, saturation and lightness; v is the colour jitter slider and u₁, u₂ are random numbers in [0, 1].' },
    ],
  },
  impressionist: {
    paragraphs: [
      'Impressionist painting works from coarse to fine, and so does the program, in three passes with brush radii R from about 7 to 21, 3.4 to 10 and 1.8 to 5.4 px (set by the brush size slider). The first pass paints over a very blurry copy of the picture, enlarged to the canvas. In the second and third passes the canvas is compared with a reference, the picture blurred to a radius of R/2. On a grid of cells 1.15 R wide, five random samples measure the colour error; a stroke is placed at the worst sample only if the average error per channel exceeds a threshold, so small brushes work where the picture still has detail. This is the layered-stroke method described by Hertzmann in 1998.',
      'A stroke follows the isophote, the line of constant brightness, so it runs along an edge instead of across it. The direction is the gradient of the blurred luminance turned by 90 degrees. The stroke takes steps of 0.9 R, up to a length set by the stroke length slider, and stops early if the reference colour has drifted too far from the stroke’s colour. The colour is then toned in the Impressionist spirit: saturation is raised, lightness lifted a little, and the darks are pushed toward violet, since shadows were painted with colour, not black. A faint woven pattern can be multiplied in for canvas.',
    ],
    equations: [
      { tex: T`\bar e=\frac{1}{15}\sum_{k=1}^{5}\big(\lvert\Delta R\rvert+\lvert\Delta G\rvert+\lvert\Delta B\rvert\big)_k>\tau,\qquad \tau=60\,(1-D)+8`, note: 'A stroke is placed in a cell only if the mean error exceeds τ; D is the detail slider (the first pass paints everywhere).' },
      { tex: T`\mathbf d=\frac{\big(-\partial_y L,\ \ \partial_x L\big)}{\lVert\nabla L\rVert},\qquad \mathbf x_{j+1}=\mathbf x_j+0.9\,R\,\mathbf d_j`, note: 'Stroke path along the isophote of the blurred luminance L (the sign is kept the same as the previous step so the stroke does not fold back).' },
      { tex: T`h'=h+\min\!\big(0.5,\ 1.4\,g\,(0.4-l)\big)\,(0.72-h)\qquad (l<0.4)`, note: 'Shadow colour: dark hues slide toward violet (0.72 of the colour wheel); g is the sunlit colour slider.' },
    ],
  },
  gouache: {
    paragraphs: [
      'Gouache is opaque and matte: the colour comes from the paint, not from the paper behind it, and a painter works from a few mixed pots. So the program chooses a palette first, by k-means clustering of the picture’s colours (the colours of paint slider sets how many), then makes the pots chalkier: saturation × 0.95 + 0.02 and lightness × 0.86 + 0.08, kept between 0.1 and 0.9. The picture is blurred (1.5 to 8.5 px), every pixel is given the label of its nearest palette colour, and two passes of a majority filter over a small neighbourhood round the ragged regions into shapes a brush could paint.',
      'Then the hand is put back. Each pixel looks up its label at a place displaced by smooth noise (up to ±5 px), so a boundary wobbles the same way on both sides. Where a different label lies a few pixels away in any of the four directions, bare paper shows through, the thin gap left between two flat areas. A wide brush drags: long streaks of noise change the colour by a few per cent, and a few dry-bristle flecks (about 40% paper) appear where a stretched noise is high.',
    ],
    equations: [
      { tex: T`\lambda(\mathbf x)=\arg\min_{k}\ \lVert \mathbf c(\mathbf x)-\mathbf p_k\rVert^{2},\qquad s'=0.95\,s+0.02,\quad l'=\operatorname{clip}(0.86\,l+0.08,\,0.1,\,0.9)`, note: 'Each pixel takes the label of the nearest palette colour p_k; the palette itself is softened in saturation and lightness.' },
      { tex: T`\mathbf x'=\mathbf x+2\,w\,\big(\boldsymbol\nu(\mathbf x)-\tfrac12\big)`, note: 'The wobble: ν is smooth 2D noise, w the hand-wobble slider (up to 5 px).' },
      { tex: T`\text{bare}=0.9\,(0.6+0.4\,n)\quad\text{if}\ \ \lambda(\mathbf x'+g\,\mathbf e)\ne\lambda(\mathbf x')\ \text{for some}\ \mathbf e\in\{\pm\hat x,\pm\hat y\}`, note: 'The gap of paper between two flat areas; g is the gaps slider in pixels and n fine noise.' },
    ],
  },
  'pencil-hatching': {
    paragraphs: [
      'An illustrator builds tone from layers of parallel strokes: one set in one direction, a second set across it, a third and a fourth where the shadow is deepest. The program does the same with up to four layers whose strokes run at 45, 135, 0 and 90 degrees (all turned together by the turn slider). A layer begins to appear only when the picture’s darkness d passes its threshold t, which is 0.16, 0.34, 0.54 and 0.74 (stretched by 1.3 when there are only two layers), so highlights stay paper and the deepest shadows are crossed four times.',
      'For one layer, the position across the strokes is the pixel’s coordinate along the layer’s normal divided by the line spacing, with slow noise added so the hand wobbles. The integer part of that number is the index of the stroke, the fractional part says where in the stroke the pixel lies. The stroke is thicker the further the darkness is past the threshold, each stroke has its own random width and pressure (seeded by its index, so every pixel along it agrees), and the layers combine by taking the strongest. Paper tooth lightens the whole thing by up to 30%, and optional soft outlines add a faint contour.',
    ],
    equations: [
      { tex: T`u_k=\frac{x\cos\theta_k+y\sin\theta_k}{s}+2.4\,\omega\,\big(\nu-\tfrac12\big),\qquad f=u_k-\lfloor u_k\rfloor`, note: 's is the line spacing, ω the hand wobble, ν slow noise; ⌊u⌋ is the stroke number and f the place inside it.' },
      { tex: T`w_k=\operatorname{clip}\!\big(3.2\,(d-t_k)+0.2,\ 0,\ 0.96\big),\qquad t=(0.16,\ 0.34,\ 0.54,\ 0.74)`, note: 'Stroke width grows with how far the darkness d is past the layer’s threshold.' },
      { tex: T`a=\max_{k}\Big[\big(1-\operatorname{smoothstep}(w_k-0.28,\ w_k,\ \lvert 2f-1\rvert)\big)\,\pi_k\Big]`, note: 'Ink coverage at the pixel; π_k is the random pressure (0.62 to 1) of its stroke in layer k.' },
    ],
  },
  'ink-wash': {
    paragraphs: [
      'Sumi-e builds its tones from a few dilutions of one ink and leaves most of the paper bare. The picture’s darkness d (the stretched lightness, blurred twice at a radius of 3 px, inverted) is rescaled from a lower bound l₀ that moves with the how-much-is-inked slider, then multiplied by the number of tone levels K. The integer part of the result is the tone and the fractional part is pushed up to the next tone by a smoothstep, so each tone is a flat wash with a short ramp between neighbours, like layers of diluted ink laid one over another. The result is blurred twice more, 1 to 7 px, which is the ink soaking sideways into damp paper.',
      'At draw time the lookup wobbles a little (up to ±2.5 px × bleed). Where the ink has an edge it is darker by up to half again, the tide-line that a drying wash leaves. Dry brush is a set of long streaks, tilted slightly, that remove up to 62% of the ink in the dark areas, the white skips of a quick stroke from a nearly dry brush. Paper fibre varies the ink by ±10%, and the final colour is paper and ink mixed by the concentration v. An optional red seal (a chop) is multiplied onto the lower right corner.',
    ],
    equations: [
      { tex: T`t=K\,\operatorname{smoothstep}(l_0,\ 1,\ d),\qquad v=\min\!\Big(1,\ \frac{1.02}{K}\big(\lfloor t\rfloor+\operatorname{smoothstep}(0.55,\,1,\ t-\lfloor t\rfloor)\big)\Big),\qquad l_0=0.6-0.5\,a`, note: 'Flat tones with short ramps; a is the how-much-is-inked slider.' },
      { tex: T`v\ \leftarrow\ v\,\Big[1-0.62\,D\,\operatorname{smoothstep}(0.58,\,0.85,\ \sigma)\,\operatorname{smoothstep}(0.35,\,0.8,\ v)\Big]`, note: 'Dry brush: σ is a noise stretched along the stroke direction, D the dry brush slider.' },
      { tex: T`C=C_{\text{paper}}\,(1-v)+C_{\text{ink}}\,v`, note: 'The ink concentration v mixes ink over paper.' },
    ],
  },
  'pastel-chalk': {
    paragraphs: [
      'Pastel is used on toned paper. The paper’s own colour supplies the shadows and middle tones, and the chalk goes on mostly for the lights. The program paints a layer of short, wide strokes, in two passes (the second half the size and covering about half the grid) along a main direction, which is the angle slider plus a spread of ±0.35 radians. Each stroke takes the colour of the blurred picture beneath it, with saturation raised by 12% and lightness set to 0.9 l + 0.1, so chalk comes out brighter and softer than the photograph.',
      'How much chalk actually stays on the paper depends on two things. First, how light the picture is there: the amount is (0.15 + 1.05 L) times the pressure times a slow noise, with L a heavily blurred lightness, so shadows are left to the paper. Second, the grain. The paper tooth is a mix of smooth and white noise, and the amount has to beat a threshold that rises with the tooth slider, which breaks every stroke into a spatter of dots. A few specks of loose dust (about 1%) are added, and the final colour is the paper and the chalk mixed by the coverage.',
    ],
    equations: [
      { tex: T`\text{amt}=\operatorname{clip}\!\Big[(0.15+1.05\,L_s)\,P\,(0.8+0.4\,n)\Big],\qquad P=0.35+0.9\,\text{pressure}`, note: 'Chalk offered to the paper: L_s is the blurred lightness, n slow noise.' },
      { tex: T`m=\alpha\ \operatorname{smoothstep}\!\Big(1.1\,\tau q-0.12(1-q)-0.05,\ \ 1.1\,\tau q+0.2+0.1(1-q),\ \ \text{amt}\Big)`, note: 'Coverage: α is the stroke layer’s own alpha, τ the paper tooth noise, q the tooth slider.' },
      { tex: T`C=C_{\text{paper}}\,(1-m)+C_{\text{chalk}}\,m`, note: 'Chalk over toned paper.' },
    ],
  },
  'blind-contour': {
    paragraphs: [
      'In a blind contour drawing the artist looks at the subject, never at the page, and the pen stays on the paper, so the line wanders and lands near but not on the edge. The program first finds the edges (the Sobel gradient of a lightly blurred, stretched lightness). It divides the picture into cells of 3 to 6.5 px, depending on the detail slider, and keeps the strongest edge pixel in each cell if it is above a threshold between 0.03 and 0.1. These points are then chained. Start at the first unused point, jump to the nearest unused point within 2.6 cells, and repeat until nothing is near enough; then lift the pen and start a new line. Lines shorter than four points are dropped. A grid of cells makes the nearest-point search fast.',
      'The wandering is added to every point: smooth noise travelling along the drawing (up to 14 px at full drift) plus a little random jitter (35% of that). The points are joined with quadratic curves that pass through the midpoints between neighbours, which turns a polyline into one continuous pen line with no corners. Each stroke has its own width (0.8 to 1.3 times the weight slider) and is drawn at 88% opacity on a speckled paper.',
    ],
    equations: [
      { tex: T`\mathcal P=\Big\{\ \arg\max_{\text{cell}}E\ :\ \max_{\text{cell}}E>\vartheta\ \Big\},\qquad \vartheta=0.1-0.07\,D`, note: 'Edge points: the strongest Sobel response E in each cell, if above the threshold set by the detail slider D.' },
      { tex: T`\mathbf q_{i+1}=\arg\min_{\mathbf q\in\mathcal P\,\setminus\,\text{used}}\lVert\mathbf q-\mathbf q_i\rVert\qquad\text{if}\quad\lVert\mathbf q_{i+1}-\mathbf q_i\rVert<2.6\,g`, note: 'Chaining the points into one pen line; g is the cell size.' },
      { tex: T`\tilde{\mathbf q}_i=\mathbf q_i+2A\,\big(\boldsymbol\nu(0.0045\,i)-\tfrac12\big)+0.35\,A\,\big(\mathbf u-\tfrac12\big)`, note: 'The hand drifts: ν is smooth noise along the line, u random numbers in [0, 1], A = 14 px × the drift slider.' },
    ],
  },
};
