import { mkdir, stat } from 'node:fs/promises';
import { chromium } from 'playwright';
import { projects } from '../src/data/projects.js';

const folder = new URL('../previews/', import.meta.url);
await mkdir(folder,{recursive:true});
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
let count = 0;
const failures = [];
try {
  for(const project of projects) {
    const context = await browser.newContext({
      viewport:{width:1280,height:800},
      deviceScaleFactor:1,
      colorScheme:'dark',
      reducedMotion:'reduce',
      locale:'es-AR'
    });
    const page = await context.newPage();
    try {
      await page.goto(project.href,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForTimeout(2800);
      const out = new URL(`../previews/${project.id}.jpg`, import.meta.url).pathname;
      await page.screenshot({path:out,type:'jpeg',quality:76,animations:'disabled',timeout:25000});
      const bytes=(await stat(out)).size;
      if(bytes<1500)throw Error('screenshot too small');
      count++;
      console.log(`CAPTURED ${project.id} (${bytes} bytes)`);
    } catch(error){
      failures.push(project.id);
      console.warn(`FAILED ${project.id}: ${error.message}`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
console.log(`CAPTURED ${count}/${projects.length}; failures: ${failures.join(',')||'none'}`);
if(count<6)process.exitCode=1;
