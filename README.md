# Lumenary

**176 ways to see an image.** A studio that runs entirely in the browser: pick a treatment, bring a photograph, turn a few dials and save the result. Every treatment also has a page of theory beside it: why it looks the way it does, how it is made, where it comes from, where it is used and what to try.

Live at **https://lumenary-studio.vercel.app**. The whole roadmap is open, and a readable catalogue of every treatment is in [`TREATMENTS.md`](TREATMENTS.md).

Nothing is uploaded. All processing happens on the visitor's device with the Canvas 2D API, so there is no server, no API key and no database.

## At a glance

| | |
| --- | --- |
| **Treatments** | 176 in thirteen sections (A to M): 151 stills you can save up to three times larger, and 25 live ones that move, follow the cursor and record a six second clip. |
| **Dials** | About a thousand in all, every one of them a slider, a choice, a switch, a colour or a text box. |
| **Theory** | A page for each treatment: why, how, the mathematics, history, uses, things to try (most with a "See it" link that turns the dials for you), a small glossary and neighbours. About fifty thousand words. |
| **Pages** | Home, 13 section pages, 14 theory pages (Foundations plus one per section), 176 treatment pages and an About page. |
| **Stack** | Vite, React 18, React Router 6, SCSS. Three small libraries for the interface: `motion` (springs and scroll-linked animation), `lenis` (smooth scrolling) and `katex` (typeset equations). The image engine itself has no dependencies. |
| **Look** | Black is primary, white is secondary, with greys in between. Bodoni Moda for display, Hanken Grotesk for text, DM Mono for small figures. |

**The sections.** A Design movements and styles (23), B Digital and technical (20), C Typographic (7), D Light, colour and glass (10), E Physical and 3D feel (7), F Print and craft (14), G Painterly and drawn (10), H Photographic and optical (12), I Geometric and generative (30), J Motion and live (5), K World cultural (22), L Sindhi design (9) and M South Asian and Islamic (7). The list lives in `src/data/sections.js` (see [section 18](#18-sections-and-the-roadmap)).

**The routes.**

| Path | What it is |
| --- | --- |
| `/` | The homepage: the hero and one portal row per section. |
| `/section/<id>` | One section's treatments as a list of names, with Still and Live filters. Hover a name to see its preview. |
| `/style/<slug>` | One treatment: the picture, the dials, the export. `?dial=value` opens it with some dials already turned. |
| `/theory` | The theory index: Foundations, then one row per section. |
| `/theory/<id>` | The theory of one group, one block per treatment. |
| `/about` | Who made Lumenary, and why. |

## Contents

1. [Quick start](#1-quick-start)
2. [Put it on GitHub](#2-put-it-on-github)
3. [Deploy on Vercel](#3-deploy-on-vercel)
4. [How the app works, in one page](#4-how-the-app-works-in-one-page)
5. [Project layout](#5-project-layout)
6. [Conventions](#6-conventions)
7. [Hooks: what, why, where, how](#7-hooks-what-why-where-how)
8. [Higher-order components: what, why, where, how](#8-higher-order-components-what-why-where-how)
9. [Other patterns we use](#9-other-patterns-we-use)
10. [Styling with one SCSS file](#10-styling-with-one-scss-file)
11. [The engine (no React)](#11-the-engine-no-react)
12. [Add a treatment](#12-add-a-treatment)
13. [Change the look](#13-change-the-look)
14. [Troubleshooting](#14-troubleshooting)
15. [Privacy](#15-privacy)
16. [The homepage design and motion](#16-the-homepage-design-and-motion)
17. [The theory pages](#17-the-theory-pages)
18. [Sections and the roadmap](#18-sections-and-the-roadmap)
19. [The About page](#19-the-about-page)
20. [Loading and performance](#20-loading-and-performance)
21. [Sharing the site](#21-sharing-the-site)

**Short on time?** Section 1 gets it running. Section 12 shows how to add a treatment. Section 17 shows how to write its theory. Sections 4 and 5 are the map of the code.

---

## 1. Quick start

### What you need

- [Node.js](https://nodejs.org) 18 or newer. Check with `node -v`.
- [Git](https://git-scm.com). Check with `git --version`.
- A free [GitHub](https://github.com) account and a free [Vercel](https://vercel.com) account (only for deploying).

### Run it on your computer

```bash
npm install
npm run dev
```

Open the address it prints (normally http://localhost:5173).

### Scripts

| Command                | What it does                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Dev server with hot reload.                                                                       |
| `npm run build`        | Production build into `dist/`. This is what Vercel runs.                                          |
| `npm run preview`      | Serves `dist/` locally so you can test the production build.                                      |
| `npm run build:single` | Writes one self-contained file, `dist-single/index.html`, with scripts, styles and fonts inlined. |
| `npm run catalogue`    | Regenerates `TREATMENTS.md`, the readable list of all 176 treatments, from the data and the style files. |
| `npm run check:theory` | Checks every theory entry against the live treatments: shape, lengths, dial presets, links, dashes. Add letters to limit it: `npm run check:theory -- KLM`. |
| `npm run sitemap`      | Writes `public/sitemap.xml` from the section list. It also runs by itself before every `npm run build`. |

### Preview without installing anything

`npm run build:single` produces a single HTML file you can double-click. It keeps its current page in memory instead of the address bar (it uses `MemoryRouter`), so it also works inside preview panes and in-app viewers where there is no real URL. The browser's back button will not step between pages in that file; use the on-page links. The deployed site uses normal URLs.

---

## 2. Put it on GitHub

1. Create an empty repository on GitHub. Do not tick "Add a README".
2. In this folder, run the commands GitHub shows under "push an existing repository":

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

`node_modules`, `dist`, `dist-single`, `.vercel` and `.env*` are already in `.gitignore`.

---

## 3. Deploy on Vercel

1. Sign in at vercel.com with GitHub.
2. **Add New → Project**, and import the repository.
3. Leave every setting as detected. Vercel reads `vercel.json`: framework Vite, build `npm run build`, output `dist`.
4. Click **Deploy**. Every later `git push` to `main` redeploys automatically.

`vercel.json` rewrites every path to `index.html`. That is what makes opening `/style/halftone` directly (or refreshing it) work: the server hands back the app, and React Router reads the URL.

---

## 4. How the app works, in one page

Read this first; the rest of the document zooms in on each part.

```
                           main.jsx
               BrowserRouter (or MemoryRouter in the single-file build)
                              │
                           App.jsx ── SmoothScroll, ScrollToTop
   ┌───────────┬──────────────┼──────────────┬─────────────┬───────────────┐
 "/"      "/section/:id"   "/theory"   "/theory/:id"    "/about"      "/style/:slug"
HomePage  SectionPage     TheoryPage  TheoryGroupPage  AboutPage        StylePage
   │          │               │             │              │                │
 section    one section's   theory        theory blocks  the maker,     withStyleRoute →
 portals    treatments      portals       of one group   the projects   withDocumentTitle → Studio
 (IndexSection) (StyleIndex) (PortalList)  (StyleTheory)  (data/maker.js)     │
                                                                       useStyleParams  useImageInput
   lazy: TheoryPage, TheoryGroupPage and AboutPage load on demand       useRuntime  useExport …
                                                                              │
                                                                   src/engine  (plain JS, no React)
                                                                   Canvas 2D: one module per treatment + runtime
```

The flow of one visit:

1. **Homepage.** `HomePage` calls `startThumbs()`. That renders every style once, from a built-in sample picture, into a small JPEG, one per idle moment (the first four of each section first, so the section rows fill quickly). The hero card and the section rows read those previews as they appear.
2. **Choosing a section, then a style.** The homepage shows sections only, as portals. A click goes to `/section/<id>`, where `SectionPage` lists that section's treatments; a click there goes to `/style/<slug>`. `withStyleRoute` looks the slug up and hands `Studio` the style object. The Theory side mirrors this: `/theory` lists groups, `/theory/<id>` shows one.
   Crossing over: the Theory button on a treatment goes to `/theory/<section>#<style-id>`, and each theory block has an Open button back to its treatment. A "See it" link in a theory block goes the other way with some dials already turned (`/style/<id>?size=20&ink=black`, section 17).
3. **Studio.** Creates a canvas runtime for that style (`useRuntime`), keeps the control values in state (`useStyleParams`, which starts from the treatment's defaults plus any dials named in the link), and listens for an uploaded image (`useImageInput`, `useDropZone`, `usePasteImage`).
4. **Changing a control.** A control calls `set(key, value)`. The new `params` object flows into `useRuntime`, which calls `runtime.setParams`. Stills re-render; live styles pick the values up on their next frame.
5. **Export.** `useExport` asks the runtime for a PNG (stills are re-rendered larger, up to 4096 px) or records six seconds of WebM (live styles), then `useDownload` saves it.

The uploaded picture is shared by every treatment page: upload once, then step through the styles with the arrows.

---

## 5. Project layout

```
index.html                 page shell
vite.config.js             React plugin, SCSS modern compiler
vite.single.config.js      the single-file build
vercel.json                SPA rewrite for Vercel
public/
  favicon.svg
  og-176.png               the share image (1200 by 630), see section 21
  robots.txt, sitemap.xml  for search engines (the sitemap is generated)
scripts/
  catalogue.mjs            writes TREATMENTS.md from the roadmap and the style files (npm run catalogue)
  check-theory.mjs         checks the theory data against the treatments (npm run check:theory)
  sitemap.mjs              writes public/sitemap.xml (npm run sitemap, and before every build)
TREATMENTS.md             the catalogue of all 176 treatments (generated, do not edit by hand)
src/
  main.jsx                 entry: fonts, stylesheet, router
  App.jsx                  the route table
  env.js                   canvas factory and font loading (the only DOM the engine ever sees)
  source.js                shared uploaded image (external store)
  thumbs.js                homepage previews (external store)
  pages/
    HomePage.jsx           route level only
    SectionPage.jsx        /section/:id, one section's treatments (composed from HOCs)
    TheoryPage.jsx         /theory, the theory portals (Foundations and each section), loaded on demand
    TheoryGroupPage.jsx    /theory/:id, one group's theory blocks, runs the scroll-spy, loaded on demand
    AboutPage.jsx          /about, the maker and the story behind the site, loaded on demand
    StylePage.jsx          /style/:slug, route level only (composed from HOCs)
  components/
    ScrollToTop.jsx        resets or hash-scrolls on navigation; waits for a block that is still loading
    SmoothScroll.jsx       starts Lenis once for the whole app
    ui/                    generic building blocks, no knowledge of this app
      Button, ButtonLink, MagneticButtonLink, LinkButton, Equation, Field, Slider, Switch, TextInput, SelectInput,
      ColorInput, Segmented, FilePicker, Section, Hint, Eyebrow, Plate, KindBadge
    controls/              turn a style's parameter schema into UI
      Control (registry), ControlList, RangeControl, SelectControl,
      ToggleControl, ColorControl, TextControl, ShuffleControl
    home/                  homepage sections
      TopBar, NavLinks, Hero, LitWordmark, Letters, HeroIntro, TiltPlate,
      HeroCard, FeaturedLink, Manifesto, ScrollWords, ScrollWord,
      IndexSection (the section portals), SectionHead,
      MethodTeaser, About, AboutColumn, Credit, Footer, Grain
    portal/                the portal pattern shared by the homepage and the theory index
      PortalList, PortalRow, PortalPreview, GroupHero, PageNeighbors
    section/               the section page, a list of names
      StyleIndex (the list), StyleFilters (Still / Live and search), StyleRow (one name), FloatingPreview (the preview that follows the cursor)
    theory/                the theory pages
      TheoryHero, TheoryNav (sticky contents), TheoryJump (the same, as a menu on phones),
      TheoryBlock (the frame), StyleTheory (one treatment's whole entry), and the pieces it is made of:
      TheoryFacts, TheorySection, TheorySteps, TheoryList, TheoryTips, TheoryTerms, TheoryRelated
    about/                 the About page
      AboutHero, MakerBlock, Prose, FactList, ProjectList, ProjectRow, PullQuote, Figures, Principles, FindMe
    studio/                the style page
      Studio, StudioBar, BackLink, TheoryLink, TitleBlock, SectionLinks, StepNav, Stage, StageMeta,
      Panel, ImageSection, TreatmentSection, ExportSection
  hooks/                   19 custom hooks (section 7)
  hoc/                     6 higher-order components (section 8)
  data/                    static copy: nav.js, about.js (the short homepage About), copy.js (author, manifesto),
                           maker.js (everything on the /about page: story, projects, links),
                           sections.js (the roadmap: every section and treatment name),
                           theoryGroups.js (the groups the theory pages are built from),
                           theory.js (the foundations; it merges the files below into one THEORY object),
                           theory-design.js, theory-digital.js, theory-type.js, theory-light.js,
                           theory-physical.js, theory-craft.js, theory-painterly.js, theory-optical.js,
                           theory-generative.js, theory-motion.js, theory-world.js, theory-sindhi.js,
                           theory-southasia.js
                           (the mathematics: paragraphs and LaTeX equations, one file per section)
    theory-extra/          the story of each treatment, one file per section (a-design.js to m-southasia.js)
                           and an index.js that gathers them (section 17)
  utils/                   cx, compose, format, jumpTo, scroller, words (numbers as words),
                           presets (dial settings carried in a link)
  styles/
    main.scss              the one stylesheet for the whole app
    abstracts/             _vars.scss, _mixins.scss, _index.scss
  engine/                  image processing, no React (section 11)
    runtime.js, utils.js, sample.js
    helpers.js             shared building blocks for treatments (pixels, ramp, nearest, kmeans, glow, slopes, cellular, ...)
    culture.js             building blocks for sections K, L and M (palette snapping, region clean-up, cloth and stone surfaces, ornaments)
    styles/                one file per treatment + index.js (the registry)
```

The three tiers in `components/` go from least to most specific. `ui/` knows nothing about styles or images. `controls/` knows about parameter schemas but not about any one treatment. `home/` and `studio/` know about the app. Dependencies only point down that list, so a bug in a button is fixed in one place for the whole app.

---

## 6. Conventions

- **One component per file**, one default export, named like the file. Props in, JSX out.
- **Functional components only.** No classes.
- **No repeated code.** If two files need the same thing, it becomes a component, a hook, a HOC or a util. Examples: `Plate` (the framed preview image) is used by the hero card and the floating preview; `Segmented` is used by the select control and the export size picker; `Field` wraps every control.
- **Hooks own behaviour, components own markup.** A component that needs a timer, a listener or a canvas gets a hook; the component itself stays a few lines of JSX.
- **Props are explicit.** Components get what they need as props and do not reach into global state, except through the two small stores in `source.js` and `thumbs.js`, always via a hook.
- **Styles live in one file**, nested (section 10).
- **Comments say why**, not what.

---

## 7. Hooks: what, why, where, how

### 7.1 Why custom hooks at all

A hook is a function that can use React state and effects. We write our own for one reason: **so that a component file contains only layout**. Without them, `Studio.jsx` would hold a canvas lifecycle, drag-and-drop wiring, clipboard listener, export logic, three pieces of state and the markup, all in one place, and half of that would be copied into any other page that needed it. With them, `Studio.jsx` is a list of one-line hook calls followed by JSX, and every behaviour can be found, read and fixed in a file named after it.

Rules every hook here follows:

- Starts with `use`, lives in `src/hooks/`, one hook per file, default export.
- Does one job and returns the smallest useful thing (a value, a pair, a handler object).
- Cleans up after itself: every listener, timer, animation frame and runtime it starts, it stops.
- Takes callbacks that may change identity and still calls the latest one (see `useInterval`).

### 7.2 The built-in hooks and where they are used

| Built-in hook          | Used for                                                                                 | Where                                                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useState`             | Values the screen depends on                                                             | `useStyleParams`, `useDropZone`, `useExport`, `useImageInput`, `useCycle`, `useRuntime` (canvas size), `Studio` (export scale), `IndexSection` (hovered style) |
| `useEffect`            | Talking to things outside React: listeners, timers, the canvas runtime, `document.title` | `useInterval`, `usePasteImage`, `useRuntime`, `useDocumentTitle`, `ScrollToTop`, `HomePage`                                                |
| `useRef`               | Holding something that must survive renders without causing one                          | `useRuntime` (`rtRef`), `useInterval` (saved callback), `FilePicker` (hidden input), `Studio` (`canvasRef`)                       |
| `useCallback`          | Giving a function a stable identity                                                      | `useStyleParams`, `useImageInput`, `useExport`, `useDownload`                                                                                                  |
| `useMemo`              | Giving an object a stable identity                                                       | `useDropZone` (the `bind` handlers), `usePointerBridge` (the pointer handlers)                                                                                 |
| `useId`                | Unique ids that match a label to its input                                               | every control in `controls/`                                                                                                                                   |
| `useSyncExternalStore` | Reading data that lives outside React                                                    | `useSource` (in `source.js`), `useThumb` / `useThumbCount` (in `thumbs.js`)                                                                   |

**Not used, on purpose:**

- `useReducer`: no state here has transitions complicated enough to need one. `useStyleParams` is "set one key" and "reset", which a functional `setState` expresses directly.
- `useContext`: nothing is passed through more than three component levels, and the two things that are genuinely global (the uploaded image, the previews) are already in external stores. Adding a context would only add a provider to maintain.

### 7.3 Why `useCallback` and `useMemo` appear where they do

They are not sprinkled everywhere. Each use has a concrete reason: the value ends up in a dependency array of an effect, or is handed to a listener that is added and removed.

- `usePasteImage(onFile)` adds a `paste` listener in an effect that depends on `onFile`. If `onFile` changed every render, the listener would be removed and re-added every render. `useImageInput` wraps `take` in `useCallback` so it is stable, and `useDropZone` builds its handlers with `useMemo` keyed on that same callback.
- `usePointerBridge` returns five handlers. They are memoised so the canvas element does not receive new props on every render, and so they only change if the canvas ref or runtime ref changes (they never do).
- `useExport` returns `savePng` and `record`; both are `useCallback`s because they depend on `scale`, `style` and the runtime ref, and callers pass them to buttons.

### 7.4 The nineteen custom hooks

The last four (`useSpotlight`, `useTilt`, `useMagnetic`, `useScrollSpy`) were added with the redesigned homepage and are described after `useDocumentTitle`.

Each entry: what it does, why it exists, where it is used, how it works.

#### `useStyleParams(style)` → `{ params, set, reset }`

- **What:** the control values for one style.
- **Why:** every style has a different parameter list, but the logic is always the same: start from the style's defaults, change one key, or go back to the defaults. Putting that in a hook means `Studio` does not know or care what parameters exist.
- **Where:** `Studio`.
- **How:** `useState(() => defaultsOf(style))` (a lazy initialiser, so defaults are computed once). `set` uses the functional form `setParams(p => ({ ...p, [key]: value }))`, which means it never needs `params` in its dependencies, so it keeps one identity for the life of the page. `reset` rebuilds from defaults. Every change produces a **new object**; that is what lets `useRuntime` detect a change with a simple `===` comparison.

#### `useImageInput()` → `{ src, take, error, reset }`

- **What:** the shared uploaded picture, plus a safe way to load a new one.
- **Why:** loading a file can fail (not an image, unreadable, too large). The error text belongs next to the upload button, not in a `try/catch` inside every component that accepts files.
- **Where:** `Studio` (passes `take` to the file picker, the drop zone and the paste listener; passes `error` to `ImageSection`).
- **How:** `src` comes from `useSource()`, which subscribes to the store in `source.js`. `take(file)` clears the error, awaits `loadImageFile`, and stores the message on failure. It ignores a missing file (cancelled picker). `reset` is `resetToSample`.

#### `useRuntime(style, canvasRef, params, source)` → `{ rtRef, dim }`

- **What:** owns the canvas runtime for one style and keeps it in step with the parameters and the picture.
- **Why:** the engine is plain JavaScript with its own animation loop. React must create it exactly once per page, give it the canvas, feed it changes, and destroy it on the way out. Mixing that into a component is where most canvas-in-React bugs come from, so it lives in one file.
- **Where:** `Studio`.
- **How, in three effects:**
  1. *Create* (`[style, canvasRef]`): builds the runtime, applies the current params and source, starts it, waits for fonts, and returns a cleanup that disposes it. Because `Studio` is remounted per style (see `withStyleRoute`), this runs once per page.
  2. *Params* (`[params]`): when the object changes, calls `setParams`.
  3. *Source* (`[source]`): when the picture changes, calls `setSource`.
- **Two details worth knowing:**
  - **Latest-ref pattern.** The create effect must not depend on `params` and `source`, or changing a slider would destroy and rebuild the runtime. Instead the latest values are copied into `latest.current` on every render, and the create effect reads from there.
  - **`applied` ref.** The create effect already applied the current params and source. Without a record of that, effects 2 and 3 would apply them a second time on mount. `applied.current` remembers what the runtime last received, and the effects skip when nothing is new.
- `dim` is the canvas size reported by the runtime (`onSize`), used for the readout and the export size hint. `rtRef` is a ref, not state, because the runtime is a mutable object that must not trigger renders.

#### `usePointerBridge(canvasRef, rtRef)` → handler object

- **What:** converts mouse and touch events on the canvas into 0 to 1 coordinates for the runtime.
- **Why:** live styles react to the cursor (for example the particles scatter away from it). The maths is the same for every style, so it is done once.
- **Where:** `Studio` spreads the result onto `Stage`'s canvas as `{...pointer}`.
- **How:** one inner `send(e, patch)` measures the canvas with `getBoundingClientRect`, normalises `clientX/clientY`, and calls `rt.setPointer`. The five handlers (`move`, `enter`, `leave`, `down`, `up`) differ only in the `patch` (`inside`, `down`). Wrapped in `useMemo` so the object is stable.

#### `useDropZone(onFile)` → `{ dragging, bind }`

- **What:** makes any element a drag-and-drop target.
- **Why:** drag-and-drop needs four event handlers and a "currently dragging" flag, and `preventDefault` on `dragover` or the browser simply opens the file. That is easy to get subtly wrong, so it is written once.
- **Where:** `Studio` → `Stage` (`dragging` shows the "Drop to use this image" overlay and highlights the border; `bind` is spread on the stage `div`).
- **How:** `dragenter` and `dragover` set `dragging` and prevent the default; `dragleave` clears it; `drop` clears it and passes the first file to `onFile`.

#### `usePasteImage(onFile)`

- **What:** lets people paste an image from the clipboard anywhere on the page.
- **Why:** it is the fastest way to use a screenshot. It is a separate hook (not part of the drop zone) because it listens on `document`, not on one element.
- **Where:** `Studio`.
- **How:** a `paste` listener on `document` scans `clipboardData.items` for the first `image/*` entry and calls `onFile`. Removed in the effect cleanup.

#### `useExport(rtRef, style, animated, scale)` → `{ busy, note, savePng, record }`

- **What:** saving a PNG, and recording a 6 second WebM for live styles, with a busy flag and a status message.
- **Why:** both actions are asynchronous, can fail, and need the same bookkeeping (set busy, try, report the error, clear busy). A shared internal `run(kind, work)` does that so the two actions only describe what is different.
- **Where:** `Studio` → `ExportSection` (`busy` disables the buttons and switches the label to "Recording…"; `note` is the status line).
- **How:** `savePng` asks `rt.exportBlob(animated ? 1 : scale)`; `record` asks `rt.recordWebM(6)`. Both hand the blob to `useDownload` with a filename like `lumenary-halftone.png`.

#### `useDownload()` → `(blob, name) => void`

- **What:** saves a blob as a file.
- **Why:** the "make an object URL, click a hidden link, clean up" routine is boilerplate that does not belong in export logic.
- **Where:** `useExport` only (it is its own hook so another export path can reuse it).
- **How:** `URL.createObjectURL`, a temporary `<a download>` appended, clicked and removed, and the URL revoked after five seconds. `useCallback` with no dependencies.

#### `useNeighborsIn(list, id)` → `{ prev, next }`

- **What:** the previous and next item of any list that has `id`s, wrapping at both ends.
- **Why:** two places need it: the arrows in the top bar (over all treatments) and the previous and next section links at the foot of the section and theory pages (over groups). The wrap-around arithmetic is the sort of thing that is wrong by one if copied twice.
- **Where:** `useNeighbors` (below) and the section and theory-group pages.
- **How:** finds the item's index and uses modulo arithmetic.

#### `useNeighbors(style)` → `{ prev, next }`

- **What:** the previous and next style in the index, wrapping at both ends.
- **Why:** the arrows in the top bar.
- **Where:** `StudioBar` → `StepNav`.
- **How:** `useNeighborsIn(STYLES, style.id)`.

#### `useFollowPointer(ref, { enabled, offset, ease })`
Eases an element toward the mouse, moving it with `transform` only. Used by `FloatingPreview`, the preview that trails the cursor over a section's list of names (mouse devices only).

#### `useMediaQuery(query)` → boolean
Subscribes to a CSS media query with `useSyncExternalStore`. `FloatingPreview` uses it to switch itself off on touch screens.

#### `useInterval(callback, ms)`

- **What:** `setInterval` that does not go stale.
- **Why:** the textbook problem with intervals in React is that the callback captures old state. Here the callback is stored in a ref and updated every render, so the interval itself is created once per `ms` and always calls the newest function. Passing `null` pauses it.
- **Where:** only through `useCycle`.
- **How:** two effects: one keeps `saved.current = callback`, one owns the timer and clears it on cleanup.

#### `useCycle(length, ms)` → index

- **What:** a number that counts `0 … length-1` and wraps, on a timer.
- **Why:** the hero card cycles through the featured styles. It is a small hook on top of `useInterval`, which shows how the hooks compose.
- **Where:** `HeroCard`.
- **How:** `useState(0)` and `useInterval(() => setI(v => (v + 1) % length), ms)`.

#### `useDocumentTitle(title)`

- **What:** sets the browser tab title.
- **Why:** each page has its own title ("Halftone | Lumenary").
- **Where:** only inside the `withDocumentTitle` HOC; pages never call it directly.
- **How:** `useEffect(() => { document.title = title; }, [title])`.

#### `useSpotlight(ref, { radius })` → `{ mask, bind }`

- **What:** a pool of light that follows the pointer and, when nobody is pointing, drifts back and forth across the element on its own.
- **Why:** it drives the one signature moment on the homepage: the giant wordmark is dark grey, and a white copy of it is revealed only inside this light. Keeping the logic in a hook keeps `LitWordmark` a plain layout component.
- **Where:** `LitWordmark`.
- **How:** the pointer position is written to two `useMotionValue`s, smoothed by `useSpring`, and turned into a CSS `radial-gradient` mask string with `useMotionTemplate`. Motion values update the element's style directly, so the cursor does not cause React re-renders. The idle drift is two looping `animate()` calls (different durations, so the path never repeats exactly) that are stopped when the pointer enters and restarted when it leaves. `useReducedMotion` turns the drift off.

#### `useTilt({ max })` → `{ style, glare, bind }`

- **What:** rotates an element in 3D toward the pointer and slides a soft highlight across it.
- **Why:** a small, physical cue that the hero picture is an object, not a flat image.
- **Where:** `TiltPlate`.
- **How:** pointer position is normalised to -0.5…0.5, mapped to `rotateX`/`rotateY` with `useTransform`, and sprung with `useSpring`. The glare is another `useMotionTemplate`. Real depth needs a `perspective` on the parent, which is what the `withPerspective` HOC adds.

#### `useMagnetic(strength)` → `{ style, bind }`

- **What:** pulls an element slightly toward the pointer while it hovers.
- **Why:** gives the main call to action weight without extra decoration.
- **Where:** inside the `withMagnetic` HOC, used for `MagneticButtonLink`.
- **How:** the offset from the element's centre, multiplied by `strength`, is sprung into `x`/`y` motion values and released to zero on leave.

#### `useScrollSpy(ids)` → active id

- **What:** reports which section is currently in the reading zone.
- **Why:** the sticky table of contents on the theory page highlights where you are.
- **Where:** `TheoryGroupPage`, passed to `TheoryNav`.
- **How:** one `IntersectionObserver` watches all section elements with a `rootMargin` that makes the top third of the viewport the "reading zone"; the observer is disconnected in the effect cleanup.

### 7.5 External stores: `source.js` and `thumbs.js`

These are not hooks, but they feed three of them and the pattern deserves a note.

- **Why not state or context?** The uploaded image and the homepage previews are needed on different pages that never mount at the same time. They must survive navigation (upload once, switch style, still there) and they hold large objects (canvases, data URLs). A module-level variable plus a subscription is the lightest way to do that.
- **How:** each store keeps its data in a module variable, a `Set` of listeners, and exposes `subscribe` and a getter. `useSyncExternalStore(subscribe, getSnapshot)` connects a component to it; React re-renders when the snapshot changes and handles concurrent rendering correctly.
- **One rule:** the snapshot must be referentially stable between changes, or React loops. That is why `getSource()` returns one cached default object instead of building a new one on each call.
- `useThumb(id)` and `useThumbCount()` read the preview cache. `useThumbCount` exists only to make `HeroCard` re-render as previews arrive.

---

## 8. Higher-order components: what, why, where, how

### 8.1 What a HOC is

A higher-order component is a function that takes a component and returns a new component with extra behaviour wrapped around it:

```js
const Enhanced = withSomething(Plain);
```

The wrapped component does not know it was wrapped; it just receives props. HOCs are the tool for behaviour that belongs *around* a component (get data, guard access, set a title), as opposed to hooks, which are for behaviour *inside* one.

### 8.2 Why HOCs here, when hooks exist

Hooks and HOCs overlap, and we use both on purpose.

- Use a **hook** when the component itself needs the value to do its job (`Studio` needs `params`).
- Use a **HOC** when the component should not need to know the thing exists, or when the wrapper must *decide whether to render the component at all*. A hook cannot do that: it cannot return a redirect instead of the component.

All six HOCs here are applied once at the file that exports the component, so the component's own body stays free of that concern and can be tested by simply passing props.

### 8.3 `withStyleRoute(Component)`: a route-guard / prop-injector HOC

File: `src/hoc/withStyleRoute.jsx`

- **What it does:** reads `:slug` from the URL, looks the style up, and renders `Component` with a `style` prop. If the slug is unknown (`/style/nonsense`), it renders `<Navigate to="/" replace />` and never renders the component.
- **Why a HOC and not a hook:** the "unknown slug" branch must replace the component entirely. That is a *render decision*, which a hook cannot make. It also means `Studio` can assume `style` is always valid and has no null checks anywhere in its tree.
- **Where:** wraps `Studio` in `StylePage`.
- **How:** `useParams()` → `getStyle(slug)` → either `<Navigate>` or `<Component key={style.id} style={style} />`.
- **The `key`.** `key={style.id}` forces React to **unmount and remount** `Studio` when you go from one style to the next, instead of reusing it. That gives every style a fresh runtime, fresh parameters and no leftover state, and it is why `useRuntime` only needs to create the runtime once per mount.

### 8.3b `withRouteLookup({ param, find, prop })(Component)`: the general form

File: `src/hoc/withRouteLookup.jsx`

- **What it does:** reads a URL parameter, looks the value up with `find`, and renders `Component` with the result under the prop name you give. An unknown value renders `<Navigate to="/" replace />`.
- **Why:** `withStyleRoute` is the same idea fixed to styles. Sections and theory groups need the same guard with a different lookup, so the idea is written once. `SectionPage` uses `withRouteLookup({ param: 'id', find: getSection, prop: 'section' })`; `TheoryGroupPage` uses `getTheoryGroup`.
- **How:** `useParams()` → `find(params[param])` → either `<Navigate>` or `<Component key={found.id} {...props} [prop]={found} />`.

### 8.4 `withThumb(Component)`: a data-injection HOC

File: `src/hoc/withThumb.jsx`

- **What it does:** looks up the preview image for `props.style.id` and passes it down as a `thumb` prop.
- **Why:** two unrelated components (`StyleRow` and `FeaturedLink`) both show a style's preview. Each should be a pure function of `{ style, thumb }`. The HOC supplies `thumb` from the preview store so neither component imports the store or calls the hook itself, and both get it identically.
- **Where:** `StyleRow` (one per treatment on a section page) and `FeaturedLink` (the hero card).
- **How:** calls `useThumb(props.style.id)` and renders `<Component {...props} thumb={thumb} />`. Each wrapped component subscribes to the preview store and re-reads only its own id, so a preview arriving leaves the others visually unchanged.

### 8.5 `withDocumentTitle(getTitle)(Component)`: a configurable (factory) HOC

File: `src/hoc/withDocumentTitle.jsx`

- **What it does:** sets the tab title from the component's props.
- **Why a factory:** the title differs per page and sometimes depends on props. So this HOC takes a *function* first (`props => string`) and returns the actual HOC. That is "a function that returns a function that returns a component", and it lets one HOC serve the homepage (a constant) and style pages (from the style's name).
- **Where:** `HomePage` (`() => 'Lumenary | How many ways are there to see an image?'`), `SectionPage`, `TheoryGroupPage` and `StylePage` (`({ style }) => `${style.name} | Lumenary``).
- **How:** the wrapper calls `useDocumentTitle(getTitle(props))`, then renders the original component untouched.

### 8.6 `withMagnetic(Component, strength)` and `withPerspective(Component, perspective)`

Two more factory HOCs came with the new homepage.

- **`withMagnetic`** wraps a component in a `motion.span` driven by `useMagnetic`, so *any* component can lean toward the pointer without knowing about springs. `MagneticButtonLink = withMagnetic(ButtonLink, 0.28)`. A hook could not do this without editing `ButtonLink` itself, and a magnetic button should still be an ordinary button elsewhere.
- **`withPerspective`** wraps a component in a `div` with a CSS `perspective`, which 3D transforms inside need to look deep rather than flat. `TiltPlate = withPerspective(TiltPlate, 1100)`. The plate stays unaware of the frame it sits in.

### 8.7 Rules all six HOCs follow

1. **Pass props through** (`{...props}`) so wrapping never hides anything.
2. **Set `displayName`** (`withThumb(StyleRow)`), so React DevTools and error messages show a readable name instead of `Anonymous`.
3. **Never create a HOC inside a render.** They are applied at module level. Creating one during render would make a new component type each time and remount the whole subtree.
4. **No behaviour inside the wrapped component changes**; the HOC only adds props or decides whether to render.

### 8.8 `compose`: stacking HOCs

File: `src/utils/compose.js`

```js
export const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
```

`compose(f, g)(x)` is `f(g(x))`. `StylePage` uses it so the stack reads top to bottom, outermost first:

```js
export default compose(
  withStyleRoute,                                   // outermost: resolves the style, or redirects
  withDocumentTitle(({ style }) => `${style.name} | Lumenary`)  // needs the `style` prop
)(Studio);
```

Order matters: `withDocumentTitle` reads `props.style`, so `withStyleRoute` has to be outside it to provide that prop first. Wrapping order is the mental model: `withStyleRoute( withDocumentTitle( Studio ) )`.

---

## 9. Other patterns we use

### 9.1 Registry instead of a `switch` (`controls/Control.jsx`)

Every style describes its controls as data: `{ key, label, type: 'range' | 'select' | 'toggle' | 'color' | 'text' | 'shuffle', … }`. `Control` is a lookup table from `type` to a component:

```js
const REGISTRY = { range: RangeControl, select: SelectControl, toggle: ToggleControl, … };
const Component = REGISTRY[def.type];
return Component ? <Component def={def} {...rest} /> : null;
```

**Why:** a `switch` or an `if` chain inside one big component grows with every new control type and mixes six pieces of markup in one file. With a registry, adding a control type is "write one file, add one line", and the engine never imports React. `ControlList` then simply maps over a style's `params` and renders a `Control` for each, so a style page needs zero per-style UI code.

### 9.2 Data-driven rendering

Wherever content is a list, it is data plus one small component, not repeated JSX:

- `data/nav.js` → `NavLinks`
- `data/about.js` → `About` → `AboutColumn`
- a section's styles → `StyleIndex` → `StyleRow`, and the style pages
- a style's `params` → `ControlList`

Editing copy or adding a style never means editing markup.

### 9.3 Composition through `children`

`Section`, `Panel` and `Field` take `children` and own only the frame around them. `Panel` shows the blurb and wraps whichever sections it is given; `Section` is a titled block with an optional action slot (`action` prop, used for the "Reset" link); `Field` is a label plus a control slot. The three style-page sections (`ImageSection`, `TreatmentSection`, `ExportSection`) are all built from them, which is why they look identical without sharing any style code.

### 9.4 Small primitives with prop spreading

`Slider`, `Switch`, `TextInput`, `SelectInput` and `ColorInput` are thin wrappers over native inputs. Each:
- converts the DOM event into a plain value (`onChange(5)` rather than `onChange(event)`), so the controls above them never touch `event.target`;
- spreads `...rest` onto the native element, so `id`, `min`, `max`, `step`, `aria-*` pass straight through.

They keep native behaviour (keyboard, focus, screen readers) while giving the app one place to restyle each kind of input.

### 9.5 `useId` for accessible labels

Every control generates an id with `useId()` and connects `<label htmlFor>` to the input. The Segmented control uses `aria-labelledby` pointing at its label's id. Ids are unique even when the same control type appears many times, and stable across server and client renders.

### 9.6 Lifting state up, and not further

- Control values live in `Studio` (via `useStyleParams`), because both the controls and the canvas need them.
- The hovered style lives in `IndexSection`, because the list sets it and the floating preview reads it. Neither needs to know about the other.
- The export scale (`1×/2×/3×`) lives in `Studio`, because `useExport` and the size hint both need it.

Nothing is higher than it has to be.

### 9.7 Passing a ref down as a prop

`Studio` creates `canvasRef` and passes it to `Stage`, and the same ref goes to `useRuntime` and `usePointerBridge`. The canvas is rendered by `Stage`, but the behaviour is attached by hooks in `Studio`. Passing the ref as an ordinary prop is simpler than `forwardRef` here, and it makes the data flow visible.

### 9.8 Keys

- `key={style.id}` on `Studio` (via `withStyleRoute`) remounts per style, as described above.
- `key={style.id}` on the `Plate` inside `FeaturedLink` remounts the image when the hero card changes style, which replays its fade-in.
- List items use stable ids (style id, nav `href`, param `key`), never array indexes.

### 9.9 Cleanup discipline

Everything that starts must stop, which also keeps React 18 `StrictMode` (which mounts, unmounts and remounts in development) from leaking: the runtime is disposed, listeners are removed, `requestAnimationFrame` is cancelled and intervals are cleared.

### 9.10 In-page anchors that survive any router (`utils/jumpTo.js`)

The nav links and the "Enter the index" button use `href="#index"`, with an `onClick` that scrolls to the element and cancels the default. A plain hash link would fight a hash-based router and navigate away; this works under `BrowserRouter` and `MemoryRouter` alike and still degrades to a normal anchor if JavaScript is off.

### 9.11 Class names with `cx`

`cx('button', variant, className)` joins the truthy arguments. It is eight characters of code that replaces every hand-built template string with a conditional.

---

## 10. Styling with one SCSS file

All styling for the app is in **`src/styles/main.scss`**. That is deliberate: one file means one pattern. A new component can only be styled the way the other fifty are.

### The pattern

One block per component, named after the component in `kebab-case`, with everything about it nested inside:

```scss
.index-row {
  a { display: grid; … }
  .num { … }
  .name { … }
  @include hover-only { a:hover .arrow { … } }
  @include below($bp-sm) { … }
}
```

- The root class matches the component (`StyleRow` → `.style-row`), so you can find its styles by searching the file for the component name.
- Children are short class names scoped by nesting (`.num`, `.name`, `.arrow`), not long BEM chains. They can repeat across components because the parent scopes them.
- Modifiers and states use `&.on`, `&:hover`, `&.solid`.
- Media queries live **inside** the block they change, via mixins.
- The file is ordered `ui` → `controls` → `home` → `studio`, with a comment above each block naming it.

### Tokens and mixins

`src/styles/abstracts/_vars.scss` holds every colour, font stack, spacing value and breakpoint. `_mixins.scss` holds `label()` (the small uppercase monospace text used everywhere), `below()`, `hover-only`, `touch-only` and `fill`. `main.scss` pulls them in with `@use 'abstracts' as *;`.

### Why responsive behaviour uses `hover` queries

Touch devices have no hover, so hover-only effects (the preview that follows the cursor on a section list, the portal preview on the homepage) are wrapped in `@include hover-only`, and `@include touch-only` gives phones the inline version.

### Accessibility and motion

All animations are disabled under `prefers-reduced-motion: reduce` (at the bottom of the base styles). Focus rings are visible on every interactive element.

---

## 11. The engine (no React)

`src/engine/` is plain JavaScript. It never touches the DOM directly; canvases are created through `env.makeCanvas` (`src/env.js`), which is how it was tested headless in Node before it was put in the browser. React only talks to it through `createRuntime`.

- **A style** is a module with `id`, `name`, `blurb`, `params` and either (the registry adds `number` and `section` itself):
  - a still style: `still({ …, render(ctx, work, p, env, W, H, cache) })`. It draws once whenever parameters or the image change;
  - an animated style: `{ kind: 'animated', create(env) }` returning an object with `setSource`, `setParams`, `draw(ctx, t, dt, pointer)` and `dispose`.
- **`createRuntime({ canvas, env, onSize })`** runs a style on a canvas: `setStyle`, `setSource`, `setParams`, `setPointer`, `invalidate`, `start`, `dispose`, `exportBlob(scale)` and `recordWebM(seconds)`. Stills are re-rendered at the export size (capped at 4096 px); live styles export the frame on screen.
- **Resolution independence.** Parameters are counts or fractions of the width, never pixels, so a still looks the same at preview size and at 3× export.
- **`renderThumb`** renders one frame of any style at small size; `thumbs.js` uses it for the homepage previews.
- **Images** are capped at 3200 px on load (`source.js`) so very large photos stay fast.
- **Safari rule.** Do not use `ctx.filter` (Safari's canvas ignores it). Blur with `boxBlur` on arrays, or draw small and scale up. `shadowBlur` is fine. `helpers.stretch` clips and stretches a luminance map, which the lettered and printed treatments use so a flat picture still shows tone. The lit, material treatments (section E) build a height map, turn it into surface slopes with `helpers.slopes` and shade it per pixel; `helpers.cellular` is a cheap nearest-site (Voronoi) noise used for leather grain and glass pieces.
- **Cultural treatments (K, L, M)** share `engine/culture.js`: `paletteIdx` and `modeFilter` snap a picture to a handful of pigments and clean the regions; `edgeMask` draws the outlines; `clothFill`, `woodFill` and `carvedStone` give woven, wooden and carved surfaces; `rosette`, `leaf`, `starPoints` and `starRadius` draw ornaments; `ribbon` fills a tapering stroke. Draw thousands of small shapes with flat fills: a gradient or a `save`/`restore` per shape is very slow on machines without a graphics card (Byzantine Mosaic once hung for that reason).

---

## 12. Add a treatment

1. Copy any file in `src/engine/styles/` (a still one such as `minimalism.js` is the simplest) and rename it. Start the file with a comment giving its path.
2. Give it a unique `id` (the URL slug), a `name`, a `blurb` and a `params` list. Parameter types: `range`, `select`, `toggle`, `color`, `text`, `shuffle`. Do not set a `number`: the registry numbers treatments in the order they appear on the site.
3. Make sure its name is in `items` of the right section in `src/data/sections.js`, and that `slugify(name)` equals the `id` (for example "Pop Art" becomes `pop-art`). Nothing else registers it: `engine/styles/index.js` loads every file in the folder.
4. Add its theory (section 17): the mathematics in that section's file (`src/data/theory-design.js`, `theory-digital.js`, `theory-type.js`, `theory-light.js`, `theory-physical.js`, `theory-craft.js`, `theory-painterly.js`, `theory-optical.js`, `theory-generative.js`, `theory-motion.js`, `theory-world.js`, `theory-sindhi.js` or `theory-southasia.js`) and the story in the matching file of `src/data/theory-extra/`, both keyed by the same id. A treatment with no entry would crash the Theory page, so run `npm run check:theory`: it lists anything missing.

The section page, preview thumbnail, controls, previous and next arrows, section links, Theory button and export appear automatically, because they are all generated from the section list and each style's `params`.

To add a new **control type**, write `XControl.jsx` in `src/components/controls/` and add one line to the registry in `Control.jsx`.

---

## 13. Change the look

- Colours, fonts, spacing, breakpoints: `src/styles/abstracts/_vars.scss`.
- Anything about one component: its block in `src/styles/main.scss`.
- Copy: `src/data/*.js` and the strings in `Hero.jsx`, `Footer.jsx`.
- Fonts are self-hosted through `@fontsource` (no Google request). Imports are at the top of `main.jsx`; the canvas fonts are listed in `src/env.js`. Two script faces were added with section C: Caveat (Handwritten) and Pinyon Script (Calligraphy Portrait). Sindhi Script (section L) uses Noto Naskh Arabic, imported in `main.jsx` and listed in `env.js`; the browser joins the Arabic letters itself, so nothing more is needed. The Sindhi word list inside that treatment was drafted without a native reader, so have it proofread.

---

## 14. Troubleshooting

| Problem                                | Fix                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm: command not found`               | Install Node.js, then reopen the terminal.                                                                        |
| Blank page after deploy                | Check that Vercel's output directory is `dist`.                                                                   |
| 404 when refreshing `/style/...`       | `vercel.json` must be in the repo root and committed.                                                             |
| Fonts look different in a saved PNG    | Wait a second after the page loads before saving; fonts load once.                                                |
| Huge photo is slow                     | Images are capped at 3200 px on load. Try the 1x export size.                                                     |
| "Record 6 s clip" does nothing         | Needs a browser with `MediaRecorder` (current Chrome, Edge, Firefox, Safari 14.1+).                               |
| Single-file preview shows a URL error  | Rebuild with `npm run build:single`; the router must be `MemoryRouter` (set in `main.jsx` through `VITE_SINGLE`). |
| A slider does nothing                  | Check the browser console. A style's `render` throwing stops that style only; the others still work.              |
| A style behaves oddly after editing it | Stills cache work between renders in `cache`; keep the cache key in sync with the parameters it depends on.       |
| `npm run check:theory` reports errors  | Each line names the treatment and the field. A "dial rejects" error means a tip's `set` uses a key or value the treatment's controls do not have. |
| A "See it" link ignores one dial       | By design: `utils/presets.js` drops any key or value the treatment would not accept. Fix the tip's `set`.         |
| A theory link lands on the wrong block | Theory pages load on demand; `ScrollToTop` waits for the block and re-aligns. Check the id in the link matches a treatment id. |
| A shared link shows an old picture     | The network cached the share image. Refresh the preview there, or give the image a new filename (section 21).     |

### Where to look when something is wrong

| Symptom                                   | Start in                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| Canvas blank or not updating              | `hooks/useRuntime.js`, then the style's file in `engine/styles/`            |
| Upload, drop or paste ignored             | `hooks/useImageInput.js`, `useDropZone.js`, `usePasteImage.js`, `source.js` |
| Wrong or missing homepage preview         | `thumbs.js`, `hoc/withThumb.jsx`                                            |
| Page shows wrong style, or redirects home | `hoc/withStyleRoute.jsx`, `engine/styles/index.js`                          |
| Save or record fails                      | `hooks/useExport.js`, `engine/runtime.js`                                   |
| Cursor has no effect on a live style      | `hooks/usePointerBridge.js`                                                 |
| Section page empty or filters wrong       | `components/section/StyleIndex.jsx`, `StyleFilters.jsx`                     |
| A control looks or behaves wrong          | `components/controls/<Type>Control.jsx`, then `components/ui/`              |
| A visual problem                          | the component's block in `styles/main.scss`                                 |

---

## 15. Privacy

There is no backend and no database. Photos are read with the browser's file APIs and stay in memory; they are never sent anywhere.

The one exception is page-view counting. `App.jsx` mounts Vercel Web Analytics (`@vercel/analytics`), which records which pages are opened, with no cookies and no personal data. It is switched on in the Vercel dashboard (Project, Analytics, Enable) and is free on the Hobby plan. It is left out of the single-file build. To remove it, delete the `<Analytics />` line and the import in `App.jsx`, and the "Counting" line in `data/maker.js`. Because every treatment has its own address, the dashboard's page list also shows which treatments are opened most.

---

## 16. The homepage design and motion

**Direction.** Pure black ground, neutral greys, one serif display face (Bodoni Moda) with one grotesque for text (Hanken Grotesk). Labels are sentence case, there are no all-caps eyebrows, no gradients and no cards, because the content (the pictures) is the decoration.

**One memorable thing.** Everything is quiet except the hero wordmark: "Lumenary" is set very large in near-black, and a white copy is revealed under a soft spotlight that follows the cursor (and drifts on its own when idle, so touch screens and idle visitors still see it). The letters also rise into place once on load. Every other effect is small and answers the visitor's own action.

| Piece                           | Library feature                                    | Where                               |
| ------------------------------- | -------------------------------------------------- | ----------------------------------- |
| Cursor spotlight                | `useMotionValue`, `useSpring`, `useMotionTemplate` | `useSpotlight`, `LitWordmark`       |
| Letter rise on load             | `motion.span` with `initial`/`animate`             | `Letters`                           |
| 3D tilting picture              | `useTransform`, `useSpring`, CSS `perspective`     | `useTilt`, `TiltPlate`              |
| Crossfading previews            | `AnimatePresence`                                  | `HeroCard`                          |
| Words brightening as you scroll | `useScroll`, `useTransform`                        | `ScrollWords`, `ScrollWord`         |
| Magnetic button                 | `useSpring`                                        | `useMagnetic`, `withMagnetic`       |
| Smooth scrolling                | `lenis`                                            | `SmoothScroll`, `utils/scroller.js` |

**Why Motion.** Its motion values change styles without React re-rendering, so pointer-driven effects stay smooth. It is imported from `motion/react`.

**Why no three.js.** The 3D here is only a tilt. CSS 3D transforms driven by springs do that with no WebGL context and a fraction of the bundle size.

**Why Lenis.** Smooth scrolling makes the scroll-linked words feel continuous. `utils/scroller.js` keeps a single reference to the Lenis instance so `jumpTo` and `ScrollToTop` scroll through it instead of fighting it. If Lenis is not running, they fall back to native scrolling. Lenis caches the page height, so after a route change it can clamp to a stale limit and land on the wrong block of a long page (the theory page). `scrollToId` therefore calls `remeasure()` (`lenis.resize()`) first, and `ScrollToTop` jumps straight to the hash, then re-aligns after 60, 250 and 700 ms and once the fonts have loaded. A wheel or touch cancels the re-alignment.

**Reduced motion.** `useReducedMotion` disables the drift, tilt and magnetism, and the stylesheet disables CSS animation.

**Footer credit.** `components/home/Credit.jsx` renders "Created with 💓 by Mursal", with the name linking to the portfolio. The name and URL live in `data/copy.js` (`AUTHOR`); change them there.

---

## 17. The theory pages

Two levels, like the rest of the site. `/theory` is a portal list: Foundations first, then one row per live section. `/theory/<id>` opens one group (`foundations`, `design`, `digital`, `type`, `light`, and so on) with one block per treatment. Each block answers the questions a curious visitor asks in the order they ask them.

### What one treatment's block contains

| Part | Field | What it says |
| --- | --- | --- |
| Three quick facts | `facts` | Where it comes from, when, and which pictures suit it best. |
| Why it looks this way | `why` | The idea behind the look, in plain words. |
| How it works | `how` | Four to six steps, with the real numbers the program uses. |
| The mathematics | `paragraphs`, `equations` | The explanation and the LaTeX equations (`tex` plus a one-line `note`). |
| A short history | `history` | The people, places and dates, kept to what can be stood behind. |
| Where it is used | `uses` | Three or four real applications. |
| Try it | `tips` | Two or three things to try. A tip with a `set` has a **See it** button that opens the treatment with those dials already turned. |
| Words worth knowing | `terms` | A small glossary of `[term, meaning]` pairs. |
| See also | `related` | Two to four neighbouring treatments, by id. |

### Where the data lives

- **The mathematics** (`paragraphs`, `equations`) is in `src/data/theory-<section>.js`, one file per section, plus the six `FOUNDATIONS` (brightness, smoothing and edges, interpolation, randomness, tone and colour, compositing) in `theory.js`.
- **The story** (everything else in the table) is in `src/data/theory-extra/<letter>-<section>.js`, one file per section, gathered by `theory-extra/index.js`. The header comment of that file is the schema.
- **`theory.js`** merges the two: `THEORY[id] = { ...BASE[id], ...EXTRA[id] }`. A treatment with only the base entry still renders (`StyleTheory` checks for `why`), so a section can be written in two passes.
- **`theoryGroups.js`** builds the list the pages use: Foundations plus every live section.

### The writing rules

- Plain words first, then the number. "Warm air is thinner than cool air" before "ρ ∝ 1/T".
- Only claim history that is solid. If a date or an inventor is disputed, say "around" or name the tradition rather than a person.
- No dashes in the prose: commas, colons and full stops. `npm run check:theory` fails the entry if it finds one.
- Cultural treatments (sections K, L and M) are written as respectful homage: name the tradition, say what the program does and does not capture, and credit the makers.

### Checking the data

`npm run check:theory` loads every treatment and every entry, and fails if:

- a live treatment has no entry, or an entry belongs to a treatment that is not live;
- a field is missing or the wrong shape (for example three `how` steps instead of four to six);
- a `tip` names a dial the treatment does not have, or a value that dial would reject (it uses the same rules as the page: `utils/presets.js`);
- a `related` id is not a live treatment, or points at itself;
- there is an em or en dash anywhere.

It also warns, without failing, about entries that are unusually short or long.

### "See it" links

A preset is a handful of dials carried in the address: `/style/halftone?size=20&ink=black`. Colours are written without the `#`. `presetToSearch` makes the address; `presetFromSearch` reads it, and **drops anything the treatment's own dials would not accept** (an unknown key, a number out of range, a choice that does not exist), so a hand-edited link can never put a treatment into a state its controls cannot show. `useStyleParams` applies the preset when the page opens, and Reset always returns to the treatment's own defaults.

### The pages

- `TheoryPage` is `TheoryHero` and a `PortalList` of the groups.
- `TheoryGroupPage` is a `GroupHero`, the sticky `TheoryNav` (hidden below 1000 px), the `TheoryJump` menu (shown only below 1000 px, because a phone has no side column), one `StyleTheory` per treatment and `PageNeighbors` (previous and next group). Unknown ids go home through `withRouteLookup`.
- `StyleTheory` is the whole entry for one treatment, built from small pieces: `TheoryFacts`, `TheorySection`, `TheorySteps`, `TheoryList`, `TheoryTips`, `TheoryTerms` and `TheoryRelated`, inside a `TheoryBlock`. `Equation` typesets LaTeX with KaTeX (`renderToString` inside `useMemo`, so each formula is computed once). The KaTeX stylesheet is imported in `Equation.jsx`.
- **Both ways:** each block ends with `Open <style>`; each treatment page has a `TheoryLink` that goes to `/theory/<section>#<style-id>`, and the group page scrolls to that block. The section page has a "Theory of this section" button and the theory group page has "Treatments in this section".
- **Long pages.** The generative group has thirty treatments, which on a phone is a very long page. That is why `TheoryJump` exists: a sticky menu that jumps to any treatment of the group.
- **Safety note:** `dangerouslySetInnerHTML` is used only for KaTeX output generated from the repository's own strings, never from user input.

### Adding a treatment's theory

1. Add the mathematics to the theory file of its section, keyed by the style's id: `paragraphs` and `equations`.
2. Add the story to the matching file in `theory-extra/`, with all nine fields.
3. Run `npm run check:theory`. Fix every error; read every warning.
4. Open `/theory/<section>#<id>` and look at it, once at desktop width and once at phone width.

---

## 18. Sections and the roadmap

`src/data/sections.js` is the master list of every treatment planned for Lumenary, 176 names in thirteen sections (A to M), and all thirteen are enabled. It is the single place that decides what is on the site.

```js
{ id: 'design', letter: 'A', enabled: true, title: 'Design movements and styles', blurb: '…', items: ['Art Deco', 'Bauhaus', …] }
```

- **`enabled: true`** sections are live: each is a portal row on the homepage (`/`) and on the Theory index (`/theory`), has its own page at `/section/<id>` listing its treatments and its own theory page at `/theory/<id>`. The treatments themselves are never listed on the homepage. **`enabled: false`** sections are only a plan; nothing from them is shown.
- **`items`** are display names. The registry turns each into a route id with `slugify` and looks for a style module with that `id`. A name with no module is skipped, so a section can ship in parts, and a module that is in no enabled section stays hidden. That is also why a finished module can wait: it stays hidden until its section is enabled.
- **`engine/styles/index.js`** loads every module with `import.meta.glob`, then builds `SECTION_LIST` (each enabled section with its styles, in order) and the flat `STYLES` list. Each style gets `number` (position across the whole site) and `section` (the section id). It exports `getStyle(id)` and `getSection(id)`.
- **Components:** `IndexSection` renders the homepage portals with `PortalList`; `SectionPage` renders one section with `GroupHero` and `StyleIndex`, a list of names with a preview that follows the cursor, and Still / Live filters (the filters appear when a section has both kinds, search when it has twelve or more). `SectionLinks` on a treatment page lists the other treatments of the same section, and the back link in the top bar returns to that section's page.
- **Counts in the copy** come from the data: `utils/words.js` writes a number in words, and `data/copy.js` builds the manifesto from the live count, so enabling a section updates them.

**Adding a section or enabling a planned one:** write its style modules, add their theory entries, flip `enabled` to `true`. Then check the section's blurb in `sections.js`, run `npm run catalogue` to refresh `TREATMENTS.md`, and run `npm run build`.

Things the data does not update by itself: the `<title>` and `description` in `index.html` and the social image in `public/`, which are written by hand (section 21). The sitemap does follow the data.

---

## 19. The About page

`/about` tells the story of the site and the person who made it. It is plain content in a few small components, and everything it says lives in one data file, so changing the page never means touching a component.

- **Data:** `src/data/maker.js` exports `MAKER` (name, tagline, intro), `WHO` (the first paragraphs), `FACTS` (work, research, study, community, teaching, writing), `PROJECTS`, `WHY` (paragraphs and a quote), `SINDH` (the note on the Sindhi section), `PRINCIPLES`, `COLOPHON` and `LINKS`. Each project is `{ name, kind, text, href }`; a link that starts with `/` stays inside the site (shown with an arrow `→`), and a full address opens in a new tab (shown with `↗`).
- **Page:** `AboutPage` is `AboutHero`, then one block each for the maker (`MakerBlock`, `Prose`, `FactList`), the projects (`ProjectList`, `ProjectRow`), the why (`Prose`, `PullQuote`), the Sindhi note, the principles (`Principles`, which reuses `home/AboutColumn`), the colophon (`Figures`, the live counts) and where to find the maker (`FindMe`).
- **Live numbers.** `Figures` counts treatments, sections, live treatments and dials from the registry (`STYLES`, `SECTION_LIST`), so the page never claims a number the site does not have.
- **Where it is linked from.** The top bar (`data/nav.js`) has an About link to `/about`, and the About section of the homepage ends with a "More about the maker" link.
- **Editing rules.** Keep it first person and plain. No dashes. Only link to pages you control or have confirmed. Nothing about private matters: the page is the maker's work, writing and community, not their circumstances.

---

## 20. Loading and performance

- **The first load** is the homepage and the studio: the app, the image engine with all 176 treatments, the stylesheet and the home page fonts. In a production build the main script is about 1.15 MB, or about 390 kB over the wire with gzip.
- **Lazy routes.** `TheoryPage`, `TheoryGroupPage` and `AboutPage` are loaded with `React.lazy` and shown inside one `Suspense`, so the 670 kB (about 245 kB gzip) of theory text and equations is fetched only when someone opens a theory page. The fallback is a quiet empty block (`route-wait`) rather than a spinner, so there is no flash.
- **Hash links into lazy pages.** A link such as `/theory/design#bauhaus` has to wait for the page to download before there is anything to scroll to. `ScrollToTop` polls for the target for up to six seconds, jumps to it as soon as it exists, then re-aligns after 60, 250 and 700 ms and again once the fonts have loaded, because late fonts move the page. A wheel or a touch cancels the whole sequence, so it never fights the reader.
- **Thumbnails.** The homepage renders its section previews one per idle moment, so they never block a click (`thumbs.js`).
- **Big pictures.** Uploaded images are capped at 3200 px on load, and stills are exported at up to 4096 px.
- **The build warning.** Vite warns that the main chunk is over 900 kB. That is expected: the engine for every treatment is in it on purpose, so any treatment opens instantly. If it ever matters, the next step is to split the engine by section with a dynamic `import()`.
- **The single-file build** (`npm run build:single`) inlines the lazy chunks, because a file opened from disk cannot fetch them.

---

## 21. Sharing the site

Everything a link needs in order to look good when someone posts it, and everything a search engine needs to find it.

| What | Where | Notes |
| --- | --- | --- |
| Page title and description | `index.html` | Written by hand. The count in the description (176) should match the site. |
| Per-page titles | `withDocumentTitle` in each page | `Halftone \| Lumenary`, `Theory \| Lumenary`, `About \| Lumenary, by Mursal Furqan Kumbhar` and so on. |
| Share image | `public/og-176.png`, 1200 by 630 | Used by `og:image` and `twitter:image`. The filename carries the number on purpose: social networks cache the picture by address, so a new image needs a new filename to show up. |
| Share image text | `og:image:alt` | Describes the picture for people who cannot see it. |
| `robots.txt` | `public/robots.txt` | Allows everything and points at the sitemap. |
| Sitemap | `public/sitemap.xml` | Generated by `scripts/sitemap.mjs` before every build: the home page, About, the theory pages, the section pages and every treatment page (about 200 addresses). Never edit it by hand. |
| Favicon | `public/favicon.svg` | |

**When a number changes** (a treatment is added, say), update these by hand: the `description`, `og:title` and `og:description` in `index.html`, the `description` in `package.json`, the home page title in `HomePage.jsx` if it quotes a number, and the share image. To remake the image, open the home page in a 1200 by 630 window, let the hero settle, take a screenshot and save it under a new name such as `og-<count>.png`; then change the two addresses in `index.html`.

**Checking a link preview.** After deploying, paste the address into a chat app or a social post composer and look at the card. If it still shows an old picture, the network has cached it: use that network's own "refresh preview" tool, or change the image filename.
