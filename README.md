# SIMONweb

Personal site for Simón Dalmasso.

Production target: https://simon.simondalmasso44.workers.dev

## Stack

Zero-dependency static site: semantic HTML, CSS and ES modules, deployed with Cloudflare Workers Static Assets.

## Verification

```bash
npm run verify
npm run deploy:dry
```

## Architecture

- `src/data/projects.js` — project data
- `src/main.js` — minimal interaction and scroll state
- `src/styles.css` — visual system and responsive motion
- `DESIGN.md` — design tokens and visual rules
- `MOTION.md` — motion contract and reduced-motion behavior
- `wrangler.toml` — Cloudflare Worker static-assets config

No backend, database, paid API, remote font, WebGL, GSAP, React runtime, or required SaaS dependency.

## Content boundary

Unverified portfolio details remain explicitly marked as placeholders instead of inventing clients, metrics, achievements, or personal history.
