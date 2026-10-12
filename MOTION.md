# 3D CAROUSEL MOTION

The eight live project screenshots rotate automatically from the first frame. Default angular speed is about 0.86 projects per second and cursor position steers direction and camera inclination. The carousel is animated with CSS 3D transforms and requestAnimationFrame, without a splash or heavy graphics libraries.

The visitor has a simple Pausar/Reanudar control. Their explicit pause choice is saved in localStorage and survives reloads; keyboard arrows, selection and drag remain available. The animation loop stops when the tab is hidden, the carousel leaves the viewport, or the user pauses.

This portfolio follows the site owner's specific request to rotate on load regardless of the operating system's reduced-motion setting. There is a visible and keyboard-accessible pause control. CSS reduced-motion still removes decorative transitions and disables smooth scrolling.
