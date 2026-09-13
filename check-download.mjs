import {chromium} from '/Users/aj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {WORKFLOW_FILES} from './dist/workflow-project.mjs';
import {scenarioFiles,workflowScenarios} from './dist/workflow-scenarios.mjs';
const base=Object.fromEntries(await Promise.all(WORKFLOW_FILES.map(async path=>[path,await readFile(new URL('./dist/projects/try-makefile/'+path,import.meta.url),'utf8')])));
const temp=await mkdtemp(join(tmpdir(),'try-makefile-download-'));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const bun=process.env.BUN||'bun';let server;
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));await page.goto('http://127.0.0.1:8765/#workflow');
 assert.equal(await page.locator('#work-download').evaluate(button=>button.nextElementSibling.id),'work-reset');
 async function download(folder){
  const pending=page.waitForEvent('download');await page.click('#work-download');const result=await pending;
  const name=workflowScenarios[Number(await page.locator('[data-work-scenario][aria-pressed="true"]').getAttribute('data-work-scenario'))].projectName;
  assert.equal(result.suggestedFilename(),name+'.zip');const zip=join(temp,folder+'.zip');await result.saveAs(zip);
  execFileSync('unzip',['-t',zip]);execFileSync('unzip',['-q',zip,'-d',join(temp,folder)]);return join(temp,folder,name);
 }
 const roots=[];
 for(let i=0;i<5;i++){
  await page.click(`[data-work-scenario="${i}"]`);const expected=scenarioFiles(base,i),paths=Object.keys(expected),name=workflowScenarios[i].projectName;
  assert.equal(await page.locator('#work-project-title').innerText(),name+' — Arise Code');assert.equal(await page.locator('#work-project-folder').innerText(),'⌄ '+name.toUpperCase());assert.equal(await page.locator('#work-cwd').innerText(),'/home/learner/'+name);assert.ok((await page.locator('#editor-breadcrumb').innerText()).startsWith(name+' / '));
  if(expected['package.json'])assert.equal(JSON.parse(expected['package.json']).name,name);assert.ok(expected['README.md'].startsWith('# '+name+' — '));
  assert.deepEqual(await page.locator('[data-editor-file]').evaluateAll(buttons=>buttons.map(button=>button.dataset.editorFile)),paths);
  assert.deepEqual(await page.locator('#editor-file option').evaluateAll(options=>options.map(option=>option.value)),paths);
  const root=await download('scenario-'+i);roots.push(root);
  const actual=(await readdir(root,{recursive:true,withFileTypes:true})).filter(entry=>entry.isFile()).map(entry=>join(entry.parentPath,entry.name).slice(root.length+1));
  assert.deepEqual(actual.sort(),paths.sort());
  for(const [file,text] of Object.entries(expected))assert.equal(await readFile(join(root,file),'utf8'),text);
 }
 const run=(root,command,args=[])=>execFileSync(command,args,{cwd:root,encoding:'utf8',stdio:'pipe'});
 await writeFile(join(roots[0],'scripts/hello.sh'),'#!/bin/sh\necho "Hello Ariser!"\n');assert.equal(run(roots[0],'sh',['scripts/hello.sh']),'Hello Ariser!\n');
 await writeFile(join(roots[1],'Makefile'),'.PHONY: hello\nhello:\n\tsh scripts/hello.sh\n');assert.match(run(roots[1],'make',['hello']),/Hello Ariser!/);
 const webRoot=roots[2];assert.match(run(webRoot,bun,['run','build']),/Built/);assert.match(run(webRoot,'make',['build']),/up to date|Nothing to be done/);
 const testRoot=roots[3];assert.match(run(testRoot,bun,['run','test']),/PASS/);await writeFile(join(testRoot,'src/index.html'),'<p>Broken</p>');assert.throws(()=>run(testRoot,'make',['test']),error=>error.status!==0&&/FAIL/.test(error.stdout));
 const chainRoot=roots[4];await writeFile(join(chainRoot,'Makefile'),'.PHONY: dev\ndev:\n\tbun run format\n\tbun run test\n\tbun run start\n');
 async function serve(root,command,args){
  server=spawn(command,args,{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe'],detached:true});
  const url=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Bun server did not start')),10000);let output='';
   server.on('error',error=>{clearTimeout(timer);reject(error);});server.on('exit',code=>{clearTimeout(timer);reject(Error('Server exited: '+code+' '+output));});
   server.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});server.stderr.on('data',chunk=>{output+=chunk;});
  });
  assert.match(await (await fetch(url)).text(),root===webRoot?/Hello, try-bun-server!/:/Hello, try-bun-chain!/);assert.equal((await fetch(url+'missing')).status,404);
  process.kill(-server.pid,'SIGTERM');await new Promise(resolve=>server.once('exit',resolve));server=null;
 }
 await serve(webRoot,bun,['run','start']);await serve(chainRoot,'make',['dev']);
 const built=await readFile(join(chainRoot,'dist/index.html'),'utf8');await writeFile(join(chainRoot,'src/index.html'),'<p>Broken</p>   ');
 assert.throws(()=>execFileSync('make',['dev'],{cwd:chainRoot,encoding:'utf8',stdio:'pipe',timeout:5000}),error=>error.status!==0&&/Formatted[\s\S]*FAIL/.test(error.stdout)&&!/Built|running at/.test(error.stdout));assert.equal(await readFile(join(chainRoot,'dist/index.html'),'utf8'),built);
 await page.click('[data-work-scenario="2"]');await page.fill('#editor-text','<h1>Saved page</h1>');await page.click('#editor-save');await page.fill('#work-command','make serve');await page.locator('#work-command').press('Enter');
 await page.fill('#editor-text','<h1>Unsaved café 🌱</h1>');await page.selectOption('#editor-file','Makefile');await page.fill('#editor-text',(await page.locator('#editor-text').inputValue())+'\n# draft\n');
 await page.fill('#work-command','echo "extra café" > extra.txt');await page.locator('#work-command').press('Enter');assert.equal(await page.locator('[data-editor-file="extra.txt"]').count(),1);assert.equal(await page.locator('[data-editor-file="dist/index.html"]').count(),1);
 const edited=await download('edited');assert.equal(await readFile(join(edited,'src/index.html'),'utf8'),'<h1>Unsaved café 🌱</h1>');assert.match(await readFile(join(edited,'Makefile'),'utf8'),/# draft/);assert.equal(await readFile(join(edited,'dist/index.html'),'utf8'),'<h1>Saved page</h1>');assert.equal(await readFile(join(edited,'extra.txt'),'utf8'),'extra café\n');
 await page.click('[data-work-scenario="0"]');assert.equal(await page.locator('[data-editor-file="extra.txt"]').count(),0);assert.equal(await page.locator('[data-editor-file="src/index.html"]').count(),0);
 await page.click('[data-editor-file="README.md"]');assert.match(await page.locator('#editor-text').inputValue(),/No Bun/);
 await page.screenshot({path:'/private/tmp/scoped-workflow.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('Passed exact explorer/dropdown/ZIP contents for all five scenarios, native shell/Make/Bun execution, chaining, drafts, generated files, and scenario isolation.');
}finally{if(server){try{process.kill(-server.pid,'SIGTERM');}catch(error){if(error.code!=='ESRCH')throw error;}}await browser.close();await rm(temp,{recursive:true,force:true});}
