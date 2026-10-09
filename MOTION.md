# MOTION

Opening animation removed. Portfolio visible at first paint.

Interaction is composed of subtle independent card drift, magnetic repulsion around the pointer, three curved SVG connections to neighboring panels, and bounded drag with rubber-band resistance. On release, velocity drives a damped spring back to origin. The continuous animation loop runs only when the board is visible and the document is active.

Touch devices retain native scroll and no drag capture. Reduced-motion disables all board translation and magnetic effects. Screenshots remain ordinary images with lazy loading and are not interactive iframes.

No GSAP, Remotion, Motion or Lottie runtime. Motion references informed the physicality and hierarchy, not new dependencies.

## Motion upgrade (2026-10-09)

- Arrival: identity and work index settle first, then project panels enter with 55ms stagger and a strong ease-out over 690ms. No splash screen.
- Relay: a 7.4s repeating choreography sends a 13px elastic-looking lift across the eight cards, one or two at a time. The 1/3 simultaneity rule applies; interaction always overrides ambient motion.
- Micro: poster drift, slightly stronger hover elevation, light following the cursor, arrow turn, and animated dashed links to three neighbors. Labels remain legible.
- Physics: the existing drag spring and velocity are preserved. Pointer movement updates the selected card and neighboring tiles; the connections retarget roughly every 75ms.
- Respect reduced-motion and touch. The rAF loop still stops offscreen or when the tab is hidden.
