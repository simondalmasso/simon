import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const root = resolve(new URL('..', import.meta.url).pathname);
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'src/data'), { recursive: true });

await cp(resolve(root, 'index.html'), resolve(dist, 'index.html'));
await cp(resolve(root, 'src/styles.css'), resolve(dist, 'src/styles.css'));
await cp(resolve(root, 'src/main.js'), resolve(dist, 'src/main.js'));
await cp(resolve(root, 'src/data/projects.js'), resolve(dist, 'src/data/projects.js'));
await cp(resolve(root, '_headers'), resolve(dist, '_headers'));
if (existsSync(resolve(root, 'previews'))) {
  await cp(resolve(root, 'previews'), resolve(dist, 'previews'), { recursive: true });
}

console.log('Built dist/');
