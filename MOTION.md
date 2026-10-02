# MOTION

## Intro

The spectral orb is the only strong motion moment. It rotates, deforms and floats for roughly 3.6 seconds before the black intro layer dissolves into the project board. A discreet SKIP control remains available.

## Project board

Panels use tiny transform offsets and slow alternate motion. The live previews drift inside their frames so the board feels active without becoming a carousel or hijacking scroll. Hover pauses the panel motion and lifts the selected card.

## Live previews

Iframes are not all loaded at startup. IntersectionObserver assigns each preview source only when the card approaches the viewport. The preview itself is pointer-inert; clicking the card opens the real site in a new tab.

## Reduced motion

`prefers-reduced-motion: reduce` shortens the intro to under a second and effectively disables panel/preview animation.

## Mobile

The desktop 12-column panel board becomes a two-column mosaic with selected full-width feature cards. The contact dock remains fixed and the footer reserves space so it never overlaps content.

## Performance

No animation library, canvas, WebGL, external fonts or background video. The only continuous animations are CSS transforms/opacity, and offscreen previews stay unloaded until needed.
