# SIMONweb

Personal work index for Simón Dalmasso.

Production: https://simon.simondalmasso44.workers.dev

## Positioning

SOFTWARE · SYSTEMS · STORE · CRM · UX

## Stack

Zero-dependency static site: semantic HTML, CSS and ES modules deployed with Cloudflare Workers Static Assets.

## Experience

- 3–4 second spectral-orb intro
- asymmetric live-project board
- eight lazy-loaded website previews
- direct email and WhatsApp contact
- responsive and reduced-motion fallbacks

## Verification

```bash
npm run verify
npm run deploy:dry
```

## Architecture

- `src/data/projects.js` — verified project destinations
- `src/main.js` — intro state, project rendering and iframe lazy-loading
- `src/styles.css` — visual system and motion
- `DESIGN.md` — visual contract
- `MOTION.md` — motion/performance contract
- `wrangler.toml` — Cloudflare Worker static-assets config
