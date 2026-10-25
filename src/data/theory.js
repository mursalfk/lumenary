// The mathematics behind each treatment. Every statement here mirrors what the code in
// src/engine does; if you change an algorithm, change its entry too.
import { THEORY_DESIGN } from './theory-design.js';
import { THEORY_DIGITAL } from './theory-digital.js';
import { THEORY_TYPE } from './theory-type.js';
import { THEORY_LIGHT } from './theory-light.js';
import { THEORY_PHYSICAL } from './theory-physical.js';
import { THEORY_CRAFT } from './theory-craft.js';
import { THEORY_PAINTERLY } from './theory-painterly.js';
import { THEORY_OPTICAL } from './theory-optical.js';
import { THEORY_GENERATIVE } from './theory-generative.js';
import { THEORY_MOTION } from './theory-motion.js';
import { THEORY_WORLD } from './theory-world.js';
import { THEORY_SINDHI } from './theory-sindhi.js';
import { THEORY_SOUTHASIA } from './theory-southasia.js';
import { EXTRA } from './theory-extra/index.js';

const T = String.raw;

export const THEORY_INTRO =
  'There is no filter library behind Lumenary. Each treatment is a short program that reads the pixels of your ' +
  'picture, does some arithmetic and draws the result on a canvas. These pages lay that arithmetic out in the open, ' +
  'like notes in a lab book. The first part covers the tools every treatment shares, and the rest takes the ' +
  'treatments one section at a time.';

export const FOUNDATIONS = [
  {
    id: 'brightness',
    title: 'Pixels, brightness and resampling',
    paragraphs: [
      'A photograph arrives as a grid of pixels, each holding red, green and blue values from 0 to 255. Most treatments need a single number per pixel instead: how bright it is. Our eyes are most sensitive to green and least to blue, so brightness is a weighted sum of the three channels. The weights are the ones defined for HD television (Rec. 709). They are applied to the stored values directly, without first undoing the display gamma. That is not photometrically exact, but it is what the canvas offers and it is plenty for an artistic effect.',
      'Before any work is done the picture is shrunk to the treatment’s working size. Shrinking in one jump skips pixels and produces jagged aliasing, so the picture is halved repeatedly, each step averaging every 2 × 2 block into one pixel. Treatments that need only a coarse grid (dots, characters, blocks) then sample that small image, which means each dot or letter is the average of the patch it stands for, not one stray pixel.',
    ],
    equations: [
      { tex: T`L \;=\; \frac{0.2126\,R \;+\; 0.7152\,G \;+\; 0.0722\,B}{255}`, note: 'Brightness L between 0 (black) and 1 (white).' },
      { tex: T`p'_{x,y} \;=\; \tfrac14\left(p_{2x,2y} + p_{2x+1,2y} + p_{2x,2y+1} + p_{2x+1,2y+1}\right)`, note: 'One halving step. Repeated until the target size is reached.' },
    ],
  },
  {
    id: 'smoothing-edges',
    title: 'Smoothing and finding edges',
    paragraphs: [
      'Edges are where brightness changes quickly, so finding them means measuring slope. The Sobel operator estimates the slope in two directions by sliding two small 3 × 3 grids of weights over the brightness map. The length of the resulting slope vector is the edge strength: large on an outline, near zero on a flat wall.',
      'Raw photographs are noisy, and noise looks like edges. So the brightness is blurred first. The blur here is a box blur, the plain average of a window, computed with a running sum so its cost does not depend on the radius, and done separately along rows and then columns. Neon glow, comic book, blueprint and neo-brutalism all use this blur-then-Sobel pipeline and differ only in what they draw where the edge strength is high.',
    ],
    equations: [
      { tex: T`G_x=\begin{bmatrix}-1&0&1\\-2&0&2\\-1&0&1\end{bmatrix}\!*L,\qquad G_y=\begin{bmatrix}-1&-2&-1\\0&0&0\\1&2&1\end{bmatrix}\!*L`, note: 'Slope in x and in y. The star is convolution: multiply and add under the grid.' },
      { tex: T`\lvert\nabla L\rvert \;=\; \tfrac14\sqrt{G_x^{2}+G_y^{2}}`, note: 'Edge strength, scaled to roughly 0 to 1.' },
      { tex: T`B(x)\;=\;\frac{1}{2r+1}\sum_{i=-r}^{r}L(x+i)`, note: 'Box blur of radius r along one axis.' },
    ],
  },
  {
    id: 'interpolation',
    title: 'Interpolation and easing',
    paragraphs: [
      'Whenever a program asks for the value at a position between two pixels, it has to invent one. Bilinear interpolation blends the four surrounding pixels, weighting each by how close the position is to it. Several treatments (liquid morph, wireframe, art deco) use it so that moving a sample point by a fraction of a pixel changes the result smoothly.',
      'Smoothstep is the other recurring curve. It turns a straight ramp from 0 to 1 into an S shape whose slope is zero at both ends, so a transition starts and stops gently. It is used to soften edges into lines and to ease the control grid of the gradient mesh.',
    ],
    equations: [
      { tex: T`f(s,t)=(1-s)(1-t)\,a+s(1-t)\,b+(1-s)\,t\,c+s\,t\,d`, note: 'Bilinear blend of four neighbours a, b, c, d with fractional offsets s and t.' },
      { tex: T`S(x)=3u^{2}-2u^{3},\qquad u=\operatorname{clamp}\!\left(\frac{x-a}{b-a},0,1\right)`, note: 'Smoothstep from edge a to edge b.' },
    ],
  },
  {
    id: 'randomness',
    title: 'Seeded randomness and noise',
    paragraphs: [
      'Nothing here uses the browser’s own random numbers, because a result you can’t reproduce is a result you can’t export twice. Instead the treatments use a small seeded generator (mulberry32). Given the same seed it always produces the same sequence, so a still looks identical at preview size and at export size. The “shuffle” buttons simply change the seed.',
      'Where a treatment needs randomness tied to a place (film grain, the clay’s fingerprints, the VHS static) it uses a hash of the pixel coordinates. For smooth, cloud-like variation it blends the hashes at the four nearest lattice points with the smoothstep curve, which is called value noise.',
    ],
    equations: [
      { tex: T`s_{n+1}=\left(s_n+\mathrm{0x6D2B79F5}\right)\bmod 2^{32}`, note: 'The state advance of mulberry32. A few xor-shift-multiply steps then scramble s into a number in [0, 1).' },
      { tex: T`N(x,y)=\operatorname{lerp}\!\Big(\operatorname{lerp}\big(h_{00},h_{10},u\big),\ \operatorname{lerp}\big(h_{01},h_{11},u\big),\ v\Big),\quad u=3x_f^2-2x_f^3,\ v=3y_f^2-2y_f^3`, note: 'Value noise from lattice hashes h; x_f and y_f are the fractional parts of the position.' },
    ],
  },
  {
    id: 'tone-colour',
    title: 'Tone curves and colour spaces',
    paragraphs: [
      'Contrast controls throughout the app use one curve: pivot around mid-grey and multiply the distance from it by a slope. The slider value c, from −1 to 1, is mapped through a tangent so that zero means “unchanged”, the left end flattens the picture to grey and the right end snaps it toward black and white.',
      'To change how colourful a picture is without changing how bright it is, colours are converted from red-green-blue to hue-saturation-lightness, saturation is scaled, and the result is converted back. Palette treatments (pixel art, Bauhaus) also need to choose the “nearest” colour from a short list, which is done by comparing squared differences between channels.',
    ],
    equations: [
      { tex: T`f=\tan\!\Big(\frac{(c+1)\,\pi}{4}\Big),\qquad L'=\operatorname{clamp}\big((L-\tfrac12)\,f+\tfrac12\big)`, note: 'Contrast. At c = 0 the slope f is exactly 1.' },
      { tex: T`C_{\text{out}}=\alpha\,C_{\text{src}}+(1-\alpha)\,C_{\text{dst}}`, note: 'The “over” operator the canvas uses whenever something is drawn with partial opacity.' },
    ],
  },
  {
    id: 'canvas',
    title: 'Compositing, speed and export',
    paragraphs: [
      'Drawing order and blend modes are part of the maths. Neon glow adds light with the “lighter” mode (sums channels), halftone inks combine with “multiply” (like real transparent inks), and kinetic type uses “destination-in” to keep your picture only where the letters are.',
      'Every size in a treatment is stored as a count or a fraction of the picture’s width, never as pixels. That is what makes the exported PNG, rendered at up to three times the preview size, the same picture as the preview, only sharper. Live treatments run at a capped working size (roughly 600 to 900 pixels on the long side) so every frame finishes in a few milliseconds, and still treatments are re-rendered at full size only when you save.',
    ],
    equations: [],
  },
];

const BASE_THEORY = {
  particles: {
    paragraphs: [
      'The picture is divided into a grid, and every cell becomes one particle with a home position (its “target”) near the cell centre, nudged by a random jitter of up to 0.35 of a cell so the dots do not look like a lattice. In original-colour mode each particle takes the colour of its cell, reduced to 4 bits per channel (at most 4096 colours) so that thousands of particles can be drawn in a few dozen batches instead of changing paint thousands of times. In white mode the colour is fixed and brightness is carried by the dot’s size instead.',
      'Motion is a damped spring simulation. Each particle is pulled toward its target with a spring of stiffness 60. When the cursor is inside the canvas, any particle within 16% of the width is pushed away, hardest at the centre of the cursor and fading smoothly to nothing at its edge. Velocity is multiplied by an exponential damping factor every frame so the particles settle rather than oscillate forever. Clicking gives each nearby particle a random impulse. The step size is clamped, so a slow frame can never make the simulation explode.',
    ],
    equations: [
      { tex: T`\mathbf a_i \;=\; k\,(\mathbf T_i-\mathbf x_i)\;+\;A\Big(1-\frac{d}{R}\Big)^{2}\,\hat{\mathbf d},\qquad d<R=0.16\,W`, note: 'Spring toward the target T plus repulsion from the cursor; d is the distance to the cursor, d-hat the direction away from it. k = 60.' },
      { tex: T`\mathbf v\leftarrow(\mathbf v+\mathbf a\,\Delta t)\,e^{-\gamma\Delta t},\qquad \mathbf x\leftarrow\mathbf x+\mathbf v\,\Delta t,\quad\gamma=11`, note: 'Semi-implicit Euler step with exponential damping.' },
      { tex: T`r_i=\tfrac12\,s\,\sigma\,\big(0.12+0.95\sqrt{L_i}\big)`, note: 'White mode: dot radius from cell size s, size slider σ and brightness. The square root makes dot area, not radius, track brightness.' },
    ],
  },
  'liquid-morph': {
    paragraphs: [
      'The picture is never changed, only looked up in a different place. For every output pixel the program computes an offset and reads the source pixel at the shifted position. The offsets form a smooth, slowly moving vector field built from sines whose phases are themselves bent by other sines (a simple form of domain warping), which is what gives the motion its liquid, non-repeating look.',
      'To keep it fast the field is calculated only at nodes six pixels apart and then blended up to every pixel bilinearly. Three effects ride on top. The cursor adds a ripple: a ring-shaped wave that decays exponentially with distance and travels outward over time. Colour split reads the red, green and blue channels at slightly different strengths of the same offset, so the channels drift apart like a prism. Sheen brightens or dims each pixel according to the vertical slope of the field, as if the surface were catching light.',
    ],
    equations: [
      { tex: T`f_1=\sin\!\big(5.5F v+1.3\tau+1.6\sin(3.1F u+0.7\tau)\big),\quad f_2=\cos\!\big(5.0F u-1.1\tau+1.5\sin(2.7F v-0.9\tau)\big)`, note: 'The two components of the field at normalised position (u, v), wave scale F and time τ.' },
      { tex: T`\mathbf d=A\,(f_1,f_2)\;+\;e^{-\rho/(0.2W)}\sin(0.07\rho-7t)\,\max(A,0.02W)\,0.9\,\hat{\boldsymbol\rho}`, note: 'Total displacement; A = strength × 0.07 W. The second term is the cursor ripple at distance ρ.' },
      { tex: T`R(\mathbf x)=S(\mathbf x+\mathbf d(1+s)),\quad G(\mathbf x)=S(\mathbf x+\mathbf d),\quad B(\mathbf x)=S(\mathbf x+\mathbf d(1-s))`, note: 'Colour split: each channel samples the source S at a different multiple of the offset.' },
    ],
  },
  holographic: {
    paragraphs: [
      'Real holographic foil changes colour with the viewing angle. Here the “angle” is replaced by a coordinate that mixes three things: the pixel’s own brightness, its position across a tilted axis, and time. That coordinate is wrapped into the range 0 to 1 and used as a hue, looked up in a precomputed table of 512 fully saturated colours. Because brightness is part of the coordinate, the rainbow follows the shapes in your picture rather than lying on top of it like a gradient.',
      'The foil colour is mixed with the base picture (greyscale or original) in proportion to the intensity slider, and weighted by brightness so shadows stay dark. A soft white band, shaped like a Gaussian bell across the tilted axis, sweeps over the surface; hovering moves it to the cursor. Finally, sparkle sets a tiny random fraction of the brighter pixels to white every tenth of a second, using a coordinate hash so each frame’s glitter is different but cheap.',
    ],
    equations: [
      { tex: T`h=\operatorname{frac}\!\big(\sigma\,L+0.9\,(u\cos\theta+v\sin\theta)+\tau\big),\qquad\theta=0.6\ \text{rad}`, note: 'Hue of the foil at a pixel: brightness L, spread σ, position along the tilted axis, drift τ.' },
      { tex: T`C=(1-k)\,C_{\text{base}}+k\,C_{\text{foil}}(h)\,(0.35+0.9L)`, note: 'Mix of base picture and foil; k is the intensity slider.' },
      { tex: T`\text{band}=e^{-q^{2}}\,b\cdot0.75,\qquad q=\frac{(u\cos\theta+v\sin\theta)-p}{w}`, note: 'The moving light band: a Gaussian of width w centred at position p.' },
    ],
  },
  'neon-glow': {
    paragraphs: [
      'The picture is reduced to its outlines with the blur-then-Sobel pipeline described in the foundations. Where the edge strength exceeds a threshold the pixel becomes a bright line; the threshold is chosen by the detail slider, so more detail means a lower threshold and more lines. The lines are coloured by a diagonal gradient between your two neon colours, or by a brightened copy of the original colours.',
      'Glow is the interesting part. A true Gaussian blur of the whole image would be slow, so the line layer is shrunk four times, each time to half the size, and every smaller copy is drawn back at full size with additive blending. Smoothing during enlargement spreads each line’s light outward, and the sum of several scales behaves like a wide, soft halo around a hard core. This is the same idea as a mipmap pyramid. Finally the whole sign flickers, as old neon does, with two sine waves of different frequency and an occasional brief dip to 45%.',
    ],
    equations: [
      { tex: T`a=S_{\theta,\,2\theta}\big(\lvert\nabla L_b\rvert\big),\qquad\theta=\operatorname{lerp}(0.26,\,0.03,\ \text{detail})`, note: 'Line opacity: smoothstep of the edge strength of the blurred brightness L_b.' },
      { tex: T`C_{\text{out}}=E+\sum_{j=1}^{4} g\,w_j\,\operatorname{up}(E_j),\qquad w=(0.95,0.85,0.75,0.65)`, note: 'Additive bloom: E is the sharp line layer, E_j the same layer at 1/2^j size, up() the smooth enlargement, g the glow slider.' },
      { tex: T`f(t)=0.93+0.05\sin(9.1\,t)+0.03\sin(23.7\,t)`, note: 'Flicker brightness; multiplied by 0.45 when (0.37 t) mod 1 > 0.965.' },
    ],
  },
  'wireframe-3d': {
    paragraphs: [
      'Brightness is read as altitude. The picture is sampled onto a grid (up to 170 columns by the chosen number of lines), lightly blurred, and every grid point becomes a 3D point whose height is its brightness. The program then does what a 3D engine does, by hand: rotate the terrain about the vertical axis (the yaw, which follows your cursor or turns by itself), tilt it toward the camera (the pitch), and project it onto the screen with perspective, so that nearer points are drawn larger.',
      'In ridgeline mode there is no depth buffer. Instead the lines are drawn from the back of the terrain to the front, and each line is first filled with the background colour below it. A closer ridge therefore hides the lines behind it, which is the painter’s algorithm and the way the famous pulsar album cover was drawn. Line opacity and thickness increase toward the front for a sense of depth. Mesh mode skips the fill and draws both rows and columns.',
    ],
    equations: [
      { tex: T`\begin{aligned}X&=x\cos\psi-z\sin\psi,\qquad Z=x\sin\psi+z\cos\psi\\ Y'&=y\cos\varphi-Z\sin\varphi,\qquad Z'=Z\cos\varphi+y\sin\varphi\end{aligned}`, note: 'Yaw ψ about the vertical axis, then pitch φ. (x, y, z) is the terrain point, with y = height × brightness.' },
      { tex: T`s=\frac{S\,D}{D-Z'},\qquad (x_{\text{screen}},y_{\text{screen}})=(c_x+X\,s,\ c_y-Y'\,s),\quad D=3.2`, note: 'Perspective projection from a camera at distance D; points with larger Z′ (nearer) get a larger scale s.' },
    ],
  },
  glassmorphism: {
    paragraphs: [
      'Frosted glass is a blurred copy of the picture shown through a window. To get a smooth blur without an expensive convolution, the picture is shrunk by a factor that depends on the frost slider and then enlarged back in successive doublings with smoothing on. Each shrink throws away fine detail, and each smooth enlargement spreads what is left, which is a low-pass filter: the more it shrinks, the lower the cutoff and the stronger the frost.',
      'Each panel is then built in layers. A soft shadow is drawn first. The panel shape is a rounded rectangle, used as a clip, inside which the blurred picture is drawn, then a translucent tint (white for light glass, near-black for smoke) mixed in by the “over” operator, then a diagonal sheen gradient that fades from bright to nothing, and finally a one-pixel border whose brightness varies along the diagonal so the glass seems to catch light on two corners. The panels’ positions are a fixed layout nudged by a seeded random offset, so “Rearrange” always gives a new but reproducible composition.',
    ],
    equations: [
      { tex: T`f=\frac{1}{1.5+b/5}`, note: 'Down-scale factor for frost amount b (0 to 100). The blurred layer is built at f × the picture size.' },
      { tex: T`C=\alpha_{\text{tint}}\,C_{\text{tint}}+(1-\alpha_{\text{tint}})\,C_{\text{blur}}`, note: 'Tint over blur, with α = opacity × 0.55 for light glass.' },
      { tex: T`r=\frac{\text{radius}}{100}\cdot0.2\cdot\min(W,H)`, note: 'Corner radius is a fraction of the shorter side.' },
    ],
  },
  'kinetic-type': {
    paragraphs: [
      'The words are rendered in an extra-heavy typeface, repeated along each row with a gap between repeats, and every row slides at its own speed in alternating directions. The speed of row i is a base speed times a factor that cycles through three values, and each row starts at a different phase, so the rows never line up and the composition keeps changing.',
      'The picture appears through the letters by masking. All filled rows are drawn in white into a separate mask canvas; the picture (brightened first) is drawn into a third canvas, and the “destination-in” blend keeps the picture only where the mask is opaque. Nothing is cut out pixel by pixel: the compositor does a per-pixel multiplication of picture by mask for us. Outline rows are drawn directly as strokes on top of the background. The brighten slider is a gamma curve applied through a 256-entry lookup table, so the cost is one table read per channel.',
    ],
    equations: [
      { tex: T`\text{offset}_i=\Big(t\,v_i\,d_i+0.31\,i\,w\Big)\bmod w,\qquad v_i=\tfrac{s}{100}\,0.32\,W\,\big(0.6+0.25\,(i\bmod 3)\big)`, note: 'Horizontal position of row i: direction d_i = ±1 alternates, w is the width of one repeat of the words.' },
      { tex: T`C_{\text{out}}=C_{\text{picture}}\cdot M_\alpha`, note: 'Destination-in compositing: picture colour times the mask’s alpha.' },
      { tex: T`g=1-\tfrac12\,\frac{\text{lift}}{100},\qquad c'=255\,\Big(\frac{c}{255}\Big)^{g}`, note: 'Gamma lift; g < 1 brightens the mid-tones.' },
    ],
  },
  isometric: {
    paragraphs: [
      'The picture is reduced to a small grid and every cell becomes a block. A block’s colour is the cell’s colour; its height is the cell’s brightness, stretched so the darkest cell in the picture is as low as the lightest is tall (an “auto-levels” step that keeps flat pictures from producing a flat city). Each block is drawn as three flat faces: a top, a left side and a right side.',
      'The projection is the 2:1 “dimetric” used in pixel-art games, where every step along a grid axis moves half a tile across and a quarter of a tile down. It is not mathematically isometric (which would use 30° and a 1:1.15 ratio) but it keeps lines on whole-pixel steps and looks cleaner. Because there is no depth buffer, blocks are drawn in order of i + j, back to front, so nearer blocks cover farther ones. The three faces get fixed brightness multipliers, which is Lambert shading for a light at a fixed position, and the whole city is scaled to fit the canvas.',
    ],
    equations: [
      { tex: T`X=X_0+(i-j)\,\frac{w}{2},\qquad Y=Y_0+(i+j)\,\frac{w}{4}-h`, note: 'Screen position of the top of block (i, j) with tile width w and block height h.' },
      { tex: T`h=\Big(\frac{L-L_{\min}}{\max(0.05,\,L_{\max}-L_{\min})}\Big)^{1.1}H_{\max}+0.08`, note: 'Block height from normalised brightness.' },
      { tex: T`C_{\text{top}}=1.08\,C,\qquad C_{\text{left}}=0.62\,C,\qquad C_{\text{right}}=0.40\,C`, note: 'Face shading.' },
    ],
  },
  'clay-3d': {
    paragraphs: [
      'Clay is a lighting calculation. The picture’s brightness, blurred twice so the surface is soft, is treated as a height map: bright is raised, dark is pressed in. At each pixel the slope of that surface is measured with central differences, which gives a surface normal, the direction the clay faces. The flatter the surface, the more the normal points straight at the viewer.',
      'The normal is then lit by a single light whose direction you set with the angle slider. Two terms are added. Diffuse (Lambert) lighting is brightest where the surface faces the light. The specular term, a Blinn-Phong highlight raised to a high power, adds the small glossy shine of damp clay. Ambient occlusion is faked by darkening where the blurred brightness is low, as if hollows catch less light. “Fingerprints” are value noise at two scales added to the slope before lighting, so the surface acquires the dents of a hand. Finally the colours are desaturated and pulled toward a mid-lightness so they read as pigment in clay rather than as a photograph.',
    ],
    equations: [
      { tex: T`\mathbf n=\frac{\big(-k\,\partial_xL_b,\ -k\,\partial_yL_b,\ 1\big)}{\left\lVert\big(-k\,\partial_xL_b,\ -k\,\partial_yL_b,\ 1\big)\right\rVert},\qquad\partial_xL_b\approx\tfrac12\big(L_b(x{+}1)-L_b(x{-}1)\big)`, note: 'Surface normal from the blurred brightness; k is the depth slider.' },
      { tex: T`\mathbf l=\frac{(\cos\alpha,\,-\sin\alpha,\,0.7)}{\lVert\cdot\rVert},\qquad\mathbf h=\frac{\mathbf l+(0,0,1)}{\lVert\cdot\rVert}`, note: 'Light direction from the angle α, and the half-vector for the highlight.' },
      { tex: T`I=(0.3+0.78\,\max(0,\mathbf n\!\cdot\!\mathbf l))\,(0.82+0.18\,L_b)\;+\;0.22\,(\mathbf n\!\cdot\!\mathbf h)^{28}`, note: 'Diffuse × ambient occlusion, plus the specular highlight.' },
    ],
  },
  'ascii-art': {
    paragraphs: [
      'The picture is sampled to a grid of cells, one per character. The number of columns is the detail slider; the number of rows follows from the font’s shape, because a letter is taller than it is wide. The program measures how wide the monospace font’s “M” is at a reference size, and from that works out the font size that makes the chosen number of characters exactly fill the width.',
      'Each cell’s brightness, after the contrast curve, picks a character from a ramp ordered by how much ink it puts on the page: a space for empty, a full block or “@” for solid. On a dark background bright cells use dense characters; on a light background the mapping flips, so the picture is always shown in the right polarity. Every character is placed individually on the grid instead of being typeset as lines of text, so the alignment stays exact even if the browser falls back to a font that is not monospace.',
    ],
    equations: [
      { tex: T`\text{fs}=\frac{W/\text{cols}}{a},\qquad\text{rows}=\operatorname{round}\!\Big(\frac{H}{\text{fs}\cdot\text{spacing}}\Big)`, note: 'Font size from the advance width a (in ems) of the glyph “M”.' },
      { tex: T`\text{index}=\operatorname{round}\big(d\,(m-1)\big),\qquad d=\begin{cases}L'&\text{light on dark}\\1-L'&\text{dark on light}\end{cases}`, note: 'Which of the m characters in the ramp to draw.' },
    ],
  },
  'gradient-mesh': {
    paragraphs: [
      'The picture is reduced to a small grid of colour points (the mesh), and their colours are pushed a little: saturation up, contrast around mid-lightness up, both controlled by the vividness slider. The output is not the picture but a smooth surface that passes through those colours, built by interpolating between the four nearest mesh points with eased weights so there are no visible seams or creases.',
      'The motion comes from warping where the surface is read. Every output pixel looks up the mesh at a position that has been pushed around by two nested sine waves that change slowly with time, so the colours drift like oil on water without the mesh itself ever changing. The surface is computed at no more than 180 pixels wide, which is plenty for something so smooth, and the canvas’s own smoothing scales it up to size. A tile of noise is laid over the top using the “overlay” blend to add a trace of film grain that stops the soft gradients from banding.',
    ],
    equations: [
      { tex: T`u=u_0+w\,\sin\!\big(3.4v_0+0.9\tau+1.2\sin(2.2u_0+0.6\tau)\big),\quad v=v_0+w\,\cos\!\big(3.0u_0-0.8\tau+1.2\sin(2.6v_0-0.5\tau)\big)`, note: 'Warped lookup position; w = warp × 0.16.' },
      { tex: T`C(u,v)=\sum_{a,b\in\{0,1\}}\omega_a(e_x)\,\omega_b(e_y)\,P_{i+a,\,j+b},\qquad e=3f^{2}-2f^{3}`, note: 'Bilinear blend of the four nearest mesh colours P with eased fractional weights.' },
    ],
  },
  'comic-book': {
    paragraphs: [
      'Three ideas make a photograph look inked. First, posterisation: brightness is snapped to a small number of levels, and the colour is rescaled so each pixel keeps its hue but takes the flat brightness of its level, giving the large flat areas of printed colour. Saturation is then pushed up around the pixel’s own grey value, which is the “pop” slider.',
      'Second, outlines: the same blur-then-Sobel edge detector as in neon glow, but here the edge strength darkens the pixel toward black, so outlines are inked rather than glowing. Third, Ben-Day dots, the mechanical dot patterns of old printing. In the darker (but not black) tones a lattice of dots is laid on a 45° grid, and a pixel is darkened if it falls inside a dot whose radius grows as the tone gets darker. Rotating coordinates by 45° is just a sum and difference scaled by 1/√2.',
    ],
    equations: [
      { tex: T`q=\frac{\operatorname{round}\big(L\,(n-1)\big)}{n-1},\qquad C'=C\cdot\frac{q+0.06}{L+0.06}`, note: 'Posterise to n levels and rescale colour to the new brightness; the 0.06 keeps blacks stable.' },
      { tex: T`u=\frac{x+y}{\sqrt2\,s},\quad v=\frac{y-x}{\sqrt2\,s},\qquad\text{dot if }\sqrt{(u-\lfloor u\rceil)^2+(v-\lfloor v\rceil)^2}<0.18+0.32\Big(1-\frac{q}{0.62}\Big)`, note: 'Dot lattice at 45° with spacing s; ⌊·⌉ rounds to the nearest integer. Applied for tones 0.02 < q < 0.62; dots darken colour to 50%.' },
      { tex: T`C_{\text{out}}=C\,\big(1-S_{\theta,1.35\theta}(\lvert\nabla L_b\rvert)\big)`, note: 'Ink: edge strength darkens toward black.' },
    ],
  },
  'split-flap': {
    paragraphs: [
      'A real split-flap board holds a drum of characters; to show a letter, the drum flips through every character before it, one flap at a time. The program does exactly that. The picture becomes a grid of cells, and each cell’s brightness picks a target position on its drum (a ten-symbol drum running from blank to heavy, or the alphabet and digits). A cell showing target number t flips t times at a fixed 70 milliseconds a flap.',
      'Cells do not start together. Each has a delay that grows with its column and row plus a small random amount from a coordinate hash, so the picture resolves in a diagonal ripple. After a hold, the board flips on through the rest of the drum back to blank, and the cycle repeats. A single flap is drawn in two halves: in the first half of its turn the top flap falls, shrinking vertically toward the hinge; in the second half the new bottom flap opens out. The vertical scale of a hinged card seen from the side is the cosine of its angle; the code uses a straight line from 1 to 0 to 1 as a cheap stand-in for that cosine, which looks the same at this speed.',
    ],
    equations: [
      { tex: T`t_i=\operatorname{round}\big(L'_i\,(M-1)\big),\qquad L'=\operatorname{clamp}\big((L-\tfrac12)\cdot1.4+\tfrac12\big)`, note: 'Target drum position of cell i on a drum of M characters.' },
      { tex: T`\delta_{x,y}=0.011\,x+0.009\,y+0.08\,h(x,y),\qquad s=\Big\lfloor\frac{\tau-\delta}{0.07}\Big\rfloor`, note: 'Start delay of a cell, and the number of flaps it has completed at time τ.' },
      { tex: T`\text{scale}=\begin{cases}1-2f&0\le f<\tfrac12\ \text{(top flap falls)}\\2f-1&\tfrac12\le f<1\ \text{(bottom flap opens)}\end{cases}\ \approx\ \lvert\cos\pi f\rvert`, note: 'Vertical scale of the moving flap during one flip, f being progress through it.' },
    ],
  },
  'retro-vhs': {
    paragraphs: [
      'Every flaw of a worn tape is reproduced as arithmetic on scanlines. The picture is first dubbed: contrast is raised by 12% and a faint cool cast added. Then each horizontal line of the picture is shifted sideways by an amount that is the sum of two slow sine waves (the line wobble) and a small random jitter that changes every frame at 24 frames a second. A tracking band, a few percent of the picture tall, drifts down the screen; inside it, lines are thrown far to the side by random amounts, with a bright speckle of dropout noise. The bottom of the frame always carries heavy shifting, as on a real head-switch.',
      'Colour bleed comes from sampling the three channels at different horizontal offsets: red a few pixels to one side (averaged over two taps for a smear), green in place, blue to the other side. Alternate rows are dimmed to make scanlines, a noise table adds static, and a radial gradient darkens the corners. The “PLAY” and counter overlay is drawn as monospace text with a one-pixel offset shadow.',
    ],
    equations: [
      { tex: T`\Delta x(y,t)=a_1\sin(0.05\,y+3.1\,t)+a_2\sin(0.013\,y-1.4\,t)+a_3\,\big(h(y,\text{frame})-\tfrac12\big)`, note: 'Horizontal shift of scanline y. The a’s scale with the distortion slider and the width.' },
      { tex: T`\Delta x_{\text{band}}=\Big(1-\frac{\lvert y-y_c(t)\rvert}{b}\Big)^{2}\big(h-0.3\big)\,0.11\,W\,\text{dist}`, note: 'Extra shift inside the tracking band of half-height b whose centre y_c moves with time.' },
      { tex: T`R=\tfrac12\big(S_r(x{+}c)+S_r(x{+}c{+}3)\big),\quad G=S_g(x),\quad B=S_b(x{-}c)`, note: 'Colour bleed: each channel sampled at its own horizontal offset c.' },
    ],
  },
  halftone: {
    paragraphs: [
      'Printing cannot make grey, only ink or no ink, so a printer fakes tone with dots of varying size arranged on a regular lattice. The same trick is done here. A square lattice with spacing s is rotated by the screen angle and laid over the picture; at every lattice point the picture is sampled and a circle is drawn whose area is proportional to how much ink that tone needs. Area grows with the square of the radius, so the radius is the square root of the tone.',
      'In four-colour mode the picture is separated into cyan, magenta, yellow and black the way a print shop does, and four lattices are drawn with the “multiply” blend so the inks combine like transparent printing inks. The four lattices use the traditional screen angles of 15°, 75°, 0° and 45° (shifted together by the angle slider), because overlaying grids at the same angle causes visible moiré while grids at well-separated angles produce the small rosette pattern seen in magazines. “Color on black” turns it around: dots grow with brightness and take the cell’s colour, normalised so the strongest channel is full.',
    ],
    equations: [
      { tex: T`\mathbf p_{ij}=\mathbf c+s\,R(\theta)\begin{bmatrix}i\\ j\end{bmatrix},\qquad R(\theta)=\begin{bmatrix}\cos\theta&-\sin\theta\\ \sin\theta&\cos\theta\end{bmatrix}`, note: 'Dot centres on a lattice of spacing s rotated by θ about the picture centre c.' },
      { tex: T`r=\tfrac12\,s\,g\cdot1.06\,\sqrt{\operatorname{adj}(1-L)}\qquad\text{since}\quad\pi r^{2}\propto\text{ink}`, note: 'Radius of a one-ink dot; g is dot gain and adj() the contrast curve.' },
      { tex: T`K=1-\max(R,G,B),\qquad C=\frac{1-R-K}{1-K},\quad M=\frac{1-G-K}{1-K},\quad Y=\frac{1-B-K}{1-K}`, note: 'RGB to CMYK separation (channels in 0 to 1).' },
    ],
  },
  bauhaus: {
    paragraphs: [
      'The picture is cut into square tiles, and each tile is replaced by one geometric shape, as in a Bauhaus poster. The shape depends on brightness in five bands: darkest tiles become full squares, then quarter circles, half circles, circles, and the lightest a small dot, so tone is carried by how much of the tile the shape fills. The colour depends on hue: reds become red, yellows and greens become yellow, everything else blue; very dark tiles are black, and low-saturation tiles are black, paper or blue by brightness.',
      'The orientation of a quarter or half circle follows the picture’s own edges. The Sobel gradient at the tile gives a direction, and that direction is quantised into one of four quadrants, so the curves lean along contours. The variation slider reassigns some tiles at random using a generator seeded from the tile’s index and the seed, so “Shuffle” gives another reproducible design and the same seed always gives the same poster.',
    ],
    equations: [
      { tex: T`\text{shape}=\begin{cases}\text{square}&L<0.22\\ \text{quarter}&L<0.45\\ \text{half}&L<0.66\\ \text{circle}&L<0.84\\ \text{dot}&\text{otherwise}\end{cases}`, note: 'Shape by brightness band.' },
      { tex: T`\text{corner}=\Big\lfloor\frac{\operatorname{atan2}(g_y,g_x)+\pi}{2\pi}\cdot4\Big\rfloor\bmod 4`, note: 'Quarter-turn orientation from the edge direction at the tile.' },
    ],
  },
  'pixel-art': {
    paragraphs: [
      'Pixel art is three decisions: how few pixels, which colours, and how to hide the loss. The picture is reduced to the chosen width using the same halving as everywhere else and saturation is adjusted. The palette is either a fixed historical one (such as a handheld console’s four greens) or adaptive: k-means clustering finds the k colours that best represent the picture. It starts with k colours spread along the brightness order, then repeats ten times: assign every sampled pixel to its nearest colour, and move each colour to the average of its pixels. Only up to about six thousand sample pixels are used, which keeps it quick.',
      'Each pixel is then replaced by its nearest palette colour, but first a small offset from a Bayer matrix is added, a fixed 4 × 4 pattern of thresholds. Pixels that sit between two palette colours then fall on one side or the other in a regular checkerboard-like pattern, and the eye blends them back into an intermediate tone. This is ordered dithering. Distance is measured with weights favouring green, 0.9 for red, 1.2 for green and 0.8 for blue, which approximates how sensitive we are to each. The small image is finally enlarged without smoothing, so each pixel becomes a crisp square.',
    ],
    equations: [
      { tex: T`B=\frac1{16}\begin{bmatrix}0&8&2&10\\12&4&14&6\\3&11&1&9\\15&7&13&5\end{bmatrix},\qquad c'=c+\Big(B_{x\bmod4,\;y\bmod4}-\tfrac12\Big)A`, note: 'Ordered dithering: add a position-dependent offset of amplitude A before choosing the palette colour.' },
      { tex: T`d^{2}=0.9\,\Delta R^{2}+1.2\,\Delta G^{2}+0.8\,\Delta B^{2}`, note: 'Weighted squared distance used to find the nearest palette colour.' },
      { tex: T`\mu_c\;\leftarrow\;\frac{1}{\lvert S_c\rvert}\sum_{\mathbf p\in S_c}\mathbf p,\qquad S_c=\{\mathbf p:\ c=\arg\min_{j}\lVert\mathbf p-\mu_j\rVert\}`, note: 'One k-means step (Lloyd’s algorithm), repeated ten times.' },
    ],
  },
  blueprint: {
    paragraphs: [
      'A blueprint is a drawing, so the picture is turned into lines. Edges come from the usual blur-then-Sobel pass, with the line weight slider setting the Sobel step so thicker lines mean looking at a coarser neighbourhood. Shading is not done with grey but with hatching, as draughtsmen do: where the blurred picture is darker than a threshold a field of diagonal lines is drawn, and where it is darker still a second set at the opposite diagonal crosses it. The lines are one pixel wide, repeated every sp pixels, and found by testing a position’s remainder, so no line has to be drawn at all.',
      'A drafting grid is added the same way (a minor line every 1/40 of the width, with every fifth line stronger). Each pixel’s final colour is a straight mix of the paper colour and the line colour by the strength a of all these things, so lines have soft edges. The sheet furniture is drawn on top: a double border, dimension lines with arrowheads (a filled triangle at each end, rotated to the line’s angle), a title block, and registration crosses at the edge midpoints.',
    ],
    equations: [
      { tex: T`a=\max\Big(S_{\theta,1.7\theta}(\lvert\nabla L_b\rvert),\ a_{\text{hatch}},\ a_{\text{grid}}\Big)`, note: 'Line strength at a pixel is the strongest of edge, hatching and grid.' },
      { tex: T`a_{\text{hatch}}=\begin{cases}0.5&D>\lambda_1\ \text{and}\ (x+y)\bmod s<w\\0.4&D>\lambda_2+0.2\ \text{and}\ (x-y)\bmod s<w\end{cases},\qquad D=1-\bar L`, note: 'Cross-hatching: D is local darkness; the modulo picks out evenly spaced diagonals.' },
      { tex: T`C=C_{\text{paper}}+(C_{\text{line}}-C_{\text{paper}})\,a`, note: 'Linear mix of paper and ink.' },
    ],
  },
  'art-deco': {
    paragraphs: [
      'Art deco’s signature is geometric ornament in metal. Two engraving techniques are available, both of which turn brightness into the thickness of a gold line rather than into tone. In “Lines” mode the picture is covered with horizontal bands; at every position along a band the band’s thickness is set by the brightness there, so bright areas get fat lines and dark areas hairlines, the technique of banknote engraving. The band is built as a polygon: along the top edge going right, then back along the bottom edge going left.',
      '“Sunburst” does the same with rays fanning from a point below the picture. A ray is a direction; stepping along it samples brightness, and the ray’s width at distance r is capped at its angular share of the circle (so neighbouring rays never overlap) and shrunk by brightness. The metal is a five-stop gradient laid diagonally across the whole picture, which is what makes it read as polished gold, silver or copper. Frame ornament (double border, corner fans of three arcs and radial ticks, midpoint diamonds) is drawn with arcs and short lines, and the title is set in Bodoni with extra letter-spacing.',
    ],
    equations: [
      { tex: T`w(x)=\text{step}\,\big(0.05+0.9\,L(x,y_c)^{0.9}\big)`, note: 'Thickness of a line band at x; y_c is the band’s centre line.' },
      { tex: T`\hat{\mathbf d}_k=(\sin\alpha_k,\,-\cos\alpha_k),\quad\alpha_k=-\beta+\big(k+\tfrac12\big)\Delta\alpha,\quad\beta=82^{\circ}`, note: 'Direction of ray k.' },
      { tex: T`w(r)=\min\!\Big(0.96\,\Delta\alpha\,r,\ \ \Delta\alpha\,r\,\big(0.05+0.9\,L^{0.9}\big)\Big)`, note: 'Ray width at distance r from the origin: never wider than its slice Δα·r.' },
    ],
  },
  'neo-brutalism': {
    paragraphs: [
      'Neo-brutalism is flat colour, thick black borders and shadows that do not blur. The picture is first cropped to fill a window (the larger of the width and height ratios decides the scale, and the centre is kept), then blurred and measured for brightness. The brightness range is cut into n equal bands and each band is given one colour from a bright palette, so the picture becomes a poster of flat colour regions, with colours spread evenly through the palette.',
      'Black outlines come from Sobel again, here with a harder smoothstep so lines are crisp, and a heavier weight meaning a wider neighbourhood. The card sits on a plain coloured background, with a black rectangle of the same size drawn offset by the shadow distance, with no blur at all, which is the whole of the “hard shadow”. A title bar with three flat squares and a title, drawn in the same black as the borders, is optional chrome. Border width and shadow offset are tied to the picture width, so the look is the same at any export size.',
    ],
    equations: [
      { tex: T`\text{band}=\min\big(n-1,\ \lfloor L\cdot n\rfloor\big),\qquad C=P\!\left[\operatorname{round}\!\Big(\tfrac{\text{band}}{n-1}(m-1)\Big)\right]`, note: 'Pick one of m palette colours P for each of n brightness bands.' },
      { tex: T`e=S_{\theta,1.25\theta}(\lvert\nabla L_b\rvert),\quad\theta=0.34-0.27\cdot\text{ink},\qquad C_{\text{out}}=(1-e)\,C+e\,C_{\text{black}}`, note: 'Black outline strength e.' },
      { tex: T`k=\max\!\Big(\frac{w}{W},\frac{h}{H}\Big),\qquad\text{source rect}=\Big(\tfrac{w}{k},\tfrac{h}{k}\Big)\ \text{centred}`, note: 'Cover-crop of the picture into a w × h window.' },
    ],
  },
};

// The first twenty treatments live above; later ones are kept in one file per section.
const BASE = { ...BASE_THEORY, ...THEORY_DESIGN, ...THEORY_DIGITAL, ...THEORY_TYPE, ...THEORY_LIGHT, ...THEORY_PHYSICAL, ...THEORY_CRAFT, ...THEORY_PAINTERLY, ...THEORY_OPTICAL, ...THEORY_GENERATIVE, ...THEORY_MOTION, ...THEORY_WORLD, ...THEORY_SINDHI, ...THEORY_SOUTHASIA };

// The mathematics (paragraphs, equations) lives in the theory-*.js files above. The fuller story of each
// treatment (why, how, history, uses, tips, glossary, related) lives in theory-extra/ and is laid over it.
export const THEORY = Object.fromEntries(Object.entries(BASE).map(([id, entry]) => [id, { ...entry, ...EXTRA[id] }]));
