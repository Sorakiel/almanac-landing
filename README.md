# Almanac — landing

Marketing landing page for [Almanac](https://almanac-sorakiels-projects.vercel.app) — a personal habits & workouts command center. Standalone static site, deliberately separate from the app's own codebase (`almanac/`): different lifecycle, different risk profile, no reason to share a deploy or a repo.

## Stack

Vanilla HTML/CSS/JS, built with [Vite](https://vitejs.dev) — no framework, no runtime dependencies. Fonts are self-hosted `.woff2` files (subset to the Latin+Cyrillic glyphs actually used), not inlined as base64.

## Develop

```bash
npm install
npm run dev
```

## Build & preview

```bash
npm run build
npm run preview
```

Output goes to `dist/` — deploy it as a static site (Vercel: framework preset "Vite", no env vars needed).

## Structure

```
index.html            all markup (single page)
src/
  main.js             entry point — imports styles, wires up every module
  modules/             one file per interactive behavior (preloader, cursor,
                        theme flip, install modal, etc.) — see each file's
                        top comment for what it does
  styles/
    tokens.css          design tokens (colors, fonts, radii) + @font-face
    base.css            reset, typography, reduced-motion overrides
    components.css      nav, buttons, preloader, cursor, footer
    sections.css        hero, manifesto, product, marquee, how-it-works, etc.
    modal.css           install modal
  fonts/                self-hosted Inter & JetBrains Mono subsets
```

## Editing content

- **Install links** (APK / web app) live in `index.html` inside `#installModal` — update the `href`s there if the GitHub release or the app's production domain changes.
- **Boosty link** is a placeholder (`#boostyLink` in `index.html`, wired to a placeholder alert in `main.js`) — once the Boosty page exists, set the real `href` and delete the `boostyLink` click handler in `main.js`.
- **Theme tokens** (colors, radii) are in `src/styles/tokens.css` — kept in sync with `almanac/`'s own design system by hand, since the two projects don't share a build.
