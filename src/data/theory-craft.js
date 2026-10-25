// src/data/theory-craft.js
// Theory entries for the treatments of section F, Print and craft (the ones added after the first twenty).
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_CRAFT = {
  risograph: {
    paragraphs: [
      'A risograph is a stencil duplicator that prints one ink colour per pass, which is why its pictures are built from two or three colours that overlap. Here two plates are made from the picture’s darkness. Plate one carries the shadows (darkness to the power 1.35). Plate two carries almost everything (darkness to the power 0.75, times 0.92) and is read from a position a few pixels away, because paper never goes back through the machine in exactly the same place.',
      'A riso plate lays ink as a random grain, not as dots. For each pixel the plate’s value is compared with a threshold that is not 0.5 but 0.5 plus a mix of white noise and smooth noise, scaled by the grain slider: where the value beats the threshold the pixel is inked. Smoothing the comparison over a small range (±0.09) avoids hard pixels. The two inks combine by multiplication, the way transparent inks do, so the overlap of blue and pink is a deep purple, and a faint fibre pattern is multiplied in to look like paper.',
    ],
    equations: [
      { tex: T`a_1=(1-L)^{1.35},\qquad a_2=0.92\,\big(1-L(\mathbf x+\boldsymbol\delta)\big)^{0.75}`, note: 'The two plates; δ is the misregistration offset, about 7 px across and 4.5 px up at full strength.' },
      { tex: T`\text{cov}_k=\operatorname{smoothstep}\big(\vartheta_k-0.09,\ \vartheta_k+0.09,\ a_k\big),\qquad \vartheta=\tfrac12+\big(0.55\,r+0.45\,n-\tfrac12\big)G`, note: 'Coverage by ink k; r is white noise, n smooth noise, G = 0.25 + 1.3 × the grain slider.' },
      { tex: T`C=C_{\text{paper}}\prod_{k=1}^{2}\Big(1-\text{cov}_k\,\delta_k\,\big(1-I_k/255\big)\Big)`, note: 'Multiply blend of the two inks I_k on the paper; δ_k is the ink density slider times a faint patchy unevenness.' },
    ],
  },
  linocut: {
    paragraphs: [
      'A linocut is printed from a block of lino with the white parts cut away; what is left stands up and takes the ink. So tone has to be made from line and area: the darkest parts are left uncut (solid ink), the middle tones become lines whose ink width follows the darkness, and the lights are cut away almost entirely. The program lays a set of parallel lines across the picture. Each line’s coordinate is bent by slow noise and by the picture’s brightness, so the lines swing round shapes as a carver’s hand does.',
      'At every pixel it finds how far it is from the middle of its line (0 at the centre, 1 at the gouge between lines) and inks it if that distance is smaller than a width that grows with darkness, with a slowly changing swell along each line to mimic the taper of a V-gouge. Optional carved outlines add solid ink wherever the Sobel edge strength is high. A few roller specks, noise above 0.86, knock small holes in the ink.',
    ],
    equations: [
      { tex: T`u=\frac{n\,(x\cos\theta+y\sin\theta)}{W}+3.2\,w\,(\nu-\tfrac12)+1.5\,w\,(\tfrac12-L_b),\qquad f=u-\lfloor u\rfloor`, note: 'Line coordinate: n lines across, θ the direction, w the wander slider and ν slow noise; f is the position within a line.' },
      { tex: T`q=\min\!\big(1.08,\ 1.12\,d^{0.85}\,s\big),\quad s=0.78+0.45\,\nu',\qquad d=1-\text{contrast}(L_b)`, note: 'Cut width q from the darkness d, with the taper s along the line.' },
      { tex: T`a=\operatorname{smoothstep}\big(\lvert 2f-1\rvert-0.08,\ \lvert 2f-1\rvert+0.02,\ q\big)\ \text{if } q>0.06,\ \text{else }0`, note: 'Ink coverage a at the pixel.' },
    ],
  },
  'banknote-engraving': {
    paragraphs: [
      'Engraved banknote portraits are made of lines, not dots. Each line is a ribbon whose thickness changes with the tone it passes through: thick in the shadows, thin in the lights. The program draws the picture as n horizontal ribbons inside a rounded window. For each line it walks along x in short steps, reads the darkness under it and sets the half-thickness to a power of that darkness, capped at half the line spacing, so the thickest ribbons almost touch. The two edges are then joined into one filled shape.',
      'The lines also move: they are shifted down where the picture is light and up where it is dark, and given a gentle sine wave, which makes the surface look modelled instead of printed. Around the portrait come the usual security-print devices. A faint wavering tint of very fine lines covers the note; a double frame surrounds it; and the rosettes are guilloche patterns, curves drawn by rolling one circle inside another (a hypotrochoid), repeated seven times with a slightly different pen offset so they interleave, and scaled by 0.62. A numeral, a serial number and a title are set in a Bodoni face; the wording is invented.',
    ],
    equations: [
      { tex: T`\text{half}=\min\!\Big(\tfrac p2,\ 0.52\,p\,d^{0.9}+0.18\,\sigma\Big),\qquad d=1-\text{contrast}(L,0.2)`, note: 'Half thickness of the ribbon; p is the line spacing, σ the scale of the picture.' },
      { tex: T`y_c=y_i+(\tfrac12-d)\,1.4\,p\,\kappa+0.35\,p\,\kappa\,\sin(0.018\,x+0.45\,i)`, note: 'Centre line of ribbon i, κ being the swing slider.' },
      { tex: T`\begin{aligned}x&=(R-r)\cos t+\delta\cos\!\Big(\tfrac{R-r}{r}\,t\Big)\\ y&=(R-r)\sin t-\delta\sin\!\Big(\tfrac{R-r}{r}\,t\Big)\end{aligned},\quad r=0.34R,\ \delta\approx0.78R`, note: 'The guilloche curve (hypotrochoid), traced over eight turns of t.' },
    ],
  },
  'screen-print': {
    paragraphs: [
      'Screen printing pushes ink through a mesh with a stencil, one colour at a time. The picture is cut into brightness bands, one per ink, from light to dark: the lightest ink (say yellow) covers every pixel darker than 0.84, the next covers everything darker than 0.62, then 0.41, then 0.21. So a dark region receives all the inks, one on top of the other, and a light region only the first.',
      'Inks are transparent and are combined by multiplication, so the overlap of yellow and red is orange and the full stack is nearly black, as in a real print. Three imperfections make it feel physical. Each pass is shifted by its own small random offset (misregistration). The threshold is wobbled by smooth noise, so the edges are slightly ragged. And the ink film is a little uneven, with a faint cross-hatch from the mesh. With fewer inks the program picks a subset (the second and fourth for two, the first, third and fourth for three).',
    ],
    equations: [
      { tex: T`\text{cov}_k=1-\operatorname{smoothstep}\big(\vartheta_k-0.012,\ \vartheta_k+0.012,\ L(\mathbf x+\mathbf o_k)+r\big),\qquad \vartheta=(0.84,\,0.62,\,0.41,\,0.21)`, note: 'Coverage by ink k: o_k is that pass’s offset and r the edge noise.' },
      { tex: T`C=C_{\text{paper}}\prod_k\Big(1-\text{cov}_k\,\phi_k\,\big(1-I_k/255\big)\Big),\qquad \phi_k=0.93+0.07\,n`, note: 'Multiply overprint; φ is the unevenness of the ink film.' },
      { tex: T`w=1-0.07\,m\,\Big(\tfrac12+\tfrac12\cos\tfrac{2\pi x}{\lambda}\cos\tfrac{2\pi y}{\lambda}\Big)`, note: 'Mesh texture: m is the slider and λ the mesh spacing.' },
    ],
  },
  mezzotint: {
    paragraphs: [
      'Mezzotint begins with a copper plate roughened all over with a rocker, so that it holds ink as a dense field of pits and prints solid black. The engraver then burnishes the plate smooth where the picture should be lighter; smoother copper holds less ink. Tone is therefore made from the density of tiny pits, not from lines or dots.',
      'The program does the same in reverse. A random value, a mix of 62% white noise (per grain cell) and 38% smooth noise, stands for how rough the plate is at each point. Darkness is raised to a power (the burnishing slider controls how much) and compared with that value: where darkness wins, the pixel takes ink, softened by a smoothstep of width ±0.1. Dark areas win nearly everywhere and are black; light areas win only at the roughest pits and stay white with scattered black specks, which is exactly the velvet gradation of the original. A bevelled edge shows where the plate pressed into the paper.',
    ],
    equations: [
      { tex: T`d=(1-L)^{\,0.8+0.5\,b},\qquad n=0.62\,r+0.38\,\nu`, note: 'Darkness after burnishing b (0 to 1), and the roughness n of the plate (r white noise per grain cell, ν smooth noise).' },
      { tex: T`a=\operatorname{smoothstep}\big(t-0.1,\ t+0.1,\ 1.08\,d\big),\qquad t=\tfrac12+(n-\tfrac12)(1.1-0.3\,b)`, note: 'Ink coverage a at a pixel.' },
    ],
  },
  cyanotype: {
    paragraphs: [
      'A cyanotype is made by coating paper with iron salts and exposing it to sunlight; where light strikes, the salts turn Prussian blue, and where it does not they wash away and leave white paper. The treatment maps brightness onto that chemistry. The picture is stretched, shifted by the exposure slider and given contrast; the result runs a five-colour ramp from deep blue (shadows) to near white (highlights). Tea toning and green toning swap in a different ramp.',
      'Hand-coated paper is never even. Two noises, one slow and blotchy, one long and thin like a brush stroke, change the tone slightly (the uneven-coating slider). The coating stops short of the sheet edge in a ragged line made from two more noises, and where the liquid pooled at the boundary the print is darker; outside the edge the bare cream paper shows. A fine fibre noise is multiplied over everything.',
    ],
    equations: [
      { tex: T`t=\operatorname{clamp}\big(\text{contrast}\big(L+0.4\,\epsilon+\pi,\ c\big)\big),\qquad \pi=0.28\,u\,(n_1-\tfrac12)+0.12\,u\,(n_2-\tfrac12)`, note: 'Tone t: ε is the exposure slider, c the contrast and u the uneven-coating slider.' },
      { tex: T`C=\text{ramp}(t),\qquad c=\operatorname{smoothstep}(-2\sigma,\ 2\sigma,\ e-m+\rho)`, note: 'Colour from the five-stop ramp; c is how coated the pixel is: e the distance to the sheet edge, m = 0.055 of the short side, ρ the ragged-edge noise, σ the picture scale.' },
      { tex: T`C\leftarrow C\,\big(1-0.8\,p\big),\qquad p=0.22\,c\,\big(1-\operatorname{smoothstep}(0,\ 9\sigma,\ e-m+\rho)\big)`, note: 'Darkening where the liquid pooled along the edge.' },
    ],
  },
  'cross-stitch': {
    paragraphs: [
      'Cross-stitch counts. The cloth (aida) is a grid of holes and every stitch fills one square, so the picture is first shrunk to one pixel per square, the “stitches across” slider. The colours are then limited to the box of flosses you chose: k-means clustering finds the k most representative colours of the small picture (made slightly more saturated) and each square takes the nearest one. The “bare” option skips squares lighter than 0.86, leaving the cloth showing.',
      'Each stitch is a cross of two strokes drawn with round caps, inset from the corners of its square. All the back strokes (one diagonal) are drawn first in a slightly darker shade, then a soft offset shadow, then the front strokes in the true colour (the other diagonal), then a thin pale highlight along each front thread to suggest twist. The cloth itself is drawn first: faint threads along every grid line, and a small dark hole at every corner.',
    ],
    equations: [
      { tex: T`s=\frac{W}{n},\qquad \text{inset}=0.15\,s,\qquad \text{thread width}=0.34\,s`, note: 'Geometry of a stitch for n stitches across.' },
      { tex: T`c(i,j)=\arg\min_{f\in F}\ \big\lVert \bar P_{ij}-f\big\rVert_{\text{redmean}}`, note: 'Each square takes the floss in the set F nearest to the average colour of its pixels; redmean is a distance that weights red and blue by brightness.' },
    ],
  },
  embroidery: {
    paragraphs: [
      'Embroidered pictures are drawn with short glossy threads laid in the direction the shape runs. The program scatters a jittered grid of stroke centres over the picture and puts them in random order. For each one it finds the direction of the picture’s edge: the gradient (the slope of brightness) points across an edge, so the thread runs perpendicular to it. Where there is no edge the thread would have no direction at all, so a lazy angle is used instead: a base angle plus a random shift that is constant over each 16-pixel square. The two directions are blended by an amount that grows with the edge strength and with the “follow the shapes” slider.',
      'The k floss colours come from k-means on the picture, and each stroke takes the floss nearest to the colour of a quarter-size copy at its centre. It is drawn three times: a dark, offset shadow, the thread itself in a brightness varied by about ±10%, and a thin lighter line slightly to one side for the sheen. The background is linen, flecks of short horizontal and vertical threads. The hoop is a wooden ellipse with a highlight, with the area outside it dark.',
    ],
    equations: [
      { tex: T`\theta_e=\operatorname{atan2}(G_x,\,-G_y),\qquad w=\phi\ \operatorname{clamp}(14\,\lvert\nabla L\rvert)`, note: 'Thread direction along the edge (the gradient G turned by 90°), and the weight w of edge-following; φ is the follow slider.' },
      { tex: T`\theta=\operatorname{atan2}\!\big(w\sin\theta_e+(1-w)\sin\theta_0,\ \ w\cos\theta_e+(1-w)\cos\theta_0\big)`, note: 'Blend with the lazy direction θ₀ by adding unit vectors.' },
    ],
  },
  'knitted-pattern': {
    paragraphs: [
      'Plain knitting (stockinette) is a lattice of V-shaped stitches, each made of two plump legs of yarn. A knit stitch is wider than it is tall, about 1 to 0.74 here. The program draws one stitch once for every yarn colour, as a small picture: two ellipses tilted 0.42 radians in opposite directions, each filled with a gradient that is dark at the edges and bright in the middle so it looks round, with slanted lines across for the plies of the yarn and a soft shadow underneath. That sprite is then stamped at every position of the grid.',
      'The yarn colours come from k-means on a picture with one pixel per stitch; each stitch takes the nearest. The Fair Isle border replaces the top and bottom rows (up to eight of each) with a repeating eight-by-seven motif, a lattice of small diamonds followed by a blank row and a solid row, knitted in the darkest and lightest of the chosen yarns, in the manner of a Nordic jumper.',
    ],
    equations: [
      { tex: T`w=\frac{W}{n},\qquad h=0.74\,w,\qquad \text{rows}=\Big\lceil\frac{H}{h}\Big\rceil+1`, note: 'Stitch width, height and number of rows for n stitches across.' },
      { tex: T`\text{leg}:\ \ r_x=0.26\,w,\quad r_y=0.62\,h,\quad \text{tilt}=\mp0.42\ \text{rad}`, note: 'Each of the two legs is an ellipse of these radii.' },
    ],
  },
  'quilt-patchwork': {
    paragraphs: [
      'A quilt is a grid of fabric patches. The picture is divided into squares, or each square into two triangles along a randomly chosen diagonal, and each patch takes the nearest of k fabric colours (from k-means, slightly softened) to the colour of the picture at its centre. A chosen fraction of patches, set by the printed-fabrics slider, also gets a pattern in a lighter or darker shade of its own colour: dots, stripes, a check, florets or diagonal lines.',
      'Quilting makes each patch puff up. That is faked with a radial gradient: white at 20% opacity near the middle and black at 30% at the rim, so the patch looks lit from above and shadowed at the seams. The seam is a thin dark line, and the running stitch is a dashed light line on a copy of the patch outline shrunk to 82% about its centre. A little grain finishes the cloth.',
    ],
    equations: [
      { tex: T`s=\frac{W}{n},\qquad \text{patch colour}=\arg\min_{f\in F}\big\lVert \bar P(\text{centre})-f\big\rVert`, note: 'Patch size for n patches across, and its fabric.' },
      { tex: T`\text{pattern}\iff h<\pi,\qquad \text{kind}=\Big\lfloor \frac{5\,h}{\pi}\Big\rfloor`, note: 'A patch is printed when its random number h is below the printed-fabrics slider π (0 to 1); the kind of print is chosen from five.' },
    ],
  },
  'tapestry-weave': {
    paragraphs: [
      'In a tapestry the weft, a coloured wool, is passed back and forth over a hidden warp, packed so tightly that the warp disappears and the picture is made of horizontal rows. The program divides the picture into rows (the passes of weft slider) and into cells about as wide as a row is tall, takes one colour per cell from a picture of that size, and limits the colours to k wool colours by k-means. Odd rows are shifted by half a cell, as in real weaving, and the row boundaries wave a little (the wobble slider) because hand-beaten weft is never straight.',
      'The lighting is within each row: a pass of wool is round, so it is bright in the middle and dark where it dips against its neighbours, a sine raised to the power 0.55. Cells alternate slightly in brightness in a checkerboard to show the over-under of the weave. Fine noise along the row is the fuzz of the wool. Where the row dips, the dark warp shows through, by an amount set by the visible-warp slider. The fringe at the bottom is the loose ends of the warp, drawn as pale curved threads.',
    ],
    equations: [
      { tex: T`k=\big(0.34+0.8\,b\big)\,o\,\Big(0.9+0.1\sin\pi f_x\Big),\qquad b=\big(\sin\pi f_y\big)^{0.55}`, note: 'Brightness of the wool: f_y and f_x are the positions across the row and across the cell (0 to 1), o is 1 or 0.9 in a checkerboard.' },
      { tex: T`k\leftarrow k\,\Big(1-\omega\,g\,\big(0.35+0.35\,w\big)\Big),\ \ w=\tfrac12+\tfrac12\sin\tfrac{2\pi x}{c},\qquad g=1-\operatorname{smoothstep}\big(0,\ 0.14,\ \min(f_y,1-f_y)\big)`, note: 'The warp showing through at the edges of a row; ω is the visible-warp slider, c the cell width and the sine-based factor the pattern of the hidden warp threads.' },
    ],
  },
  'paper-cut-out': {
    paragraphs: [
      'The picture’s brightness, blurred to round off detail, is cut into bands like a contour map. Layer i is a sheet of coloured paper that exists wherever the brightness is above the threshold i/n, with a very short smoothstep at the edge so it is a sharp cut. The bottom layer is the whole sheet. Papers go from dark (bottom) to light (top), taken either from a built-in palette or from the picture’s own k-means colours sorted by brightness.',
      'What makes it look cut and stacked is the shadow. For each layer the mask is shifted a few pixels away from the light and blurred twice; where that shifted, blurred shape falls outside the layer itself, the sheets beneath are darkened. The layers are composited from the bottom up: darken by the shadow of the layer, then replace by the layer’s colour where its mask is on. A hairline of extra light is added right at the cut edges, and paper fibre noise is multiplied in.',
    ],
    equations: [
      { tex: T`m_i=\operatorname{smoothstep}\big(\tfrac in-0.012,\ \tfrac in+0.012,\ L_b\big),\qquad i=1,\dots,n-1`, note: 'The mask of layer i, with n layers in all.' },
      { tex: T`s_i=\operatorname{blur}^{2}\big(m_i(\mathbf x-\mathbf d)\big),\qquad \mathbf d=5\,\sigma\,(-\cos\alpha,\ \sin\alpha)`, note: 'Shadow of layer i: the mask displaced away from the light (angle α) and blurred twice.' },
      { tex: T`C\leftarrow\big(C\,(1-0.55\,\delta\,s_i\,(1-m_i))\big)(1-m_i)+c_i\,m_i`, note: 'Compositing one layer; δ is the shadow slider and c_i the colour of paper i.' },
    ],
  },
  'stained-glass': {
    paragraphs: [
      'Stained glass is a mosaic of coloured pieces held in lead strips. The pieces here come from cellular noise: a random site in every square of a coarse grid, with each pixel belonging to the nearest site, which makes irregular convex shapes. Each piece’s colour is the picture, blurred to about the size of a piece, read at the site, then made more saturated and brighter, like glass lit from behind.',
      'Lead lies on the boundary between two pieces: a pixel is lead where the distance to the nearest site and to the second nearest nearly match, that is where F2 − F1 is below the lead width. Lead is a dark bar with a soft highlight along its crown. Glass is not flat: it is darker toward the lead and brighter in the middle of a piece (a smoothstep of the distance to the site), rippled by two layers of noise, and lit by a backlight whose strength you set and which fades away from the top left.',
    ],
    equations: [
      { tex: T`\text{lead}\iff F_2-F_1<\lambda,\qquad \lambda=0.9\,\sigma\,\ell`, note: 'Where lead lies: F₁ and F₂ are the distances to the nearest and second-nearest sites, ℓ the lead slider and σ the picture scale.' },
      { tex: T`k=\big(0.55+0.55\,m+\rho\big)\,\big(0.58+0.42\,\beta\big)\,\gamma\,\big(0.78+0.22\,q\big),\qquad m=1-\operatorname{smoothstep}(0.1s,\ 0.7s,\ F_1)`, note: 'Glass brightness: m is the nearness to the middle of the piece, ρ the ripple, β the backlight slider, γ the fade across the picture and q the distance from the lead.' },
      { tex: T`(h,\ s,\ l)\mapsto\big(h,\ \operatorname{clamp}(1.35\,s+0.12),\ \operatorname{clamp}(0.78\,l+0.14,\ 0.22,\ 0.78)\big)`, note: 'Colour of a piece, in hue, saturation and lightness.' },
    ],
  },
};
