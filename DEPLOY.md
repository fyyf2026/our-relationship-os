# Relationship OS Deployment Guide

This project is a static Vite + React app. It does not need a database or server for the current prototype. User edits are saved in the visitor's browser with `localStorage`.

## Vercel 部署步骤

1. Push this project to GitHub.
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New...**.
4. Click **Project**.
5. Click **Import** beside your GitHub repository.
6. Confirm the project settings.
7. Click **Deploy**.

### Vercel Settings

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: keep Vercel default
- Environment Variables: none required
- Root Directory: leave empty if this folder is the GitHub repository root. If you upload the larger Codex workspace instead, set Root Directory to `outputs/our-relationship-os`.

The included `vercel.json` rewrites all routes to `index.html`, so refreshing `/settings` or opening a hash link directly will continue loading the app.

## GitHub 上传步骤

Run these commands from the project folder:

```bash
git init
git add .
git commit -m "Prepare Relationship OS for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/our-relationship-os.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Netlify 部署

Netlify also works well for this app.

- Build Command: `npm run build`
- Publish Directory: `dist`
- Environment Variables: none required

The included `public/_redirects` file is copied into `dist` during the build and keeps `/settings` refreshes working on Netlify.

## GitHub Pages

GitHub Pages is possible, but Vercel or Netlify is recommended because they handle single-page app routing more cleanly. If you use GitHub Pages, prefer opening the site from the root URL and using the in-app navigation.

## Local Production Check

Before deploying, run:

```bash
npm install
npm run build
```

Then preview the built app with:

```bash
npm run preview
```

Open the preview URL and confirm:

- The homepage loads.
- `/settings` loads after refresh.
- Hash links such as `/#wish-box` work.
- The identity modal and `localStorage` edits work.
