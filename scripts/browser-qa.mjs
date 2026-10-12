import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile,mkdir } from 'node:fs/promises';
import { resolve,extname,sep } from 'node:path';
import { once } from 'node:events';
import assert from 'node:assert/strict';

const root=resolve('dist');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const local=resolve(root,'.'+(path==='/'?'/index.html':path));
    if(local!==root&&!local.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    res.writeHead(200,{'Content-Type':types[extname(local)]||'application/octet-stream'});
    res.end(await readFile(local));
  }catch{res.writeHead(404);res.end();}
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('qa',{recursive:true});
let total=0;
async function inspect(label,width,height,reduced=false){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference',isMobile:width<500,hasTouch:width<500});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(url,{waitUntil:'load'});
  await page.locator('.orbit-card').first().waitFor();
  assert.equal(await page.locator('.orbit-card').count(),8);
  assert.equal(await page.locator('.intro-splash').count(),0);
  assert.equal(await page.locator('h1').count(),1);
  const geometry=await page.evaluate(()=>({
   scrollWidth:document.documentElement.scrollWidth,
   viewport:document.documentElement.clientWidth,
   cards:[...document.querySelectorAll('.orbit-card')].map(el=>getComputedStyle(el).transform),
   selected:document.querySelector('#orbit-name').textContent,
   projectLinks:document.querySelectorAll('.orbit-card a').length
  }));
  assert.ok(geometry.scrollWidth<=geometry.viewport+2,`overflow ${JSON.stringify(geometry)}`);
  assert.equal(geometry.projectLinks,8);
  assert.ok(geometry.cards.some(x=>x.includes('matrix3d')),'side cards use 3D transforms');
  assert.ok(geometry.cards.every(x=>x!=='none'),'all cards positioned');
  for(const id of ['jobas','voy','atm','leadx','aberturas','rebeca','zungun','liva']){
   const res=await page.request.get(`${url}/previews/${id}.jpg`);
   assert.equal(res.status(),200,id);
  }
  await page.screenshot({path:`qa/${label}-start.jpg`,type:'jpeg',quality:72});
  {
    const initial=await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(1350);
    const advanced=await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform);
    assert.notEqual(initial,advanced,'autoplay moves even with OS reduced-motion preference');
  }
  if(width>900&&!reduced){
    const bounds=await page.locator('.orbit-scene').boundingBox();
    const left={x:bounds.x+bounds.width*.14,y:bounds.y+bounds.height*.28};
    const right={x:bounds.x+bounds.width*.86,y:bounds.y+bounds.height*.70};
    await page.mouse.move(left.x,left.y);
    await page.waitForTimeout(460);
    const leftTilt=await page.locator('.orbit-track').evaluate(el=>getComputedStyle(el).transform);
    await page.mouse.move(right.x,right.y);
    await page.waitForTimeout(460);
    const rightTilt=await page.locator('.orbit-track').evaluate(el=>getComputedStyle(el).transform);
    assert.notEqual(leftTilt,rightTilt,'camera follows cursor');
    const movingBefore=await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(850);
    const movingAfter=await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform);
    assert.notEqual(movingBefore,movingAfter,'still rotates under mouse hover');
    await page.screenshot({path:'qa/desktop-cursor-steering.jpg',type:'jpeg',quality:76});
  }
  await page.locator('.orbit-index button').first().click();
  await page.waitForTimeout(reduced?80:900);
  assert.equal(await page.locator('#orbit-name').innerText(),'JOBAS','index navigation selects JOBAS');
  await page.locator('.orbit-next').click();
  await page.waitForTimeout(reduced?80:750);
  assert.equal(await page.locator('#orbit-name').innerText(),'VOY','next arrow selects next');
  {
    assert.equal(await page.locator('#orbit-motion').getAttribute('aria-pressed'),'true','starts active');
    await page.locator('#orbit-motion').click();
    assert.equal(await page.locator('#orbit-motion').getAttribute('aria-pressed'),'false','pause available');
    const before=await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(500);
    const after=await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform);
    assert.equal(before,after,'pause freezes transform');
    assert.equal(await page.evaluate(()=>localStorage.getItem('simon-orbit-paused')),'true','pause stored');
    await page.locator('.orbit-next').click();
    assert.equal(await page.locator('#orbit-name').innerText(),'ATM','next works paused');
    await page.locator('.orbit-prev').click();
    assert.equal(await page.locator('#orbit-name').innerText(),'VOY','previous works paused');
    await page.reload({waitUntil:'load'});
    assert.equal(await page.locator('#orbit-motion').getAttribute('aria-pressed'),'false','pause persists across reload');
    await page.locator('#orbit-motion').click();
    assert.equal(await page.locator('#orbit-motion').getAttribute('aria-pressed'),'true','resume available');
    assert.equal(await page.evaluate(()=>localStorage.getItem('simon-orbit-paused')),'false','resumed preference stored');
    const resumedBefore=await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(1100);
    assert.notEqual(resumedBefore,
      await page.locator('.orbit-card').first().evaluate(el=>getComputedStyle(el).transform),
      'resume rotates after reload');
  }
  await page.locator('.orbit-index button').nth(4).click();
  assert.equal(await page.locator('#orbit-name').innerText(),'Aberturas Avenida',
    'manual project selection updates the label synchronously');
  assert.ok((await page.locator('#orbit-open').getAttribute('href')).includes('aberturasavenida'),
    'selected action updates synchronously with navigation');
  await page.waitForTimeout(reduced?80:900);
  assert.equal(await page.locator('#orbit-name').innerText(),'Aberturas Avenida',
    'selection is held until the carousel reaches its target');
  await page.screenshot({path:`qa/${label}-gallery.jpg`,type:'jpeg',quality:72});
  assert.equal(await page.locator('.top-contact').getAttribute('href'),'#contact');
  await page.locator('.top-contact').click();
  assert.equal(new URL(page.url()).hash,'#contact','Hablemos goes to contact');
  await page.locator('#copy-email').click();
  assert.ok((await page.locator('#copy-feedback').innerText()).includes('simondalmasso44@gmail.com'),'email copying visible');
  assert.deepEqual(errors,[]);
  total++; console.log(`QA PASS ${label} cards=8 navigation=ok overflow=0 reduced=${reduced}`);
 }finally{await context.close();}
}
try{await inspect('desktop',1280,800);await inspect('mobile',375,812);await inspect('reduced',1280,800,true);console.log(`BROWSER_QA=${total}/3 PASS`);}
finally{await browser.close();await new Promise(done=>server.close(done));}
