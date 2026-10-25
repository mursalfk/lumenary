// scripts/sitemap.mjs
// Writes public/sitemap.xml: every public page of the site, straight from the section list.
// It runs before each `npm run build`, so the map never falls behind the treatments.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENABLED_SECTIONS, slugify } from '../src/data/sections.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://lumenary-studio.vercel.app';

const pages = [
  { path: '/', priority: '1.0' },
  { path: '/about', priority: '0.6' },
  { path: '/theory', priority: '0.7' },
  { path: '/theory/foundations', priority: '0.6' },
];
for (const sec of ENABLED_SECTIONS) {
  pages.push({ path: `/section/${sec.id}`, priority: '0.8' });
  pages.push({ path: `/theory/${sec.id}`, priority: '0.6' });
}
for (const sec of ENABLED_SECTIONS) {
  for (const name of sec.items) pages.push({ path: `/style/${slugify(name)}`, priority: '0.5' });
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><priority>${p.priority}</priority></url>`),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(root, 'public', 'sitemap.xml'), xml);
console.log(`public/sitemap.xml written: ${pages.length} pages`);
