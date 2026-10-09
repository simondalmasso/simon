import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { once } from 'node:events';
import assert from 'node:assert/strict';

const root = resolve('dist');
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg'};
const server = createServer(async (req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const local=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(local!==root && !local.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const body=await readFile(local);
    res.writeHead(200,{'Content-Type':types[extname(local)]||'application/octet-stream'});
    res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(0,'127.0.0.1');
await once(server,'listening');
const url=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('qa',{recursive:true});
let passed=0;

async function checkCase(label,width,height,reduced=false) {
  const context=await browser.newContext({
    viewport:{width,height},
    deviceScaleFactor:1,
    reducedMotion:reduced?'reduce':'no-preference',
    isMobile:width<500,
    hasTouch:width<500
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(url,{waitUntil:'load',timeout:20000});
    await page.locator('.project-tile').first().waitFor();
    assert.equal(await page.locator('.project-tile').count(),8,'eight tiles');
    assert.equal(await page.locator('.intro-splash,canvas').count(),0,'no intro/canvas');
    assert.equal(await page.locator('h1').count(),1,'one h1');
    assert.equal(await page.locator('.board-links path').count(),3,'three links');
    const data=await page.evaluate(()=>({
      width:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,
      opacity:getComputedStyle(document.querySelector('.identity-tile')).opacity,
      links:[...document.querySelectorAll('.project-link')].map(a=>a.href),
      email:!!document.querySelector('a[href="mailto:simondalmasso44@gmail.com"]'),
      whatsapp:!!document.querySelector('a[href="https://wa.me/543425391278"]')
    }));
    assert.ok(data.scrollWidth<=data.width+2,'horizontal overflow '+JSON.stringify(data));
    assert.equal(data.opacity,'1','identity must be shown immediately');
    assert.equal(data.links.length,8,'8 linked cards');
    assert.ok(data.email && data.whatsapp,'contact links');
    for(const id of ['jobas','voy','atm','leadx','aberturas','rebeca','zungun','liva']){
      const response=await page.request.get(url+'previews/'+id+'.jpg');
      assert.equal(response.status(),200,'asset '+id);
    }
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.className),'skip-link','keyboard skip link');
    if(width>900&&!reduced){
      const card = page.locator('.project-tile').first();
      const animation = await card.evaluate(el=>getComputedStyle(el).animationName);
      assert.ok(animation.includes('tile-arrive'),'staggered arrival animation');
      await page.waitForTimeout(950);
      const before = await card.evaluate(el=>getComputedStyle(el).transform);
      await page.waitForTimeout(1050);
      const after = await card.evaluate(el=>getComputedStyle(el).transform);
      assert.notEqual(before,after,'autonomous motion is perceptible');
      assert.equal(await page.locator('.project-tile.is-featured').count(),1,'one prominent card at a time');
      const firstFocus = await page.locator('.project-tile.is-featured').first().getAttribute('style');
      await page.screenshot({path:'qa/desktop-motion-active.jpg',type:'jpeg',quality:75});
      await page.waitForTimeout(3150);
      const secondFocus = await page.locator('.project-tile.is-featured').first().getAttribute('style');
      assert.notEqual(firstFocus,secondFocus,'showcase migrates between projects');
      const toggle=page.locator('.motion-toggle');
      assert.equal(await toggle.getAttribute('aria-pressed'),'true','motion enabled on arrival');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-pressed'),'false','pause button disables motion');
      assert.equal(await page.locator('.board[data-active="false"]').count(),1,'board stops on pause');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-pressed'),'true','motion restart works');
      
      const rect=await page.locator('.project-tile').first().boundingBox();
      assert.ok(rect,'tile has bounds');
      await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);
      await page.waitForTimeout(180);
      assert.ok(await page.locator('.board-links.is-active').count()>0,'magnetic connections activate');
      assert.ok(await page.locator('.project-tile.is-magnetic').count()>1,'neighbor response');
    }
    if(reduced){
      assert.equal(await page.locator('.motion-toggle:disabled').count(),1,'reduced motion disables activation');
      const anim = await page.locator('.project-tile').first().evaluate(el=>getComputedStyle(el).animationName);
      assert.equal(anim,'none','reduced motion disables arrival movement');
      await page.waitForTimeout(150);
      assert.equal(await page.locator('.board[data-active="false"]').count(),1,'reduced motion pauses board');
    }
    await page.evaluate(async ()=>{
      for(let y=0;y<document.body.scrollHeight;y+=500){
        window.scrollTo(0,y);
        await new Promise(resolve=>setTimeout(resolve,50));
      }
      window.scrollTo(0,0);
      await new Promise(resolve=>setTimeout(resolve,450));
    });
    await page.screenshot({path:`qa/${label}.jpg`,type:'jpeg',quality:70,fullPage:true});
    assert.deepEqual(errors,[],'uncaught browser JS errors');
    passed++;
    console.log(`QA PASS ${label} tiles=8 no-overflow keyboard contact posters magnet=${width>900&&!reduced}`);
  } finally {await context.close();}
}
try {
  await checkCase('desktop',1280,800);
  await checkCase('mobile',375,812);
  await checkCase('reduced',1280,800,true);
  console.log(`BROWSER_QA=${passed}/3 PASS`);
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
