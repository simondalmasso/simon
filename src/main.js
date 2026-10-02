import { projects } from './data/projects.js';

const intro = document.querySelector('#intro');
const introSkip = document.querySelector('.intro-skip');
const introCanvas = document.querySelector('#intro-canvas');
const grid = document.querySelector('#project-grid');
const board = document.querySelector('#project-board');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const INTRO_MS = 4250;

document.body.classList.add('intro-active');

let introClosed = false;
function closeIntro(skip = false) {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add(skip ? 'is-skipped' : 'is-exiting');
  document.body.classList.remove('intro-active');
}

const introTimer = window.setTimeout(() => closeIntro(false), INTRO_MS);
introSkip?.addEventListener('click', () => {
  window.clearTimeout(introTimer);
  closeIntro(true);
});

function startOrb() {
  if (!(introCanvas instanceof HTMLCanvasElement)) return;

  const ctx = introCanvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let raf = 0;
  const started = performance.now();

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
    const elapsed = now - started;
    if (introClosed && elapsed > INTRO_MS + 850) {
      cancelAnimationFrame(raf);
      return;
    }

    const { width, height, dpr } = resize();
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const w = width / dpr;
    const h = height / dpr;
    const cx = w * .5;
    const cy = h * .5;
    const base = Math.min(w, h) * .245;
    const time = elapsed * .001;
    const slow = reduceMotion.matches ? .22 : 1;

    ctx.translate(cx, cy);
    ctx.globalCompositeOperation = 'lighter';

    const ribbons = reduceMotion.matches ? 42 : 92;
    for (let i = 0; i < ribbons; i += 1) {
      const q = i / ribbons;
      const phase = q * Math.PI * 2;
      const spin = time * (.34 + q * .16) * slow;
      const rx = base * (1.03 + Math.sin(time * .85 * slow + phase * 2.7) * .12);
      const ry = base * (.77 + Math.cos(time * 1.08 * slow + phase * 2.15) * .11);
      const wobble = base * (.05 + .035 * Math.sin(time * 1.4 * slow + phase * 4));
      const start = phase + spin;
      const sweep = Math.PI * (1.15 + .5 * Math.sin(phase * 3 + time * .65 * slow));

      ctx.beginPath();
      const steps = 48;
      for (let s = 0; s <= steps; s += 1) {
        const u = s / steps;
        const a = start + sweep * u;
        const pulse = Math.sin(a * 3 + time * 2.1 * slow + phase) * wobble;
        const twist = Math.cos(a * 2 - time * 1.55 * slow + phase * 2) * wobble * .42;
        const x = Math.cos(a) * (rx + pulse) + twist;
        const y = Math.sin(a) * (ry + pulse * .58) + Math.sin(time * .7 * slow + phase) * base * .035;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const hue = (188 + q * 245 + time * 38 * slow) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 58%, ${.035 + (i % 7) * .006})`;
      ctx.lineWidth = .8 + (i % 5) * .32;
      ctx.shadowBlur = 8 + (i % 6) * 2.4;
      ctx.shadowColor = `hsla(${hue}, 100%, 58%, .5)`;
      ctx.stroke();
    }

    for (let i = 0; i < 18; i += 1) {
      const a = time * (.36 + i * .006) * slow + i * .47;
      const radius = base * (.93 + Math.sin(time * .72 * slow + i) * .08);
      const x = Math.cos(a) * radius;
      const y = Math.sin(a * 1.05) * radius * .78;
      const hue = (185 + i * 17 + time * 45 * slow) % 360;
      ctx.fillStyle = `hsla(${hue},100%,63%,.42)`;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `hsla(${hue},100%,60%,.75)`;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + (i % 4) * .45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    raf = requestAnimationFrame(draw);
  }

  raf = requestAnimationFrame(draw);
}

startOrb();

if (grid) {
  projects.forEach((project, index) => {
    const article = document.createElement('article');
    article.className = 'project-tile';
    article.style.setProperty('--i', String(index));
    article.innerHTML = `
      <div class="preview-surface" aria-hidden="true">
        <div class="preview-fallback">${project.name}</div>
        <iframe
          class="project-frame"
          data-src="${project.href}"
          title="${project.name} live preview"
          loading="lazy"
          tabindex="-1"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
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

const frames = [...document.querySelectorAll('.project-frame')];
function loadFrame(frame) {
  if (!frame.src && frame.dataset.src) frame.src = frame.dataset.src;
}

if ('IntersectionObserver' in window) {
  const frameObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        loadFrame(entry.target);
        frameObserver.unobserve(entry.target);
      }
    }
  }, { rootMargin: '360px 0px' });

  frames.forEach(frame => frameObserver.observe(frame));
} else {
  frames.forEach(loadFrame);
}

const tiles = [...document.querySelectorAll('.project-tile')];
const tileState = tiles.map((tile, index) => ({
  tile,
  phase: index * 1.71,
  speed: .00013 + (index % 4) * .000018,
  ampX: 12 + (index % 3) * 7,
  ampY: 9 + ((index + 1) % 4) * 5,
  repelX: 0,
  repelY: 0,
  dragX: 0,
  dragY: 0,
  dragging: false,
  dragged: false,
  startX: 0,
  startY: 0,
}));

function setPointerRepulsion(event) {
  if (!board || reduceMotion.matches) return;

  for (const state of tileState) {
    const rect = state.tile.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - event.clientX;
    const dy = cy - event.clientY;
    const dist = Math.hypot(dx, dy);
    const range = Math.max(180, Math.min(330, rect.width * 1.25));

    if (dist < range && dist > 0) {
      const force = (1 - dist / range) * 20;
      state.repelX = (dx / dist) * force;
      state.repelY = (dy / dist) * force;
    } else {
      state.repelX *= .78;
      state.repelY *= .78;
    }
  }
}

board?.addEventListener('pointermove', setPointerRepulsion, { passive: true });
board?.addEventListener('pointerleave', () => {
  for (const state of tileState) {
    state.repelX = 0;
    state.repelY = 0;
  }
});

for (const state of tileState) {
  const { tile } = state;
  const link = tile.querySelector('.project-link');

  tile.addEventListener('pointerdown', event => {
    if (reduceMotion.matches || event.pointerType === 'touch') return;
    state.dragging = true;
    state.dragged = false;
    state.startX = event.clientX - state.dragX;
    state.startY = event.clientY - state.dragY;
    tile.classList.add('is-dragging');
    tile.setPointerCapture?.(event.pointerId);
  });

  tile.addEventListener('pointermove', event => {
    if (!state.dragging) return;
    const nextX = event.clientX - state.startX;
    const nextY = event.clientY - state.startY;
    if (Math.hypot(nextX - state.dragX, nextY - state.dragY) > 5) state.dragged = true;
    state.dragX = Math.max(-70, Math.min(70, nextX));
    state.dragY = Math.max(-70, Math.min(70, nextY));
  });

  const release = event => {
    if (!state.dragging) return;
    state.dragging = false;
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

let boardRaf = 0;
function animateBoard(now) {
  for (const state of tileState) {
    if (!state.dragging) {
      state.dragX *= .91;
      state.dragY *= .91;
    }

    state.repelX *= .94;
    state.repelY *= .94;

    const motion = reduceMotion.matches ? 0 : 1;
    const t = now * state.speed;
    const autoX = Math.sin(t + state.phase) * state.ampX * motion;
    const autoY = Math.cos(t * 1.17 + state.phase * .73) * state.ampY * motion;
    const autoR = Math.sin(t * .81 + state.phase) * .42 * motion;
    const hover = state.tile.matches(':hover') ? 1.018 : 1;

    state.tile.style.setProperty('--kx', `${(autoX + state.repelX + state.dragX).toFixed(2)}px`);
    state.tile.style.setProperty('--ky', `${(autoY + state.repelY + state.dragY).toFixed(2)}px`);
    state.tile.style.setProperty('--kr', `${autoR.toFixed(3)}deg`);
    state.tile.style.setProperty('--ks', hover.toFixed(3));
  }

  boardRaf = requestAnimationFrame(animateBoard);
}

if (tiles.length) boardRaf = requestAnimationFrame(animateBoard);

document.documentElement.dataset.motion = reduceMotion.matches ? 'reduced' : 'full';
reduceMotion.addEventListener?.('change', event => {
  document.documentElement.dataset.motion = event.matches ? 'reduced' : 'full';
});
