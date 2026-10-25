// src/data/theory-motion.js
// Theory entries for the treatments of section J, Motion and live.
// Keys are style ids. Every statement mirrors the code in src/engine/styles/<id>.js; change one, change the other.
const T = String.raw;

export const THEORY_MOTION = {
  'rain-on-glass': {
    paragraphs: [
      'The window is two layers: a pane misted with condensation, and the clear glass beneath it. The mist is the picture shrunk to a tenth of its size and enlarged again (a strong blur), tinted pale blue-grey with an opacity of 0.12 to 0.62 from the mist slider. A second, invisible layer is a mask that records where the glass has been cleared. Where the mask is white the sharp picture is drawn over the mist, so every drop that runs down the pane leaves a clear trail, and so does your finger when you move the pointer across it (a soft stroke 7% of the width wide). The mist comes back slowly: every 0.12 seconds the mask is reduced by 3.5%, the way condensation re-forms.',
      'Small drops sit still, with radii from 1.2 to 5.7 px skewed toward the small end. Big drops run. A running drop speeds toward a terminal speed that grows with its size, with a smooth approach (rate 3 per second), stops now and again for 0.1 to 0.7 seconds and slows to 30% of its speed, which is the stick-and-slip of real drops, and slides sideways in proportion to the slant of the wind. It also sheds tiny droplets behind it at about 3 per second. Each drop larger than about 2.6 px is a little lens. Water on glass focuses the scene behind it, and the image in a drop is upside down. The program draws it by clipping a circle and filling it with a patch of the picture rotated by 180 degrees and 3.2 times wider than the drop, then adding a dark rim, a soft highlight and a pale ring.',
    ],
    equations: [
      { tex: T`C=(1-m)\,C_{\text{mist}}+m\,C_{\text{sharp}},\qquad m\leftarrow 0.965\,m\ \ \text{every }0.12\ \text{s}`, note: 'The pane: m is the clear-glass mask, which fades back toward mist.' },
      { tex: T`v\leftarrow v+\big(v_t-v\big)\min(1,\,3\,\Delta t),\qquad v_t=v_{\text{run}}\,\mu\,\frac{r}{6},\qquad \Delta x=v\,\Delta t\,\tan\alpha`, note: 'A running drop: v_t is the terminal speed (μ a random factor from 0.6 to 1.4 and r the radius) and α the slant.' },
      { tex: T`\mathbf x_{\text{src}}=\mathbf c-3.2\,(\mathbf x-\mathbf c)`, note: 'The lens of a drop: a point x inside a drop centred at c shows the picture at x_src, so the image is inverted (the minus sign) and 3.2 times larger in extent than the drop.' },
    ],
  },
  'heat-haze': {
    paragraphs: [
      'Air bends light. How much depends on its density, through the Gladstone-Dale relation n − 1 = Kρ, and density depends on temperature, ρ ∝ 1/T at constant pressure. So warm air rising from the ground is a swirling mix of slightly different refractive indices, and the rays that pass through it are deflected a little differently from moment to moment. That is the shimmer over a hot road. The program displaces each pixel’s lookup of the picture by a vector built from fractal noise stretched in the vertical direction (the horizontal frequency is 1.3 times the vertical one’s 0.45, in units of the ripple size), and the noise scrolls upward as time goes on, so the ripples rise. The displacement is up to 3.2% of the width at full strength, a little less sideways than up and down, with a slight net lift.',
      'A heat weight w from 0 to 1 says how hot each place is. It rises from the bottom as smoothstep(0.1, 1, y/H)^1.3 for heat from the ground, is a broad Gaussian blob for heat from the middle, or is 0.8 everywhere. The pointer adds a Gaussian flame around itself that eases in at 4 per second and out at 2 per second. Red and blue light are bent by slightly different amounts (dispersion), and the program reads the three channels with the displacement scaled by 1 − s, 1 and 1 + s, which gives colour fringes at edges; s is 0.9 × the colour fringes slider. The warm tint adds red and yellow in proportion to the local displacement. The field is computed on a lattice of 6 px cells at half size and interpolated bilinearly.',
    ],
    equations: [
      { tex: T`n-1=K\rho,\qquad \rho\propto\frac{1}{T}`, note: 'Why warm air bends light: hot air is thinner, so its refractive index is lower.' },
      { tex: T`\mathbf d=A\,w\,\Big(2\big(\nu_1-\tfrac12\big),\ \ 1.1\big(\nu_2-\tfrac12\big)-0.12\Big),\qquad \nu=\operatorname{fbm}\big(1.3\,\lambda u,\ 0.45\,\lambda v+1.4\,\tau\big)`, note: 'Displacement of the lookup: A is 0.032 × strength × width, w the heat weight, λ the ripple frequency, τ the time.' },
      { tex: T`C_j(\mathbf x)=I_j\big(\mathbf x+(1+(j-1)\,s)\,\mathbf d\big),\qquad j=0,1,2\ \ (R,G,B)`, note: 'Each colour channel is looked up with its own share of the displacement.' },
    ],
  },
  fireflies: {
    paragraphs: [
      'On a summer night the picture sits in near darkness, and each firefly lights the patch of it beneath. Every firefly has a position, a heading and its own rhythm. The heading drifts smoothly: its rate of change is 5 × (n − ½) where n is slow noise, so the flight curves lazily, and the speed is set by the slider with a slight upward float. Fireflies leave one edge and re-enter at the opposite one. When the pointer is inside the picture it draws them in: within half the picture’s width the pull is 55 px per second at the pointer and falls off linearly with distance. Each blinks on its own period of 1.4 to 3.8 seconds and its own phase, with a brightness b = lerp(1, w^2.2, blink), where w = ½ + ½ sin(2πt/T + φ); the power makes each flash short and the dark between them long.',
      'The lighting is built in layers. First a near-black field with the picture at a fraction 1 − night of its brightness. Then a mask is painted: each firefly stamps a soft radial sprite (radius 30 to 125 px times 0.6 to 1.1, according to its brightness) at an opacity equal to b, and stamps combine as 1 − Π(1 − bᵢ gᵢ), so overlapping lights add up without ever exceeding 1. The sharp picture seen through this mask is added to the dark base with additive blending. Last, each firefly draws a small halo in its colour (green-gold, amber, cool white or pink) and a bright white core, also additively.',
    ],
    equations: [
      { tex: T`\dot a=5\,\big(n(0.4\,t+s)-\tfrac12\big),\qquad \mathbf v=\big(\cos a,\ \sin a\big)\,v_0\,\kappa-(0,\,4)`, note: 'A firefly’s heading a and velocity: n is slow noise, s the firefly’s own offset and κ its personal speed factor (0.6 to 1.4).' },
      { tex: T`b=(1-\beta)+\beta\Big(\tfrac12+\tfrac12\sin\big(\tfrac{2\pi t}{T}+\varphi\big)\Big)^{2.2}`, note: 'The blinking: β is the blinking slider, T the firefly’s period and φ its phase.' },
      { tex: T`m=1-\prod_i\big(1-b_i\,g_i(\mathbf x)\big),\qquad C=C_{\text{night}}+0.9\,m\,C_{\text{picture}}+\sum_i b_i\,h_i(\mathbf x)\,\mathbf c`, note: 'The light mask m, and the final colour: g and h are the radial profiles of the mask and halo sprites, c the firefly colour.' },
    ],
  },
  'ink-in-water': {
    paragraphs: [
      'Ink in still water spreads by two means: it is carried along by slow currents (advection) and it diffuses. The program uses up to 6,500 ink particles. A drop is a burst of about 380 particles (times the ink-in-each-drop slider) in a small disc 9 px across, each given a small outward push. Every particle is carried by a flow made from curl noise. If ψ(x, y, t) is a smooth scalar noise, the velocity v = (∂ψ/∂y, −∂ψ/∂x) has zero divergence, which means the flow is incompressible. The ink therefore swirls and curls without bunching up or leaving gaps, as real ink in water does. The gradient is measured by central differences over 6 px, the velocity is damped by 0.9 per step so it follows the currents with some inertia, and a little random jitter and a gentle sinking are added.',
      'Each particle draws a translucent disc on a persistent canvas whose radius grows as 1 + 0.45 × its age, with an opacity of 0.07 (1 − age/life)^0.6, so the layers add up as 1 − Π(1 − a) and darken where the ink is thick. The ink’s colour is that of the picture where the drop was released, made 1.5 times as saturated and set to 0.82 of its brightness on light water or 1.25 of it on dark water, so each drop is a distinct hue. The release spot is chosen from six random candidates as the one with the most colour (largest difference between its strongest and weakest channel). The canvas is pulled back toward the water colour at every frame, by 7% down to 0.3% per frame at 30 per second according to how long the ink lingers. Moving the pointer across the water releases small drops.',
    ],
    equations: [
      { tex: T`\mathbf v=F\,\Big(\frac{\partial\psi}{\partial y},\ -\frac{\partial\psi}{\partial x}\Big),\qquad \nabla\!\cdot\mathbf v=0`, note: 'Curl noise: ψ is smooth noise that also drifts with time, F the strength of the currents.' },
      { tex: T`a_{\text{total}}=1-\prod_i\big(1-a_i\big),\qquad a_i=0.07\,\Big(1-\frac{\text{age}}{\text{life}}\Big)^{0.6}\Big(0.6+0.4\,q\Big)`, note: 'Layered translucent discs; q is the ink-per-drop slider.' },
      { tex: T`C\leftarrow(1-\lambda)\,C+\lambda\,C_{\text{water}},\qquad \lambda=\operatorname{lerp}\big(0.07,\ 0.003,\ \ell\big)\,30\,\Delta t`, note: 'The ink thins out: ℓ is the linger slider.' },
    ],
  },
  snowfall: {
    paragraphs: [
      'The snow is a lesson in depth cues. Each flake has a depth z between 0 and 1, drawn as u^1.6 so that most flakes are far away. The near ones are bigger (radius 2.2 + 14 z² px), fall faster (0.35 + 1.1 z times the base fall speed), sway more, and are drawn with a soft, blurry sprite and a higher opacity (0.45 to 0.95), as the near objects are out of focus for a camera focused on the scene. The far ones are small, sharp, slow and faint. That is motion parallax together with atmospheric perspective, and it is why a dozen flakes make a room of space. Flakes wrap round at the edges.',
      'Each flake moves with the speed v = (14 + 90 × fall) × (0.35 + 1.1 z) px per second downward and a sideways drift made of the wind times (0.3 + z) plus a sine sway of 14 × (0.4 + z) px. The wind is the wind slider plus the pointer’s offset from the middle (up to ±100 px per second), and it eases toward its target at 2 per second so a gust builds and fades. Under the snow the picture sits in a cold light: a blue wash (opacity 0.22 × the frost slider) and a luminosity blend with a cool grey (0.35 × frost) that cools and slightly mutes its colours. Snow banked on the ground is a white gradient rising from the bottom edge to up to a fifth of the height.',
    ],
    equations: [
      { tex: T`z=u^{1.6},\qquad \rho=(2.2+14\,z^{2})\,k,\qquad \alpha=\operatorname{lerp}\big(0.45,\ \alpha_1,\ z\big)`, note: 'Depth, flake radius and opacity: u is a random number in [0, 1], k the size slider and α₁ 0.8 for soft near flakes, 0.95 for sharp ones.' },
      { tex: T`\dot y=(14+90\,\phi)\,(0.35+1.1\,z),\qquad \dot x=\omega\,(0.3+z)+14\,(0.4+z)\sin(\varsigma\,t+\varphi)`, note: 'Motion of a flake: φ is the fall slider, ω the wind, ς and φ the flake’s own sway rate and phase.' },
      { tex: T`\omega\leftarrow\omega+(\omega^{*}-\omega)\,\min(1,\,2\,\Delta t),\qquad \omega^{*}=0.7\,w+200\,\big(p_x-\tfrac12\big)`, note: 'The wind eases toward its target (w the wind slider, p the pointer position, in pixels per second at 720 px wide).' },
    ],
  },
};
