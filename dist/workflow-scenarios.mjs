export const workflowScenarios = [
  {id:'hello',projectName:'try-shell-hello',title:'Hello, shell',file:'scripts/hello.sh',steps:[
    'Create your first shell script: add echo "Hello Ariser!" below the comment.',
    'Save the file and run sh scripts/hello.sh.'
  ],hint:'#!/bin/sh\necho "Hello Ariser!"\n',commands:['sh scripts/hello.sh'],expected:'Hello Ariser!'},
  {id:'recipe',projectName:'try-make-hello',title:'Run a script with Make',file:'Makefile',steps:[
    'The greeting script is ready. Replace the hello target’s echo recipe with sh scripts/hello.sh.',
    'Start the recipe with a TAB, save, and run make hello.'
  ],hint:'.PHONY: hello\nhello:\n\tsh scripts/hello.sh\n',commands:['make hello','cat scripts/hello.sh'],expected:'Make runs the shell script and prints Hello Ariser!'},
  {id:'serve',projectName:'try-bun-server',title:'Build and serve with Bun',file:'src/index.html',steps:[
    'Change the page’s <h1> heading and save src/index.html.',
    'Run make build twice. The second run should skip unchanged work.',
    'Run make serve to open your page in the browser preview.'
  ],hint:'make build\nmake build\nmake serve',commands:['make build','make serve','bun run start'],expected:'The preview shows your saved heading. Bun serves the built HTML.'},
  {id:'test',projectName:'try-bun-test',title:'Break and fix a test',file:'src/index.html',steps:[
    'Remove the <h1> heading, save, and run bun run test. Read the FAIL message.',
    'Restore a non-empty <h1>, save, and run the same test again.'
  ],hint:'<h1>Hello Ariser!</h1>\n',commands:['bun run test','make test'],expected:'First FAIL, then PASS. A nonzero exit status signals a failed test.'},
  {id:'chain',projectName:'try-bun-chain',title:'Format, test, then serve',file:'Makefile',steps:[
    'Add three TAB-indented recipe lines to the dev target: bun run format, bun run test, then bun run start. Save the Makefile.',
    'Run make dev. Make runs each recipe line in order: formatting removes trailing whitespace, then tests pass before the server starts.',
    'Try the failure case: remove the HTML heading, save, and rerun make dev. Make stops at the failed test and skips the server.'
  ],hint:'.PHONY: dev\ndev:\n\tbun run format\n\tbun run test\n\tbun run start\n',commands:['make dev'],expected:'Success: Formatted → PASS → serving. Failure: FAIL, with no new build or server start.'}
];
const scenarioPaths=[
  ['scripts/hello.sh'],
  ['Makefile','scripts/hello.sh'],
  ['src/index.html','Makefile','package.json','scripts/build.js','scripts/serve.js','scripts/start.js'],
  ['src/index.html','package.json','scripts/check.js','Makefile'],
  ['Makefile','src/index.html','package.json','scripts/format.js','scripts/format-text.js','scripts/check.js','scripts/build.js','scripts/serve.js','scripts/start.js']
];
const makefiles={
  1:'.PHONY: hello\nhello:\n\techo "Replace this recipe with sh scripts/hello.sh"\n',
  2:'.PHONY: build serve\nbuild: dist/index.html\n\ndist/index.html: src/index.html scripts/build.js\n\tbun scripts/build.js\n\nserve: build\n\tbun scripts/serve.js\n',
  3:'.PHONY: test\ntest:\n\tbun scripts/check.js\n',
  4:'.PHONY: dev\ndev:\n\t# Add format, test, and start recipe lines here.\n'
};
const packageScripts={
  2:{build:'bun scripts/build.js',start:'bun scripts/start.js'},
  3:{test:'bun scripts/check.js'},
  4:{format:'bun scripts/format.js',test:'bun scripts/check.js',build:'bun scripts/build.js',start:'bun scripts/start.js'}
};
export function scenarioFiles(base,index) {
  const scenario=workflowScenarios[index];
  if(!scenario)throw new Error('Unknown workflow scenario.');
  const files=Object.fromEntries(scenarioPaths[index].map(path=>[path,base[path]]));
  if(makefiles[index])files.Makefile=makefiles[index];
  if(packageScripts[index])files['package.json']=JSON.stringify({name:scenario.projectName,version:'1.0.0',private:true,type:'module',scripts:packageScripts[index]},null,2)+'\n';
  if(index===1)files['scripts/hello.sh']='#!/bin/sh\necho "Hello Ariser!"\n';
  if(index===4)files['src/index.html']=files['src/index.html'].replace('<h1>','  <h1>').replace('</h1>','</h1>   ')+'\n\n';
  for(const path of ['src/index.html','scripts/serve.js'])if(files[path])files[path]=files[path].replaceAll('try-makefile',scenario.projectName);
  const setup=index<2?'Use sh on macOS, Linux, WSL, or Git Bash. No Bun or package installation is needed.': 'Install Bun (https://bun.com/docs/installation). No external packages or install step are needed.';
  const extra=index===1?'Make must also be installed. Recipe lines start with a TAB.':index===2?'Make is optional: bun run start builds and serves without Make. Open http://127.0.0.1:3000. Edit the source, run make build in another terminal, then refresh. Ctrl+C stops the server.':index===3?'Make is optional: bun run test runs the check directly. A non-empty <h1> passes; a missing heading exits with status 1.':index===4?'Make must be installed. Recipe lines start with a TAB; Make stops if a line fails. Run make dev. Keep the server last: it runs until Ctrl+C. Open http://127.0.0.1:3000. The formatter removes trailing whitespace, normalizes line endings, and adds one final newline; it does not re-indent HTML.':'Run sh scripts/hello.sh; executable permissions are not required.';
  files['README.md']=`# ${scenario.projectName} — ${scenario.title}\n\nThis download contains only scenario ${index+1} and its required files.\n\n## Run locally\n\nExtract the ZIP and open a terminal in the ${scenario.projectName} folder. ${setup}\n\n${scenario.steps.map((step,i)=>`${i+1}. ${step}`).join('\n')}\n\nCommands:\n\n\`\`\`sh\n${scenario.commands.join('\n')}\n\`\`\`\n\n${extra}\n\n## Files\n\n${Object.keys(files).map(path=>'- '+path).join('\n')}\n- README.md: these instructions.\n\nCurrent saved files, generated files, and unsaved drafts are included. Downloading does not save drafts in the lesson. The browser simulates commands; downloaded shell and Bun scripts run locally. Exercise scripts may still need the edits described above.\n`;
  for(const [path,text] of Object.entries(files))if(typeof text!=='string')throw new Error('Missing scenario file: '+path);
  return files;
}
