import {chromium} from '/Users/aj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));await page.goto('http://127.0.0.1:8765/#workflow');
 const run=async command=>{await page.fill('#work-command',command);await page.locator('#work-command').press('Enter');};
 const save=async(file,text)=>{await page.selectOption('#editor-file',file);await page.fill('#editor-text',text);await page.click('#editor-save');};
 const done=async index=>assert.equal(await page.locator(`[data-work-scenario="${index}"]`).evaluate(button=>button.classList.contains('done')),true);
 await page.locator('[data-work-scenario="0"]').waitFor();
 assert.deepEqual(await page.locator('[data-editor-file]').evaluateAll(buttons=>buttons.map(button=>button.dataset.editorFile)),['scripts/hello.sh','README.md']);assert.equal(await page.locator('[data-work-scenario]').count(),5);
 assert.equal(await page.locator('#editor-file').inputValue(),'scripts/hello.sh');
 await page.click('#work-hint');assert.match(await page.locator('#work-hint-code').innerText(),/Hello Ariser!/);
 await run('sh scripts/hello.sh');assert.equal(await page.locator('#work-scenarios .done').count(),0);
 await save('scripts/hello.sh','#!/bin/sh\necho "Hello Ariser!"\n');await run('sh scripts/hello.sh');await done(0);
 await page.click('#work-next');assert.deepEqual(await page.locator('[data-editor-file]').evaluateAll(buttons=>buttons.map(button=>button.dataset.editorFile)),['Makefile','scripts/hello.sh','README.md']);await save('Makefile','.PHONY: hello\nhello:\n\tsh scripts/hello.sh\n');await run('make hello');await done(1);
 await page.click('#work-next');await save('src/index.html','<h1>Hello Ariser!</h1>');await run('make build');await run('make build');await run('make serve');await done(2);assert.equal(await page.frameLocator('#work-preview').locator('h1').innerText(),'Hello Ariser!');
 await page.click('#work-next');await run('bun run test');assert.equal(await page.locator('#work-scenarios .done').count(),3);await save('src/index.html','<p>broken</p>');await run('bun run test');assert.match(await page.locator('#work-output').innerText(),/FAIL/);await save('src/index.html','<h1>Fixed</h1>');await run('bun run test');await done(3);
 await page.click('#work-next');await save('Makefile','.PHONY: dev\ndev:\n\tbun run format\n\tbun run test\n\tbun run start\n');await run('make dev');assert.match(await page.locator('#work-feedback').innerText(),/chain succeeded/);
 await page.selectOption('#editor-file','src/index.html');assert.ok(!(await page.locator('#editor-text').inputValue()).split('\n').some(line=>/[\t ]+$/.test(line)));
 await save('src/index.html','<p>No heading</p>   ');await run('make dev');await done(4);assert.match(await page.locator('#work-feedback').innerText(),/All five/);
 await page.click('[data-work-scenario="0"]');assert.equal(await page.locator('#work-scenarios .done').count(),5);assert.doesNotMatch(await page.locator('#editor-text').inputValue(),/echo/);
 await page.click('#work-restart');assert.equal(await page.locator('#work-scenarios .done').count(),4);
 await page.screenshot({path:'/private/tmp/workflow-scenarios.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});for(let i=0;i<5;i++){await page.click(`[data-work-scenario="${i}"]`);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}await page.screenshot({path:'/private/tmp/workflow-scenarios-mobile.png',fullPage:true});
 await page.click('#work-reset');assert.equal(await page.locator('#work-scenarios .done').count(),0);assert.equal(await page.locator('#editor-file').inputValue(),'scripts/hello.sh');assert.deepEqual(errors,[]);
 console.log('Passed all five scenarios, hints, independent starters, completion, formatting, chain failure, restart/reset, and mobile layouts.');
}finally{await browser.close();}
