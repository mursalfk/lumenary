# Twenty

Twenty ways to see an image. A browser-only studio: pick one of twenty treatments, drop in a photo, adjust a few controls, save the result.

Nothing is uploaded. All processing happens on the visitor's device with the Canvas 2D API, so there is no server, no API key and no database.

- **Stack:** Vite, React 18, React Router 6, SCSS. No other runtime dependencies.
- **Routes:** `/` is the homepage. `/style/<slug>` is one page per treatment (twenty in total).
- **Palette:** black is primary, white is secondary, with greys in between.
- **Treatments:** 9 are live (animated, respond to the cursor, can record a 6 second WebM clip) and 11 are stills (export a PNG at 1x to 3x).

## What you need

- [Node.js](https://nodejs.org) 18 or newer. Check with `node -v`.
- [Git](https://git-scm.com). Check with `git --version`.
- A free [GitHub](https://github.com) account and a free [Vercel](https://vercel.com) account.

## Run it on your computer

```bash
npm install
npm run dev
```

Open the address it prints (normally http://localhost:5173).

To test the production build instead:

```bash
npm run build
npm run preview
```

## Put it on GitHub

1. Create an empty repository on GitHub. Do not tick "Add a README".
2. In this folder, run the commands GitHub shows under "push an existing repository":

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

## Deploy on Vercel

1. Sign in at vercel.com with GitHub.
2. **Add New → Project**, and import the repository.
3. Leave every setting as detected. Vercel reads `vercel.json`: framework Vite, build `npm run build`, output `dist`.
4. Click **Deploy**. Every later `git push` to `main` redeploys automatically.

`vercel.json` rewrites all paths to `index.html`, so opening `/style/halftone` directly (or refreshing it) works.

## Project layout

```
src/
  main.jsx, App.jsx        entry and routes
  pages/                   HomePage, StylePage (route level only)
  components/
    ui/                    small generic pieces: Button, Field, Slider, Switch, Segmented, Plate…
    controls/              one component per control type + a registry (Control.jsx)
    home/                  homepage sections
    studio/                the style page: bar, stage, panel and its sections
  hooks/                   useRuntime, useExport, useDropZone, useStyleParams, …
  hoc/                     withStyleRoute, withThumb, withDocumentTitle
  engine/                  the image processing; no React in here
    styles/                one file per treatment + index.js
  styles/                  SCSS tokens (abstracts/), base styles (main.scss)
  data/, utils/            static content and tiny helpers
```

Every component sits in its own file with its own `.scss` beside it. SCSS is nested under one root class per component, so a style problem is found by opening the component's folder.

## Add a treatment

1. Copy any file in `src/engine/styles/` (a still one such as `halftone.js` is the simplest) and rename it.
2. Give it a unique `id` (the URL slug), a `number`, a `name`, a `blurb` and a `params` list. Param types: `range`, `select`, `toggle`, `color`, `text`, `shuffle`.
3. Register it in `src/engine/styles/index.js`.

The homepage index, preview thumbnail, controls and export appear automatically. The "twenty" wording in the copy is the only thing to edit by hand.

## Change the look

All colours, fonts and breakpoints are in `src/styles/abstracts/_vars.scss`. Shared mixins are in `_mixins.scss`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm: command not found` | Install Node.js, then reopen the terminal. |
| Blank page after deploy | Check that Vercel's output directory is `dist`. |
| 404 when refreshing `/style/...` | `vercel.json` must be in the repo root and committed. |
| Fonts look different in a saved PNG | Wait a second after the page loads before saving; fonts load once. |
| Huge photo is slow | Images are capped at 3200 px on load. Try the 1x export size. |
| "Record 6 s clip" does nothing | Needs a browser with `MediaRecorder` (current Chrome, Edge, Firefox, Safari 14.1+). |

## Privacy

There is no analytics, no backend and no network request after the page loads. Photos are read with the browser's file APIs and stay in memory.
