# Instructions

## 0. Just look at it

Open `twenty.html` in any browser. No install needed.

## 1. Run it

```bash
unzip twenty.zip && cd twenty
npm install
npm run dev
```

Open http://localhost:5173.

## 2. Push to GitHub

The zip already contains a git repository with one commit.

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

## 3. Deploy to Vercel

1. vercel.com → Add New → Project → import the repo.
2. Keep the detected settings. Click Deploy.

## 4. Next steps

- Check each of the twenty pages with one of your own photos, on desktop and on a phone.
- Colour: the palette is black and white for now. Edit `src/styles/abstracts/_vars.scss` when you are ready to add accent colour.
- Add a custom domain in Vercel → Project → Settings → Domains.
