# DESIGN

## Direction

The site has two acts.

Act 1 is a 6.7-second cinematic ident: a dark spectral field, a central energy form and five spatial service statements — DESARROLLO A MEDIDA, SISTEMAS, UI / UX, INTEGRACIONES and VANGUARDIA. The words move through depth rather than appearing as slides.

Act 2 is a compact kinetic work index. It borrows the clarity of industrial/logistics identity systems without copying a brand: graphite field, black surfaces, off-white type, one acid signal color, strong numbering and asymmetric composition.

## Core tokens

- Background: `#070807`
- Board field: `#5f605a`
- Surface: `#0a0b0a`
- Primary text: `#f4f5ef`
- Muted text: `#a8aaa1`
- Structural line: `#292b27`
- Accent: `#eaff1a`
- Max board width: `1440px`
- Ease-out: `cubic-bezier(.23, 1, .32, 1)`
- On-screen movement: custom spring in JavaScript

## Typography

System sans for display/body and system monospace for operational labels. Large typography is tightly tracked; utility copy uses positive tracking.

## Intro

The canvas and typography share one requestAnimationFrame clock so they cannot drift apart. Text enters from authored 3D positions, settles around the center, then moves through depth and blurs out as the landing board materializes.

The full-motion duration is 6.7 seconds. Reduced-motion deliberately shortens the intro to 1.1 seconds and removes spatial motion.

## Work board

Eight verified project destinations appear in an asymmetric mosaic.

Six can render live iframe previews. VOY and ZUNGUN currently send framing-denial headers, so their cards use intentional protected-preview graphics rather than broken browser frames. Their external links remain live.

## Interaction

- Board movement begins only after landing.
- Autonomous drift runs only while the board is near the viewport.
- Pointer proximity is eased rather than mapped directly.
- Desktop project cards use pointer-captured drag with rubber-band resistance.
- Release velocity feeds a damped spring back home.
- Touch scrolling is never captured for drag.
- Hover states exist only on hover-capable fine pointers.
- Utility buttons use subtle press scaling.

## Accessibility

The SKIP INTRO button remains in the accessibility tree. Keyboard focus uses a high-contrast double ring. Reduced motion swaps spatial choreography for a short transition.

## Security

Cloudflare Static Assets ships CSP, HSTS, nosniff, anti-framing, restrictive referrer policy and permissions policy. CSP only enables frames from this portfolio's workers.dev project family.
