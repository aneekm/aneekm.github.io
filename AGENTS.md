# AGENTS.md

Personal site (aneekm.com) — "record player" design. Vite 7 + vanilla JS ESM (no framework), deployed to GitHub Pages via Actions.

## Deploy model (critical)
- **`master` is production.** Any push to master runs `.github/workflows/deploy.yml` (Build → Test → upload-pages-artifact → deploy-pages) and publishes the site. Do not push unless asked.
- GitHub Pages source is **GitHub Actions** (not a branch). Repo merge settings are squash-only — PRs must be squash-merged.
- `public/CNAME` = `aneekm.com` custom domain; Pages redirects `aneekm.github.io` → `www.aneekm.com`.
- `v1/` and `v2/` are archived site versions — leave them alone.

## Commands
- `npm run dev` — vite dev server on **port 8123** (not the default 5173; `vite.config.js`)
- `npm test` — **runs `npm run build` first**, then jsdom smoke-test against `dist/`. Build before test; the smoke test reads `dist/index.html` + bundle.
- `npm run verify:tracks search <q>` / `check <url>` — validate SoundCloud URLs (oembed). Use `check` before adding any new track URL.
- `npm run optimize:portrait` — sharp-based portrait processing.
- Verify a build with `npx vite preview --port 8123` (port must be free; see shell gotchas).

## Architecture
- `src/main.js` is the entry: imports `styles.css`, then `initTheme()`, `initPlayer()`, `initEasterEgg()`.
- Player (`src/player.js`): hidden SoundCloud iframe (`.sc-widget-frame`, `pointer-events:none`, `z-index:-1`) controlled via the SC Widget API (`https://w.soundcloud.com/player/api.js`). `state.current` holds a **track object**, not an index.
- **SC autoplay gotcha**: `auto_play: true` is only honored on the widget's *first* load. Track swaps must pass `callback: () => widget.play()` in `widget.load(url, {...})` or the new track loads paused (this is a real, shipped bug-fix — keep the callback).
- `src/tracks.js`: `TRACKS` (7 entries) + `SECRET_TRACK` (Lido — Murder). The secret track **must never be added to `TRACKS`** (drawer renders all of `TRACKS`; `TRACKS.length` is asserted as 7 in the smoke test).
- Easter egg (`src/easteregg.js`): `konami` npm dep handles keyboard + touch input; toggles `data-secret` on `<html>`. No `e.repeat`/cooldown guards — that's intentional (konami-js semantics).
- Theme (`src/theme.js`): `data-theme` attribute + localStorage. `index.html` head has an **inline theme guard script that must stay before the app bundle** to avoid FOUC.
- `index.html` meta (canonical/og/twitter) hard-codes `https://www.aneekm.com` — never substitute localhost/dev URLs.
- Google Fonts: Fraunces + Newsreader (Newsreader is body text; Fraunces headings/UI). `assetsInlineLimit: 0` forces fonts as real assets.

## Testing quirks
- `scripts/smoke-test.mjs` stubs the SC widget API **before** evaluating the bundle: it patches iframe `load`, script `onload`, and defines `window.SC.Widget` with a recorded fake widget.
- **Test section order matters**: the playlist-swap block runs *before* the konami block. The konami `playSecret` resolves the adapter with the secret track and breaks the swap assertions if it runs first.
- Real-widget Playwright verification is unreliable in headless Chromium (renderer crashes on SC `getCurrentSound` postMessage round-trips). The jsdom smoke test is authoritative for player logic; use it for regressions.

## Shell / tooling gotchas
- `pkill -f`/`pgrep -f` patterns that match the command's own literal string kill the tool's shell and hang the session. Use bracket patterns (`pgrep -f 'vite[ ]preview'`) or kill by PID.
- Start preview servers with `nohup npx vite preview --port 8123 > /tmp/opencode/preview.log 2>&1 & echo $! > /tmp/opencode/preview.pid`, kill via the PID file. Check for strays with `ss -ltn`.
- Playwright in ad-hoc `/tmp` scripts: import via the absolute path `/home/ubuntu/dev/aneekm.github.io/node_modules/playwright/index.mjs` (relative ESM resolution fails).

## Docs
- `GH_HOSTING.md` — hosting/deploy notes. `DESIGN_SURVEY.md` — design decisions behind the v3 redesign. Read these before making design changes.
