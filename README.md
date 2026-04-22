# PDIMW_20

Simple Vue 3 + TypeScript app for a personal data interaction project.

## Features

- Multiple pages with Vue Router
- Observable notebook embeds through reusable iframes
- Ready for deployment on GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Add Observable visualizations

Open `src/data/visualizations.ts` and replace the example `src` with your own
Observable embed URL. Add more objects to the array when you want more iframe
visualizations on the page.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to the `main` branch and the workflow in `.github/workflows/deploy.yml`
   will build and publish the app.

If your repository name changes, update `repoName` in `vite.config.ts`.
For testing
