import {chromium} from '/Users/aj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/#foundations');await page.locator('#api-send').waitFor();
await page.fill('#browser-url','notes.example');await page.locator('#browser-url').press('Enter');
await page.waitForFunction(()=>document.getElementById('browser-status').textContent==='Up to date');
assert.equal(await page.locator('#browser-url').inputValue(),'https://notes.example/');
assert.match(await page.locator('#api-response').innerText(),/200/);
await page.selectOption('#api-scenario','create');await page.fill('#note-text','My API lesson');
for(let i=0;i<6;i++)await page.click('#api-next');
assert.match(await page.locator('#api-response').innerText(),/201/);assert.match(await page.locator('#api-screen').innerText(),/My API lesson/);
await page.selectOption('#api-scenario','list');for(let i=0;i<6;i++)await page.click('#api-next');assert.match(await page.locator('#api-response').innerText(),/My API lesson/);
await page.selectOption('#api-scenario','invalid');for(let i=0;i<6;i++)await page.click('#api-next');assert.match(await page.locator('#api-screen').innerText(),/must not be empty/);
await page.selectOption('#api-scenario','auth');for(let i=0;i<6;i++)await page.click('#api-next');assert.match(await page.locator('#api-response').innerText(),/401/);
await page.click('#api-reset');await page.fill('#browser-note','Added from the browser');await page.click('#browser-add');assert.equal(await page.locator('#browser-add').isDisabled(),true);await page.waitForFunction(()=>document.getElementById('browser-status').textContent==='Up to date');assert.match(await page.locator('#api-screen').innerText(),/Added from the browser/);await page.click('#browser-reload');await page.waitForFunction(()=>document.getElementById('browser-status').textContent==='Up to date');assert.match(await page.locator('#api-request').innerText(),/GET \/api\/notes/);assert.match(await page.locator('#api-screen').innerText(),/Added from the browser/);await page.fill('#browser-note','');await page.click('#browser-add');await page.waitForFunction(()=>document.getElementById('browser-status').textContent==='Request failed');assert.match(await page.locator('#api-response').innerText(),/422/);await page.click('#browser-reload');await page.waitForFunction(()=>document.getElementById('browser-status').textContent==='Up to date');await page.screenshot({path:'/private/tmp/arise-foundations.png',fullPage:true});
await page.click('#tab-shell');await page.fill('#shell-command','cat access.log | grep 200 | wc -l');await page.locator('#shell-command').press('Enter');assert.match(await page.locator('#shell-output').innerText(),/\n3\n/);
await page.selectOption('#shell-mode','zsh');await page.fill('#shell-command','echo *.csv');await page.locator('#shell-command').press('Enter');assert.match(await page.locator('#shell-output').innerText(),/no matches found/);
await page.click('#tab-workflow');await page.fill('#editor-text','<h1>My first build</h1>');await page.click('#editor-save');await page.click('[data-work="make build"]');await page.click('[data-work="make build"]');assert.match(await page.locator('#work-output').innerText(),/up to date/);await page.click('[data-work="make serve"]');assert.equal(await page.frameLocator('#work-preview').locator('h1').innerText(),'My first build');assert.match(await page.locator('#work-feedback').innerText(),/Complete/);
await page.fill('#editor-text','<p>broken</p>');await page.click('#editor-save');await page.click('[data-work="make"]');assert.match(await page.locator('#work-output').innerText(),/FAIL/);assert.equal(await page.frameLocator('#work-preview').locator('h1').innerText(),'My first build');
await page.click('#work-reset');assert.equal(await page.locator('#work-exit').innerText(),'exit 0');await page.fill('#editor-text','<h1>Unsaved draft</h1>');await page.selectOption('#editor-file','Makefile');await page.selectOption('#editor-file','src/index.html');assert.equal(await page.locator('#editor-text').inputValue(),'<h1>Unsaved draft</h1>');await page.click('#work-reset');await page.screenshot({path:'/private/tmp/arise-workflow.png',fullPage:true});
await page.click('#tab-network');await page.click('#next');assert.equal(await page.locator('#step-count').innerText(),'2 / 11');assert.equal(await page.locator('#travel').evaluate(e=>getComputedStyle(e).animationPlayState),'running');
await page.setViewportSize({width:390,height:844});for(const id of ['foundations','shell','workflow','network']){await page.click('#tab-'+id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow on '+id);}
await page.click('#tab-shell');await page.screenshot({path:'/private/tmp/arise-mobile.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('Passed: API create/read/validation/auth, shell pipeline and Zsh errors, save/build/skip/serve and failed test, original network animation, and all four mobile layouts.');
}finally{await browser.close();}
