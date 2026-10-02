# MOTION

## Motion philosophy

The site uses motion for three reasons only: establish identity, explain the transition from services to work, and make the project board feel spatial. Motion is never used to delay normal navigation after the opening sequence.

The implementation follows a single language: transform/opacity, strong ease-out for state transitions, spring physics for interrupted drag, and loops that stop when invisible.

## Act 1 — cinematic ident

Normal duration: 6.7 seconds.

A single display-synced loop controls both Canvas 2D spectral ribbons and the five typographic service layers. Each word has an authored X/Y/depth/rotation origin. It approaches the viewer, settles around the spectral center, then exits forward with opacity and blur.

Words:
- DESARROLLO A MEDIDA
- SISTEMAS
- UI / UX
- INTEGRACIONES
- VANGUARDIA

The last ~700 ms dissolves the full-screen ident while the board underneath resolves from blur/offset into its final position.

Project iframe loading is deferred until the intro exits, protecting the animation's frame budget.

## Act 2 — kinetic board

Each project has a low-frequency autonomous drift and sub-degree rotation. The loop starts only after landing, while the board is near the viewport and the document is visible.

Pointer proximity writes a target force; the rendered force eases toward it, avoiding direct mouse-to-transform stiffness.

## Drag physics

Desktop cards can be dragged with pointer capture. Past 74 px from home, overshoot is damped to 32%, creating rubber-band resistance.

Release velocity is preserved and handed to a damped spring. The card returns to its authored zone without a visible stop between gesture and animation.

Touch pointers never activate drag.

## Preview motion

Live preview surfaces drift slowly within their clips. Their CSS loop pauses whenever the board is inactive. VOY and ZUNGUN remain static fallback surfaces because their live responses explicitly deny iframe embedding.

## Timing

- Press feedback: ~160 ms.
- Hover/focus: 160–180 ms.
- Landing materialization: ~560–840 ms with small stagger.
- Intro exit: 720 ms.
- No layout properties animate.

## Reduced motion

Reduced motion shortens the intro to 1.1 seconds, slows spectral movement, removes typographic travel, and disables kinetic board motion/drag.

## Performance

No Three.js, WebGL, GSAP or runtime UI framework. One short-lived Canvas 2D loop, one guarded transform-only board loop, lazy iframe initialization after the intro, and no remote fonts.
