# Simon Dalmasso — Personal Portfolio

Personal portfolio of **Simon Dalmasso (Simón Dalmasso)**, an inventor and software builder based in Santa Fe, Argentina.

- **Website:** https://simon.simondalmasso44.workers.dev/
- **GitHub:** https://github.com/simondalmasso
- **LinkedIn:** https://linkedin.com/in/simondalmasso

Selected work spans AI tools and agentic workspaces, software verification, automation, CRM, mobility and web applications. Project maturity and release evidence are documented in each repository; a published repository or deployed interface is not, by itself, a claim that every feature is production-ready.

## Selected projects

- [BOQA — software verification](https://github.com/simondalmasso/boQA-ai-verification)
- [0liviA — personal AI workspace](https://github.com/simondalmasso/0liviA)
- [MiMicus iAffice — governed multi-agent runtime](https://github.com/simondalmasso/MiMicus-iAffice)
- [VOY — source-backed mobility platform](https://github.com/simondalmasso/VOY)
- [LeadX — commercial signal desk](https://github.com/simondalmasso/Leadx)

## UI

Light editorial landing with an immersive **cylindrical 3D website carousel** inspired by the layout language of MotionSites Custom Spaces (not copied). Nine real project screenshots are served as static JPEG assets from `previews/`, with direct HTTPS destinations in `src/data/projects.js`.

Carousel runs on native CSS 3D transforms + vanilla JS with no WebGL or animation-library dependency. It stays still until a pointer approaches, then moves left/right according to cursor proximity. Touch drag, previous/next arrows, project jump buttons and keyboard arrows remain available; animation pauses when offscreen or the tab is hidden. All project links remain accessible via the focused card and the current-project button. No splash screen.

## Project workflow

`npm run verify` for unit/static verification. GitHub Actions `Browser UI QA` runs Chromium at desktop, mobile and reduced-motion viewports. `Cloudflare Deploy` builds and publishes via Wrangler using existing GitHub secrets. `Refresh Portfolio Previews` captures real websites independently.

## Project 09 — Casa Tour

[Casa Tour](https://casa-tour.simondalmasso44.workers.dev/) offers **Recorridos 3D interactivos de propiedades**. Its captured image `previews/casa-tour.jpg` was stored and reviewed before enabling the card. The hero's studio/location line now follows the name **Simón**.
