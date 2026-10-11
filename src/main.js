import { projects } from './data/projects.js';

const scene = document.querySelector('#orbit-scene');
const track = document.querySelector('#orbit-track');
const indexText = document.querySelector('#orbit-index');
const nameText = document.querySelector('#orbit-name');
const openLink = document.querySelector('#orbit-open');
const motionButton = document.querySelector('#orbit-motion');
const motionLabel = document.querySelector('#orbit-motion-label');
const navigation = document.querySelector('#orbit-index-list');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const wrap = (value,length)=>((value%length)+length)%length;
const shortest = (a,b,length)=>{
  let d=a-b;
  if(d>length/2)d-=length;
  if(d< -length/2)d+=length;
  return d;
};
let position = 0;
let target = 0;
let last = performance.now();
let holdUntil = 0;
let dragging = false;
let dragMoved = false;
let dragStartX = 0;
let dragStartTarget = 0;
let pointerId = null;
let hovering = false;
let visible = true;
let running = true;
let raf = 0;
let selected = -1;
let userPaused = false;
const cards = [];
const navButtons = [];

projects.forEach((project,index)=>{
  const card=document.createElement('article');
  card.className='orbit-card';
  card.dataset.id=project.id;
  card.dataset.index=String(index);
  card.innerHTML=`
    <a href="${project.href}" target="_blank" rel="noopener" aria-label="Abrir ${project.name}">
      <img src="/previews/${project.id}.jpg" alt="" loading="${index<3?'eager':'lazy'}" decoding="async">
      <span class="card-number">${String(index+1).padStart(2,'0')} / 08</span>
      <span class="card-copy"><strong>${project.name}</strong><span aria-hidden="true">↗</span></span>
    </a>`;
  const img=card.querySelector('img');
  img.addEventListener('error',()=>{img.style.display='none';card.classList.add('image-fallback');});
  track.appendChild(card);
  cards.push(card);

  const button=document.createElement('button');
  button.type='button';
  button.textContent=project.name;
  button.setAttribute('aria-label','Mostrar proyecto '+project.name);
  button.addEventListener('click',()=>navigateTo(index));
  navigation.appendChild(button);
  navButtons.push(button);
});

function updateSelected(index){
  if(index===selected)return;
  selected=index;
  const project=projects[index];
  indexText.textContent=String(index+1).padStart(2,'0');
  nameText.textContent=project.name;
  openLink.href=project.href;
  navButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  cards.forEach((card,i)=>card.classList.toggle('is-centered',i===index));
}

function calculate(){
  const width=scene.clientWidth;
  const mobile=width<620;
  const radius=Math.min(width*(mobile?.72:.55),mobile?330:730);
  const vertical=mobile?14:22;
  const step=mobile?.68:.50;
  const cardWidth=cards[0]?.getBoundingClientRect().width||300;
  const stageHeight=scene.clientHeight;
  for(let i=0;i<cards.length;i++){
    const delta=shortest(i,position,cards.length);
    const magnitude=Math.abs(delta);
    const angle=delta*step;
    const x=Math.sin(angle)*radius;
    const y=vertical*Math.pow(magnitude,1.45);
    const z=(Math.cos(angle)-1)*(mobile?180:280);
    const rotate=-angle*(180/Math.PI)*.75;
    const scale=1-Math.min(magnitude,4)*(mobile?.058:.035);
    const opacity=clamp(1-Math.max(magnitude-2,0)*.28,.03,1);
    const card=cards[i];
    card.style.transform=`translate3d(calc(-50% + ${x.toFixed(2)}px),calc(-50% + ${y.toFixed(2)}px),${z.toFixed(2)}px) rotateY(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    card.style.opacity=String(opacity);
    card.style.zIndex=String(50-Math.round(magnitude*10));
    card.style.pointerEvents=magnitude<2.65?'auto':'none';
    card.querySelector('a').tabIndex=magnitude<1.4?0:-1;
    card.setAttribute('aria-hidden',String(magnitude>2.65));
  }
  updateSelected(wrap(Math.round(position),cards.length));
}

function navigateTo(index){
  const current=Math.round(target);
  target=current+shortest(index,wrap(current,projects.length),projects.length);
  holdUntil=performance.now()+3500;
  syncAnimation();
}
function shift(by){
  target=Math.round(target)+by;
  holdUntil=performance.now()+3500;
  syncAnimation();
}

function canAuto(now){return visible&&!document.hidden&&!reduced.matches&&!userPaused&&!hovering&&!dragging&&now>holdUntil;}
function syncAnimation(){
  if(reduced.matches){
    target=Math.round(target);
    position=target;
    calculate();
    running=false;
    if(raf){cancelAnimationFrame(raf);raf=0;}
    return;
  }
  if(raf)return;
  last=performance.now();
  raf=requestAnimationFrame(frame);
}
function frame(now){
  raf=0;
  if(!visible||document.hidden){
    running=false;
    return;
  }
  const dt=Math.min(.042,(now-last)/1000||.016);
  last=now;
  const auto=canAuto(now);
  if(auto)target+=dt*.185;
  if(!dragging){
    const response=1-Math.exp(-dt*(auto?5.5:10.5));
    position+=(target-position)*response;
    if(!auto&&Math.abs(target-position)<.0004)position=target;
  }
  calculate();
  running=true;
  raf=requestAnimationFrame(frame);
}

const prev=document.querySelector('.orbit-prev');
const next=document.querySelector('.orbit-next');
prev.addEventListener('click',()=>shift(-1));
next.addEventListener('click',()=>shift(1));
scene.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
    event.preventDefault();
    shift(event.key==='ArrowRight'?1:-1);
  }
});
scene.addEventListener('mouseenter',()=>{hovering=true;holdUntil=performance.now()+800;});
scene.addEventListener('mouseleave',()=>{hovering=false;holdUntil=performance.now()+750;});
scene.addEventListener('pointerdown',event=>{
  if(event.button!==0&&event.pointerType==='mouse')return;
  if(reduced.matches)return;
  dragging=false;dragMoved=false;
  pointerId=event.pointerId;
  dragStartX=event.clientX;
  dragStartTarget=target;
  holdUntil=performance.now()+2500;
});
scene.addEventListener('pointermove',event=>{
  if(pointerId!==event.pointerId||dragStartX===null)return;
  const distance=event.clientX-dragStartX;
  if(!dragging&&Math.abs(distance)>7){
    dragging=true;
    dragMoved=true;
    scene.classList.add('is-dragging');
    scene.setPointerCapture?.(event.pointerId);
  }
  if(!dragging)return;
  const unit=(scene.clientWidth<620?scene.clientWidth*.70:Math.min(scene.clientWidth*.27,310));
  position=dragStartTarget-distance/unit;
  target=position;
  calculate();
});
function endDrag(event){
  if(event.pointerId!==pointerId)return;
  if(dragging){
    target=Math.round(position);
    if(scene.hasPointerCapture?.(pointerId))scene.releasePointerCapture(pointerId);
  }
  dragging=false;
  dragStartX=null;
  pointerId=null;
  scene.classList.remove('is-dragging');
  holdUntil=performance.now()+3700;
  syncAnimation();
}
scene.addEventListener('pointerup',endDrag);
scene.addEventListener('pointercancel',endDrag);
scene.addEventListener('click',event=>{
  if(dragMoved){
    event.preventDefault();
    event.stopPropagation();
    dragMoved=false;
  }
},true);

function updateMotion(){
  const canRun=!userPaused&&!reduced.matches;
  motionButton.setAttribute('aria-pressed',String(canRun));
  motionButton.disabled=reduced.matches;
  motionLabel.textContent=canRun?'Pausar movimiento':'Movimiento pausado';
  motionButton.setAttribute('aria-label',canRun?'Pausar rotación automática':'Activar rotación automática');
  if(!canRun)holdUntil=Number.POSITIVE_INFINITY;
  else holdUntil=performance.now()+1100;
  syncAnimation();
}
motionButton.addEventListener('click',()=>{userPaused=!userPaused;updateMotion();});
reduced.addEventListener?.('change',updateMotion);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncAnimation();});
new ResizeObserver(()=>{calculate();syncAnimation();}).observe(scene);
new IntersectionObserver(([entry])=>{visible=Boolean(entry?.isIntersecting);if(visible)syncAnimation();},{threshold:.02}).observe(scene);
updateSelected(0);
calculate();
updateMotion();
