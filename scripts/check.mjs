import { readFile } from 'node:fs/promises';

const [html, css, js, data] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/data/projects.js', import.meta.url), 'utf8'),
]);

const assertions = [
  ['semantic main', /<main\b/.test(html)],
  ['single h1', (html.match(/<h1\b/g) || []).length === 1],
  ['skip link', /class="skip-link"/.test(html)],
  ['work target', /id="work"/.test(html)],
  ['requested disciplines', /SOFTWARE · SYSTEMS · STORE · CRM · UX/.test(html)],
  ['spectral intro', /intro-canvas/.test(html) && /startOrb/.test(js) && /INTRO_MS = 4250/.test(js)],
  ['no door remains', !/door-(stage|wrap|frame|panel|handle)/.test(html + css + js)],
  ['live preview frames', /class="project-frame"/.test(js) && /IntersectionObserver/.test(js)],
  ['kinetic project motion', /animateBoard/.test(js) && /setPointerRepulsion/.test(js)],
  ['desktop project drag', /pointerdown/.test(js) && /is-dragging/.test(js)],
  ['eight project data entries', (data.match(/id:\s*'/g) || []).length === 8],
  ['no AI claim in visible page', !/\bAI\b/i.test(html)],
  ['email contact', /mailto:simondalmasso44@gmail\.com/.test(html)],
  ['whatsapp contact', /wa\.me\/543425391278/.test(html)],
  ['floating contact dock', /class="contact-dock"/.test(html)],
  ['reduced motion', /prefers-reduced-motion:\s*reduce/.test(css)],
  ['visible focus', /focus-visible/.test(css)],
  ['no external font', !/@import\s+url|fonts\.googleapis/.test(css)],
  ['no eval', !/\beval\s*\(/.test(js)],
];

for (const [name, ok] of assertions) {
  if (!ok) throw new Error(`check failed: ${name}`);
  console.log(`PASS ${name}`);
}
