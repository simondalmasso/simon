# MOTION

## Principles

Motion expresses one narrative: approach → threshold → digital field. It never hijacks scrolling.

## Door

- Native document scroll remains in control; JavaScript only samples section progress through a passive scroll listener and one requestAnimationFrame per frame.
- The door approaches, visibly opens on its left hinge, exposes a lit portal, and then scales past the viewer to create an entering-the-door transition.
- No scroll hijacking, no canvas/WebGL and no continuous animation loop when the page is idle.
- The implementation does not depend on CSS ScrollTimeline support.

## Hover/focus

Project cards shift by 6px and strengthen their boundary. Keyboard focus always uses a visible cold outline.

## Ambient void

One very slow conic sweep behind the digital void. Decorative only.

## Reduced motion

`prefers-reduced-motion: reduce` disables the scroll choreography and looping motion, removes smooth scrolling and presents a clearly recognizable, partially open static door before projects.

## Mobile

Shorter narrative height, larger door relative to viewport, no coordinate labels, single-column project flow.

## Performance

No canvas, no animation library, no remote fonts, no image textures and no continuous JavaScript animation loop.
