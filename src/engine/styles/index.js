import particles from './particles.js';
import liquid from './liquid-morph.js';
import holographic from './holographic.js';
import neon from './neon-glow.js';
import wireframe from './wireframe-3d.js';
import glass from './glassmorphism.js';
import kinetic from './kinetic-type.js';
import isometric from './isometric.js';
import clay from './clay-3d.js';
import ascii from './ascii-art.js';
import mesh from './gradient-mesh.js';
import comic from './comic-book.js';
import flap from './split-flap.js';
import vhs from './retro-vhs.js';
import halftone from './halftone.js';
import bauhaus from './bauhaus.js';
import pixel from './pixel-art.js';
import blueprint from './blueprint.js';
import deco from './art-deco.js';
import neo from './neo-brutalism.js';

export const STYLES = [
  particles, liquid, holographic, neon, wireframe, glass, kinetic, isometric, clay, ascii,
  mesh, comic, flap, vhs, halftone, bauhaus, pixel, blueprint, deco, neo,
].sort((a, b) => a.number - b.number);

export const getStyle = (slug) => STYLES.find((s) => s.id === slug);
