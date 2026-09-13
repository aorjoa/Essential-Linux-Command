import {runEnv} from './env-model.mjs';
const initial={'.env':'APP_NAME="Arise Notes"\nPORT=3000\nDEMO_TOKEN=practice-only\n','.env.local':'# Uncomment to override the base port.\n# PORT=4000\n','.env.example':'APP_NAME="My app"\nPORT=3000\nDEMO_TOKEN=\n','.gitignore':'.env\n.env.*\n!.env.example\n',
'app.ts':`const name = process.env.APP_NAME;
const port = Number(process.env.PORT ?? 3000);
if (!name) throw new Error("APP_NAME is required.");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535.");
}
console.log("App:", name);
console.log("Port:", port);
console.log("Port type:", typeof process.env.PORT);
console.log("Demo token:", process.env.DEMO_TOKEN ? "configured" : "missing");
`};
const commands=[
 {text:'bun run app.ts',mode:'auto',description:'Load .env and .env.local automatically.'},
 {text:'bun --env-file=.env.example run app.ts',mode:'custom',description:'Load the shared example file explicitly.'},
 {text:'bun run --no-env-file app.ts',mode:'off',description:'Start without loading environment files.'}
];
const examples=[
 {id:'run',title:'Load the defaults',file:'.env',command:0,steps:['Read APP_NAME and PORT in .env.','Run the app with automatic loading.'],expected:'App: Arise Notes · Port: 3000 · Source: .env'},
 {id:'edit',title:'Change a setting',file:'.env',command:0,steps:['Change PORT=3000 to PORT=3500 in .env.','Save the file, then run the app.'],expected:'Port: 3500 · Source: .env'},
 {id:'local',title:'Override locally',file:'.env.local',command:0,steps:['Uncomment PORT=4000 in .env.local.','Save the file, then run the app. Compare the source column.'],expected:'Port: 4000 · Source: .env.local'},
 {id:'custom',title:'Choose an explicit file',file:'.env.example',command:1,steps:['Read the placeholders in .env.example.','Run with --env-file=.env.example.'],expected:'App: My app · Port: 3000 · Demo token: missing'},
 {id:'missing',title:'Handle missing settings',file:'app.ts',command:2,steps:['Read the APP_NAME validation in app.ts.','Run with --no-env-file to skip configuration loading.'],expected:'Error: APP_NAME is required. · exit 1'}
];
export function mountEnvLesson({panel,intro,windowDots}){
 const p=panel('dotenv',intro('05','One app. Different settings.','Keep configuration in a .env file, then read it when your Bun app starts.','10 MIN')+`
<div class="learning-grid"><div><div class="ide-window"><div class="ide-titlebar">${windowDots}<span class="window-title">config-lab — Arise Code</span><span class="simulation-badge">SIMULATION</span><button id="env-reset" class="secondary">Reset lesson</button></div><div class="ide-workspace"><nav class="file-explorer" aria-label="Configuration files"><div class="explorer-heading">EXPLORER</div><div class="project-folder">⌄ CONFIG-LAB</div>${Object.keys(initial).map(name=>`<button data-env-file="${name}"><span class="file-icon">${name==='app.ts'?'TS':'⋮'}</span>${name}</button>`).join('')}</nav><div class="editor-grid env-workspace"><div class="editor"><div class="editor-toolbar"><select id="env-file" aria-label="Configuration file"><option>.env</option><option>.env.local</option><option>app.ts</option><option>.gitignore</option><option>.env.example</option></select><button id="env-save" class="primary">Save file</button></div><div id="env-breadcrumb" class="editor-breadcrumb">config-lab / .env</div><div class="editor-code"><pre id="env-lines" class="editor-lines" aria-hidden="true">1</pre><textarea id="env-editor" aria-label="Configuration contents" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea></div><div id="env-save-state" class="editor-status" aria-live="polite"></div></div><div class="preview-box env-preview simulated-browser" aria-label="Bun configuration preview"><div class="browser-tabs">${windowDots}<span class="browser-tab"><span class="tab-favicon" aria-hidden="true">↗</span> Configuration preview</span><span class="browser-sim-label">SIMULATED RUNTIME</span></div><div class="browser-toolbar"><button id="env-reload" class="secondary" aria-label="Run configuration again" title="Run saved configuration again">↻</button><div class="browser-address">app.ts · Bun</div></div><div id="env-values" class="preview-placeholder" aria-live="polite"></div><div class="editor-status" id="env-preview-status">No run yet</div></div></div></div><div class="workflow-terminal"><div class="terminal"><div class="terminal-bar"><span class="terminal-tab">TERMINAL</span><span>bun</span></div><pre id="env-output" class="terminal-output" role="log" aria-label="Bun output">Ready. Type bun run app.ts to start.</pre><form id="env-run-form" class="term-form"><span class="terminal-prompt" aria-hidden="true">❯</span><input id="env-command" aria-label="Bun command" value="bun run app.ts" placeholder="bun run app.ts" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="terminal-run" type="submit">Run ↵</button></form><div class="terminal-details"><span>/home/learner/config-lab</span><span id="env-exit">exit 0</span></div></div></div></div><section class="env-commands" aria-labelledby="env-commands-title"><h3 id="env-commands-title">Supported commands</h3><p>Select a command to place it in the terminal, then press Run.</p><div>${commands.map((command,i)=>`<button data-env-command="${i}"><code>${command.text}</code><span>${command.description}</span></button>`).join('')}</div></section><p class="env-note">This exercise models .env and .env.local with literal values, comments, and single-line quotes. It does not run Bun, load your computer’s environment, or simulate variable expansion and mode-specific files.</p></div>
<aside class="lab-card env-practice"><div class="eyebrow">PRACTICES SESSION</div><h2>One example at a time.</h2><div class="task-picker" id="env-examples" aria-label="Practice examples">${examples.map((example,i)=>`<button data-env-example="${i}">${i+1}. ${example.title}</button>`).join('')}</div><p class="env-note">Selecting an example restores its starting files. Your completed examples stay marked.</p><section class="env-example-detail" aria-labelledby="env-example-title"><div id="env-example-progress" class="eyebrow"></div><h3 id="env-example-title"></h3><ol id="env-example-steps"></ol><div class="challenge"><strong>Expected result</strong><p id="env-example-expected"></p></div><p id="env-feedback" aria-live="polite"></p><div class="lesson-controls"><button id="env-example-restart" class="secondary">Restart example</button><button id="env-example-next" class="secondary">Next example →</button></div></section></aside></div>
<div class="reference-row"><article><h3>What is dotenv?</h3><p>A .env file stores KEY=value settings. Bun loads it automatically; the dotenv npm package is unnecessary for this.</p><p>Read values with <code>process.env.PORT</code> or <code>Bun.env.PORT</code>. Values are strings; absent keys are undefined. Convert and validate numbers before using them.</p><p>Here, .env.local overrides .env. Bun also supports mode-specific files; see the full loading order in the docs.</p></article><article><h3>Keep private settings private</h3><p>A leading dot makes a file hidden in ordinary listings. It does not encrypt its contents.</p><p>Inspect .gitignore: it excludes local configuration while allowing .env.example. Share placeholders in that example, not credentials. Git ignores do not remove files already tracked.</p><p>Keep secrets in server code. Sending a value to a browser makes it visible to that browser’s user. This lab uses only a fake demo token and never prints its value.</p></article><article><h3>Try it in a real project</h3><p>With Bun installed, put app.ts and .env in your project folder. Run <code>bun run app.ts</code> there.</p><p><code>--env-file</code> selects an explicit file; <code>--no-env-file</code> disables automatic loading. The two commands in this lab let you compare those cases.</p><a href="https://bun.com/docs/runtime/environment-variables" target="_blank" rel="noopener noreferrer">Bun environment variable documentation ↗</a></article></div>`);
 const get=id=>p.querySelector('#'+id);
 function resetPreview(){get('env-values').className='preview-placeholder';get('env-values').innerHTML='<span class="preview-empty-icon" aria-hidden="true">▤</span><strong>Your settings will appear here</strong><span>Run <code>bun run app.ts</code> in the terminal to inspect the configuration.</span>';get('env-preview-status').textContent='No run yet';}
 get('env-reload').addEventListener('click',()=>{get('env-command').value=commands[examples[exampleIndex].command].text;get('env-run-form').requestSubmit();});let files={...initial},drafts={},file='.env';const done=new Set();const commandHistory=[];let historyIndex=0,exampleIndex=0;
 function renderExample(){
  const example=examples[exampleIndex];
  p.querySelectorAll('[data-env-example]').forEach((button,i)=>{button.classList.toggle('selected',i===exampleIndex);button.classList.toggle('done',done.has(examples[i].id));button.setAttribute('aria-pressed',String(i===exampleIndex));});
  get('env-example-progress').textContent=`Example ${exampleIndex+1} of ${examples.length} · ${done.size} complete`;
  get('env-example-title').textContent=example.title;
  get('env-example-steps').replaceChildren(...example.steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  get('env-example-expected').textContent=example.expected;
  get('env-example-next').disabled=exampleIndex===examples.length-1;
 }
 function startExample(index){
  exampleIndex=index;const example=examples[index];files={...initial};drafts={};file=example.file;
  get('env-file').value=file;get('env-command').value=commands[example.command].text;
  commandHistory.length=0;historyIndex=0;get('env-exit').textContent='exit 0';resetPreview();
  get('env-output').textContent='Ready. '+example.title+'.';get('env-feedback').textContent='Follow the steps, then compare your result.';
  renderExample();load();
 }
 p.querySelectorAll('[data-env-example]').forEach(button=>button.addEventListener('click',()=>startExample(Number(button.dataset.envExample))));
 p.querySelectorAll('[data-env-command]').forEach(button=>button.addEventListener('click',()=>{get('env-command').value=commands[Number(button.dataset.envCommand)].text;get('env-command').focus();}));
 get('env-example-restart').addEventListener('click',()=>{done.delete(examples[exampleIndex].id);startExample(exampleIndex);});
 get('env-example-next').addEventListener('click',()=>{if(exampleIndex<examples.length-1)startExample(exampleIndex+1);});
 function syncEditor(){const editor=get('env-editor');get('env-lines').textContent=Array.from({length:editor.value.split('\n').length},(_,i)=>i+1).join('\n');get('env-lines').scrollTop=editor.scrollTop;get('env-breadcrumb').textContent='config-lab / '+file;p.querySelectorAll('[data-env-file]').forEach(b=>{b.classList.toggle('active',b.dataset.envFile===file);b.setAttribute('aria-pressed',String(b.dataset.envFile===file));});}
 function load(){get('env-editor').value=drafts[file]??files[file];get('env-editor').readOnly=['app.ts','.gitignore','.env.example'].includes(file);get('env-save').disabled=get('env-editor').readOnly;get('env-save-state').textContent=get('env-editor').readOnly?'Reference file · read only':Object.hasOwn(drafts,file)?'Unsaved changes':'Saved virtual file';syncEditor();}
 p.querySelectorAll('[data-env-file]').forEach(b=>b.addEventListener('click',()=>{get('env-file').value=b.dataset.envFile;file=b.dataset.envFile;load();}));
 get('env-editor').addEventListener('scroll',syncEditor);
 get('env-editor').addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(!get('env-editor').readOnly)get('env-save').click();}if(e.key==='Escape')get('env-save').focus();if(e.key==='Tab'&&!get('env-editor').readOnly){e.preventDefault();const t=e.target;t.setRangeText('\t',t.selectionStart,t.selectionEnd,'end');t.dispatchEvent(new Event('input'));}});
 get('env-command').addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.max(0,Math.min(commandHistory.length,historyIndex+(e.key==='ArrowUp'?-1:1)));e.target.value=commandHistory[historyIndex]||'';}});
 get('env-file').addEventListener('change',e=>{file=e.target.value;load();});
 get('env-editor').addEventListener('input',()=>{drafts[file]=get('env-editor').value;get('env-save-state').textContent='Unsaved changes · save before running';syncEditor();});
 get('env-save').addEventListener('click',()=>{files[file]=get('env-editor').value;delete drafts[file];load();});
 get('env-run-form').addEventListener('submit',e=>{
  e.preventDefault();const command=get('env-command').value.trim().replace(/\s+/g,' ');if(!command)return;commandHistory.push(command);historyIndex=commandHistory.length;get('env-command').value='';const mode=commands.find(item=>item.text===command)?.mode;
  if(!mode){get('env-output').textContent+='\n$ '+command+'\nSupported commands:\nbun run app.ts\nbun --env-file=.env.example run app.ts\nbun run --no-env-file app.ts\n';get('env-exit').textContent='exit 2';return;}
  try{
   const result=runEnv(files,mode);get('env-values').replaceChildren();get('env-values').className='env-preview-values';get('env-preview-status').textContent=result.error?'Configuration error':'Values seen by app.ts · saved files';
   const table=document.createElement('table');table.className='env-table';const head=table.createTHead().insertRow();for(const title of ['Variable','Value','Source']){const th=document.createElement('th');th.textContent=title;head.append(th);}
   for(const key of ['APP_NAME','PORT','DEMO_TOKEN']){const row=table.insertRow();for(const text of [key,key==='DEMO_TOKEN'?(result.env[key]?'configured':'missing'):result.env[key]??'undefined',result.sources[key]??'not set']){row.insertCell().textContent=text;}}get('env-values').append(table);
   get('env-output').textContent+='\n$ '+command+'\n'+(result.error?'Error: '+result.error+'\nexit 1':`App: ${result.env.APP_NAME}\nPort: ${result.port}\nPort type: ${typeof result.env.PORT}\nDemo token: ${result.env.DEMO_TOKEN?'configured':'missing'}\nexit 0`);
   get('env-exit').textContent='exit '+(result.error?1:0);get('env-output').scrollTop=get('env-output').scrollHeight;
   const passed={run:!result.error&&mode==='auto'&&result.port===3000&&result.env.APP_NAME==='Arise Notes'&&result.sources.PORT==='.env',edit:!result.error&&mode==='auto'&&result.port===3500&&result.sources.PORT==='.env',local:!result.error&&mode==='auto'&&result.port===4000&&result.sources.PORT==='.env.local',custom:!result.error&&mode==='custom',missing:mode==='off'&&Boolean(result.error)}[examples[exampleIndex].id];
   if(passed)done.add(examples[exampleIndex].id);renderExample();
   get('env-feedback').textContent=(Object.keys(drafts).length?'Unsaved edits were not used. ':'')+(passed?(done.size===examples.length?'All examples complete!':'Example complete! Compare the result, then choose the next example.'):'Not quite yet. Follow this example’s steps and compare the expected result.');
  }catch(error){get('env-exit').textContent='exit 1';get('env-values').textContent='Configuration could not be loaded.';get('env-preview-status').textContent='Configuration error';get('env-output').textContent+='\n$ '+command+'\n'+error.message+'\nexit 1';get('env-feedback').textContent='Fix the saved configuration and run again.';}
 });
 get('env-reset').addEventListener('click',()=>{done.clear();startExample(0);});startExample(0);
}
