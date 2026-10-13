import { readFile } from 'node:fs/promises';
import { projects } from '../src/data/projects.js';
const [html,css,js,build]=await Promise.all([
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../src/styles.css',import.meta.url),'utf8'),
  readFile(new URL('../src/main.js',import.meta.url),'utf8'),
  readFile(new URL('./build.mjs',import.meta.url),'utf8')
]);
const checks=[
 ['nine projects including Casa Tour',projects.length===9&&projects.some(p=>p.id==='casa-tour'&&p.href==='https://casa-tour.simondalmasso44.workers.dev/')],
 ['semantic work section',html.includes('id="work"')],
 ['exactly one heading',html.split('<h1').length===2],
 ['hero identity is Simón',html.includes('<h1 id="hero-title">Simón</h1>')],
 ['exact service claim',html.includes('Desarrollo a medida de sistemas que funcionan')],
 ['studio metadata placed below Simón',html.indexOf('id="hero-title"')<html.indexOf('class="hero-overline"')&&html.indexOf('class="hero-overline"')<html.indexOf('class="hero-subtitle"')],
 ['accurate 09 total',html.includes('Nueve proyectos web')&&html.includes('Nueve proyectos reales.')],
 ['3D carousel',html.includes('orbit-scene')&&css.includes('perspective:1250px')],
 ['larger desktop 3D tiles',css.includes('--orb-w:clamp(282px,32.2vw,443px)')],
 ['larger tablet tiles',css.includes('--orb-w:clamp(290px,39.6vw,365px)')],
 ['mobile size preserved',css.includes('--orb-w:clamp(215px,63vw,285px)')],
 ['CSS 3D transforms',js.includes('rotateY(')&&js.includes('translate3d(')],
 ['touch drag',js.includes('pointerdown')&&css.includes('touch-action:pan-y')],
 ['keyboard arrows',js.includes('ArrowRight')&&js.includes('ArrowLeft')],
 ['no obsolete motion switch',!html.includes('id="orbit-motion"')&&!js.includes('userPaused')],
 ['cursor-only motion',js.includes('pointerActive&&visible')&&js.includes('-cursorX*1.6')&&!js.includes('.86+cursorX')],
 ['camera tracks cursor',js.includes('cameraYaw')&&js.includes('cursorAimX')&&js.includes('track.style.transform')],
 ['many-lap wrap',js.includes('Math.trunc(position/projects.length)')&&js.includes('wrap(a-b+length/2,length)')],
 ['reduced motion CSS support',css.includes('prefers-reduced-motion:reduce')],
 ['standby render loop',js.includes('if(!idle)raf=requestAnimationFrame(frame)')],
 ['snapshot assets',js.includes('/previews/')&&build.includes('previews')],
 ['no intro',!html.includes('intro-splash')&&!js.includes('introTimer')],
 ['contact email',html.includes('mailto:simondalmasso44@gmail.com')],
 ['one-tap header contact links',html.includes('shortcut-mail')&&html.includes('shortcut-whatsapp')&&!html.includes('class="top-contact"')],
 ['project descriptions on cards and in focus',js.includes('project.description')&&html.includes('id="orbit-description"')],
 ['copyable email',html.includes('id="copy-email"')&&js.includes('navigator.clipboard.writeText')],
 ['no technical motion HUD',!html.includes('orbit-live-status')&&!html.includes('MOVIMIENTO REDUCIDO')],
 ['no OS autoplay lock',!js.includes('motionReduced()')&&!js.includes('reduced.matches')],
 ['pointer proximity left/right',js.includes('pointerActive=false')&&js.includes('marginX=90,marginY=110')&&js.includes('-cursorX*1.6')],
 ['official WhatsApp logo',html.includes('shortcut-whatsapp')&&html.includes('fill="currentColor"')&&html.includes('M17.472 14.382c-.297-.149')],
 ['WhatsApp mobile touch target',css.includes('.shortcut-link{width:44px;height:44px}')],
 ['contact whatsapp',html.includes('wa.me/543425391278')],
 ['no iframes',!html.includes('<iframe')&&!js.includes('<iframe')],
 ['no external runtime',!js.includes("from 'three'")&&!js.includes("from 'gsap'")],
 ['canonical portfolio URL',html.includes('<link rel="canonical" href="https://simon.simondalmasso44.workers.dev/">')],
 ['Simon Dalmasso person metadata',html.includes('"@type": "Person"')&&html.includes('"name": "Simon Dalmasso"')&&html.includes('"alternateName": "Simón Dalmasso"')],
 ['GitHub identity link',html.includes('href="https://github.com/simondalmasso"')],
 ['LinkedIn identity link',html.includes('href="https://linkedin.com/in/simondalmasso"')&&html.includes('"https://linkedin.com/in/simondalmasso"')]
];
for(const [name,ok] of checks){if(!ok)throw Error('FAIL '+name);console.log('PASS '+name);}
