import { readFile } from 'node:fs/promises';

const [html, css, js, data, headers] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/data/projects.js', import.meta.url), 'utf8'),
  readFile(new URL('../_headers', import.meta.url), 'utf8'),
]);

const assertions = [
  ['semantic main', /<main\b/.test(html)],
  ['single h1', (html.match(/<h1\b/g) || []).length === 1],
  ['skip link', /class="skip-link"/.test(html)],
  ['work target', /id="work"/.test(html)],
  ['requested disciplines', /SOFTWARE · SYSTEMS · STORE · CRM · UX/.test(html)],
  ['cinematic intro duration', /INTRO_MS = 6700/.test(js)],
  ['cinematic intro vocabulary', ['DESARROLLO A MEDIDA','SISTEMAS','UI \/ UX','INTEGRACIONES','VANGUARDIA'].every(term => html.includes(term))],
  ['spectral canvas', /intro-canvas/.test(html) && /startIntroVisual/.test(js)],
  ['intro skip accessible', !/intro-splash[^>]*aria-hidden/.test(html) && /intro-skip/.test(html)],
  ['landing transition', /is-landed/.test(js) && /body\.is-landed/.test(css)],
  ['no door remains', !/door-(stage|wrap|frame|panel|handle)/.test(html + css + js)],
  ['live preview frames', /class="project-frame"/.test(js) && /initFrames/.test(js)],
  ['preview loading waits for intro', /schedulePreviewInit/.test(js) && /requestIdleCallback/.test(js)],
  ['frame-blocked fallback', /is-policy-blocked/.test(js) && /embeddable:\s*false/.test(data)],
  ['kinetic project motion', /animateBoard/.test(js) && /setPointerRepulsion/.test(js)],
  ['spring drag return', /springK/.test(js) && /rubberBand/.test(js) && /pointerVX/.test(js)],
  ['offscreen motion guard', /boardVisible/.test(js) && /document\.hidden/.test(js) && /board\.dataset\.active/.test(js)],
  ['eight project data entries', (data.match(/id:\s*'/g) || []).length === 8],
  ['no AI claim in visible page', !/\bAI\b/i.test(html)],
  ['email contact', /mailto:simondalmasso44@gmail\.com/.test(html)],
  ['whatsapp contact', /wa\.me\/543425391278/.test(html)],
  ['floating contact dock', /class="contact-dock"/.test(html)],
  ['reduced motion', /prefers-reduced-motion:\s*reduce/.test(css) && /REDUCED_INTRO_MS = 6700/.test(js)],
  ['visible focus', /focus-visible/.test(css)],
  ['no external font', !/@import\s+url|fonts\.googleapis/.test(css)],
  ['security headers', /Content-Security-Policy/.test(headers) && /X-Content-Type-Options:\s*nosniff/.test(headers)],
  ['CSP allows portfolio previews', /frame-src\s+https:\/\/\*\.simondalmasso44\.workers\.dev/.test(headers)],
  ['no eval', !/\beval\s*\(/.test(js)],
];

for (const [name, ok] of assertions) {
  if (!ok) throw new Error(`check failed: ${name}`);
  console.log(`PASS ${name}`);
}
