# MOTION

Opening animation removed. Portfolio visible at first paint.

Interaction is composed of subtle independent card drift, magnetic repulsion around the pointer, three curved SVG connections to neighboring panels, and bounded drag with rubber-band resistance. On release, velocity drives a damped spring back to origin. The continuous animation loop runs only when the board is visible and the document is active.

Touch devices retain native scroll and no drag capture. Reduced-motion disables all board translation and magnetic effects. Screenshots remain ordinary images with lazy loading and are not interactive iframes.

No GSAP, Remotion, Motion or Lottie runtime. Motion references informed the physicality and hierarchy, not new dependencies.
