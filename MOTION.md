# MOTION — STEERABLE 3D CAROUSEL

Portfolio opens directly, no splash.

The eight real screenshots form a curved 3D carousel in CSS perspective. Cards use translate3d and rotateY, with side depth, shadow, and a small focused-image zoom.

Autoplay starts immediately at ~0.52 projects/second. Hover does not pause rotation. Moving the cursor within the gallery smoothly changes the angular velocity; left can reverse the rotation, right accelerates it. The entire 3D track leans in pitch and yaw toward the pointer. Leaving returns to neutral.

Positions use modulo wrap and are periodically normalized, so the carousel works over unlimited revolutions. The loop stops when the gallery is offscreen, the tab is hidden, or the user pauses.

Manual arrow controls, individual project buttons, horizontal drag/touch snap and keyboard arrows remain. The pause button freezes position; reduced-motion disables autoplay and pointer steering, with a visible status label.

The carousel caches stage width via ResizeObserver rather than reading card geometry each frame. No WebGL, videos, GSAP or heavy runtime dependencies.
Pausing freezes autoplay but arrow, index and keyboard navigation remain available.