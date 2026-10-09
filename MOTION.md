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

## Spotlight motion (2026-10-09)

The subtle relay was replaced by an obvious sequential showcase. Approximately every 2.95 seconds a different project becomes the foreground focus. The active panel rises by 27px, scales by 5.2%, receives a visible acid rim and an `IN FOCUS` label, while its screenshot zooms and the two closest panels move aside by up to 17px. On mobile the translations are clamped to 8px and the image/label emphasis remains visible. A `MOTION ON/OFF` control in WORK INDEX pauses and resumes the choreography. The project grid is still immediately available without any intro; manual hover/drag takes priority over the automated focus. Reduced-motion disables all automated transforms.
