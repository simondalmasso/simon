# SIMONweb

Personal portfolio of Simón Dalmasso. Deployed at https://simon.simondalmasso44.workers.dev/

## UI

Light editorial landing with an immersive **cylindrical 3D website carousel** inspired by the layout language of MotionSites Custom Spaces (not copied). Eight real project screenshots are served as static JPEG assets from `previews/`, with direct HTTPS destinations in `src/data/projects.js`.

Carousel runs on native CSS 3D transforms + vanilla JS with no WebGL or animation-library dependency. It rotates automatically with low velocity, responds to horizontal pointer/touch drag, offers previous/next arrows, per-project jump buttons, keyboard arrows, and a motion pause control. Offscreen or hidden tabs stop rendering; reduced-motion uses static snap navigation. All project links remain accessible via the focused card and the current-project button. No splash screen.

## Project workflow

`npm run verify` for unit/static verification. GitHub Actions `Browser UI QA` runs Chromium at desktop, mobile and reduced-motion viewports. `Cloudflare Deploy` builds and publishes via Wrangler using existing GitHub secrets. `Refresh Portfolio Previews` captures real websites independently.
