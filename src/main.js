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
          <span>${project.summary}</span>
        </div>
        <span class="project-open" aria-hidden="true">↗</span>
      </a>`;
    wave.appendChild(article);
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateMotionState() {
  document.documentElement.dataset.motion = reduceMotion.matches ? 'reduced' : 'full';
}

updateMotionState();
reduceMotion.addEventListener?.('change', updateMotionState);
