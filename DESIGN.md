# DESIGN

## Direction

The site is an editorial work index rather than a conventional portfolio. The opening is a short spectral-orb ident, then the page resolves into an asymmetric panel board inspired by logistics/industrial identity systems: dense black surfaces, utilitarian labels, one acid accent and moving live product previews.

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
3. Intro dissolves.
4. The project board is immediately visible.

## Project board

Eight requested live sites are presented inside asymmetric panels. Each card has a lazy-loaded, non-interactive iframe preview with a permanent project label and external-link hit target. If a remote site refuses framing, the project name remains visible as the fallback.

## Visual rules

- One acid accent rather than a multi-color UI palette.
- The spectral multi-color treatment belongs only to the opening ident.
- Motion is subtle after the intro: panel breathing and slow preview drift.
- No glassmorphism, fake metrics, generic tech claims, or AI positioning.
- Contact is always reachable through a floating two-button dock.
