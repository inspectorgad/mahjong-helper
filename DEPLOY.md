# Deploy Guide

End-to-end: from unzipped repo to installed iPhone PWA.

## Prerequisites

- Node.js 18 or later (`node --version` to check)
- Git installed locally
- A GitHub account with SSH key configured (you already have this set up under `inspectorgad`)

## Step 1 — Unzip and verify locally

```bash
unzip mahjong-helper.zip
cd mahjong-helper
npm install
npm test
```

Expected output: `14 passed, 0 failed`.

Then start the dev server:

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`) in any browser. Verify the tile picker works, sample loads, suggestions appear.

## Step 2 — Create the GitHub repo

Option A — via GitHub web UI:

1. Go to https://github.com/new
2. Owner: `inspectorgad`
3. Repository name: `mahjong-helper`
4. Visibility: **Private** (keep it private — the encoded card is for personal use only)
5. Do NOT initialize with a README, .gitignore, or license (we have these already)
6. Click "Create repository"
7. Copy the SSH URL: `git@github.com:inspectorgad/mahjong-helper.git`

Option B — via `gh` CLI if you have it installed:

```bash
gh repo create inspectorgad/mahjong-helper --private --source=. --remote=origin --push
```

If you used Option B, skip to step 4.

## Step 3 — Initialize and push the repo

From inside the `mahjong-helper` directory:

```bash
git init
git add .
git commit -m "Initial commit: mahjong helper v2"
git branch -M main
git remote add origin git@github.com:inspectorgad/mahjong-helper.git
git push -u origin main
```

## Step 4 — Configure GitHub Pages with Actions

Create `.github/workflows/deploy.yml` in the repo:

```yaml
name: Deploy to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then commit and push:

```bash
mkdir -p .github/workflows
# (paste the YAML above into .github/workflows/deploy.yml)
git add .github
git commit -m "Add GitHub Pages deploy workflow"
git push
```

## Step 5 — Enable Pages in repo settings

1. Go to your repo on github.com
2. Settings → Pages
3. Source: **GitHub Actions** (not "Deploy from a branch")
4. Save

The first deploy will run automatically. Watch progress under the "Actions" tab.

## Step 6 — Fix the base URL for GitHub Pages

GitHub Pages serves under `https://inspectorgad.github.io/mahjong-helper/`, not at the domain root. Update `vite.config.js`:

```js
export default defineConfig({
  base: '/mahjong-helper/',  // change from './' to this
  // ... rest unchanged
});
```

Commit, push, the workflow rebuilds:

```bash
git add vite.config.js
git commit -m "Fix base path for GitHub Pages"
git push
```

## Step 7 — Install on iPhone

Once Actions shows green:

1. On your iPhone, open Safari and navigate to:
   `https://inspectorgad.github.io/mahjong-helper/`
2. Verify it loads. Try the tile picker.
3. Tap the Share button (square with up arrow)
4. Scroll down, tap **Add to Home Screen**
5. Tap **Add** in the top right

The app opens fullscreen with no Safari chrome. The icon you generated appears on your home screen. Tile state persists across launches because of localStorage. Works offline once the service worker has cached the assets — open it once on wifi, and it'll work anywhere after.

## Updating later

After any code change:

```bash
git add .
git commit -m "describe the change"
git push
```

The workflow rebuilds, Pages serves the new version. On your iPhone, the next time you open the PWA the service worker fetches updates in the background and applies them on the next launch (vite-plugin-pwa is configured with `registerType: 'autoUpdate'`).

## Troubleshooting

**404 after deploy.** Usually the `base` in `vite.config.js` doesn't match the repo name. Repo name `mahjong-helper` → `base: '/mahjong-helper/'`.

**Workflow fails on `npm test`.** Look at the Actions log to see which test failed. Run `npm test` locally first to catch this before pushing.

**Icon doesn't appear after Add to Home Screen.** Safari sometimes caches the manifest aggressively. Force-quit Safari, reopen, hard-reload the page, then re-add.

**Service worker stuck on old version.** On iPhone: Settings → Safari → Advanced → Website Data → search "github.io" → delete the entry. Reload the PWA from Safari and re-add.

**Want to check what's deployed.** Actions tab → latest "Deploy to Pages" → look for the URL in the job output.
