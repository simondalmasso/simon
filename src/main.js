import { projects } from './data/projects.js';

const intro = document.querySelector('#intro');
const introSkip = document.querySelector('.intro-skip');
const introCanvas = document.querySelector('#intro-canvas');
const introWords = [...document.querySelectorAll('[data-intro-word]')];
const introPhase = document.querySelector('#intro-phase');
const grid = document.querySelector('#project-grid');
const board = document.querySelector('#project-board');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');
const INTRO_MS = 6700;
const REDUCED_INTRO_MS = 1100;

const clamp01 = value => Math.max(0, Math.min(1, value));
const smoothstep = value => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};
const mix = (a, b, t) => a + (b - a) * t;

document.body.classList.add('intro-active');
if (board) board.dataset.active = 'false';

let introClosed = false;
let introClosedAt = Number.POSITIVE_INFINITY;
let previewInitStarted = false;
const introStartedAt = performance.now();

function initProjectGrid() {
  if (!grid) return;

  projects.forEach((project, index) => {
    const blocked = project.embeddable === false;
    const preview = blocked
      ? `<div class="preview-fallback is-policy-blocked">
          <span>${project.name}</span>
          <small>LIVE PREVIEW PROTECTED · OPEN SITE</small>
        </div>`
      : `<div class="preview-fallback">
          <span>${project.name}</span>
          <small>LOADING LIVE SITE</small>
        </div>
        <iframe
          class="project-frame"
          data-src="${project.href}"
          title="${project.name} live preview"
          loading="lazy"
          tabindex="-1"
          referrerpolicy="no-referrer"
        ></iframe>`;

    const article = document.createElement('article');
    article.className = 'project-tile';
    article.style.setProperty('--i', String(index));
    article.innerHTML = `
      <div class="preview-surface" aria-hidden="true">${preview}</div>
      <div class="project-scrim" aria-hidden="true"></div>
      <div class="project-meta">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <span>LIVE WEB</span>
      </div>
      <h2 class="project-name">${project.name}</h2>
      <span class="project-arrow" aria-hidden="true">↗</span>
      <a class="project-link" href="${project.href}" target="_blank" rel="noopener" aria-label="Open ${project.name}"></a>
    `;
    grid.appendChild(article);
  });
}

initProjectGrid();

function initFrames() {
  const frames = [...document.querySelectorAll('.project-frame')];
  const loadFrame = frame => {
    if (!frame.src && frame.dataset.src) frame.src = frame.dataset.src;
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          loadFrame(entry.target);
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '180px 0px' });

    frames.forEach(frame => observer.observe(frame));
  } else {
    frames.forEach(loadFrame);
  }
}

function schedulePreviewInit() {
  if (previewInitStarted) return;
  previewInitStarted = true;
  const run = () => initFrames();

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 650 });
  } else {
    window.setTimeout(run, 120);
  }
}

function closeIntro(skip = false) {
  if (!intro || introClosed) return;
  introClosed = true;
  introClosedAt = performance.now();
  intro.classList.add(skip ? 'is-skipped' : 'is-exiting');
  document.body.classList.remove('intro-active');
  document.body.classList.add('is-landed');
  window.setTimeout(schedulePreviewInit, skip ? 80 : 260);
  syncBoardLoop();
}

const introDuration = reduceMotion.matches ? REDUCED_INTRO_MS : INTRO_MS;
const introTimer = window.setTimeout(() => closeIntro(false), introDuration);

introSkip?.addEventListener('click', () => {
  window.clearTimeout(introTimer);
  closeIntro(true);
});

function updateIntroTypography(now) {
  const elapsed = now - introStartedAt;
  const total = reduceMotion.matches ? REDUCED_INTRO_MS : INTRO_MS;
  const p = clamp01(elapsed / total);

  const phases = ['INITIALIZING', 'STRUCTURE', 'INTERFACE', 'CONNECTION', 'DEPLOY', 'LANDING'];
  if (introPhase) {
    introPhase.textContent = phases[Math.min(phases.length - 1, Math.floor(p * phases.length))];
  }

  introWords.forEach((word, index) => {
    const baseX = Number(word.dataset.x || 0);
    const baseY = Number(word.dataset.y || 0);
    const baseR = Number(word.dataset.r || 0);
    const introStart = .04 + index * .055;
    const introEnd = introStart + .19;
    const enter = smoothstep((p - introStart) / (introEnd - introStart));
    const exit = smoothstep((p - .76 - index * .015) / .16);
    const live = 1 - exit;
    const orbit = reduceMotion.matches ? 0 : 1;

    const x = baseX * innerWidth * (1 - enter) + Math.sin(p * 8 + index * 1.7) * (8 + index * 2) * orbit;
    const y = baseY * innerHeight * (1 - enter) + Math.cos(p * 7.4 + index * .9) * (6 + index) * orbit;
    const z = mix(-260, 30 + index * 7, enter) + exit * 280;
    const scale = mix(.72, 1, enter) + exit * .17;
    const rotate = baseR * (1 - enter) + Math.sin(p * 5 + index) * .7 * orbit;
    const blur = (1 - enter) * 16 + exit * 14;
    const opacity = enter * live;

    word.style.opacity = opacity.toFixed(3);
    word.style.filter = `blur(${blur.toFixed(2)}px)`;
    word.style.transform =
      `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px) scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg)`;
  });
}

function startIntroVisual() {
  if (!(introCanvas instanceof HTMLCanvasElement)) return;
  const ctx = introCanvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let raf = 0;

  function resize() {
    const rect = introCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (introCanvas.width !== width || introCanvas.height !== height) {
      introCanvas.width = width;
      introCanvas.height = height;
    }

    return { width, height, dpr };
  }

  function draw(now) {
    if (introClosed && now - introClosedAt > 780) {
      cancelAnimationFrame(raf);
      return;
    }

    updateIntroTypography(now);

    const elapsed = now - introStartedAt;
    const { width, height, dpr } = resize();
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const w = width / dpr;
    const h = height / dpr;
    const cx = w * .5;
    const cy = h * .5;
    const base = Math.min(w, h) * .21;
    const time = elapsed * .001;
    const speed = reduceMotion.matches ? .12 : 1;

    ctx.translate(cx, cy);
    ctx.globalCompositeOperation = 'lighter';

    const ribbons = reduceMotion.matches ? 26 : 78;
    for (let i = 0; i < ribbons; i += 1) {
      const q = i / ribbons;
      const phase = q * Math.PI * 2;
      const spin = time * (.29 + q * .15) * speed;
      const rx = base * (1.04 + Math.sin(time * .73 * speed + phase * 2.7) * .15);
      const ry = base * (.72 + Math.cos(time * .92 * speed + phase * 2.1) * .14);
      const wobble = base * (.055 + .035 * Math.sin(time * 1.1 * speed + phase * 4));
      const start = phase + spin;
      const sweep = Math.PI * (1.2 + .52 * Math.sin(phase * 3 + time * .58 * speed));

      ctx.beginPath();
      for (let step = 0; step <= 42; step += 1) {
        const u = step / 42;
        const angle = start + sweep * u;
        const pulse = Math.sin(angle * 3 + time * 1.9 * speed + phase) * wobble;
        const twist = Math.cos(angle * 2 - time * 1.35 * speed + phase * 2) * wobble * .45;
        const x = Math.cos(angle) * (rx + pulse) + twist;
        const y = Math.sin(angle) * (ry + pulse * .58);
        if (step === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const hue = (188 + q * 245 + time * 34 * speed) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 58%, ${.04 + (i % 6) * .007})`;
      ctx.lineWidth = .75 + (i % 5) * .31;
      ctx.shadowBlur = 8 + (i % 5) * 2.2;
      ctx.shadowColor = `hsla(${hue}, 100%, 58%, .48)`;
      ctx.stroke();
    }

    const coreGradient = ctx.createRadialGradient(0, 0, base * .12, 0, 0, base * .82);
    coreGradient.addColorStop(0, 'rgba(2,4,7,.98)');
    coreGradient.addColorStop(.55, 'rgba(3,5,9,.8)');
    coreGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, base * .82, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    raf = requestAnimationFrame(draw);
  }

  raf = requestAnimationFrame(draw);
}

startIntroVisual();

/* KINETIC BOARD */
const baseRotations = [0, -.3, .25, -.25, .18, -.2, .2, -.16];
const tiles = [...document.querySelectorAll('.project-tile')];
const isMobileMotion = () => coarsePointer.matches || innerWidth <= 620;
const tileState = tiles.map((tile, index) => ({
  tile,
  baseRotation: baseRotations[index] ?? 0,
  phase: index * 1.71,
  speed: .00012 + (index % 4) * .000017,
  ampX: isMobileMotion() ? 4 + (index % 3) * 2 : 13 + (index % 3) * 6,
  ampY: isMobileMotion() ? 3 + (index % 4) * 1.5 : 9 + ((index + 1) % 4) * 4,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  repelX: 0,
  repelY: 0,
  repelTargetX: 0,
  repelTargetY: 0,
  dragging: false,
  dragged: false,
  startPointerX: 0,
  startPointerY: 0,
  startX: 0,
  startY: 0,
  lastPointerX: 0,
  lastPointerY: 0,
  lastPointerTime: 0,
  pointerVX: 0,
  pointerVY: 0,
}));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function rubberBand(value, limit = 74) {
  const sign = Math.sign(value) || 1;
  const absolute = Math.abs(value);
  if (absolute <= limit) return value;
  return sign * (limit + (absolute - limit) * .32);
}

let boardVisible = false;
let boardRaf = 0;
let lastFrame = performance.now();

function setPointerRepulsion(event) {
  if (!boardVisible || reduceMotion.matches || event.pointerType === 'touch') return;

  for (const state of tileState) {
    const rect = state.tile.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - event.clientX;
    const dy = cy - event.clientY;
    const distance = Math.hypot(dx, dy);
    const range = Math.max(170, Math.min(310, rect.width * 1.18));

    if (distance < range && distance > 0) {
      const force = (1 - distance / range) * 18;
      state.repelTargetX = (dx / distance) * force;
      state.repelTargetY = (dy / distance) * force;
    } else {
      state.repelTargetX = 0;
      state.repelTargetY = 0;
    }
  }
}

board?.addEventListener('pointermove', setPointerRepulsion, { passive: true });
board?.addEventListener('pointerleave', () => {
  for (const state of tileState) {
    state.repelTargetX = 0;
    state.repelTargetY = 0;
  }
});

for (const state of tileState) {
  const { tile } = state;
  const link = tile.querySelector('.project-link');

  tile.addEventListener('pointerdown', event => {
    if (reduceMotion.matches || event.pointerType === 'touch') return;

    state.dragging = true;
    state.dragged = false;
    state.startPointerX = event.clientX;
    state.startPointerY = event.clientY;
    state.startX = state.x;
    state.startY = state.y;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerTime = event.timeStamp;
    state.pointerVX = 0;
    state.pointerVY = 0;
    tile.classList.add('is-dragging');
    tile.setPointerCapture?.(event.pointerId);
  });

  tile.addEventListener('pointermove', event => {
    if (!state.dragging) return;

    const rawX = state.startX + event.clientX - state.startPointerX;
    const rawY = state.startY + event.clientY - state.startPointerY;
    state.x = rubberBand(rawX);
    state.y = rubberBand(rawY);

    const dt = Math.max(8, event.timeStamp - state.lastPointerTime) / 1000;
    state.pointerVX = clamp((event.clientX - state.lastPointerX) / dt, -1400, 1400);
    state.pointerVY = clamp((event.clientY - state.lastPointerY) / dt, -1400, 1400);
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerTime = event.timeStamp;

    if (Math.hypot(event.clientX - state.startPointerX, event.clientY - state.startPointerY) > 6) {
      state.dragged = true;
    }
  });

  const release = event => {
    if (!state.dragging) return;
    state.dragging = false;
    state.vx = state.pointerVX;
    state.vy = state.pointerVY;
    tile.classList.remove('is-dragging');
    tile.releasePointerCapture?.(event.pointerId);
  };

  tile.addEventListener('pointerup', release);
  tile.addEventListener('pointercancel', release);

  link?.addEventListener('click', event => {
    if (state.dragged) {
      event.preventDefault();
      state.dragged = false;
    }
  });
}

function renderStaticTiles() {
  for (const state of tileState) {
    state.tile.style.transform = `rotate(${state.baseRotation}deg)`;
  }
}

function animateBoard(now) {
  boardRaf = 0;
  if (!boardVisible || reduceMotion.matches || document.hidden || !document.body.classList.contains('is-landed')) return;

  const dt = Math.min(.032, Math.max(.001, (now - lastFrame) / 1000));
  lastFrame = now;
  const springK = 135;
  const springDamping = 21;
  const follow = 1 - Math.exp(-11 * dt);

  for (const state of tileState) {
    if (!state.dragging) {
      const ax = -springK * state.x - springDamping * state.vx;
      const ay = -springK * state.y - springDamping * state.vy;
      state.vx += ax * dt;
      state.vy += ay * dt;
      state.x += state.vx * dt;
      state.y += state.vy * dt;

      if (Math.abs(state.x) < .02 && Math.abs(state.vx) < .05) {
        state.x = 0;
        state.vx = 0;
      }
      if (Math.abs(state.y) < .02 && Math.abs(state.vy) < .05) {
        state.y = 0;
        state.vy = 0;
      }
    }

    state.repelX += (state.repelTargetX - state.repelX) * follow;
    state.repelY += (state.repelTargetY - state.repelY) * follow;

    const t = now * state.speed;
    const autoX = Math.sin(t + state.phase) * state.ampX;
    const autoY = Math.cos(t * 1.17 + state.phase * .73) * state.ampY;
    const autoR = Math.sin(t * .81 + state.phase) * .34;
    const scale = state.tile.matches(':hover') && !state.dragging ? 1.012 : 1;

    const x = autoX + state.repelX + state.x;
    const y = autoY + state.repelY + state.y;
    const rotation = state.baseRotation + autoR;

    state.tile.style.transform =
      `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotation.toFixed(3)}deg) scale(${scale})`;
  }

  boardRaf = requestAnimationFrame(animateBoard);
}

function syncBoardLoop() {
  const shouldRun =
    boardVisible &&
    !reduceMotion.matches &&
    !document.hidden &&
    document.body.classList.contains('is-landed');

  if (board) board.dataset.active = shouldRun ? 'true' : 'false';

  if (shouldRun && !boardRaf) {
    lastFrame = performance.now();
    boardRaf = requestAnimationFrame(animateBoard);
  } else if (!shouldRun && boardRaf) {
    cancelAnimationFrame(boardRaf);
    boardRaf = 0;
  }

  if (!shouldRun && reduceMotion.matches) renderStaticTiles();
}

if (board && 'IntersectionObserver' in window) {
  const boardObserver = new IntersectionObserver(([entry]) => {
    boardVisible = Boolean(entry?.isIntersecting);
    syncBoardLoop();
  }, { rootMargin: '120px 0px' });
  boardObserver.observe(board);
} else if (board) {
  boardVisible = true;
}

document.addEventListener('visibilitychange', syncBoardLoop);
window.addEventListener('resize', () => {
  const mobile = isMobileMotion();
  tileState.forEach((state, index) => {
    state.ampX = mobile ? 4 + (index % 3) * 2 : 13 + (index % 3) * 6;
    state.ampY = mobile ? 3 + (index % 4) * 1.5 : 9 + ((index + 1) % 4) * 4;
  });
}, { passive: true });

document.documentElement.dataset.motion = reduceMotion.matches ? 'reduced' : 'full';
reduceMotion.addEventListener?.('change', event => {
  document.documentElement.dataset.motion = event.matches ? 'reduced' : 'full';
  if (event.matches && !introClosed) {
    window.clearTimeout(introTimer);
    window.setTimeout(() => closeIntro(false), REDUCED_INTRO_MS);
  }
  syncBoardLoop();
});
