# Lumenary: instructions

Follow in order. Each step says what you should see when it worked.

## Update: deeper theory for all 176 treatments, an About page, a new README and the launch checklist (this release)

**One new package:** `@vercel/analytics`, so run `npm install`. `package.json` also gains scripts (`sitemap`, `check:theory`, and a `prebuild` that writes the sitemap) and a new description.

1. **Close the dev server** if it is running (Ctrl+C).
2. **Unzip `lumenary.zip`** somewhere temporary. Copy everything inside the `lumenary` folder into your project folder, replacing files when asked. Your `.git`, `node_modules` and `dist` are not in the zip.
3. **Delete two retired files:** `public/og.png` and `src/components/section/StyleTile.jsx`. The share image is now `public/og-176.png` (the filename carries the number so social networks fetch the new picture instead of their cached one).
4. **Install and run:**

```bash
npm install
npm run dev
```

   Check, in this order:
   - Open `/theory/design#bauhaus`. The block now has three quick facts, **Why it looks this way**, **How it works**, **The mathematics**, **A short history**, **Where it is used**, **Try it**, **Words worth knowing** and **See also**, then the Open button.
   - Press **See it** under Try it. The treatment opens with those dials already turned. Press Reset: it goes back to the defaults.
   - Make the window phone width (or use your phone) and open `/theory/generative`. A sticky **Jump to a treatment** menu sits under the header, because the side contents list is hidden on small screens.
   - Open `/about` from the **About** link in the top bar, and from **More about the maker** at the end of the homepage's About section.
5. **Check the theory data and the build:**

```bash
npm run check:theory
npm run build
```

   Check: `check:theory` prints `Theory check: 176 of 176 entries, ... 0 errors`. Warnings are only about lines that are a little short or long; they are fine. `npm run build` first prints `public/sitemap.xml written: 206 pages`, then ends without errors. The yellow note about a large chunk is expected (the engine for all 176 treatments is in the main file on purpose). The theory text is no longer in that file: it loads only when someone opens a theory page.
6. **Commit and push when you are ready.** Read "Before you share" below first: it is worth one Vercel preview before this goes to production.

### What is new

- **Visitor analytics.** Page views are counted with Vercel Web Analytics (free, no cookies, no personal data). **Run `npm install` for this release** (new package `@vercel/analytics`). After you deploy, open the Vercel project, then **Analytics**, then **Enable**; nothing is counted until you do. The About page's colophon mentions it, and README section 15 explains how to remove it.
- **Section pages are lists again.** Each section shows a list of names; hover one and its preview follows your cursor (on a phone, each row has a small picture). The sliding text over the pictures is gone. Retired file: `src/components/section/StyleTile.jsx` (delete it). Back again: `FloatingPreview`, `StyleRow`, and the hooks `useFollowPointer` and `useMediaQuery`.
- **Theory, in depth.** Every one of the 176 treatments now has the story beside the maths (about fifty thousand words in all): why it looks the way it does, how it is made (with the real numbers the program uses), a short history, where it is used, things to try, a small glossary and neighbours. 528 tips (three per treatment) have a **See it** button that opens the treatment with the dials turned for you. The new text lives in `src/data/theory-extra/`, one file per section; the maths files are untouched. README section 17 explains the format.
- **An About page** at `/about`: who made it, the projects, why the site exists, a note on the Sindhi section, the principles it was built by, live counts and where to find you. All of it is in one file, `src/data/maker.js`.
- **A new README.** A proper top (at a glance, routes, contents), a rewritten theory section, and three new sections: the About page (19), loading and performance (20) and sharing the site (21). The project layout is brought up to date.
- **Faster first load.** The theory and About pages load on demand, so the first visit no longer carries about 245 kB of theory text. Links such as `/theory/design#bauhaus` still land on the right block.
- **Share-ready.** A new share image that says "One hundred seventy-six ways to see an image", updated page description and share text (176, not "dozens"), `robots.txt`, and a generated `sitemap.xml` with 206 addresses.
- **Two new commands.** `npm run check:theory` checks every theory entry (shape, lengths, dial presets, links, no dashes). `npm run sitemap` rewrites the sitemap (it also runs before every build).

---

## Before you share (the launch checklist)

This is everything left between "it works on my machine" and "here, look". Items marked **must** are about accuracy or respect, so they are worth doing before the post goes out. The rest can follow.

### 1. Read the About page, line by line (must)

I wrote it from what I know and from your public links, so only you can say whether it is right. Open `/about` and check each of these (all are in `src/data/maker.js`):

- **The facts list.** Research, study, the AWS Community Builder category, the AWS User Group Karachi, **President of Hack Club**, Rotaract, "Microsoft Innovative Educator Master Trainer", and "more than a hundred articles on Dev.to". Change or delete any that is wrong, out of date, or that you would rather not state. Delete the whole "Community" line if you would rather not name groups.
- **Your name.** The page says Furqan; the footer credit on every page says "Created with 💓 by Mursal". Pick one and make them match (`data/copy.js` for the footer).
- **The projects.** Lumenary, Tech Dastaan, The Accountant, Court of Facts: AWS Edition, The Ledger That Charged Twice. Check each description says what you want, and that each link opens the right place.
- **Links.** Only four are included, the ones I could confirm: your portfolio, GitHub, Dev.to and the Tech Dastaan link page. Add LinkedIn, Medium and your AWS Builder Center profile to `LINKS` if you want them: I did not guess addresses. To add Tech Dastaan's Instagram, its handle is `@tech.dastaan` (`https://www.instagram.com/tech.dastaan`).
- **Left out on purpose:** phone, email, any city, family, and anything unpublished or not yet announced. Keep it that way unless you decide otherwise.
- **"Nine"** Sindhi crafts is typed into the text of the Sindhi note. If the section ever changes size, change it too.

### 2. Have the Sindhi checked (must)

The Sindhi Script treatment's word list (`WORDS` in `src/engine/styles/sindhi-script.js`) and the text of the Sindhi section (`theory-sindhi.js`, `theory-extra/l-sindhi.js`, and the blurbs in the treatment files) were written without a native reader. Ask someone who reads Sindhi to check the spelling, the letter list, and that the descriptions of Ajrak, Hala, Makli, Ralli and the rest are what they would say. When it is done, remove the sentence on the Sindhi Script theory page that says the spelling is provisional.

### 3. Have the cultural sections read (must)

Sections K, L and M borrow the look of living traditions. The text is written as homage: it names the tradition, says what the program does and does not capture, and credits the makers. Before sharing widely, read at least these with fresh eyes, and show them to someone from the tradition if you know anyone:

- Aboriginal Dot Painting (the page says plainly that it borrows a technique and cannot carry the meaning of the original works; keep that wording),
- Maori Koru, Navajo Weave, Adinkra, Kente, Mudcloth, Hieroglyphs, Aztec Glyphs,
- Persian Miniature, Girih, Mughal Jali, Madhubani, Warli, Kolam.

If a line feels wrong, soften it or cut it; the treatment can stay.

### 4. Look at a Vercel preview before production (recommended)

Pushing to `main` deploys to production at once, so use a branch first:

```bash
git switch -c launch-176
git add -A
git commit -m "176 treatments, deeper theory, About page, new README, share image"
git push -u origin launch-176
```

Vercel builds a preview address for the branch (in the project's Deployments tab, or as a comment if you open a pull request). On **your phone**, open the preview and try:

- the homepage, one section, one treatment with one of your own photos (save a PNG),
- one live treatment, with the cursor or a finger, and **Record 6 s clip** (Safari needs 14.1 or newer),
- a theory page with a hash link, for example `/theory/sindhi#ajrak`, and a **See it** button,
- `/about`.

Then merge the branch into `main` (on GitHub: **Compare and pull request**, then **Merge**), wait for the deploy, and hard-refresh the live site. Write commit messages as above, with no extra attribution lines.

If you would rather push straight to `main`: `git add -A`, `git commit -m "..."`, `git push`.

### 5. Test the share card (must, takes two minutes)

After the live deploy, paste `https://lumenary-studio.vercel.app` into:

- a chat message to yourself (WhatsApp, Telegram or Slack) and look at the card,
- Facebook's Sharing Debugger (https://developers.facebook.com/tools/debug/) and LinkedIn's Post Inspector (https://www.linkedin.com/post-inspector/), then press the refresh or "scrape again" button. These also clear old caches.

The card should show the black hero with "One hundred seventy-six ways to see an image" and the title "Lumenary: 176 ways to see an image". If it shows the old "Twenty ways" picture, the network cached it: press refresh in the tool above, or rename the image (README section 21).

### 6. Tidy the repository (recommended, five minutes)

```bash
git rm --cached lumenary.zip
git rm src/styles/main.css src/styles/main.css.map src/styles/main.min.css src/styles/main.min.css.map
git commit -m "Remove build leftovers"
```

- `lumenary.zip` is now in `.gitignore`; the first command stops tracking the copy that was committed earlier.
- The four `main.*` files are compiled copies of the stylesheet that the app does not use and that are out of date. Skip this if you still use them for something.
- On GitHub, set the repository's **About** (the gear beside it): a one-line description, the website `https://lumenary-studio.vercel.app`, and a few topics (for example `image-processing`, `canvas`, `creative-coding`, `react`, `vite`, `generative-art`).
- Decide on a **licence**. The repository has none, which means "all rights reserved". If you want people to learn from and reuse the code, MIT is the usual choice (GitHub: **Add file**, **Create new file**, name it `LICENSE`, then **Choose a license template**). The fonts and KaTeX have their own open licences and are not affected.

### 7. Nice to have, not blocking

- **A short screen recording.** A ten second clip of one live treatment (Ink in Water, Fireflies) makes a better post than a still. Lumenary can record one itself.
- **Search.** The sitemap is already served at `/sitemap.xml`. To have Google index the site faster, add the site in Google Search Console and submit that address. Optional.
- **Lighthouse.** Run Chrome's Lighthouse once on the live site. The big first script is the one thing it may flag; README section 20 explains why it is there and how to split it later.
- **Visitor counts** are on (see "What is new"). Remember to enable Analytics in the Vercel dashboard.
- **Your own domain** (Step 9 below) gives a link that is easier to say aloud.
- **More profile links** on the About page (see item 1).

### Things to know, so nothing surprises you

- **The long theory pages on a phone.** The Geometric and generative group has thirty treatments, so on a phone it is a very long scroll. The jump menu keeps it usable. If it still feels too long, splitting that group in two is a small change.
- **Heavier treatments** (Delft Blue, Byzantine Mosaic, Aztec Glyphs, Hieroglyphs, Celtic Knot, and some generative ones) do real per-pixel work and may take a moment on a very large photo. Pictures are capped at 3200 px when they load.
- **If the names or numbers change** (a treatment is added or renamed): `npm run catalogue`, `npm run check:theory`, and the share-image steps in README section 21.

---

## Earlier update: sections K, L and M, and the roadmap is complete

**This release needs `npm install`.** One new package, `@fontsource/noto-naskh-arabic`, supplies the Arabic-script face for Sindhi Script. Nothing else changes in `package.json` except its description.

1. **Close the dev server** if it is running (Ctrl+C).
2. **Unzip `lumenary.zip`** somewhere temporary. Copy everything inside the `lumenary` folder into your project folder, replacing files when asked. Your `.git`, `node_modules` and `dist` are not in the zip. No files are retired in this release, so there is nothing to delete.
3. **Install and run:**

```bash
npm install
npm run dev
```

   Check, in this order:
   - The homepage lists **thirteen** sections (A to M). Open **World cultural** (22), **Sindhi design** (9) and **South Asian and Islamic** (7). Each section page is a contact sheet of pictures.
   - Open a handful of treatments: Ukiyo-e, Kintsugi, Celtic Knot, Byzantine Mosaic, Ajrak, Hala Lacquerware, Indus Seal, Sindhi Script, Girih, Mughal Jali, Kolam. Each has a **Theory** button with its own maths. Sindhi Script should show joined Arabic letters, right to left.
   - Open `/theory`: Foundations plus thirteen section groups. Try `/theory/southasia#girih` and `/theory/sindhi#ajrak`: each lands on its block.
4. **Refresh the catalogue** (optional, the zip already includes it):

```bash
npm run catalogue
```

   Check: it prints `TREATMENTS.md written: 176 open of 176`.
5. **Test the production build:**

```bash
npm run build
```

   Check: it ends without errors. A yellow note about a large chunk is expected: the theory text for 176 treatments is part of the main bundle.
6. **Commit and push when you are ready** (Vercel redeploys by itself). Read the first point under "What you should know" before you do.

What you should know about this release:

- **GitHub only has sections A and B.** The last commit on `main` is "added OG Image". Everything since is still only on your machine and in these zips: sections C to M, the contact-sheet section pages, the catalogue and the fixes. Because `main` deploys to production, the whole thing will go live in one push. Either push straight to `main`:

```bash
git add -A
git commit -m "Sections C to M: all 176 treatments, contact-sheet section pages, catalogue"
git push
```

   or, if you would like to look at a Vercel preview first, push a branch (`git switch -c sections-c-m`, commit, then `git push -u origin sections-c-m`) and merge it when you are happy. Write the commit message as above, with no extra attribution lines.
- **Please proofread the Sindhi.** The word list in Sindhi Script (`src/engine/styles/sindhi-script.js`, the `WORDS` array) is short and made of common words, but it was drafted without a native reader, and so was the letter list. The theory page for it says the spelling is provisional; once you have checked it, change that sentence in `src/data/theory-sindhi.js`.
- **New sections.** K World cultural (22: Ukiyo-e, Papel Picado, Chinese Paper Cut, Aboriginal Dot Painting, Batik, Kente, Adinkra, Mudcloth, Azulejo, Delft Blue, Talavera, Sashiko, Kintsugi, Celtic Knot, Rosemaling, Mandala, Maori Koru, Navajo Weave, Aztec Glyphs, Hieroglyphs, Greek Meander, Byzantine Mosaic), L Sindhi design (9) and M South Asian and Islamic (7). That is 38 new treatments, **176 of 176 live**.
- **A shared toolbox.** `src/engine/culture.js` holds what these treatments have in common: snapping a picture to a few pigments, cleaning the regions, outlines, cloth, wood and carved-stone surfaces, and ornament shapes. The README (section 11) describes it.
- **Respect for the sources.** The Aboriginal Dot Painting page says plainly that it borrows a visual technique and cannot carry the meaning of the original works. Keep that wording if you edit it.
- **Heavier treatments.** Delft Blue, Byzantine Mosaic, Aztec Glyphs, Hieroglyphs and Celtic Knot do real per-pixel or per-tile work and may take a moment on a very large photo.
- Everything from the notes below still applies: `main.css` and `main.min.css` (if you still have them) are stale compiled copies, and a `lumenary.zip` is committed in the repo root (see the new release notes above).

---

## Earlier update: contact-sheet section pages, a better catalogue, and sections G to J

No new packages this time (the only change to `package.json` is a new `catalogue` script and its description), so no `npm install`.

1. **Close the dev server** if it is running (Ctrl+C).
2. **Unzip `lumenary.zip`** somewhere temporary. Copy everything inside the `lumenary` folder into your project folder, replacing files when asked. Your `.git`, `node_modules` and `dist` are not in the zip.
3. **Delete the files this release retires.** The zip cannot delete anything, so run this from the project folder:

```bash
git rm -f src/components/home/IndexList.jsx src/components/home/IndexRow.jsx src/components/home/FloatingPreview.jsx src/hooks/useFollowPointer.js src/hooks/useMediaQuery.js treatment_list.txt
```

   Check: it prints one `rm '...'` line per file. If git says a path did not match, that file is already gone and you can ignore it.
4. **Run it:**

```bash
npm run dev
```

   Check, in this order:
   - The homepage lists **ten** sections (A to J). Open any section: you now see a **contact sheet** of pictures instead of a long numbered list. Sections with both kinds have **Still** and **Live** filters, and the longer ones have a search box.
   - Open **Geometric and generative** (30 treatments) and **Motion and live** (5). Pick a few new ones (Watercolour, Charcoal Sketch, Bokeh, Space Colonization, Rain on Glass, Fireflies, Ink in Water). Each has a **Theory** button with its own maths. The live ones respond to the cursor, and you can record a 6 second clip.
   - Open `/theory`: Foundations plus ten section groups. Try `/theory/generative#space-colonization`: it lands on that block.
5. **Refresh the catalogue** (optional, the zip already includes it):

```bash
npm run catalogue
```

   Check: it prints `TREATMENTS.md written: 138 open of 176`.
6. **Test the production build:**

```bash
npm run build
```

   Check: it ends without errors. A yellow note about a chunk larger than 900 kB is expected: the theory text for 138 treatments is now part of the main bundle.
7. **Commit and push** (Vercel redeploys by itself):

```bash
git add -A
git commit -m "Contact-sheet section pages, TREATMENTS.md catalogue, sections G to J (138 treatments)"
git push
```

   Write the commit message as above, with no extra attribution lines.

What you should know about this release:

- **Section pages are contact sheets.** Each treatment is a tile with its picture and name, so a section reads like a table of thumbnails rather than a scroll of rows. `src/components/section/` holds `StyleIndex` (the sheet), `StyleFilters` (Still / Live and search) and `StyleTile`. The cursor-following preview, with `useFollowPointer` and `useMediaQuery`, is gone because nothing uses it any more.
- **No em dashes anywhere.** The copy, the theory text, the README and the catalogue were rewritten in a plain, scientific and cozy voice. `src/` and the docs contain no em dash at all.
- **`treatment_list.txt` is replaced by `TREATMENTS.md`.** It is generated by `scripts/catalogue.mjs` from `src/data/sections.js` and the style files: a summary table, then one table per section with each treatment's number, kind (Still or Live) and a one-line description, plus a link to that section's theory page. Run `npm run catalogue` whenever you enable a section. Do not edit it by hand.
- **New sections.** G Painterly and drawn (10), H Photographic and optical (12), I Geometric and generative (30, which now includes Particles) and J Motion and live (5). That is 57 new treatments, 138 live in total. Only K World cultural (22), L Sindhi design (9) and M South Asian and Islamic (7) remain.
- **Live treatments in J** (Rain on Glass, Heat Haze, Fireflies, Ink in Water, Snowfall) run a small simulation on a canvas. They settle after a second or two on a large photo, and the pointer stirs them. Space Colonization in I is the heaviest still one and may take a moment on a very large photo.
- **Space Colonization** now starts as a vein tree grown from the centre, which reads better on photographs than the old defaults. Its sliders are unchanged.
- **Phone fix.** On treatment pages narrower than 1000 px the row of other treatments in the same section (`SectionLinks`) stretched the grid column and made the whole page scroll sideways. The column is now `minmax(0, 1fr)`, so only that row scrolls.
- Everything from the notes below still applies: `main.css` and `main.min.css` (if you still have them) are stale compiled copies, and a `lumenary.zip` is committed in the repo root (see the new release notes above).

---

## Earlier update: Theory button fix, plus sections E and F

No new packages this time (`package.json` is unchanged), so no `npm install`.

1. **Close the dev server** if it is running (Ctrl+C).
2. **Unzip `lumenary.zip`** somewhere temporary. Copy everything inside the `lumenary` folder into your project folder, replacing files when asked. Your `.git`, `node_modules` and `dist` are not in the zip.
3. **Run it:**

```bash
npm run dev
```

   Check, in this order:
   - Open `http://localhost:5173/style/swiss-design`, click **Theory**: you land on the **Swiss Design** block, not Art Deco. Try a few other treatments, and also reload on a link such as `/theory/design#swiss-design`.
   - The homepage lists **six** sections (A to F). **Physical and 3D feel** has 7 treatments and **Print and craft** has 14.
   - Open a few new ones (Gold Foil, Embossed Leather, Risograph, Stained Glass, Banknote Engraving). Each has a **Theory** button with its own maths.
4. **Test the production build:**

```bash
npm run build
```

   Check: it ends without errors.
5. **Commit and push** (Vercel redeploys by itself):

```bash
git add -A
git commit -m "Fix Theory button landing on the wrong block, add sections E and F (81 treatments)"
git push
```

What you should know about this release:

- **The Theory button bug.** The smooth-scroll library keeps the page height it measured on the previous page, so on the long theory page it could not scroll as far as the target and stopped at the wrong block (Art Deco, the one that fit). `src/utils/scroller.js` now re-measures first, and `src/components/ScrollToTop.jsx` jumps to the block and re-aligns it a few times while the page settles. Scrolling with the wheel or touch during that moment cancels it.
- **New in E:** Plasticine, Embossed Leather, Gold Foil, Fabric Folds, Rubber Stamp, Origami Folds (Clay 3D was already built). **New in F:** Risograph, Linocut, Banknote Engraving, Screen Print, Mezzotint, Cyanotype, Cross-stitch, Embroidery, Knitted Pattern, Quilt Patchwork, Tapestry Weave, Paper Cut-out, Stained Glass (Halftone was already built). The Banknote Engraving wording is invented on purpose.
- Plasticine takes about a second to render on a large photo, because it builds a height map for every clay colour. That is normal.
- Only **Particles** is still hidden on purpose; it belongs to section I.
- Two small engine helpers were added (`slopes`, `cellular` in `src/engine/helpers.js`) and the Bodoni Moda 600 weight is preloaded for canvas text in `src/env.js`.
- Everything from the notes below still applies: `main.css` and `main.min.css` (if you still have them) are stale compiled copies, and a `lumenary.zip` is committed in the repo root (see the new release notes above).

---

## Earlier update: sections as portals, plus C and D

You already have the repository and the live site. This release changes the structure and adds two fonts, so it needs one `npm install`.

1. **Close the dev server** if it is running (Ctrl+C in its terminal).
2. **Unzip `lumenary.zip`** somewhere temporary. You get a folder named `lumenary`. Copy everything inside it into your project folder, replacing files when asked. Your `.git` folder, `node_modules` and `dist` are not in the zip, so they are untouched.
   The `src`, `public`, `index.html`, `package.json`, `README.md` and `instructions.md` from the zip replace yours. If you changed `main.scss` by hand since the last release, copy your changes aside first, because the zip's `src/styles/main.scss` is the new one.
3. **Install the two new fonts (Caveat and Pinyon Script):**

```bash
npm install
```

   Check: it finishes without errors.
4. **Delete the files that no longer exist** (they were replaced by the new structure; leftovers are harmless but confusing):

```bash
rm src/components/home/IndexGroup.jsx src/components/home/SectionJump.jsx src/components/theory/GroupTitle.jsx
```

5. **Run it:**

```bash
npm run dev
```

   Check, in this order:
   - The homepage lists **sections only** (A to D), each with a few preview pictures and a treatment count. No treatments on the homepage.
   - Click **Design movements and styles**: a new page lists its 23 treatments. Click one: you reach the treatment.
   - On a treatment page there is a **Theory** button (top bar on a desktop, above the controls on a phone). It opens that treatment's block on the theory page.
   - On the theory page, each block has **Open <treatment>** to go back. `/theory` is also a list of portals: Foundations and one per section.
   - Sections **C Typographic** and **D Light, colour and glass** are live: 60 treatments in all.
6. **Test the production build:**

```bash
npm run build
```

   Check: it ends without errors and prints the size of `dist`.
7. **Commit and push** (Vercel redeploys by itself):

```bash
git add -A
git commit -m "Sections as portals, theory button both ways, add sections C and D (60 treatments)"
git push
```

   Check: in about a minute https://lumenary-studio.vercel.app shows the new homepage.

What you should know about this release:

- **What changed.** Homepage and theory index are portals. `/section/<id>` is one section's treatments and `/theory/<id>` is one group's theory. The treatment page's back link now returns to its section. Sections A and B were re-fixed to this structure.
- **New in C:** Handwritten, Calligraphy Portrait, Newspaper, Letterpress, Ticker Text (live). **New in D:** Aurora, Duotone, Chrome, Glass Refraction, Frosted Ice. The seven earlier treatments that belong to C and D (kinetic type, split-flap, glassmorphism, gradient mesh, holographic, neon glow, liquid morph) are back.
- Three of the first twenty are still **hidden on purpose**: particles, clay 3D and halftone. They belong to sections I, E and F.
- Matrix Rain's katakana option depends on the visitor's system fonts. Nothing to fix; it falls back to a plain monospace glyph.
- `src/styles/main.css`, `main.min.css` and their `.map` files are compiled copies tracked in your repo. The app does not use them (Vite compiles `main.scss` itself) and they are not updated by this release, so they are now out of date. If you use a Sass watcher in your editor it will refresh them; otherwise you can remove them with `git rm`.
- Your repository has a `lumenary.zip` committed in its root (from an earlier commit). It is not part of the app. Remove it with `git rm lumenary.zip` if you did not mean to keep it.
- To switch on the next section later: see section 18 of `README.md`.

---

## Before you start

You need three things on your computer:

1. **Node.js 18 or newer.** Download the LTS version from https://nodejs.org and install it.
   Check: open a terminal and run `node -v`. It should print `v18` or higher.
2. **Git.** Download from https://git-scm.com and install.
   Check: `git --version` prints a version.
3. **Two free accounts:** GitHub (https://github.com) and Vercel (https://vercel.com). On Vercel, choose "Continue with GitHub".

Terminal: Terminal on Mac, PowerShell or Git Bash on Windows.

## Step 0. Just look at it (optional, no install)

Double-click `lumenary.html` (sent separately). It opens in your browser. The Theory page explains the maths behind each treatment. Use the on-page links to move around; the browser back button will not change pages in this file.

## Step 1. Unzip

1. Unzip `lumenary.zip`. You get a folder named `lumenary`.
2. In the terminal, go into it:

```bash
cd path/to/lumenary
```

Check: `ls` (Mac) or `dir` (Windows) shows `package.json`, `README.md`, `src`.

## Step 2. Install and run locally

```bash
npm install
npm run dev
```

Check: the terminal prints a line like `Local: http://localhost:5173/`. Open that address. You should see the black homepage with a huge "Lumenary" wordmark that lights up under your cursor. Open **Theory** in the top bar to see the equations. Click any style, upload a photo, move the sliders. Press `Ctrl+C` in the terminal to stop.

## Step 3. Test the production build (optional but recommended)

```bash
npm run build
npm run preview
```

Check: `build` ends with `built in …s`. Open the address `preview` prints and click through two or three styles.

## Step 4. Create the GitHub repository

1. Go to https://github.com/new.
2. Repository name: `lumenary` (or anything you like).
3. Choose Public or Private.
4. **Do not** tick "Add a README", ".gitignore" or a licence. Leave the repo empty.
5. Click **Create repository**. Keep the page open; you need its address, which looks like `https://github.com/<your-username>/lumenary.git`.

## Step 5. Push the code

The folder is already a git repository with one commit. In the terminal, inside the `lumenary` folder:

```bash
git remote add origin https://github.com/<your-username>/lumenary.git
git branch -M main
git push -u origin main
```

Replace `<your-username>` with yours. If asked to sign in, use your GitHub login (or a personal access token if it asks for a password: GitHub → Settings → Developer settings → Personal access tokens).

Check: refresh the GitHub page. You see the files and the README.

If `git push` says "remote origin already exists", run `git remote set-url origin https://github.com/<your-username>/lumenary.git` and push again.

If git says it does not know who you are when committing later, run once:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Step 6. Deploy on Vercel

1. Go to https://vercel.com/new and sign in with GitHub.
2. If your repo is not listed, click **Adjust GitHub App Permissions** and allow access to it.
3. Click **Import** next to `lumenary`.
4. Leave everything as detected. It should show: Framework **Vite**, Build Command `npm run build`, Output Directory `dist`. (These come from `vercel.json`.)
5. Click **Deploy**. Wait about a minute.

Check: Vercel shows a "Congratulations" page with a preview. Click it. You get a link like `https://lumenary.vercel.app`.

## Step 7. Verify the live site

On the live link:

1. The homepage loads.
2. Open any style. Then **refresh the page** and check it still loads (this proves the Vercel rewrite works).
3. Upload a photo and press **Save PNG**.
4. On a live style (marked "Live", for example Particles) press **Record 6 s clip**.
5. Open it on your phone.

## Step 8. Updating the site later

Edit files, then:

```bash
git add -A
git commit -m "Describe your change"
git push
```

Vercel redeploys automatically in about a minute.

## Step 9. Optional: your own domain

Vercel → your project → **Settings** → **Domains** → add the domain and follow the DNS instructions it shows.

## If something goes wrong

| What you see | Do this |
| --- | --- |
| `npm: command not found` | Install Node.js (Before you start, item 1), close and reopen the terminal. |
| `npm install` errors about Node version | Install Node 18 or newer. |
| Port 5173 already in use | Vite picks the next port automatically; use the address it prints. |
| Vercel build fails | Open the failed deployment → Build Logs. Run `npm run build` locally; if it fails there too, the error is the same. |
| Blank page on Vercel | Settings → General → Output Directory must be `dist`. |
| 404 when refreshing `/style/...` | Make sure `vercel.json` is committed and in the repo root, then redeploy. |
| `git push` rejected | You ticked "Add a README" in Step 4. Create a new empty repo and push again. |

## Where things are

- Full documentation, including every hook and higher-order component: `README.md`.
- All styling: `src/styles/main.scss`.
- Add a new style: README section 12.
- Make your own preview file: `npm run build:single`, then open `dist-single/index.html`.

## Next steps

- Try each of the twenty styles with two or three of your own photos, on desktop and phone.
- The palette is black and white for now. Accent colour goes in `src/styles/abstracts/_vars.scss`.

## Changing the credit line

The footer reads "Created with 💓 by Mursal". The name and portfolio link are in `src/data/copy.js` under `AUTHOR`.

## Rebuilding the single HTML preview

```bash
npm run build:single
```

The file is written to `dist-single/index.html`.
