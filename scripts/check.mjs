import { readFile } from 'node:fs/promises';

const [html, css, js] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
]);

const assertions = [
  ['semantic main', /<main\b/.test(html)],
  ['single h1', (html.match(/<h1\b/g) || []).length === 1],
  ['skip link', /class="skip-link"/.test(html)],
  ['work target', /id="work"/.test(html)],
  ['reduced motion', /prefers-reduced-motion:\s*reduce/.test(css)],
  ['visible focus', /focus-visible/.test(css)],
  ['no canvas', !/<canvas\b/.test(html)],
  ['no external font', !/@import\s+url|fonts\.googleapis/.test(css)],
  ['no eval', !/\beval\s*\(/.test(js)],
];

for (const [name, ok] of assertions) {
  if (!ok) throw new Error(`check failed: ${name}`);
  console.log(`PASS ${name}`);
}
