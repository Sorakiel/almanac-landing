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

The page is a sequence of scroll scenes (spec: `almanac-redesign-handoff/LANDING.md`).

```
index.html            all markup: icon sprite, nav, one <section> per scene
src/
  main.js             entry point — mounts logos, theme, then each scene's init
  modules/
    scroll.js           the one rAF loop; scenes register({ el, measure, frame })
    logo.js             the app icon as a component (plain / intro / final)
    theme.js            dark ↔ coffee with a circular wipe, remembered choice
    today.js            the app's Today screen and habit rows, shared by scenes
    fx.js               odometer, ripple, burst, vibrate, plural, count-up…
    reveal.js           fade-up for [data-rv] blocks entering from below
    faq.js, platformDownloads.js, env.js, installModal.js (old, until install v2)
  styles/
    tokens.css          colors for both themes, fonts (@font-face), easing
    base.css            reset, typography, section scaffolding, reduced motion
    components.css      glass, buttons, nav, logo, phone + habit rows, seal, capsule
    scenes.css          one block per scene
    modal.css           old install modal (removed with install v2)
  fonts/                self-hosted Onest & JetBrains Mono (Latin + Cyrillic)
```

## Editing content

- **Install links** (APK / web app) live in `index.html` inside `#installModal` — update the `href`s there if the GitHub release or the app's production domain changes.
- **Boosty link** is a placeholder (`#boostyLink` in `index.html`, wired to a placeholder alert in `main.js`) — once the Boosty page exists, set the real `href` and delete the `boostyLink` click handler in `main.js`.
- **Theme tokens** (colors, radii) are in `src/styles/tokens.css` — kept in sync with `almanac/`'s own design system by hand, since the two projects don't share a build.
