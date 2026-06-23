# Relationship OS V3 Deployment Guide

Relationship OS V3 is a Vite + React app with optional Supabase cloud sync.

- Supabase Database stores shared relationship content.
- Supabase Storage stores uploaded memory photos.
- `localStorage` stores only the lightweight `currentUser` identity choice.
- If Supabase environment variables are missing, the app falls back to demo data and shows: `Cloud sync is not configured. Showing demo data.`

## GitHub 上传步骤

From the project folder:

```bash
git status
git add .
git commit -m "Upgrade Relationship OS to V3 cloud sync"
git push origin main
```

The current repository is:

```text
https://github.com/fyyf2026/our-relationship-os
```

## Supabase 创建项目步骤

1. Go to [Supabase](https://supabase.com).
2. Click **New project**.
3. Choose an organization.
4. Enter a project name, for example `relationship-os`.
5. Set a database password and save it somewhere safe.
6. Choose a region close to you.
7. Click **Create new project**.

## 如何运行 `supabase/schema.sql`

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Open [supabase/schema.sql](./supabase/schema.sql).
5. Copy the full SQL file into the Supabase SQL Editor.
6. Click **Run**.

This creates the tables, prototype anon policies, and the public `memory-photos` storage bucket.

## 如何运行 `supabase/seed.sql`

1. In Supabase **SQL Editor**, click **New query** again.
2. Open [supabase/seed.sql](./supabase/seed.sql).
3. Copy the full SQL file into the editor.
4. Click **Run**.

This inserts starter data for Fan Ye and Yihang Fu, including important dates, notes, wishes, footprints, and AI coach metrics.

## Vercel 部署步骤

The existing deployed site is:

```text
https://our-relationship-os.vercel.app/
```

For a new import:

1. Go to [Vercel](https://vercel.com).
2. Click **Add New...**.
3. Click **Project**.
4. Import `fyyf2026/our-relationship-os`.
5. Confirm these settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: Vercel default
- Root Directory: leave empty for this repository

The included [vercel.json](./vercel.json) rewrites all app routes to `index.html`, so `/settings` can be refreshed without a 404.

## Vercel Environment Variables

In Vercel:

1. Open the project.
2. Go to **Settings**.
3. Go to **Environment Variables**.
4. Add:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Find these values in Supabase:

1. Open Supabase project.
2. Go to **Project Settings**.
3. Go to **API**.
4. Copy **Project URL** into `VITE_SUPABASE_URL`.
5. Copy the public **anon** key into `VITE_SUPABASE_ANON_KEY`.

After adding environment variables, click **Redeploy** in Vercel so the production app uses cloud sync.

## 如何获得公开网址

1. Push changes to `main`.
2. Vercel automatically starts a deployment.
3. Open the deployment from the Vercel project dashboard.
4. Click **Visit**.
5. Share the production URL, for example:

```text
https://our-relationship-os.vercel.app/
```

## Local Production Check

Before pushing:

```bash
npm install
npm run build
```

Then preview:

```bash
npm run preview
```

Check:

- Homepage loads.
- `/settings` refreshes without a white screen.
- `/#wish-box` and `/#footprints` hash links work.
- Identity selection still saves `currentUser`.
- Without Supabase env vars, demo data appears with the cloud-sync warning.
- With Supabase env vars, edits are visible on another device after refresh.
