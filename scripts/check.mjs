import { readFile } from 'node:fs/promises';
import { projects } from '../src/data/projects.js';
const [html,css,js,build]=await Promise.all([
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../src/styles.css',import.meta.url),'utf8'),
  readFile(new URL('../src/main.js',import.meta.url),'utf8'),
  readFile(new URL('./build.mjs',import.meta.url),'utf8')
]);
const checks=[
 ['eight projects',projects.length===8],
 ['semantic work section',html.includes('id="work"')],
 ['exactly one heading',html.split('<h1').length===2],
 ['3D carousel',html.includes('orbit-scene')&&css.includes('perspective:1150px')],
 ['CSS 3D transforms',js.includes('rotateY(')&&js.includes('translate3d(')],
 ['touch drag',js.includes('pointerdown')&&css.includes('touch-action:pan-y')],
 ['keyboard arrows',js.includes('ArrowRight')&&js.includes('ArrowLeft')],
 ['pause control',html.includes('id="orbit-motion"')&&js.includes('userPaused')],
 ['autoplay during hover',js.includes('cursorX*1.3')&&!js.includes('&&!hovering')],
 ['camera tracks cursor',js.includes('cameraYaw')&&js.includes('cursorAimX')&&js.includes('track.style.transform')],
 ['many-lap wrap',js.includes('Math.trunc(position/projects.length)')&&js.includes('wrap(a-b+length/2,length)')],
 ['reduced motion',js.includes('reduced.matches')&&css.includes('prefers-reduced-motion:reduce')],
 ['snapshot assets',js.includes('/previews/')&&build.includes('previews')],
 ['no intro',!html.includes('intro-splash')&&!js.includes('introTimer')],
 ['contact email',html.includes('mailto:simondalmasso44@gmail.com')],
 ['primary CTA goes to contact',html.includes('class="top-contact" href="#contact"')],
 ['copyable email',html.includes('id="copy-email"')&&js.includes('navigator.clipboard.writeText')],
 ['animated status',html.includes('orbit-live-status')&&js.includes('GIRANDO EN VIVO')],
 ['explicit reduced motion opt-in',js.includes('userMotionOverride=true')],
 ['contact whatsapp',html.includes('wa.me/543425391278')],
 ['no iframes',!html.includes('<iframe')&&!js.includes('<iframe')],
 ['no external runtime',!js.includes("from 'three'")&&!js.includes("from 'gsap'")]
];
for(const [name,ok] of checks){if(!ok)throw Error('FAIL '+name);console.log('PASS '+name);}
