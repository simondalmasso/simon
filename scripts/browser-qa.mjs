import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
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
server.listen(0,'127.0.0.1'); await once(server,'listening');
const url=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('qa',{recursive:true});
let count=0;
async function inspect(name,width,height,reduced=false){
  const context=await browser.newContext({viewport:{width,height},
    reducedMotion:reduced?'reduce':'no-preference',isMobile:width<500,hasTouch:width<500});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const pos=()=>page.locator('.orbit-track').getAttribute('data-position').then(Number);
  try {
    await page.goto(url,{waitUntil:'load'});
    await page.locator('.orbit-card').first().waitFor();
    assert.equal(await page.locator('.orbit-card').count(),8);
    assert.equal(await page.locator('.card-description').count(),8,'all cards show a project function');
    assert.equal(await page.locator('#orbit-description').innerText(),'Asistente de búsqueda laboral');
    assert.equal(await page.locator('.orbit-motion').count(),0,'obsolete pause removed');
    assert.equal(await page.locator('h1').innerText(),'Simón');
    assert.equal(await page.locator('.hero-subtitle').innerText(),'Desarrollo a medida de sistemas que funcionan');
    const dims=await page.evaluate(()=>({a:document.documentElement.scrollWidth,b:document.documentElement.clientWidth}));
    assert.ok(dims.a<=dims.b+2,'no overflow '+JSON.stringify(dims));
    for(const id of ['jobas','voy','atm','leadx','aberturas','rebeca','zungun','liva']){
      const r=await page.request.get(url+'previews/'+id+'.jpg');
      assert.equal(r.status(),200,'preview '+id);
    }
    const initial=await pos();
    await page.waitForTimeout(1200);
    assert.equal(await pos(),initial,'no autonomous rotation');
    if(width>900){
      const rect=await page.locator('#orbit-scene').boundingBox();
      const left={x:rect.x+rect.width*.17,y:rect.y+rect.height*.5};
      const right={x:rect.x+rect.width*.83,y:rect.y+rect.height*.5};
      await page.mouse.move(left.x,left.y);
      await page.waitForTimeout(900);
      const movedLeft=await pos();
      assert.ok(movedLeft>initial+.08,`cursor left must move cards left (orbit positive): ${initial} -> ${movedLeft}`);
      await page.mouse.move(right.x,right.y);
      await page.waitForTimeout(1100);
      const movedRight=await pos();
      assert.ok(movedRight<movedLeft-.15,`cursor right must move cards right (orbit negative): ${movedLeft} -> ${movedRight}`);
      await page.screenshot({path:`qa/${name}-cursor.jpg`,type:'jpeg',quality:75});
      await page.mouse.move(0,0);
      await page.waitForTimeout(850);
      const stopped=await pos();
      await page.waitForTimeout(700);
      assert.ok(Math.abs((await pos())-stopped)<.003,'stops after cursor leaves');
    }
    await page.locator('.orbit-index button').first().click();
    assert.equal(await page.locator('#orbit-name').innerText(),'JOBAS');
    await page.locator('.orbit-next').click();
    assert.equal(await page.locator('#orbit-name').innerText(),'VOY','manual next');
    assert.equal(await page.locator('#orbit-description').innerText(),'App de movilidad');
    await page.locator('.orbit-index button').nth(4).click();
    assert.equal(await page.locator('#orbit-name').innerText(),'Aberturas Avenida','manual index');
    assert.equal(await page.locator('#orbit-description').innerText(),'Catálogo de puertas y ventanas');
    const mail=page.locator('.shortcut-mail');
    const whatsapp=page.locator('.shortcut-whatsapp');
    assert.ok(await mail.isVisible(),'email icon visible at all viewport widths');
    assert.ok(await whatsapp.isVisible(),'WhatsApp icon visible at all viewport widths');
    assert.equal(await mail.getAttribute('href'),'mailto:simondalmasso44@gmail.com','direct email link');
    assert.equal(await whatsapp.getAttribute('href'),'https://wa.me/543425391278','direct WhatsApp link');
    assert.ok((await mail.getAttribute('aria-label')).includes('email'),'accessible mail icon');
    assert.ok((await whatsapp.getAttribute('aria-label')).includes('WhatsApp'),'accessible WhatsApp icon');
    await page.locator('#copy-email').click();
    assert.ok((await page.locator('#copy-feedback').innerText()).includes('simondalmasso44@gmail.com'));
    await page.screenshot({path:`qa/${name}-page.jpg`,type:'jpeg',quality:68,fullPage:true});
    assert.deepEqual(errors,[],'no browser JS errors');
    count++;console.log(`QA PASS ${name}: static idle, cursor direction, navigation, contact`);
  }finally{await context.close();}
}
try{
 await inspect('desktop',1280,800);
 await inspect('mobile',375,812);
 await inspect('reduced',1280,800,true);
 console.log(`BROWSER_QA=${count}/3 PASS`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
