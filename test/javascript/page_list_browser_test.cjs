const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const script = fs.readFileSync(require('node:path').join(__dirname, '../../app/assets/javascripts/imagine_cms/page_list.js'), 'utf8');
(async () => {
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage();
 const errors=[]; page.on('pageerror', e=>errors.push(String(e)));
 const shapes = [
  ['flat','<div><a href="#">First</a></div>','<div><a href="#">Second</a></div>','div'],
  ['list','<ul><li><a href="#">First</a></li>','<li><a href="#">Second</a></li>','li'],
  ['table','<table><tr><td><a href="#">First</a></td></tr>','<tr><td><a href="#">Second</a></td></tr>','tr'],
  ['body','<table><tbody><tr><td>First</td></tr>','<tr><td>Second</td></tr>','tr']
 ];
 let calls=0, fail=false, hold=false, release;
 await page.route('https://cms.test/**', async route=> {
  if (route.request().resourceType()==='document') return route.fulfill({body:'<html><body></body></html>',contentType:'text/html'});
  calls++;
  if (hold) await new Promise(r=>release=r);
  if (fail) return route.fulfill({status:503,body:'failure'});
  const key=new URL(route.request().url()).searchParams.get('key');
  return route.fulfill({json:{html:shapes.find(s=>s[0]===key)[2],count:1,next_url:null}});
 });
 await page.goto('https://cms.test/');
 let html=shapes.map(([key,head])=>`<section id="${key}">${head}<!--cms-list-end:${key}-->${key==='list'?'</ul>':key==='table'?'</table>':key==='body'?'</tbody></table>':''}<p class="footer">Footer</p><div data-cms-pagination="${key}" data-mode="load_more" data-next-url="/segment?key=${key}&seed=42"><button>Load more</button><span role="status"></span></div></section>`).join('');
 await page.setContent(html); await page.addScriptTag({content:script});
 assert.equal(await page.locator('#list [data-cms-pagination]').getAttribute('data-state'), 'idle');
 assert.equal(await page.locator('#list [data-cms-pagination]').getAttribute('data-auto-load'), 'false');
 for (const [key,, ,tag] of shapes) {
  await page.locator(`#${key} button`).click();
  await page.waitForFunction(key=>document.querySelector(`#${key} [role=status]`).textContent==='All items loaded.',key);
  assert.equal(await page.locator(key === "flat" ? "#flat > div:not([data-cms-pagination])" : `#${key} ${tag}`).count(),2,key+' preserves parent');
  assert.equal(await page.locator(`#${key} .footer`).count(),1);
 }
 assert.equal(calls,4);
 // Failure preserves URL and permits retry, without duplicate pending requests.
 await page.setContent(html); await page.evaluate(()=>window.ImagineCmsPageLists.init());
 fail=true; hold=true;
 await page.locator('#list button').click();
 await page.waitForFunction(()=>document.querySelector('#list button').disabled);
 assert.equal(await page.locator('#list [data-cms-pagination]').getAttribute('data-state'), 'loading');
 const before=calls;
 await page.locator('#list button').evaluate(b=>b.click());
 assert.equal(calls,before);
 release(); hold=false;
 await page.waitForFunction(()=>document.querySelector('#list button').textContent==='Retry');
 assert.equal(await page.locator('#list li').count(),1);
 assert.equal(await page.locator('#list [data-cms-pagination]').getAttribute('data-state'), 'error');
 fail=false;
 await page.locator('#list button').click();
 await page.waitForFunction(()=>document.querySelector('#list [role=status]').textContent==='All items loaded.');
 assert.equal(await page.locator('#list li').count(),2);
 assert.equal(await page.locator('#table tr').count(),1,'other lists unchanged');
 // Observer path uses the same loader, does not steal focus, and stops at exhaustion.
 await page.setContent(html.replaceAll('data-mode="load_more"','data-mode="infinite"'));
 await page.evaluate(()=>{document.body.tabIndex=-1;document.body.focus();window.ImagineCmsPageLists.init();});
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('[role=status]')).every(s=>s.textContent==='All items loaded.'));
 assert.equal(await page.evaluate(()=>document.activeElement.tagName),'BODY');
 assert.equal(await page.locator('#list [data-cms-pagination]').getAttribute('data-state'), 'complete');
 assert.equal(await page.locator('#list [data-cms-pagination]').getAttribute('data-auto-load'), 'true');
 // Browsers without observation retain a functional manual button.
 await page.setContent(html.replaceAll('data-mode="load_more"','data-mode="infinite"'));
 await page.evaluate(()=>{delete window.IntersectionObserver;window.ImagineCmsPageLists.init();});
 assert.equal(await page.locator('#list li').count(),1);
 assert.equal(await page.locator('#list [data-cms-pagination]').getAttribute('data-auto-load'), 'false');
 await page.locator('#list button').click();
 await page.waitForFunction(()=>document.querySelector('#list [role=status]').textContent==='All items loaded.');
 assert.equal(await page.locator('#list li').count(),2);
 assert.deepEqual(errors,[]);
 console.log('Browser checks passed: flat, ul, implicit/explicit tbody, independent lists, failure/retry, pending guard, automatic append and focus.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
