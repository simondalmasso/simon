import { readFile } from 'node:fs/promises';
import { projects } from '../src/data/projects.js';
const [html, css, js, headers, build] = await Promise.all([
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../src/styles.css',import.meta.url),'utf8'),
  readFile(new URL('../src/main.js',import.meta.url),'utf8'),
  readFile(new URL('../_headers',import.meta.url),'utf8'),
  readFile(new URL('./build.mjs',import.meta.url),'utf8')
]);
const assertions=[
 ['semantic main',html.includes('<main')],
 ['single h1',(html.match(/<h1\\b/g)||[]).length===1],
 ['skip link',html.includes('class="skip-link"')],
 ['work target',html.includes('id="work"')],
 ['no intro element',!html.includes('intro-splash')],
 ['no delayed landing',!js.includes('introTimer')&&!css.includes('is-landed')&&!css.includes('landing-tile')],
 ['no canvas',!html.includes('<canvas')],
 ['eight live sites',projects.length===8],
 ['poster previews',js.includes('project-poster')&&js.includes('loadPoster')],
 ['no iframes',!js.includes('project-frame')&&!html.includes('<iframe')],
 ['fallback colors',css.includes('--poster-color')],
 ['connections',js.includes('renderField')&&css.includes('board-links')],
 ['elastic drag',js.includes('rubberBand')&&js.includes('throwVX')],
 ['offscreen pause',js.includes('boardVisible')&&js.includes('document.hidden')],
 ['asset copy',build.includes('previews')],
 ['email',html.includes('mailto:simondalmasso44@gmail.com')],
 ['whatsapp',html.includes('wa.me/543425391278')],
 ['reduced motion',css.includes('prefers-reduced-motion: reduce')],
 ['focus style',css.includes('focus-visible')],
 ['security headers',headers.includes('Content-Security-Policy')],
 ['no eval',!js.includes('eval(')]
];
for(const [name,ok] of assertions) {
 if(!ok)throw new Error('check failed: '+name);
 console.log('PASS '+name);
}
