// src/data/theory-light.js
// Theory entries for the treatments of section D, Light, colour and glass (the ones added after the first twenty).
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_LIGHT = {
  aurora: {
    paragraphs: [
      'An aurora is a curtain of glowing gas that hangs down from a ceiling of light and fades upward. The treatment keeps that shape. The picture is stretched and blurred heavily, and only its brighter parts count as sources: a smoothstep from 0.22 to 0.85 turns brightness into source strength. Then, for each column of pixels, the program walks from the bottom to the top carrying a running value that is either replaced by a stronger source or fades by a constant factor. The result is that every bright patch sends a curtain upward, and the length of the curtain is set by the fade rate.',
      'Real curtains are streaky, so the value is multiplied by two layers of value noise that change quickly from left to right but slowly from bottom to top. The colour comes from how far a pixel is from the source that fed it: green near the source, then teal, violet and pink further up, the order real auroras follow. Light adds rather than blends, so the glow is added to a dark blue sky. Stars appear only where the sky is dark, and the pine ridge is two rows of layered triangles in near black.',
    ],
    equations: [
      { tex: T`c_y=\max\!\big(s_y,\ \delta\,c_{y+1}\big),\qquad \delta=1-\frac{1}{H\,(0.05+0.75\,\ell)}`, note: 'The smear, from the bottom row upward: s is the source strength, ℓ the “curtain height” slider (0 to 1).' },
      { tex: T`a=\operatorname{clamp}\!\big(c\cdot\text{ray}\cdot k\big),\qquad g=0.95\,a^{2}(3-2a)+0.12\,a`, note: 'Intensity after the ray streaks and brightness gain k, then shaped so faint light stays faint and strong light glows.' },
      { tex: T`\text{colour}=\text{ramp}\!\Big(\operatorname{clamp}\tfrac{d}{0.55\,H}\Big),\qquad \text{pixel}=\text{sky}+g\cdot\text{colour}`, note: 'd is the number of rows since the source.' },
    ],
  },
  duotone: {
    paragraphs: [
      'Duotone throws away colour and keeps tone. Each pixel’s brightness is first bent by a power curve so that the “midpoint” slider decides which brightness lands exactly halfway between the two colours, then given more or less contrast, and finally used as the mix between your shadow colour and your highlight colour. Black becomes the first, white the second, and everything else is a straight blend of the two.',
      'Because only one number per pixel survives, the effect depends entirely on the tonal map of the picture, which is why a good duotone starts from a picture with strong light and shade. A little film grain is added at the end to stop the smooth gradients from banding.',
    ],
    equations: [
      { tex: T`t=\operatorname{clamp}\!\Big(\big(L^{\gamma}-\tfrac12\big)(1+c)+\tfrac12\Big),\qquad \gamma=\frac{\ln 0.5}{\ln m}`, note: 'Tone t: L is brightness, m the midpoint slider (0.2 to 0.8; L = m maps to ½) and c the contrast slider.' },
      { tex: T`\text{pixel}=A+(B-A)\,t`, note: 'A is the shadow colour and B the highlight colour, mixed per channel.' },
    ],
  },
  chrome: {
    paragraphs: [
      'Chrome is a mirror, so what you see in it is not the object but the room around it. To fake that, the picture’s brightness is treated as a height map: bright parts are hills. Two blurs of different size are mixed so the shapes are smooth but still have some fine detail. The slope of the map at each pixel gives a surface normal, a unit arrow that points out of the surface; the steeper the slope, the more the arrow leans.',
      'A leaning surface reflects a different part of the sky. The reflected direction is worked out from the normal, and its up-and-down part chooses a position on a strip that stands for the world: dark sky overhead, a bright band near the horizon, a hard edge where the horizon is, then a darker ground and a light floor. The “horizon” slider shifts where flat areas land on the strip. A small, hard highlight, a specular spot from a light at the top left, is added on top. Gold and cobalt use different strips.',
    ],
    equations: [
      { tex: T`h=0.82\,\overline{L}_{r}+0.18\,\overline{L}_{r/3}`, note: 'Height map: two box blurs of radius r and r/3 mixed.' },
      { tex: T`\mathbf n=\frac{(-k\,G_x,\ -k\,G_y,\ 1)}{\lVert(-k\,G_x,\ -k\,G_y,\ 1)\rVert},\qquad \mathbf r=\big(2n_zn_x,\ 2n_zn_y\big)`, note: 'Normal from the Sobel slopes G (k grows with the relief slider) and the sideways part of the mirror direction for a viewer looking straight down.' },
      { tex: T`t=t_0+0.4\,r_y+0.08\,r_x+0.08\,h,\qquad t_0=0.12+0.42\,\eta`, note: 'Position on the environment strip (0 top, 1 bottom); η is the horizon slider.' },
      { tex: T`\text{spec}=\left(\max\!\Big(0,\ \frac{\mathbf n\cdot\mathbf m}{\lVert\mathbf m\rVert}\Big)\right)^{90}`, note: 'The highlight; m is halfway between the light direction and the viewer.' },
    ],
  },
  'glass-refraction': {
    paragraphs: [
      'Glass bends light, so what you see through it comes from somewhere else. For every output pixel the program decides where in the picture to look, and takes that colour instead. Ribbed glass is a row of cylinder lenses: within each rib the sampling point runs across a wider part of the picture than the rib itself, and backwards, so each rib shows a squeezed, mirrored slice of the scene. Glass beads are tiny spheres on a hexagonal grid doing the same in two directions, and the sheet between them is dark. Bubbles are the opposite kind of lens: they magnify the middle of the disc, because the sampling radius is smaller than the pixel’s own radius.',
      'Glass bends blue more than red, so the three colour channels are each sampled with a slightly different strength, which gives coloured fringes. Each lens is also shaded: beads are darker toward the rim, both kinds get a small bright window reflection at the top left, and bubbles get a thin ring of light at the edge. Lenses are drawn one at a time inside their bounding boxes (largest bubble first), so the cost is the area of the lenses, not of lenses times pixels.',
    ],
    equations: [
      { tex: T`x'_c=x_0-u\,\frac w2\,(0.3+3.2\,\beta)\,f_c,\qquad f_R=1+2\delta,\ f_G=1,\ f_B=1-2\delta`, note: 'Ribbed glass: x₀ is the rib centre, u from −1 to 1 the position in the rib, w its width, β the bend slider, δ = 0.1 × the colour-split slider.' },
      { tex: T`\mathbf p'_c=\mathbf c-\mathbf n\,R\,(0.6+1.9\,\beta)\,f_c`, note: 'Glass bead: n is the pixel’s position in the bead (−1 to 1), R its radius; the minus sign inverts the image.' },
      { tex: T`\mathbf p'_c=\mathbf c+\hat{\mathbf n}\,R\,\rho^{\,e_c},\qquad \rho=\lVert\mathbf n\rVert,\quad e_c=(1+1.1\,\beta)\big(1+(c-1)\,\delta\big)`, note: 'Bubble: a pixel at radius ρ looks at radius ρ^e, nearer the centre, so the middle is magnified.' },
    ],
  },
  'frosted-ice': {
    paragraphs: [
      'Frosted glass scatters light, so the first step is blurring the picture strongly, each colour channel separately, with two box blurs. The frost itself is made from noise. Two layers of smooth value noise bend the coordinates (a “warp”), and a ridged version of the noise, 1 − |2n − 1|, is computed at two scales, so lines appear where the noise crosses its middle value: they look like cracks and crystal edges. Raising that to the fifth power keeps only the strongest ridges. A scatter of single bright pixels adds sparkle, and the same warp shifts the blurred picture sideways by a few pixels, as ice does.',
      'Frost is thicker toward the edges of a pane, so its amount grows with distance from the centre. The result is pushed toward a pale icy blue. Finally comes the clear patch, a stroke wiped by a hand: the distance of each pixel to a curved path of points, wobbled by low-frequency noise so the edge is not a perfect ellipse. Inside the stroke the sharp picture shows; just outside it, the wiped-away frost piles up in a brighter ridge.',
    ],
    equations: [
      { tex: T`q=1-\lvert 2\,n(x\,\phi+5w_x,\ y\,\phi+5w_y)-1\rvert,\qquad \text{crystal}=(0.65\,q_1+0.35\,q_2)^{5}`, note: 'Ridged noise at two scales, with warp w; φ is the frost frequency (a little lower vertically).' },
      { tex: T`\text{white}=\operatorname{clamp}\!\big(f\,(0.14+0.55\,\text{crystal})+0.22\,f\,\varsigma\big),\qquad f=\phi_0\,(0.55+0.45\,e)`, note: 'How much white frost covers a pixel: φ₀ is the frost slider, e the nearness to the pane edge and ς 1 on sparkle pixels.' },
      { tex: T`C\leftarrow C+(C_{\text{ice}}-C)\,(0.28\,f+0.7\,\text{white}),\qquad m=1-\operatorname{smoothstep}\big(0.84\,\rho_0,\ 0.97\,\rho_0,\ d\big)`, note: 'Tint toward pale ice; m is how clear the wiped patch is at distance d from its path, of radius ρ₀.' },
    ],
  },
};
