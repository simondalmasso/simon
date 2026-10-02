# DESIGN

## Direction

The site is an editorial work index rather than a conventional portfolio. The opening is a four-second spectral-flow ident, then the page resolves into a compact asymmetric panel board inspired by logistics/industrial identity systems: dense black surfaces, utilitarian labels, one acid accent and moving live product previews.

## Tokens

- Background: `#090909`
- Board field: `#60615c`
- Surface: `#0a0b0a`
- Primary text: `#f5f5f0`
- Muted text: `#a5a69e`
- Structural line: `#292b28`
- Accent: `#eaff1a`
- Maximum board width: `1440px`

## Typography

System sans for display/body and system monospace for utility labels. Large type is compact, tightly tracked and paired with very small operational labels.

## First-load sequence

1. Full-black intro.
2. Spectral torus/orb animates for about 3.6 seconds.
3. Intro dissolves after roughly 4.25 seconds.
4. The compact project board appears immediately, with no oversized empty identity panel.

## Project board

Eight requested live sites are presented inside asymmetric kinetic panels. Each card drifts and rotates independently, reacts to pointer proximity, and can be briefly dragged on desktop. Each card has a lazy-loaded, non-interactive iframe preview with a permanent project label and external-link hit target. If a remote site refuses framing, the project name remains visible as the fallback.

## Visual rules

- One acid accent rather than a multi-color UI palette.
- The spectral multi-color treatment belongs only to the opening ident.
- Motion is subtle after the intro: panel breathing and slow preview drift.
- No glassmorphism, fake metrics, generic tech claims, or AI positioning.
- Contact is always reachable through a floating two-button dock.
