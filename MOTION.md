# MOTION — 3D SPHERICAL CAROUSEL

No opening splash.

The project track uses CSS 3D transforms with a mathematical cylindrical projection:
- angular offset based on distance from the current continuous position
- horizontal x = radius · sin(offset · step)
- depth z = depth · (cos(offset · step) - 1)
- slight vertical y sag toward lateral cards; rotateY makes them face inward

Animation is continuously interpolated by requestAnimationFrame at ~0.185 projects/second. Manual arrows/buttons smoothly target the chosen project and pause automatic rotation briefly. Dragging controls continuous position and snaps to the nearest card on release. On mouse hover, autoplay suspends. Pause button toggles autoplay.

Performance: no image iframes, no WebGL, no GSAP, no layout measurements inside each frame beyond the stage width; screenshots are self-hosted and lazy. Animation stops when offscreen / tab hidden. On reduced motion, snap navigation is immediate and autoplay disabled.
