import { projects } from './data/projects.js';

const grid = document.querySelector('#project-grid');
const board = document.querySelector('#project-board');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = matchMedia('(pointer: coarse)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rubberBand = (value, limit = 74) => {
  if (Math.abs(value) <= limit) return value;
  return Math.sign(value) * (limit + (Math.abs(value) - limit) * .32);
};

if (grid) {
  projects.forEach((project, index) => {
    const tile = document.createElement('article');
    tile.className = 'project-tile';
    tile.style.setProperty('--i', String(index));
    tile.innerHTML = `
      <div class="preview-surface" aria-hidden="true">
        <div class="preview-fallback"><span>${project.name}</span><small>EXPLORAR PROYECTO ↗</small></div>
        <img class="project-poster" data-src="/previews/${project.id}.jpg" alt="" loading="lazy" decoding="async">
      </div>
      <div class="project-scrim" aria-hidden="true"></div>
      <div class="project-meta"><span>${String(index + 1).padStart(2, '0')}</span><span>LIVE WEB</span></div>
      <h2 class="project-name">${project.name}</h2>
      <span class="project-arrow" aria-hidden="true">↗</span>
      <a class="project-link" href="${project.href}" target="_blank" rel="noopener"
        aria-label="Abrir ${project.name}"></a>`;
    grid.appendChild(tile);
  });
}

const posters = [...document.querySelectorAll('.project-poster')];
const loadPoster = img => {
  if (!img.dataset.src || img.dataset.loaded) return;
  img.dataset.loaded = '1';
  img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  img.addEventListener('error', () => img.remove(), { once: true });
  img.src = img.dataset.src;
};
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) { loadPoster(entry.target); observer.unobserve(entry.target); }
    }
  }, { rootMargin: '250px 0px' });
  posters.forEach(img => observer.observe(img));
} else posters.forEach(loadPoster);

/* Magnet field: panels react to each other, not only the pointer. */
const rotations = [0, -.3, .25, -.25, .18, -.2, .2, -.16];
const isMobile = () => coarsePointer.matches || innerWidth <= 620;
const states = [...document.querySelectorAll('.project-tile')].map((tile, index) => ({
  tile, index, baseRotation: rotations[index] || 0, phase: index * 1.71,
  speed: .00049 + (index % 4) * .00005,
  x: 0, y: 0, vx: 0, vy: 0,
  targetX: 0, targetY: 0, pushX: 0, pushY: 0,
  dragging: false, moved: false, candidate: false,
  startPointerX: 0, startPointerY: 0, startX: 0, startY: 0,
  lastX: 0, lastY: 0, lastTime: 0, throwVX: 0, throwVY: 0
}));

const svgNS = 'http://www.w3.org/2000/svg';
const links = document.createElementNS(svgNS, 'svg');
links.setAttribute('class', 'board-links');
links.setAttribute('aria-hidden', 'true');
const paths = Array.from({ length: 3 }, () => {
  const p = document.createElementNS(svgNS, 'path');
  links.appendChild(p);
  return p;
});
board?.prepend(links);

let boardVisible = false;
let boardRaf = 0;
let lastFrame = performance.now();
let hovered = null;
let lastConnectionRender = 0;
const ambientStart = performance.now();

// A short, sequential impulse travels between neighboring tiles.
// It deliberately animates only one or two cards at once.
function relayEnvelope(seconds, index) {
  const cycle = seconds % 7.4;
  const progress = (cycle - 1.15 - index * .37) / .95;
  if (progress <= 0 || progress >= 1) return 0;
  return Math.sin(Math.PI * progress);
}

function clearField() {
  hovered = null;
  board?.classList.remove('is-exploring');
  links.classList.remove('is-active');
  states.forEach(s => { s.tile.classList.remove('is-magnetic'); s.targetX = 0; s.targetY = 0; });
}

function renderField(active) {
  if (!board || !active || reduceMotion.matches || isMobile()) return;
  board.classList.add('is-exploring');
  const box = board.getBoundingClientRect();
  if (box.width < 1 || box.height < 1) return;
  const center = el => {
    const rect = el.getBoundingClientRect();
    return { x: rect.left - box.left + rect.width / 2,
             y: rect.top - box.top + rect.height / 2 };
  };
  const anchor = center(active);
  const neighbors = states.filter(s => s.tile !== active)
    .map(s => {
      const pt = center(s.tile);
      return { state: s, pt, distance: Math.hypot(pt.x-anchor.x, pt.y-anchor.y) };
    }).sort((a,b) => a.distance-b.distance).slice(0,3);
  states.forEach(s => s.tile.classList.toggle('is-magnetic',
    s.tile === active || neighbors.some(n => n.state === s)));
  links.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  paths.forEach((path, index) => {
    const n = neighbors[index];
    if (!n) return path.setAttribute('d','');
    const midX = (anchor.x+n.pt.x)/2;
    const midY = (anchor.y+n.pt.y)/2 - Math.min(26,n.distance*.055);
    path.setAttribute('d',`M ${anchor.x.toFixed(1)} ${anchor.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${n.pt.x.toFixed(1)} ${n.pt.y.toFixed(1)}`);
    path.style.opacity = String(.8-index*.17);
  });
  links.classList.add('is-active');
}

function applyPointerField(event) {
  if (reduceMotion.matches || isMobile() || !boardVisible) return;
  const active = event.target.closest?.('.project-tile');
  if (active) {
    hovered = active;
    const rect = active.getBoundingClientRect();
    const px = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const py = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    active.style.setProperty('--spot-x', px.toFixed(1) + '%');
    active.style.setProperty('--spot-y', py.toFixed(1) + '%');
  }
  if (hovered) renderField(hovered);
  for (const s of states) {
    const rect = s.tile.getBoundingClientRect();
    const dx = rect.left + rect.width/2 - event.clientX;
    const dy = rect.top + rect.height/2 - event.clientY;
    const dist = Math.hypot(dx, dy);
    const range = Math.max(180, Math.min(340,rect.width*1.4));
    const force = dist > 1 && dist < range ? (1-dist/range)*20 : 0;
    s.targetX = force*dx/(dist||1);
    s.targetY = force*dy/(dist||1);
  }
}
board?.addEventListener('pointermove',applyPointerField,{ passive: true });
board?.addEventListener('pointerleave',clearField);
board?.addEventListener('focusin',event=>{
  const tile=event.target.closest?.('.project-tile');
  if (tile && !reduceMotion.matches && !isMobile()) {
    hovered=tile;
    renderField(tile);
  }
});
board?.addEventListener('focusout',event=>{
  if(!board.contains(event.relatedTarget)) clearField();
});

for (const s of states) {
  const {tile} = s;
  tile.addEventListener('pointerdown', event => {
    if (reduceMotion.matches || event.pointerType === 'touch' || event.button !== 0) return;
    s.candidate = true; s.moved = false;
    s.startPointerX = s.lastX = event.clientX;
    s.startPointerY = s.lastY = event.clientY;
    s.startX = s.x; s.startY = s.y;
    s.lastTime = event.timeStamp;
  });
  tile.addEventListener('pointermove', event => {
    if (!s.candidate) return;
    const dx = event.clientX-s.startPointerX;
    const dy = event.clientY-s.startPointerY;
    if (!s.dragging && Math.hypot(dx,dy) > 6) {
      s.dragging = true; s.moved = true;
      tile.classList.add('is-dragging');
      tile.setPointerCapture?.(event.pointerId);
    }
    if (!s.dragging) return;
    s.x = rubberBand(s.startX + dx);
    s.y = rubberBand(s.startY + dy);
    const dt = Math.max(8,event.timeStamp-s.lastTime)/1000;
    s.throwVX = clamp((event.clientX-s.lastX)/dt,-1100,1100);
    s.throwVY = clamp((event.clientY-s.lastY)/dt,-1100,1100);
    s.lastTime = event.timeStamp; s.lastX = event.clientX; s.lastY = event.clientY;
  });
  const release = event => {
    if (!s.candidate) return;
    s.candidate = false;
    if(s.dragging) {
      s.vx=s.throwVX; s.vy=s.throwVY;
      s.dragging = false; tile.classList.remove('is-dragging');
      if (tile.hasPointerCapture?.(event.pointerId)) tile.releasePointerCapture(event.pointerId);
    }
  };
  tile.addEventListener('pointerup',release);
  tile.addEventListener('pointercancel',release);
  tile.addEventListener('click',event=>{
    if(s.moved) {
      event.preventDefault(); event.stopPropagation(); s.moved=false;
    }
  },true);
}

function renderStill() {
  states.forEach(s => {
    s.tile.style.transform=`rotate(${s.baseRotation}deg)`;
    s.tile.classList.remove('is-in-wave');
  });
  clearField();
}

function animateBoard(now) {
  boardRaf=0;
  if (!boardVisible || document.hidden || reduceMotion.matches) return;
  const dt = Math.min(.032,Math.max(.001,(now-lastFrame)/1000));
  lastFrame=now;
  const follow=1-Math.exp(-11*dt);
  for (const s of states) {
    if(!s.dragging){
      s.vx += (-135*s.x-21*s.vx)*dt;
      s.vy += (-135*s.y-21*s.vy)*dt;
      s.x += s.vx*dt; s.y += s.vy*dt;
      if(Math.abs(s.x)<.02 && Math.abs(s.vx)<.1){s.x=0;s.vx=0;}
      if(Math.abs(s.y)<.02 && Math.abs(s.vy)<.1){s.y=0;s.vy=0;}
    }
    s.pushX+=(s.targetX-s.pushX)*follow;
    s.pushY+=(s.targetY-s.pushY)*follow;
    const t=now*s.speed;
    const amplitude=isMobile()?.32:1;
    const relay=relayEnvelope((now-ambientStart)/1000,s.index) * amplitude;
    const autoX=Math.sin(t+s.phase)*(8+s.index%3*3)*amplitude + relay*(s.index%2?2.5:-2.5);
    const autoY=Math.cos(t*1.17+s.phase*.73)*(7+s.index%4*2)*amplitude - relay*13;
    const rotation=s.baseRotation+Math.sin(t*.81+s.phase)*.36*amplitude + relay*(s.index%2?.75:-.75);
    const scale=(s.tile.matches(':hover') || s.tile.matches(':focus-within'))&&!s.dragging ? 1.022:1;
    s.tile.classList.toggle('is-in-wave',relay>.32 && !s.dragging);
    s.tile.style.transform=`translate3d(${(s.x+s.pushX+autoX).toFixed(2)}px,${(s.y+s.pushY+autoY).toFixed(2)}px,0) rotate(${rotation.toFixed(3)}deg) scale(${scale})`;
  }
  // Lines follow moving neighbors even when the pointer is stationary.
  if(hovered && now-lastConnectionRender>75) {
    renderField(hovered);
    lastConnectionRender=now;
  }
  boardRaf=requestAnimationFrame(animateBoard);
}
function syncLoop() {
  const shouldRun=boardVisible && !document.hidden && !reduceMotion.matches;
  if(board)board.dataset.active=shouldRun?'true':'false';
  if(shouldRun&&!boardRaf){lastFrame=performance.now();boardRaf=requestAnimationFrame(animateBoard);}
  if(!shouldRun&&boardRaf){cancelAnimationFrame(boardRaf);boardRaf=0;}
  if(!shouldRun)states.forEach(s=>s.tile.classList.remove('is-in-wave'));
  if(reduceMotion.matches)renderStill();
}
if(board && 'IntersectionObserver' in window) {
  const observer=new IntersectionObserver(([entry])=>{
    boardVisible=Boolean(entry?.isIntersecting);
    syncLoop(); if(!boardVisible)clearField();
  },{rootMargin:'100px 0px'});
  observer.observe(board);
}else if(board){boardVisible=true;syncLoop();}
document.addEventListener('visibilitychange',syncLoop);
reduceMotion.addEventListener?.('change', syncLoop);
document.documentElement.dataset.motion=reduceMotion.matches?'reduced':'full';
