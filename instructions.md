# Lumenary: instructions

Follow in order. Each step says what you should see when it worked.

## Update: sections A and B (this release)

You already have the repository and the live site, so you only need to put the new files over your folder and push. Nothing new to install: `package.json` has no new packages.

1. **Close the dev server** if it is running (Ctrl+C in its terminal).
2. **Unzip `lumenary.zip`** somewhere temporary. You get a folder named `lumenary`. Copy everything inside it into your project folder, replacing files when asked. Your `.git` folder, `node_modules` and `dist` are not in the zip, so they are untouched.
   The `src`, `public`, `index.html`, `README.md` and `instructions.md` from the zip replace yours. If you changed `main.scss` by hand since the last release, copy your changes aside first, because the zip's `src/styles/main.scss` is the new one.
3. **Run it:**

```bash
npm run dev
```

   Check: the homepage now groups the treatments under **A. Design movements and styles** and **B. Digital and technical**, with a row of A and B links under the heading. Open `/theory`: it has the same two groups. Open any treatment: below the picture there is a list of the other treatments in its section.

4. **Test the production build:**

```bash
npm run build
```

   Check: it ends without errors and prints the size of `dist`.

5. **Commit and push** (Vercel redeploys by itself):

```bash
git add -A
git commit -m "Add sections A and B: 43 treatments, section groups on homepage, treatment pages and theory"
git push
```

   Check: in about a minute https://lumenary-studio.vercel.app shows the new homepage.

What you should know about this release:

- Ten of the first twenty treatments (particles, liquid morph, holographic, neon glow, glassmorphism, kinetic type, clay 3D, gradient mesh, split-flap, halftone) are **hidden on purpose**: they belong to sections C to I, which are not on the site yet. Their code is still there and they come back when their section is switched on in `src/data/sections.js`.
- Visiting `/style/particles` (a hidden one) sends you to the homepage.
- `public/og.png` (the link preview image) still says "twenty". The page text and meta tags no longer do. Regenerate the image when you are happy with the number.
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
