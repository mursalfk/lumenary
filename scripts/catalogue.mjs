// scripts/catalogue.mjs
// Writes TREATMENTS.md: the whole roadmap as a readable catalogue, straight from the code.
// Run it with `npm run catalogue` whenever a section is built or a treatment is renamed.
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SECTIONS, slugify } from '../src/data/sections.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = join(root, 'src', 'engine', 'styles');
const SITE = 'https://lumenary-studio.vercel.app';

// One line for each treatment that is planned but not built yet. Built ones use their own `blurb`.
const PLANNED = {
  'ukiyo-e': 'Japanese woodblock prints: flat colour, bold black key lines, wave and cloud patterns, a red seal.',
  'papel-picado': 'Mexican tissue paper cut into lace-like banners and strung in bright colours.',
  'chinese-paper-cut': 'Red paper cut in symmetrical scrollwork, held up against a window.',
  'aboriginal-dot-painting': 'Fields of dots in earth ochres that follow the contours of the picture.',
  batik: 'Wax-resist dyeing with crackled lines and soft pools of colour.',
  kente: 'Woven strips of Ghanaian cloth in bold, interlocking bands of colour.',
  adinkra: 'Symbols from the Akan tradition of Ghana, stamped in black ink on cloth.',
  mudcloth: 'Hand-dyed Malian cloth: earthy browns with white geometric motifs.',
  azulejo: 'Portuguese glazed tile panels in blue and white.',
  'delft-blue': 'Dutch cobalt glaze on white, drawn with a fine brush.',
  talavera: 'Mexican majolica tile with painted floral borders.',
  sashiko: 'Japanese white running-stitch patterns on indigo cloth.',
  kintsugi: 'Broken ceramic mended with gold seams that trace the cracks.',
  'celtic-knot': 'Interlaced bands that pass over and under, in the manner of illuminated manuscripts.',
  rosemaling: 'Norwegian decorative painting: scrolling flowers laid in layered strokes.',
  mandala: 'Radial, symmetrical designs built outward from a single centre.',
  'maori-koru': 'Unfurling fern-frond spirals, as in carving and tattoo.',
  'navajo-weave': 'Stepped diamonds and banded rugs in natural wool colours.',
  'aztec-glyphs': 'Blocky pictograms in the style of Mesoamerican codices.',
  hieroglyphs: 'Papyrus-toned registers of pictographic signs.',
  'greek-meander': 'The repeating key pattern of ancient Greek vases and borders.',
  'byzantine-mosaic': 'Gold-grounded tesserae set in flowing, glittering courses.',
  ajrak: 'Block-printed cloth in deep crimson and indigo with interlocking geometric repeats.',
  'hala-blue-pottery': 'Cobalt and turquoise glazes with floral motifs on pale ceramic.',
  'ralli-patchwork': 'Sindhi quilts of bold appliqué and patchwork squares.',
  'sindhi-mirror-embroidery': 'Small mirrors held in dense embroidery that catches the light.',
  'sindhi-topi': 'The embroidered, mirror-studded Sindhi cap, its pattern repeated in bands.',
  'hala-lacquerware': 'Lathe-turned wood lacquered in bands of colour.',
  'makli-carving': 'Stone and brick relief from the necropolis of Makli: floral and geometric.',
  'indus-seal': 'Square steatite seals with animal figures and the undeciphered script.',
  'sindhi-script': 'Calligraphy in the Perso-Arabic Sindhi script, flowing across the picture.',
  'truck-art': 'Pakistani truck panels: dense florals, birds, chains and bright borders.',
  'mughal-jali': 'Pierced stone screens and inlaid pietra dura floral work.',
  'persian-miniature': 'Jewel-toned painting with flattened space and delicate borders.',
  girih: 'Islamic geometric strapwork built from five tile shapes.',
  madhubani: 'Folk painting from Bihar: dense line work, double borders and flat colour.',
  warli: 'Stick figures and spirals in white on an earthen ground.',
  kolam: 'Rice-flour floor drawings looped around a grid of dots.',
};

const built = new Map();
for (const f of readdirSync(stylesDir).filter((n) => n.endsWith('.js') && n !== 'index.js')) {
  const def = (await import(pathToFileURL(join(stylesDir, f)).href)).default;
  built.set(def.id, def);
}

const anchor = (text) => text.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-');
const cell = (text) => String(text).replace(/\|/g, '\\|');

let n = 0;
const rows = SECTIONS.map((sec) => ({
  sec,
  items: sec.items.map((name) => {
    const id = slugify(name);
    const def = built.get(id);
    n += 1;
    return { n, name, id, def, live: !!def && sec.enabled };
  }),
}));

const total = n;
const liveCount = rows.reduce((a, r) => a + r.items.filter((i) => i.live).length, 0);
const motionCount = rows.reduce((a, r) => a + r.items.filter((i) => i.live && i.def.kind === 'animated').length, 0);

const out = [];
out.push('# Lumenary treatments', '');
out.push(
  'Every treatment in Lumenary is a short program that reads the pixels of a picture, does some arithmetic and draws the result. ' +
    'This is the catalogue: what each one does, which ones you can open today, and which are still on the bench.',
  ''
);
out.push(`**${liveCount} of ${total} are open now** (${liveCount - motionCount} still, ${motionCount} live). ${liveCount < total ? 'The rest are planned, section by section.' : 'The whole roadmap is open.'}`, '');
out.push('| | Section | Treatments | Open now |', '|---|---|---:|---:|');
for (const { sec, items } of rows) {
  const open = items.filter((i) => i.live).length;
  out.push(`| ${sec.letter} | [${sec.title}](#${anchor(`${sec.letter}. ${sec.title}`)}) | ${items.length} | ${open ? open : 'planned'} |`);
}
out.push('', '**Still** treatments are drawn once and can be saved up to three times larger. **Live** treatments move, answer your cursor and can record a six second clip.', '');

for (const { sec, items } of rows) {
  const open = items.filter((i) => i.live).length;
  out.push(`## ${sec.letter}. ${sec.title}`, '', `*${sec.blurb}*`, '');
  out.push(`${items.length} treatments, ${open ? `${open} open now` : 'all planned'}. [Theory of this section](${SITE}/theory/${sec.id})${sec.enabled ? '' : ' (when it opens)'}.`, '');
  out.push('| No. | Treatment | Kind | What it does |', '|---:|---|---|---|');
  for (const i of items) {
    if (i.live) {
      const kind = i.def.kind === 'animated' ? 'live' : 'still';
      out.push(`| ${i.n} | [${cell(i.def.name)}](${SITE}/style/${i.id}) | ${kind} | ${cell(i.def.blurb)} |`);
    } else {
      out.push(`| ${i.n} | ${cell(i.name)} | planned | ${cell(PLANNED[i.id] || '')} |`);
    }
  }
  out.push('');
}
out.push('---', '', 'Generated by `npm run catalogue` from `src/data/sections.js` and the treatment files. Edit those, not this page.', '');

writeFileSync(join(root, 'TREATMENTS.md'), out.join('\n'));
console.log(`TREATMENTS.md written: ${liveCount} open of ${total}`);
