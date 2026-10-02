# MOTION

## Principles

Motion expresses one narrative: approach → threshold → digital field. It never hijacks scrolling.

## Door

- Native CSS scroll-driven animation when supported.
- Scale from distant to oversized during natural document scroll.
- No JavaScript scroll listeners, no layout reads, no WebGL.
- Unsupported browsers receive a static door.

## Hover/focus

Project cards shift by 6px and strengthen their boundary. Keyboard focus always uses a visible cold outline.

## Ambient void

One very slow conic sweep behind the digital void. Decorative only.

## Reduced motion

`prefers-reduced-motion: reduce` disables scroll-driven and looping motion, removes smooth scrolling and presents the door as a static threshold before projects.

## Mobile

Shorter narrative height, larger door relative to viewport, no coordinate labels, single-column project flow.

## Performance

No canvas, no animation library, no remote fonts, no image textures and no continuous JavaScript animation loop.
