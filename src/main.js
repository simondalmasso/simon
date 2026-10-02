import { projects } from './data/projects.js';

const wave = document.querySelector('#project-wave');

if (wave) {
  projects.forEach((project, index) => {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.style.setProperty('--i', String(index));
    article.innerHTML = `
      <a href="${project.href}" target="_blank" rel="noopener" aria-label="Open ${project.name}">
        <div class="project-meta">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <span>${project.status}</span>
        </div>
        <div class="project-orbit" aria-hidden="true">
          <span class="orbit-core"></span>
          <span class="orbit-line"></span>
          <span class="orbit-node node-a"></span>
          <span class="orbit-node node-b"></span>
        </div>
        <div class="project-copy">
          <p>${project.type}</p>
          <h3>${project.name}</h3>
        </div>
        <span class="project-open" aria-hidden="true">↗</span>
      </a>`;
    wave.appendChild(article);
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const threshold = document.querySelector('.threshold');
const approachState = document.querySelector('.approach-state');
let rafId = 0;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const segment = (progress, start, end) => clamp((progress - start) / (end - start));

function setMotionDefaults() {
  root.dataset.motion = reduceMotion.matches ? 'reduced' : 'full';

  if (reduceMotion.matches) {
    root.style.removeProperty('--door-progress');
    root.style.removeProperty('--door-open');
    root.style.removeProperty('--door-scale');
    root.style.removeProperty('--door-opacity');
    root.style.removeProperty('--portal-opacity');
    root.style.removeProperty('--hero-opacity');
    root.style.removeProperty('--scene-y');
    return;
  }

  updateThresholdScene();
}

function updateThresholdScene() {
  rafId = 0;
  if (!threshold || reduceMotion.matches) return;

  const rect = threshold.getBoundingClientRect();
  const travel = Math.max(1, threshold.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / travel);
  const approach = segment(progress, 0, 0.48);
  const opening = segment(progress, 0.28, 0.58);
  const entering = segment(progress, 0.52, 0.95);
  const fadeOut = segment(progress, 0.78, 1);
  const heroFade = 1 - segment(progress, 0.1, 0.38);
  const scale = 0.72 + (approach * 0.72) + (entering * 4.9);
  const sceneY = 16 * (1 - approach);
  const portalOpacity = 0.08 + (opening * 0.68) + (entering * 0.24);

  root.style.setProperty('--door-progress', progress.toFixed(4));
  root.style.setProperty('--door-open', opening.toFixed(4));
  root.style.setProperty('--door-scale', scale.toFixed(4));
  root.style.setProperty('--door-opacity', (1 - fadeOut * 0.92).toFixed(4));
  root.style.setProperty('--portal-opacity', clamp(portalOpacity).toFixed(4));
  root.style.setProperty('--hero-opacity', heroFade.toFixed(4));
  root.style.setProperty('--scene-y', `${sceneY.toFixed(2)}vh`);

  if (approachState) {
    approachState.textContent = progress < 0.25
      ? 'APPROACH THE DOOR'
      : progress < 0.6
        ? 'THE DOOR IS OPENING'
        : 'ENTERING DIGITAL VOID';
  }
}

function requestSceneUpdate() {
  if (rafId || reduceMotion.matches) return;
  rafId = requestAnimationFrame(updateThresholdScene);
}

setMotionDefaults();
window.addEventListener('scroll', requestSceneUpdate, { passive: true });
window.addEventListener('resize', requestSceneUpdate, { passive: true });
reduceMotion.addEventListener?.('change', setMotionDefaults);
