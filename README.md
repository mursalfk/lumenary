# Lumenary

Dozens of ways to see an image, grouped into sections. A browser-only studio: pick a treatment, drop in a photo, adjust a few controls, save the result.

**Live now:** section A (Design movements and styles, 23 treatments) and section B (Digital and technical, 20 treatments), 43 in all. The other 133 treatments of the roadmap are listed in `src/data/sections.js` and switch on one section at a time (see [section 18](#18-sections-and-the-roadmap)).

Nothing is uploaded. All processing happens on the visitor's device with the Canvas 2D API, so there is no server, no API key and no database.

- **Stack:** Vite, React 18, React Router 6, SCSS, plus three small libraries for the interface: `motion` (springs and scroll-linked animation), `lenis` (smooth scrolling) and `katex` (typeset equations). The image engine itself has no dependencies.
- **Routes:** `/` is the homepage. `/theory` explains the maths behind every treatment. `/style/<slug>` is one page per treatment.
- **Palette:** black is primary, white is secondary, with greys in between.
- **Treatments:** most are stills (export a PNG at 1x to 3x). A few are live: they animate, respond to the cursor and can record a 6 second WebM clip. The badge on each page says which.

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
17. [The theory page](#17-the-theory-page)
18. [Sections and the roadmap](#18-sections-and-the-roadmap)

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
        ┌─────────────┼───────────────┐
   "/" HomePage   "/theory" TheoryPage   "/style/:slug" StylePage
              │                         │
   TopBar, Hero, Manifesto,        withStyleRoute → withDocumentTitle → Studio
   IndexSection, MethodTeaser,          │
   About, Footer, Grain
                                  useStyleParams  useImageInput  useRuntime
                                  useExport  useDropZone  usePasteImage …
                                        │
                              src/engine  (plain JS, no React)
                              Canvas 2D: one module per treatment + runtime
```

The flow of one visit:

1. **Homepage.** `HomePage` calls `startThumbs()`. That renders every style once, from a built-in sample picture, into a small JPEG, one per idle moment. The hero card and the index rows read those previews as they appear.
2. **Choosing a style.** Clicking a row goes to `/style/<slug>`. `withStyleRoute` looks the slug up and hands `Studio` the style object.
3. **Studio.** Creates a canvas runtime for that style (`useRuntime`), keeps the control values in state (`useStyleParams`), and listens for an uploaded image (`useImageInput`, `useDropZone`, `usePasteImage`).
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
public/favicon.svg
src/
  main.jsx                 entry: fonts, stylesheet, router
  App.jsx                  the route table
  env.js                   canvas factory and font loading (the only DOM the engine ever sees)
  source.js                shared uploaded image (external store)
  thumbs.js                homepage previews (external store)
  pages/
    HomePage.jsx           route level only
    TheoryPage.jsx         route level: groups the theory data, runs the scroll-spy
    StylePage.jsx          route level only (composed from HOCs)
  components/
    ScrollToTop.jsx        resets or hash-scrolls on navigation
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
      IndexSection, IndexGroup, SectionJump, SectionHead, IndexList, IndexRow, FloatingPreview,
      MethodTeaser, About, AboutColumn, Credit, Footer, Grain
    theory/                the theory page
      TheoryHero, TheoryNav, GroupTitle, TheoryBlock, StyleTheory
    studio/                the style page
      Studio, StudioBar, BackLink, TitleBlock, SectionLinks, StepNav, Stage, StageMeta,
      Panel, ImageSection, TreatmentSection, ExportSection
  hooks/                   18 custom hooks (section 7)
  hoc/                     5 higher-order components (section 8)
  data/                    static copy: nav.js, about.js, copy.js (author, manifesto),
                           sections.js (the roadmap: every section and treatment name),
                           theory.js (foundations and the first twenty treatments),
                           theory-design.js, theory-digital.js (theory text and LaTeX, one file per section)
  utils/                   cx, compose, format, jumpTo, scroller, words (numbers as words)
  styles/
    main.scss              the one stylesheet for the whole app
    abstracts/             _vars.scss, _mixins.scss, _index.scss
  engine/                  image processing, no React (section 11)
    runtime.js, utils.js, sample.js
    helpers.js             shared building blocks for treatments (pixels, ramp, nearest, kmeans, glow, ...)
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
| `useEffect`            | Talking to things outside React: listeners, timers, the canvas runtime, `document.title` | `useInterval`, `useFollowPointer`, `usePasteImage`, `useRuntime`, `useDocumentTitle`, `ScrollToTop`, `HomePage`                                                |
| `useRef`               | Holding something that must survive renders without causing one                          | `useRuntime` (`rtRef`), `useInterval` (saved callback), `FilePicker` (hidden input), `Studio` (`canvasRef`), `FloatingPreview` (element)                       |
| `useCallback`          | Giving a function a stable identity                                                      | `useStyleParams`, `useImageInput`, `useExport`, `useDownload`                                                                                                  |
| `useMemo`              | Giving an object a stable identity                                                       | `useDropZone` (the `bind` handlers), `usePointerBridge` (the pointer handlers)                                                                                 |
| `useId`                | Unique ids that match a label to its input                                               | every control in `controls/`                                                                                                                                   |
| `useSyncExternalStore` | Reading data that lives outside React                                                    | `useMediaQuery`, `useSource` (in `source.js`), `useThumb` / `useThumbCount` (in `thumbs.js`)                                                                   |

**Not used, on purpose:**

- `useReducer`: no state here has transitions complicated enough to need one. `useStyleParams` is "set one key" and "reset", which a functional `setState` expresses directly.
- `useContext`: nothing is passed through more than three component levels, and the two things that are genuinely global (the uploaded image, the previews) are already in external stores. Adding a context would only add a provider to maintain.

### 7.3 Why `useCallback` and `useMemo` appear where they do

They are not sprinkled everywhere. Each use has a concrete reason: the value ends up in a dependency array of an effect, or is handed to a listener that is added and removed.

- `usePasteImage(onFile)` adds a `paste` listener in an effect that depends on `onFile`. If `onFile` changed every render, the listener would be removed and re-added every render. `useImageInput` wraps `take` in `useCallback` so it is stable, and `useDropZone` builds its handlers with `useMemo` keyed on that same callback.
- `usePointerBridge` returns five handlers. They are memoised so the canvas element does not receive new props on every render, and so they only change if the canvas ref or runtime ref changes (they never do).
- `useExport` returns `savePng` and `record`; both are `useCallback`s because they depend on `scale`, `style` and the runtime ref, and callers pass them to buttons.

### 7.4 The eighteen custom hooks

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

#### `useNeighbors(style)` → `{ prev, next }`

- **What:** the previous and next style in the index, wrapping at both ends.
- **Why:** the arrows in the top bar. The wrap-around arithmetic is the sort of thing that is wrong by one if copied twice.
- **Where:** `StudioBar` → `StepNav`.
- **How:** finds the style's index in `STYLES` and uses modulo arithmetic.

#### `useFollowPointer(ref, { enabled, offset, ease })`

- **What:** moves an element after the mouse with easing.
- **Why:** the floating preview on the homepage. The motion must run on `requestAnimationFrame` and write `transform` directly to the element; routing 60 position updates per second through React state would re-render the page 60 times a second.
- **Where:** `FloatingPreview`.
- **How:** a `mousemove` listener records the target; an animation-frame loop moves the current position a fraction (`ease`) toward it and writes `translate3d(...)`. It flips to the left of the cursor near the right edge and clamps to the viewport. `enabled` is false on touch devices, in which case nothing is attached.

#### `useMediaQuery(query)` → boolean

- **What:** whether a CSS media query currently matches.
- **Why:** the floating preview should only exist for a mouse; on a phone the previews are shown inline instead. CSS handles the layout, but the JavaScript loop must also know to not start.
- **Where:** `FloatingPreview` (`'(hover: hover) and (pointer: fine)'`).
- **How:** `useSyncExternalStore`. `subscribe` listens to the query's `change` event; `getSnapshot` reads `matchMedia(query).matches`; the server snapshot is `false`. It stays correct if the user plugs in a mouse or rotates the device.

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
- **Why:** each page has its own title ("Halftone — Lumenary").
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
- **Where:** `TheoryPage`, passed to `TheoryNav`.
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

All five HOCs here are applied once at the file that exports the component, so the component's own body stays free of that concern and can be tested by simply passing props.

### 8.3 `withStyleRoute(Component)` — a route-guard / prop-injector HOC

File: `src/hoc/withStyleRoute.jsx`

- **What it does:** reads `:slug` from the URL, looks the style up, and renders `Component` with a `style` prop. If the slug is unknown (`/style/nonsense`), it renders `<Navigate to="/" replace />` and never renders the component.
- **Why a HOC and not a hook:** the "unknown slug" branch must replace the component entirely. That is a *render decision*, which a hook cannot make. It also means `Studio` can assume `style` is always valid and has no null checks anywhere in its tree.
- **Where:** wraps `Studio` in `StylePage`.
- **How:** `useParams()` → `getStyle(slug)` → either `<Navigate>` or `<Component key={style.id} style={style} />`.
- **The `key`.** `key={style.id}` forces React to **unmount and remount** `Studio` when you go from one style to the next, instead of reusing it. That gives every style a fresh runtime, fresh parameters and no leftover state, and it is why `useRuntime` only needs to create the runtime once per mount.

### 8.4 `withThumb(Component)` — a data-injection HOC

File: `src/hoc/withThumb.jsx`

- **What it does:** looks up the preview image for `props.style.id` and passes it down as a `thumb` prop.
- **Why:** two unrelated components (`IndexRow` and `FeaturedLink`) both show a style's preview. Each should be a pure function of `{ style, thumb }`. The HOC supplies `thumb` from the preview store so neither component imports the store or calls the hook itself, and both get it identically.
- **Where:** `IndexRow` (one per treatment on the homepage) and `FeaturedLink` (the hero card).
- **How:** calls `useThumb(props.style.id)` and renders `<Component {...props} thumb={thumb} />`. Each wrapped component subscribes to the preview store and re-reads only its own id, so a preview arriving leaves the others visually unchanged.

### 8.5 `withDocumentTitle(getTitle)(Component)` — a configurable (factory) HOC

File: `src/hoc/withDocumentTitle.jsx`

- **What it does:** sets the tab title from the component's props.
- **Why a factory:** the title differs per page and sometimes depends on props. So this HOC takes a *function* first (`props => string`) and returns the actual HOC. That is "a function that returns a function that returns a component", and it lets one HOC serve the homepage (a constant) and style pages (from the style's name).
- **Where:** `HomePage` (`() => 'Lumenary | How many ways are there to see an image?'`) and `StylePage` (`({ style }) => `${style.name} — Lumenary``).
- **How:** the wrapper calls `useDocumentTitle(getTitle(props))`, then renders the original component untouched.

### 8.6 `withMagnetic(Component, strength)` and `withPerspective(Component, perspective)`

Two more factory HOCs came with the new homepage.

- **`withMagnetic`** wraps a component in a `motion.span` driven by `useMagnetic`, so *any* component can lean toward the pointer without knowing about springs. `MagneticButtonLink = withMagnetic(ButtonLink, 0.28)`. A hook could not do this without editing `ButtonLink` itself, and a magnetic button should still be an ordinary button elsewhere.
- **`withPerspective`** wraps a component in a `div` with a CSS `perspective`, which 3D transforms inside need to look deep rather than flat. `TiltPlate = withPerspective(TiltPlate, 1100)`. The plate stays unaware of the frame it sits in.

### 8.7 Rules all five HOCs follow

1. **Pass props through** (`{...props}`) so wrapping never hides anything.
2. **Set `displayName`** (`withThumb(IndexRow)`), so React DevTools and error messages show a readable name instead of `Anonymous`.
3. **Never create a HOC inside a render.** They are applied at module level. Creating one during render would make a new component type each time and remount the whole subtree.
4. **No behaviour inside the wrapped component changes**; the HOC only adds props or decides whether to render.

### 8.8 `compose` — stacking HOCs

File: `src/utils/compose.js`

```js
export const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
```

`compose(f, g)(x)` is `f(g(x))`. `StylePage` uses it so the stack reads top to bottom, outermost first:

```js
export default compose(
  withStyleRoute,                                   // outermost: resolves the style, or redirects
  withDocumentTitle(({ style }) => `${style.name} — Lumenary`)  // needs the `style` prop
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
- `STYLES` → `IndexList` → `IndexRow`, and the style pages
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

- The root class matches the component (`IndexRow` → `.index-row`), so you can find its styles by searching the file for the component name.
- Children are short class names scoped by nesting (`.num`, `.name`, `.arrow`), not long BEM chains. They can repeat across components because the parent scopes them.
- Modifiers and states use `&.on`, `&:hover`, `&.solid`.
- Media queries live **inside** the block they change, via mixins.
- The file is ordered `ui` → `controls` → `home` → `studio`, with a comment above each block naming it.

### Tokens and mixins

`src/styles/abstracts/_vars.scss` holds every colour, font stack, spacing value and breakpoint. `_mixins.scss` holds `label()` (the small uppercase monospace text used everywhere), `below()`, `hover-only`, `touch-only` and `fill`. `main.scss` pulls them in with `@use 'abstracts' as *;`.

### Why responsive behaviour uses `hover` queries

Touch devices have no hover, so the cursor-following preview makes no sense there. `@include hover-only` and `@include touch-only` swap the desktop hover preview for inline thumbnails on phones, and `useMediaQuery` in `FloatingPreview` makes sure JavaScript does the same.

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

---

## 12. Add a treatment

1. Copy any file in `src/engine/styles/` (a still one such as `minimalism.js` is the simplest) and rename it. Start the file with a comment giving its path.
2. Give it a unique `id` (the URL slug), a `name`, a `blurb` and a `params` list. Parameter types: `range`, `select`, `toggle`, `color`, `text`, `shuffle`. Do not set a `number`: the registry numbers treatments in the order they appear on the site.
3. Make sure its name is in `items` of the right section in `src/data/sections.js`, and that `slugify(name)` equals the `id` (for example "Pop Art" becomes `pop-art`). Nothing else registers it: `engine/styles/index.js` loads every file in the folder.
4. Add an entry for it in that section's theory file (`src/data/theory-design.js`, `theory-digital.js`, or a new `theory-<section>.js` that you spread into `THEORY` in `theory.js`), keyed by the same id. A treatment with no entry would crash the Theory page, so the file `theory.js` is the checklist.

The homepage index, preview thumbnail, controls, previous and next arrows, section links and export appear automatically, because they are all generated from the section list and each style's `params`.

To add a new **control type**, write `XControl.jsx` in `src/components/controls/` and add one line to the registry in `Control.jsx`.

---

## 13. Change the look

- Colours, fonts, spacing, breakpoints: `src/styles/abstracts/_vars.scss`.
- Anything about one component: its block in `src/styles/main.scss`.
- Copy: `src/data/*.js` and the strings in `Hero.jsx`, `Footer.jsx`.
- Fonts are self-hosted through `@fontsource` (no Google request). Imports are at the top of `main.jsx`; the canvas fonts are listed in `src/env.js`.

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

### Where to look when something is wrong

| Symptom                                   | Start in                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| Canvas blank or not updating              | `hooks/useRuntime.js`, then the style's file in `engine/styles/`            |
| Upload, drop or paste ignored             | `hooks/useImageInput.js`, `useDropZone.js`, `usePasteImage.js`, `source.js` |
| Wrong or missing homepage preview         | `thumbs.js`, `hoc/withThumb.jsx`                                            |
| Page shows wrong style, or redirects home | `hoc/withStyleRoute.jsx`, `engine/styles/index.js`                          |
| Save or record fails                      | `hooks/useExport.js`, `engine/runtime.js`                                   |
| Cursor has no effect on a live style      | `hooks/usePointerBridge.js`                                                 |
| Floating preview missing                  | `hooks/useFollowPointer.js`, `hooks/useMediaQuery.js`                       |
| A control looks or behaves wrong          | `components/controls/<Type>Control.jsx`, then `components/ui/`              |
| A visual problem                          | the component's block in `styles/main.scss`                                 |

---

## 15. Privacy

There is no analytics, no backend and no network request after the page loads. Photos are read with the browser's file APIs and stay in memory.

---

## 16. The homepage design and motion

**Direction.** Pure black ground, neutral greys, one serif display face (Bodoni Moda) with one grotesque for text (Hanken Grotesk). Labels are sentence case, there are no all-caps eyebrows, no gradients and no cards, because the content (twenty pictures) is the decoration.

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

**Why Lenis.** Smooth scrolling makes the scroll-linked words feel continuous. `utils/scroller.js` keeps a single reference to the Lenis instance so `jumpTo` and `ScrollToTop` scroll through it instead of fighting it. If Lenis is not running, they fall back to native scrolling.

**Reduced motion.** `useReducedMotion` disables the drift, tilt and magnetism, and the stylesheet disables CSS animation.

**Footer credit.** `components/home/Credit.jsx` renders "Created with 💓 by Mursal", with the name linking to the portfolio. The name and URL live in `data/copy.js` (`AUTHOR`); change them there.

---

## 17. The theory page

Route `/theory`. It explains, for every treatment, how the picture is generated and which equations are used.

- **Data:** all text and LaTeX live in `src/data/theory.js`: an intro, six `FOUNDATIONS` (brightness, smoothing and edges, interpolation, randomness, tone and colour, compositing), and a `THEORY` object keyed by the same ids as the engine's styles, each with `paragraphs` and `equations` (`tex` plus a one-line `note`).
- **Rendering:** `TheoryPage` groups the data; `TheoryBlock` is one section; `StyleTheory` fills a block for a treatment and links to its page; `Equation` typesets LaTeX with KaTeX (`renderToString` inside `useMemo`, so each formula is computed once). The KaTeX stylesheet is imported in `Equation.jsx`.
- **Navigation:** `TheoryNav` is a sticky contents list highlighted by `useScrollSpy`. It is hidden below 1000 px.
- **Adding a treatment's theory:** add an entry, with the new style's id as its key, to the theory file of its section. `theory.js` merges the section files into one `THEORY` object.
- **Sections:** `TheoryPage` walks the enabled sections from `sections.js`: a `GroupTitle` (letter, title, blurb) and then one block for each treatment in it. The sticky navigation lists the same groups.
- **Safety note:** `dangerouslySetInnerHTML` is used only for KaTeX output generated from the repository's own strings, never from user input.

---

## 18. Sections and the roadmap

`src/data/sections.js` is the master list of every treatment planned for Lumenary, 176 names in thirteen sections (A to M). It is the single place that decides what is on the site.

```js
{ id: 'design', letter: 'A', enabled: true, title: 'Design movements and styles', blurb: '…', items: ['Art Deco', 'Bauhaus', …] }
```

- **`enabled: true`** sections are live: their treatments are on the homepage (in section groups with a jump bar), in the Theory page (one group each) and as routes. **`enabled: false`** sections are only a plan; nothing from them is shown.
- **`items`** are display names. The registry turns each into a route id with `slugify` and looks for a style module with that `id`. A name with no module is skipped, so a section can ship in parts, and a module that is in no enabled section stays hidden. That is why ten of the original twenty (particles, liquid morph, holographic, neon glow, glassmorphism, kinetic type, clay 3D, gradient mesh, split-flap and halftone) are not on the site yet: they belong to sections C to I, which are not enabled.
- **`engine/styles/index.js`** loads every module with `import.meta.glob`, then builds `SECTION_LIST` (each enabled section with its styles, in order) and the flat `STYLES` list. Each style gets `number` (position across the whole site) and `section` (the section id). It exports `getStyle(id)` and `getSection(id)`.
- **Components:** `IndexSection` renders the homepage list, `SectionJump` the row of letter links under the heading and `IndexGroup` one section's rows. `SectionLinks` on a treatment page lists the other treatments of the same section. `GroupTitle` opens each group on the Theory page.
- **Counts in the copy** come from the data: `utils/words.js` writes a number in words, and `data/copy.js` builds the manifesto from the live count, so enabling a section updates them.

**Enabling the next section:** write its style modules, add their theory entries, flip `enabled` to `true`. Then check the section's blurb in `sections.js` and run `npm run build`.

Things the data does not update by itself: the `<title>` and `description` in `index.html` and the social image in `public/og.png`, which are written by hand.
