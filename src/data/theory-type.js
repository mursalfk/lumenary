// src/data/theory-type.js
// Theory entries for the treatments of section C, Typographic (the ones added after the first twenty).
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_TYPE = {
  handwritten: {
    paragraphs: [
      'The page is drawn first: paper, ruled lines (or a square grid), a red margin and three binder holes. Then your sentence is written out one letter at a time, left to right, line after line, starting again from the beginning whenever it runs out. Before writing, the picture’s brightness is stretched so that its darkest 2% become black and its lightest 2% white, then blurred, so each letter reads a smooth tone and not one noisy pixel.',
      'A pen presses harder where the picture is dark. For every letter the program looks at the darkness d just above its baseline and makes the letter larger, bolder (weight 700 once d passes one half) and more opaque. Where d is under 0.07 the pen lifts and nothing is written, so the paper shows through the highlights. Each letter is also turned by a random couple of degrees at most and its size varies by a few percent, which is what stops it looking typeset. The “Pen pressure” slider widens the gap between light and heavy writing.',
    ],
    equations: [
      { tex: T`v=\operatorname{clamp}\!\left(\frac{L-L_{2\%}}{\max(0.08,\;L_{98\%}-L_{2\%})}\right),\qquad d=1-\bar v`, note: 'Brightness stretched between its 2nd and 98th percentiles, blurred (the bar), and turned into darkness d.' },
      { tex: T`s=1.28\,q\,\big(0.62+(0.55+0.35\,\pi)\,d\big)\,(0.94+0.12\,u),\qquad q=\frac{0.9\,H}{n}`, note: 'Letter size: q is the line pitch for n lines, π the pressure slider (0 to 1) and u a random number from 0 to 1.' },
      { tex: T`\alpha=\min\!\big(1,\;0.16+d\,(0.7+0.55\,\pi)\big)`, note: 'Ink opacity of one letter.' },
    ],
  },
  'calligraphy-portrait': {
    paragraphs: [
      'The page is parchment (a radial gradient, a few faint stains) with a double border in ink. The sentence is then lettered in a flowing script on lines that rise or fall by the slant you choose. What makes it a portrait is that the letters change size: where the picture is dark they are very large and heavy, and since each letter only advances about 62% of its own width, neighbouring letters pile up on each other and the ink builds into black. In the light parts they are small and thin and the parchment shows between them.',
      'Spaces advance by a fixed fraction of the size, and every letter is turned to follow the baseline with a tiny random wobble. The picture is stretched and blurred as in Handwritten, so the tones are smooth. An optional red seal, a rounded square with a pale inner frame and a single letter, is stamped in the bottom corner. Layering rather than drawing is the whole idea: tone comes from how many letters overlap, much as it does in an engraving.',
    ],
    equations: [
      { tex: T`s=b\,\big(0.3+1.45\,d^{1.15}\big),\qquad b=1.7\,\frac{0.8\,H}{n}`, note: 'Letter size from darkness d; b is a base size set by the number of lines n.' },
      { tex: T`\Delta x=\max(0.12\,s,\;0.62\,w)\ \ \text{(letters)},\qquad \Delta x=0.3\,s\ \ \text{(spaces)}`, note: 'How far the pen moves after a letter of measured width w.' },
      { tex: T`y(x)=y_0+m\,(x-\tfrac W2),\qquad m=0.35\tan\theta,\qquad \alpha=0.3+0.55\,d`, note: 'The sloping baseline for a slant of θ, and the ink opacity.' },
    ],
  },
  newspaper: {
    paragraphs: [
      'A printed photograph has no grey, only black dots of different sizes on white paper, small ones for light areas and large ones for dark. The eye blends them. Here the dots sit on a lattice turned 45°, the angle at which the eye notices a regular pattern least. For each lattice point the program reads the picture’s brightness L at that spot and draws a dot whose radius grows with the square root of the darkness, which makes the inked area proportional to the darkness. In the deepest tones the dots are big enough to merge and the page goes solid black.',
      'The rest of the page is typeset around it. The masthead is fitted to the page width by measuring the text at one size and scaling; the headline is wrapped into at most three lines and shrunk by 8% steps until it fits; thin and thick rules separate the sections; and the remaining columns are filled with “greeked” text, bars of random length standing in for words, with the occasional subhead. Paper grain and a warm vignette finish it.',
    ],
    equations: [
      { tex: T`\begin{pmatrix}x\\y\end{pmatrix}=\frac{1}{\sqrt2}\begin{pmatrix}a+b\\ b-a\end{pmatrix},\qquad a,b\in s\,\mathbb Z`, note: 'Lattice points: a square grid of spacing s turned by 45°.' },
      { tex: T`r=0.62\,s\,\sqrt{1-L(x,y)}`, note: 'Dot radius; the inked fraction of a cell is πr²/s², proportional to the darkness 1 − L.' },
      { tex: T`F=\min\!\left(u_0,\ \frac{0.98\,w_{\text{page}}}{w_{100}}\cdot 100\right)`, note: 'Masthead font size: the text measured at 100 px has width w₁₀₀, and is scaled to fill 98% of the page width.' },
    ],
  },
  letterpress: {
    paragraphs: [
      'Letterpress is printing with a raised plate pressed into thick cotton paper, so the ink arrives with a physical dent. The treatment builds the plate first, as black on transparent: a 45° halftone of your picture, two rules and the title. That layer becomes an ink map a(x, y) between 0 and 1.',
      'The paper is then treated as a height field. The ink map is softened with two small blurs (the paper’s give) and its slope is measured with a Sobel filter. Light comes from the top left, so the lower-right wall of every dent is lit and the upper-left wall falls in shadow, which is how the impression shows. Paper tone gets a little fibre and speckle noise. Ink is the one chosen colour, a touch darker at the edges where it squashes outward, and the “ink wear” slider knocks small holes in it, the way a worn plate prints.',
    ],
    equations: [
      { tex: T`r=0.72\,s\,\sqrt{1-L}`, note: 'Halftone dot radius on the plate; s is the dot spacing.' },
      { tex: T`v=1-5.2\,\delta\,(G_x+G_y)-0.07\,\delta\,\tilde a+\eta,\qquad \tilde a=\text{blur}^2(a)`, note: 'Paper shading v: δ is the impression slider, G the Sobel slopes of the softened ink map, η small noise.' },
      { tex: T`C=v\,\Big(P+k\,\big(\sigma\,I-P\big)\Big),\qquad k=a\,(1-h)`, note: 'Final colour: paper P toward ink I by the ink amount k; h is 0.55 on worn speckles and σ shades the ink.' },
    ],
  },
  'ticker-text': {
    paragraphs: [
      'A trading-floor display is rows of text sliding sideways. Each row is built from short tokens made of your symbols, a price and an arrow, for instance “LUM 217.40 ▲1.8%”, repeated until the row is wider than the screen; the text itself is random but fixed by the seed. Rows alternate direction and each has its own speed, so the whole wall never moves in step.',
      'The picture is carried by brightness. A small, contrast-stretched copy of your picture is sampled at the centre of each letter at the moment it is drawn, and the brighter that spot the brighter the letter, so as text slides over a bright area it lights up and over a dark area it fades. The brightest letters get a glow. In green-and-red mode the hue is a property of the token (up or down) and only the intensity comes from the picture. To keep it fast, letters are drawn in batches grouped by intensity and hue, so the fill colour changes only a couple of dozen times per frame.',
    ],
    equations: [
      { tex: T`x_i(t)=\Big(\big(i\,c+\varepsilon\,(v\,\rho\,t+o)\big)\bmod T\Big)-c,\qquad T=n\,c`, note: 'Position of character i: c is the character width, n the characters in the row, ε = ±1 the direction, v the row speed, ρ the speed slider, o an offset.' },
      { tex: T`\alpha=\operatorname{clamp}\!\big(0.07+\sigma\,B^{1.5}\cdot1.05+(1-\sigma)\cdot0.55\big)`, note: 'Letter intensity from the picture brightness B under it; σ is the “picture strength” slider.' },
    ],
  },
};
