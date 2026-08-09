# Hosting on GitHub Pages

This repo's site is served by **GitHub Pages** at `https://aneekm.com` (custom domain,
see the `CNAME` file). GitHub Pages is a free static-site host: it only serves static
files (HTML, CSS, JS, images, PDFs). It cannot run server code — anything dynamic must
be handled client-side (JavaScript), pre-computed during a build, or offloaded to an
external service.

Everything in this file is about the second half of that sentence: **how your static
files get onto GitHub Pages in the first place.**

---

## The two mental models

There are two fundamentally different ways to publish to GitHub Pages:

| | A. Serve from a branch | B. Build, then deploy |
|---|---|---|
| Where the served files come from | A folder on a branch you commit directly | The output of a build step that runs on GitHub's servers |
| Who builds | Nobody (or GitHub's built-in Jekyll) | You (a GitHub Actions workflow) |
| Repo contents | Hand-written / committed static files | Source code + build tooling; output may never be committed |
| Works with | Plain HTML/CSS/JS, Jekyll | Any static site generator / bundler / framework |
| Current repo status | v1 & v2 worked this way | v3 moves to this model |

### Model A: serve from a branch

1. In **Settings → Pages → Build and deployment**, set **Source → Deploy from a branch**.
2. Pick the branch and folder (`/` (root) or `/docs`) that contains the site.

Whenever you push to that branch, GitHub publishes the chosen folder. If the repo has
no Jekyll configuration, GitHub serves the files essentially as-is (it may still try to
run Jekyll unless a `.nojekyll` file exists — see below).

- **Pros:** zero tooling, dead simple, matches how v1/v2 shipped.
- **Cons:** no build step, so no frameworks, no preprocessing, no codegen. Everything is
  hand-committed. Committing compiled output into the same branch muddies the source.

### Model B: build, then deploy (what this repo uses for v3)

1. In **Settings → Pages → Build and deployment**, set **Source → GitHub Actions**.
2. Add a workflow (`.github/workflows/deploy.yml`) that:
   - triggers on push to the source branch,
   - checks out the source,
   - runs your build (if any),
   - uploads the result as an artifact,
   - deploys that artifact to Pages.

GitHub then serves exactly what the workflow produced. The source branch never has to
contain the finished site. This is the "pre-compile into a static site and publish"
pattern.

There are **two sub-patterns** for Model B — this repo uses the first:

#### B1. Artifact-based (recommended by GitHub, used here)

The workflow uploads the built folder as a CI artifact and deploys it with
`actions/deploy-pages`. **No deployment branch is created or needed.** The source branch
and the served site never share history.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - v3
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- **Pros:** cleanest; no deploy branch; the workflow owns the whole pipeline; works with
  any SSG/framework by uncommenting the build steps. Repo stays readable.
- **Cons:** none real, aside from needing the workflow to exist before Pages has anything
  to serve.

#### B2. Branch-based (force-push to a `gh-pages` deployment branch)

The workflow compiles the site and **force-pushes the output to a dedicated branch**
(conventionally `gh-pages`), which is then the publish source. Tools: the
`peaceiris/actions-gh-pages` action, or the `gh-pages` npm package.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - v3

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # - uses: actions/setup-node@v4   # if you have build tooling
      # - run: npm ci && npm run build
      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .      # the folder to publish
          publish_branch: gh-pages
```

After the first run you'd set **Settings → Pages → Source → Deploy from a branch →
`gh-pages`** (or leave Source on GitHub Actions; GitHub detects the pre-built branch and
skips its own build).

- **Pros:** deployment branch keeps the compiled artifact in git history; familiar from
  the pre-Actions era; lets the `gh-pages` npm package be used locally too.
- **Cons:** extra branch; force-pushed history; the source repo and deploy branch can
  drift; two places to keep `.nojekyll`/`CNAME` in sync. Generally no benefit over B1.

**Decision for this repo: B1 (artifact-based).** No deployment branch, no build tooling
required right now, and it scales cleanly if v3 later adopts a bundler or SSG.

---

## Gotchas & details

### `.nojekyll`
GitHub runs the Jekyll build on branch-served sites by default, which can eat files
that start with `_` and rewrite paths. A `.nojekyll` file at the site root disables it.
Branch-based deploys (including B2) should include it; artifact-based deploys (B1) skip
Jekyll automatically.

### `CNAME` + custom domain
- A `CNAME` file in the published root tells GitHub which domain the site answers to
  (currently `aneekm.com`).
- For artifact deploys, the `CNAME` file must be inside the folder you upload.
- DNS: point `aneekm.com` at the Pages apex IPs (A records) and `www.aneekm.com` at
  `aneekm.github.io` (CNAME), or use the `ALIAS`/`ANAME` your DNS provider offers.
- Enable HTTPS in **Settings → Pages**; GitHub issues a Let's Encrypt certificate
  automatically (usually within minutes, sometimes up to 24h for new domains).

### GITHUB_TOKEN pushes do not re-trigger Pages
If a workflow pushes a commit to the Pages source branch using the built-in
`GITHUB_TOKEN`, that commit does **not** trigger another Pages build. Use a
Personal Access Token (fine-grained, `Contents: Read & Write`) if you ever rely on
push-to-trigger, or (as here) let `actions/deploy-pages` handle deployment directly.

### Build quotas & limits
- Site size limit: **1 GB** per site.
- Soft bandwidth cap: **~100 GB / month** (not enforced hard, but be polite).
- Private repos can publish Pages if you have Pro or better; public repos are free.
- Pages sites are **public on the internet** even from a private repo — never commit
  secrets, API keys, or personal data you don't want public.

### Environment + branch protection
The B1 workflow deploys through a `github-pages` **environment**. Add a protection rule
so only the source branch (`v3`) can deploy, and consider requiring review for the
`deploy` job.

### Troubleshooting
- **No site / 404:** confirm Settings → Pages shows a successful build and a URL; the
  first deploy happens on the first workflow run.
- **Custom domain not resolving:** check DNS records (see above), then re-verify the
  domain in Settings → Pages after DNS propagates.
- **Workflow fails on upload:** ensure `path:` points at the folder with the site
  (usually `.` or a `dist`/`public` folder) and that `permissions.pages`/`id-token`
  are set.

---

## Comparison: GitHub Pages vs. alternatives

| | GitHub Pages | Cloudflare Pages | Netlify | Vercel |
|---|---|---|---|---|
| Cost | Free | Free | Free tier | Free tier |
| CI/deploy | GitHub Actions (here) | Built-in | Built-in | Built-in |
| Custom domain + TLS | Yes | Yes | Yes | Yes |
| Preview deploys per PR | Manual workflow | Yes | Yes | Yes |
| Serverless / edge functions | No | Yes | Yes | Yes |
| Best fit | GitHub-centric static | Static + edge | Static + forms/functions | Framework-heavy (Next) |

Stick with GitHub Pages unless you need preview deployments, serverless functions, or
form handling — all possible elsewhere. For a personal landing page, GH Pages + Actions
is more than enough and keeps everything in one place.
