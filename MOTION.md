# MOTION — CURSOR-DIRECTED 3D REEL

The gallery is completely still on arrival. It does **not** autoplay.

When a fine pointer approaches the 3D gallery, horizontal location steers angular velocity: **left = positive orbit index / visually LEFT**, **right = negative orbit index / visually RIGHT**, centre dead zone = zero. Velocity eases in/out; pointer absence cancels directional motion and returns camera tilt to neutral. A quiet state stops requestAnimationFrame. There is no motion pause button because there is no autoplay to pause.

Manual drag, arrow buttons, keyboard and project jump buttons work independently. Touch devices retain native vertical scrolling and use horizontal drag/arrows for navigation. The preview screenshots remain self-hosted, no external animation libraries.

The visible hero identity is only **Simón**. The primary claim is exactly: **Desarrollo a medida de sistemas que funcionan**.

Mouse/pen proximity is detected by window pointermove, reaching 90px beyond horizontal and 110px beyond vertical gallery boundaries. The signed speed follows screen-space left/right, not internal orbit index direction. Scroll, window blur and leaving the proximity reset steering.

## 2026-10-12 — larger 3D cards

Desktop cards increase approximately 15% (from clamp(245px,28vw,385px) to clamp(282px,32.2vw,443px)), tablet increases approximately 10% (from clamp(265px,36vw,330px) to clamp(290px,39.6vw,365px)), and mobile remains unchanged. Stage height increases responsively on desktop and from 470 to 510px on tablet. The non-mobile orbit radius grows modestly to keep the larger cards spatially separated, with small added vertical sag. Cursor-guided direction, still-on-entry behavior, project links, and touch navigation remain unchanged.
