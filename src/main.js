import { projects } from './data/projects.js';

const scene = document.querySelector('#orbit-scene');
const track = document.querySelector('#orbit-track');
const indexText = document.querySelector('#orbit-index');
const nameText = document.querySelector('#orbit-name');
const descriptionText = document.querySelector('#orbit-description');
const openLink = document.querySelector('#orbit-open');
const copyEmail = document.querySelector('#copy-email');
const copyFeedback = document.querySelector('#copy-feedback');
const navigation = document.querySelector('#orbit-index-list');

const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const wrap = (value,length)=>((value%length)+length)%length;
const shortest = (a,b,length)=>wrap(a-b+length/2,length)-length/2;
let position = 0;
let target = 0;
let last = performance.now();
let holdUntil = 0;
let dragging = false;
let dragMoved = false;
let dragStartX = 0;
let dragStartTarget = 0;
let pointerId = null;
let pointerActive = false;
let cursorAimX = 0;
let cursorAimY = 0;
let cursorX = 0;
let cursorY = 0;
let cameraPitch = 0;
let cameraYaw = 0;
let stageWidth = scene.clientWidth;
let visible = true;
let raf = 0;
let selected = -1;
let manualSelection = null;
const cards = [];
const navButtons = [];

projects.forEach((project,index)=>{
  const card=document.createElement('article');
  card.className='orbit-card';
  card.dataset.id=project.id;
  card.dataset.index=String(index);
  card.innerHTML=`
    <a href="${project.href}" target="_blank" rel="noopener" aria-label="Abrir ${project.name}: ${project.description}">
      <img src="/previews/${project.id}.jpg" alt="" loading="${index<3?'eager':'lazy'}" decoding="async">
      <span class="card-number">${String(index+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}</span>
      <span class="card-copy">
        <span class="card-text"><strong>${project.name}</strong><small class="card-description">${project.description}</small></span>
        <span class="card-arrow" aria-hidden="true">↗</span>
      </span>
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
  descriptionText.textContent=project.description;
  openLink.href=project.href;
  navButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  cards.forEach((card,i)=>card.classList.toggle('is-centered',i===index));
}

function calculate(){
  track.dataset.position=position.toFixed(4);
  const width=stageWidth;
  const mobile=width<620;
  const radius=Math.min(width*(mobile?.72:width<=900?.62:.60),mobile?330:820);
  const vertical=mobile?18:36;
  const step=mobile?.71:.56;
  for(let i=0;i<cards.length;i++){
    const delta=shortest(i,position,cards.length);
    const magnitude=Math.abs(delta);
    const angle=delta*step;
    const x=Math.sin(angle)*radius;
    const y=vertical*Math.pow(magnitude,1.45);
    const z=(Math.cos(angle)-1)*(mobile?225:390);
    const rotate=-angle*(180/Math.PI)*.92;
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
  const settled = Math.abs(target-position) < .065;
  if(manualSelection !== null && !settled){
    updateSelected(manualSelection); // Explicit clicks must not show yesterday's card.
  }else{
    manualSelection=null;
    updateSelected(wrap(Math.round(position),cards.length));
  }
}

function navigateTo(index){
  const current=Math.round(target);
  target=current+shortest(index,wrap(current,projects.length),projects.length);
  manualSelection=wrap(index,projects.length);
  updateSelected(manualSelection); // Visible response within the same click event.
  holdUntil=performance.now()+1400;
  syncAnimation();
}
function shift(by){
  target=Math.round(target)+by;
  manualSelection=wrap(Math.round(target),projects.length);
  updateSelected(manualSelection);
  holdUntil=performance.now()+1400;
  syncAnimation();
}

function canAuto(now){return pointerActive&&visible&&!document.hidden&&!dragging&&now>holdUntil;}
function syncAnimation(){
  if(!visible||document.hidden)return;
  if(raf)return;
  last=performance.now();
  raf=requestAnimationFrame(frame);
}
function frame(now){
  raf=0;
  if(!visible||document.hidden){
    return;
  }
  const dt=Math.min(.042,Math.max(.001,(now-last)/1000||.016));
  last=now;
  const follow=1-Math.exp(-dt*5.4);
  cursorX+=(cursorAimX-cursorX)*follow;
  cursorY+=(cursorAimY-cursorY)*follow;
  cameraYaw+=(cursorX*12-cameraYaw)*(1-Math.exp(-dt*5.1));
  cameraPitch+=(-cursorY*7-cameraPitch)*(1-Math.exp(-dt*5.1));
  track.style.transform=`rotateX(${cameraPitch.toFixed(3)}deg) rotateY(${cameraYaw.toFixed(3)}deg)`;
  const auto=canAuto(now);
  // Positive orbit position makes the rendered cards slide LEFT.
  // The sign is deliberately inverted to follow cursor direction.
  if(auto)target+=dt*clamp(-cursorX*1.6,-1.5,1.5);
  if(!dragging){
    const response=1-Math.exp(-dt*(auto?6:11));
    position+=(target-position)*response;
    if(!auto&&Math.abs(target-position)<.0004)position=target;
  }
  // Normalize complete laps to keep numerical values bounded.
  if(!dragging&&Math.abs(position)>32){
    const laps=Math.trunc(position/projects.length);
    position-=laps*projects.length;
    target-=laps*projects.length;
  }
  calculate();
  const idle=(!pointerActive||Math.abs(cursorAimX)<.09)&&!dragging&&Math.abs(target-position)<.0003
    &&Math.abs(cursorX)<.002&&Math.abs(cursorY)<.002
    &&Math.abs(cameraPitch)<.015&&Math.abs(cameraYaw)<.015;
  if(!idle)raf=requestAnimationFrame(frame);
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
function resetSteering(){
  pointerActive=false;
  cursorAimX=0;
  cursorAimY=0;
  if(manualSelection===null)target=position;
  syncAnimation();
}
window.addEventListener('pointermove',event=>{
  if((event.pointerType!=='mouse'&&event.pointerType!=='pen')||dragging)return;
  const rect=scene.getBoundingClientRect();
  const marginX=90,marginY=110;
  const near=event.clientX>=rect.left-marginX&&event.clientX<=rect.right+marginX&&
    event.clientY>=rect.top-marginY&&event.clientY<=rect.bottom+marginY;
  if(!near){if(pointerActive)resetSteering();return;}
  const x=clamp((event.clientX-(rect.left+rect.width/2))/(rect.width*.44),-1,1);
  const y=clamp((event.clientY-(rect.top+rect.height/2))/(rect.height*.44),-1,1);
  const extraY=Math.max(rect.top-event.clientY,event.clientY-rect.bottom,0);
  const strength=clamp(1-extraY/marginY,0,1);
  cursorAimX=Math.abs(x)<.09?0:x*strength;
  cursorAimY=Math.abs(y)<.09?0:y*strength;
  pointerActive=true;
  if(manualSelection===null)holdUntil=0;
  syncAnimation();
},{passive:true});
document.addEventListener('pointerout',event=>{
  if(!event.relatedTarget)resetSteering();
});
window.addEventListener('blur',resetSteering);
window.addEventListener('scroll',()=>{
  if(pointerActive)resetSteering();
},{passive:true});
scene.addEventListener('pointerdown',event=>{
  if(event.button!==0&&event.pointerType==='mouse')return;
  dragging=false;dragMoved=false;
  pointerId=event.pointerId;
  dragStartX=event.clientX;
  dragStartTarget=target;
  manualSelection=null;
  holdUntil=performance.now()+2500;
});
scene.addEventListener('pointermove',event=>{
  if(pointerId!==event.pointerId||dragStartX===null)return;
  const distance=event.clientX-dragStartX;
  if(!dragging&&Math.abs(distance)>7){
    dragging=true;
    dragMoved=true;
    pointerActive=false;
    cursorAimX=0;cursorAimY=0;
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
  holdUntil=performance.now()+500;
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

document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncAnimation();});
new ResizeObserver(()=>{
  stageWidth=scene.clientWidth;
  calculate();
  syncAnimation();
}).observe(scene);
new IntersectionObserver(([entry])=>{visible=Boolean(entry?.isIntersecting);if(visible)syncAnimation();},{threshold:.02}).observe(scene);
updateSelected(0);
calculate();
syncAnimation();

copyEmail?.addEventListener('click',async()=>{
  const email='simondalmasso44@gmail.com';
  // Never wait on clipboard permissions before showing actionable feedback.
  copyFeedback.textContent='Correo: '+email;
  copyEmail.textContent='Copiando…';
  let success=false;
  try{await navigator.clipboard.writeText(email);success=true;}
  catch{
    const field=document.createElement('textarea');
    field.value=email;field.style.position='fixed';field.style.opacity='0';
    document.body.appendChild(field);field.focus();field.select();
    try{success=document.execCommand('copy');}catch{}
    field.remove();
  }
  copyFeedback.textContent=success?'Email copiado: '+email:'Email: '+email;
  copyEmail.textContent=success?'Email copiado ✓':'Ver email';
});
