import { projects } from './data/projects.js';

const intro = document.querySelector('#intro');
const introSkip = document.querySelector('.intro-skip');
const grid = document.querySelector('#project-grid');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function closeIntro() {
  if (!intro || intro.classList.contains('is-skipped')) return;
  intro.classList.add('is-skipped');
  document.body.classList.remove('intro-active');
}

document.body.classList.add('intro-active');
const introTimeout = window.setTimeout(
  () => document.body.classList.remove('intro-active'),
  reduceMotion.matches ? 720 : 3800
);

introSkip?.addEventListener('click', () => {
  window.clearTimeout(introTimeout);
  closeIntro();
});

intro?.addEventListener('animationend', event => {
  if (event.animationName === 'introExit') {
    document.body.classList.remove('intro-active');
  }
});

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
  if (!frame.src && frame.dataset.src) {
    frame.src = frame.dataset.src;
  }
}

if ('IntersectionObserver' in window) {
  const frameObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        loadFrame(entry.target);
        frameObserver.unobserve(entry.target);
      }
    }
  }, { rootMargin: '320px 0px' });

  frames.forEach(frame => frameObserver.observe(frame));
} else {
  frames.forEach(loadFrame);
}

document.documentElement.dataset.motion = reduceMotion.matches ? 'reduced' : 'full';
reduceMotion.addEventListener?.('change', event => {
  document.documentElement.dataset.motion = event.matches ? 'reduced' : 'full';
});
