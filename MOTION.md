# MOTION

## Intro

The opening ident lasts about 4.25 seconds. A canvas-rendered spectral torus is built from dozens of animated light ribbons and orbiting points, producing visible rotation, deformation, hue travel and depth on a black field. The intro then dissolves into the work board. A SKIP control remains available.

The timing is controlled in JavaScript rather than by a CSS media-query shortcut, so a browser cannot unexpectedly collapse the ident to a one-second flash.

## Kinetic project board

The project cards are not static grid items. Each has an independent low-frequency drift on X/Y plus fractional rotation. Pointer proximity pushes nearby cards away slightly, making the board react as a field rather than a set of hover effects.

On desktop, cards can also be dragged up to a bounded distance and released. They ease back toward their home zone while autonomous drift resumes. A drag gesture suppresses the following click; a normal click still opens the project.

## Live previews

Iframes are loaded only when their tiles approach the viewport. The preview itself is pointer-inert; the whole tile is the external-link target.

## Reduced motion

Reduced-motion keeps the full intro duration but reduces the spectral field's movement and disables autonomous card travel. This preserves the narrative without imposing large spatial motion.

## Mobile

Touch scrolling is never captured for dragging. Mobile cards keep their mosaic layout and live previews without desktop drag behavior.

## Performance

No animation library or WebGL. The spectral ident uses one short-lived 2D canvas loop. The board loop animates transforms only; iframe previews remain lazy-loaded.
