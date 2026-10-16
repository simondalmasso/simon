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
    assert.equal(await page.locator('.orbit-card').count(),10);
    assert.equal(await page.locator('.card-description').count(),10,'all cards show a project function');
    const expectedDescriptions={"jobas":"Asistente de búsqueda laboral remota y local","voy":"App de movilidad argentina","atm":"Panel de oportunidades, ingresos y cobros","leadx":"CRM para clientes y seguimiento comercial","aberturas":"Catálogo y pedidos de aberturas en Santa Fe","rebeca":"Tienda e-commerce de ropa femenina","zungun":"Sistema de operaciones y mensajería offline","liva":"Explorador de TV en vivo y videos a demanda","casa-tour":"Tours 3D de viviendas para inmobiliarias","amira":"Inteligencia bancaria y productos financieros"};
    for(const [id,description] of Object.entries(expectedDescriptions)){
      assert.equal(await page.locator(`.orbit-card[data-id="${id}"] .card-description`).innerText(),description,
        `specific visible description for ${id}`);
    }
    assert.equal(await page.locator('.orbit-total').innerText(),'/ 10');
    const overlineFollowsName=await page.locator('.hero-heading').evaluate(el=>{
      const h=el.querySelector('h1'),line=el.querySelector('.hero-overline');
      return Boolean(h.compareDocumentPosition(line)&Node.DOCUMENT_POSITION_FOLLOWING);
    });
    assert.ok(overlineFollowsName,'studio/location metadata below Simón');
    assert.equal(await page.locator('#orbit-description').innerText(),'Asistente de búsqueda laboral remota y local');
    assert.equal(await page.locator('.orbit-motion').count(),0,'obsolete pause removed');
    assert.equal(await page.locator('h1').innerText(),'Simón');
    assert.equal(await page.locator('.hero-subtitle').innerText(),'Desarrollo a medida de sistemas que funcionan');
    const dims=await page.evaluate(()=>({a:document.documentElement.scrollWidth,b:document.documentElement.clientWidth}));
    assert.ok(dims.a<=dims.b+2,'no overflow '+JSON.stringify(dims));
    const galleryGeometry=await page.locator('.orbit-scene').evaluate(scene=>{
      const card=scene.querySelector('.orbit-card');
      const cardBox=card.getBoundingClientRect();
      return {
        cardWidth:parseFloat(getComputedStyle(card).width),
        cardHeight:parseFloat(getComputedStyle(card).height),
        sceneHeight:scene.getBoundingClientRect().height,
        cardTop:cardBox.top,
        sceneTop:scene.getBoundingClientRect().top
      };
    });
    if(width>900){
      assert.ok(galleryGeometry.cardWidth>=width*.32 && galleryGeometry.cardWidth<=443,
        'desktop cards are about 15% larger: '+JSON.stringify(galleryGeometry));
      assert.ok(galleryGeometry.sceneHeight>=width*.43,
        'desktop gallery expanded vertically: '+JSON.stringify(galleryGeometry));
    }else if(width>620){
      assert.ok(galleryGeometry.cardWidth>=width*.39 && galleryGeometry.cardWidth<=365,
        'tablet cards enlarged about 10%: '+JSON.stringify(galleryGeometry));
      assert.ok(galleryGeometry.sceneHeight>=510,
        'tablet stage has room for larger tiles');
    }else{
      assert.ok(galleryGeometry.cardWidth>=215 && galleryGeometry.cardWidth<=285,
        'mobile cards remain compact: '+JSON.stringify(galleryGeometry));
      assert.ok(galleryGeometry.sceneHeight<=360,
        'mobile 3D gallery height unchanged');
    }
    for(const id of ['jobas','voy','atm','leadx','aberturas','rebeca','zungun','liva','casa-tour','amira']){
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
    assert.equal(await page.locator('#orbit-description').innerText(),'App de movilidad argentina');
    await page.locator('.orbit-index button').nth(4).click();
    assert.equal(await page.locator('#orbit-name').innerText(),'Aberturas Avenida','manual index');
    assert.equal(await page.locator('#orbit-description').innerText(),'Catálogo y pedidos de aberturas en Santa Fe');
    await page.locator('.orbit-index button').nth(5).click();
    assert.equal(await page.locator('#orbit-name').innerText(),'REBECA');
    assert.equal(await page.locator('#orbit-description').innerText(),'Tienda e-commerce de ropa femenina');
    await page.locator('.orbit-index button').nth(8).click();
    assert.equal(await page.locator('#orbit-name').innerText(),'Casa Tour','ninth project selectable');
    assert.equal(await page.locator('#orbit-description').innerText(),'Tours 3D de viviendas para inmobiliarias');
    assert.equal(await page.locator('#orbit-open').getAttribute('href'),'https://casa-tour.simondalmasso44.workers.dev/');
    assert.equal(await page.locator('.orbit-card[data-id="casa-tour"]').count(),1);
    await page.locator('.orbit-index button').nth(9).click();
    assert.equal(await page.locator('#orbit-name').innerText(),'aMira','tenth project selectable');
    assert.equal(await page.locator('#orbit-description').innerText(),'Inteligencia bancaria y productos financieros');
    assert.equal(await page.locator('#orbit-open').getAttribute('href'),'https://amira.simondalmasso44.workers.dev/');
    assert.equal(await page.locator('.orbit-card[data-id="amira"]').count(),1);
    const mail=page.locator('.shortcut-mail');
    const whatsapp=page.locator('.shortcut-whatsapp');
    assert.ok(await mail.isVisible(),'email icon visible at all viewport widths');
    assert.ok(await whatsapp.isVisible(),'WhatsApp icon visible at all viewport widths');
    assert.equal(await mail.getAttribute('href'),'mailto:simondalmasso44@gmail.com','direct email link');
    assert.equal(await whatsapp.getAttribute('href'),'https://wa.me/543425391278','direct WhatsApp link');
    assert.ok((await mail.getAttribute('aria-label')).includes('email'),'accessible mail icon');
    assert.ok((await whatsapp.getAttribute('aria-label')).includes('WhatsApp'),'accessible WhatsApp icon');
    // Regression: previous hand-drawn logo looked wrong despite a valid URL.
    const logo=whatsapp.locator('svg');
    assert.equal(await logo.getAttribute('viewBox'),'0 0 24 24','official WhatsApp aspect ratio');
    assert.equal(await logo.getAttribute('fill'),'currentColor','logo uses solid canonical fill');
    assert.equal(await logo.locator('path').count(),1,'recognizable single brand silhouette');
    // Navigation checks may have scrolled the topbar outside the viewport.
    // Bring the actual touch target onscreen before using elementFromPoint.
    await whatsapp.scrollIntoViewIfNeeded();
    const brandGeometry=await whatsapp.evaluate(el=>{
      const svg=el.querySelector('svg');
      const icon=svg.getBoundingClientRect();
      const bounds=el.getBoundingClientRect();
      const hit=document.elementFromPoint(bounds.left+bounds.width/2,bounds.top+bounds.height/2);
      return {
        width:bounds.width,height:bounds.height,iconWidth:icon.width,iconHeight:icon.height,
        hit:hit===el||el.contains(hit),
        fill:getComputedStyle(svg).fill,
        aligned:Math.abs((icon.left+icon.width/2)-(bounds.left+bounds.width/2))<1
          && Math.abs((icon.top+icon.height/2)-(bounds.top+bounds.height/2))<1
      };
    });
    assert.ok(brandGeometry.width>=44 && brandGeometry.height>=44,'WhatsApp touch target minimum 44px');
    assert.ok(brandGeometry.iconWidth>=22 && brandGeometry.iconHeight>=22,'legible brand mark');
    assert.ok(brandGeometry.hit,'touch center hits WhatsApp link and not an overlay');
    assert.ok(brandGeometry.aligned,'logo centered in button');
    assert.ok(brandGeometry.fill==='rgb(255, 255, 255)','white mark over green button');
    await page.locator('.topbar').screenshot({path:`qa/${name}-contact-icons.png`});
    await page.locator('#copy-email').click();
    assert.ok((await page.locator('#copy-feedback').innerText()).includes('simondalmasso44@gmail.com'));
    await page.screenshot({path:`qa/${name}-page.jpg`,type:'jpeg',quality:68,fullPage:true});
    assert.deepEqual(errors,[],'no browser JS errors');
    count++;console.log(`QA PASS ${name}: 10 projects, metadata below Simón, Casa Tour, aMira, navigation, contact`);
  }finally{await context.close();}
}
try{
 await inspect('desktop',1280,800);
 await inspect('tablet',768,900);
 await inspect('mobile',375,812);
 await inspect('small-mobile',320,700);
 await inspect('reduced',1280,800,true);
 console.log(`BROWSER_QA=${count}/5 PASS`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
