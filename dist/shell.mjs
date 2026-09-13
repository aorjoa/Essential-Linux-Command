import {formatText} from './projects/try-makefile/scripts/format-text.js';
// A deliberately bounded teaching model. Commands never reach the host OS.
export const MAKEFILE = `.PHONY: all build test serve clean
all: test build

build: dist/index.html

dist/index.html: src/index.html
\tmkdir -p dist
\tcp src/index.html dist/index.html

test:
\tnode scripts/check.js

serve: build
\tpreview dist/index.html

clean:
\tremove-build
`;
export class Shell {
 constructor({projectName='project',files=null}={}){this.projectName=projectName;this.initialFiles=files;this.reset();}
 reset(){
  this.cwd='/home/learner/'+this.projectName;this.projectRoot=this.cwd;this.home='/home/learner';this.shell='bash';this.env={HOME:this.home,USER:'learner',SHELL:'/bin/bash'};this.vars={};this.files=new Map();this.dirs=new Set(['/','/home',this.home,this.cwd,this.cwd+'/src',this.cwd+'/scripts']);this.clock=1;this.history=[];this.served=false;this.events=[];this.scriptStack=[];this.makeActive=false;
  if(this.initialFiles){
   for(const [path,text] of Object.entries(this.initialFiles)){const parts=path.split('/');parts.pop();let dir=this.projectRoot;for(const part of parts){dir+='/'+part;this.dirs.add(dir);}this.write(path,text);}
   return;
  }
  this.write('src/index.html','<h1>Hello, Arise!</h1>\n<p>Built from a source file.</p>\n');
  this.write('README.md','Arise practice project\nEdit src/index.html, then run make.\n');
  this.write('access.log','200 GET /\n200 GET /style.css\n404 GET /missing\n200 GET /api/notes\n');
  this.write('notes.txt','DNS finds an address.\nHTTP carries messages.\nTLS encrypts the connection.\n');
  this.write('Makefile',MAKEFILE);this.write('scripts/check.js',"// Teaching check: source must contain a non-empty <h1>.\n// Simulated by this lesson; arbitrary JavaScript is not executed.\n");
  this.write('../.bashrc','# Bash interactive configuration\n');this.write('../.zshrc','# Zsh interactive configuration\n');
 }
 path(value='.'){const raw=value==='~'?this.home:value.startsWith('~/')?this.home+value.slice(1):value;const parts=(raw.startsWith('/')?raw:this.cwd+'/'+raw).split('/'),out=[];for(const p of parts){if(p==='..')out.pop();else if(p&&p!=='.')out.push(p);}return '/'+out.join('/');}
 read(path){const f=this.files.get(this.path(path));if(!f)throw Error(`${path}: no such file`);return f.text;}
 write(path,text){const p=this.path(path),parent=p.slice(0,p.lastIndexOf('/'))||'/';if(!this.dirs.has(parent))throw Error(`${parent}: no such directory`);if(this.dirs.has(p))throw Error(`${path}: is a directory`);if(text.length>50000)throw Error('Simulation limit: files may contain up to 50,000 characters.');this.files.set(p,{text,time:++this.clock});}
 children(path=this.cwd,hidden=false){const p=this.path(path),prefix=p==='/'?'/':p+'/';if(!this.dirs.has(p))throw Error(`${path}: no such directory`);return [...new Set([...this.dirs,...this.files.keys()].filter(x=>x.startsWith(prefix)&&x!==p).map(x=>x.slice(prefix.length).split('/')[0]))].filter(x=>hidden||!x.startsWith('.')).sort();}
 lex(line){
  const tokens=[];let value='',quote='',started=false,literal=false;
  const emit=()=>{if(started)tokens.push({value,literal});value='';started=false;literal=false;};
  for(let i=0;i<line.length;i++){
   const c=line[i];
   if(c===quote&&quote){quote='';continue;}
   if(!quote&&(c==='"'||c==="'")){quote=c;started=true;literal=true;continue;}
   if(c==='\\'&&quote!=="'"){if(i+1>=line.length)throw Error('A trailing backslash needs another character.');value+=line[++i];started=true;literal=true;continue;}
   if(c==='$'&&quote!=="'"){
    if(line[i+1]==='(')throw Error('Command substitution is outside this introductory simulator.');
    const match=line.slice(i+1).match(/^(?:\{([A-Za-z_][\w]*)\}|([A-Za-z_][\w]*))/);
    if(match){const expansion=this.vars[match[1]||match[2]]??this.env[match[1]||match[2]]??'';i+=match[0].length;
     if(!quote&&this.shell==='bash'){const parts=expansion.split(/\s+/);value+=parts.shift()||'';started=started||!!value;for(const part of parts){emit();value=part;started=!!part;}}else{value+=expansion;started=true;}continue;}
   }
   if(!quote&&/\s/.test(c)){emit();continue;}
   if(!quote&&['|','>'].includes(c)){emit();let op=c;if(line[i+1]===c){op+=c;i++;}tokens.push({op});continue;}
   if(!quote&&c==='&'&&line[i+1]==='&'&&this.initialFiles){emit();tokens.push({op:'&&'});i++;continue;}
   if(!quote&&[';','&','<','`'].includes(c))throw Error('This simulator supports one command or pipeline, with > or >>. Compound commands and substitutions are not supported.');
   value+=c;started=true;
  }
  if(quote)throw Error('Unclosed quote. Add the matching quote and try again.');emit();return tokens;
 }
 expand(token){
  const v=token.value;if(token.literal||!v.includes('*'))return [v];
  const split=v.lastIndexOf('/'),dir=split<0?'.':v.slice(0,split)||'/',pattern=v.slice(split+1);
  const re=new RegExp('^'+pattern.split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+'$');
  const matches=this.children(dir,pattern.startsWith('.')).filter(n=>re.test(n)).map(n=>split<0?n:v.slice(0,split+1)+n);
  if(!matches.length&&this.shell==='zsh')throw Error(`zsh: no matches found: ${v}`);return matches.length?matches:[v];
 }
 run(line){
  if(!line.trim())return {output:'',code:0};if(line.length>2000)return {output:'Command is too long for this simulator.',code:2};
  this.history.push(line);let output='',code=0;
  try{
   const result=this.executeLine(line);output=result.output;code=result.code;
  }catch(e){output=e.message+'\n';code=2;}
  const result={output,code};this.events.push({line,...result});return result;
 }
 executeLine(line){
  // Expand variables only when each command in an AND-list actually runs.
  const commands=[];let start=0,quote='';
  for(let i=0;i<line.length;i++){
   const c=line[i];
   if(c==='\\'&&quote!=="'"){i++;continue;}
   if(quote){if(c===quote)quote='';continue;}
   if(c==='"'||c==="'"){quote=c;continue;}
   if(c==='&'&&line[i+1]==='&'&&this.initialFiles){commands.push(line.slice(start,i));start=i+2;i++;}
  }
  commands.push(line.slice(start));
  if(commands.some(command=>!command.trim()))throw Error('Put a command on both sides of &&.');
  let output='',code=0;
  for(const command of commands){
   try{const result=this.executeTokens(this.lex(command));output+=result.output;code=result.code;}catch(error){output+=error.message+'\n';code=2;}
   if(code)break;
  }
  return {output,code};
 }
 executeTokens(tokens){
  const chains=[[]];for(const token of tokens){if(token.op==='&&')chains.push([]);else chains.at(-1).push(token);}
  if(chains.some(chain=>!chain.length))throw Error('Put a command on both sides of &&.');
  let output='',code=0;
  for(const chain of chains){
   try{const result=this.executePipeline([...chain]);output+=result.output;code=result.code;}catch(error){output+=error.message+'\n';code=2;}
   if(code)break;
  }
  return {output,code};
 }
 executePipeline(tokens){
  let output='',code=0;
   let dest=null,append=false;const redirect=tokens.findIndex(t=>t.op==='>'||t.op==='>>');
   if(redirect>=0){if(redirect!==tokens.length-2||tokens.at(-1).op)throw Error('Use one filename after > or >>, at the end of the command.');dest=tokens.at(-1).value;append=tokens[redirect].op==='>>';tokens.splice(redirect);}
   const groups=[[]];for(const t of tokens){if(t.op==='|')groups.push([]);else if(t.op)throw Error('Only a single | pipe is supported.');else groups.at(-1).push(...this.expand(t));}
   for(const args of groups){if(!args.length)throw Error('A pipe needs a command on both sides.');if(groups.length>1&&['cd','export','mkdir','touch','cp','make','bun','sh','bash','zsh','clear'].includes(args[0]))throw Error('Use this command on its own; this simulator pipes text-processing commands only.');const r=this.command(args,output);output=r.output;code=r.code||0;}
   if(dest!==null){const p=this.path(dest);this.write(p,(append&&this.files.has(p)?this.read(p):'')+output);output='';}
  return {output,code};
 }
 runScript(path){
  const resolved=this.path(path);
  if(this.scriptStack.includes(resolved)||this.scriptStack.length>=8)throw Error('Recursive or deeply nested shell scripts are outside this lesson.');
  const text=this.read(path),cwd=this.cwd,env={...this.env},vars={...this.vars};
  this.scriptStack.push(resolved);let output='',code=0;
  try{
   for(const line of text.split('\n')){
    if(!line.trim()||line.trimStart().startsWith('#'))continue;
    const result=this.executeLine(line);output+=result.output;code=result.code;
   }
   return {output,code};
  }finally{this.scriptStack.pop();this.cwd=cwd;this.env=env;this.vars=vars;}
 }
 command(args,input=''){
  const [cmd,...a]=args,ok=output=>({output,code:0});
  if(/^[A-Za-z_]\w*=/.test(cmd)&&a.length===0){const pos=cmd.indexOf('=');this.vars[cmd.slice(0,pos)]=cmd.slice(pos+1);return ok('');}
  switch(cmd){
   case 'help':return ok('Supported: pwd, ls [-al] [PATH], cd, cat, echo, mkdir [-p], touch, cp, grep, wc -l, export, printenv, history, clear, bash, zsh, make. Bun project: sh scripts/hello.sh, sh scripts/dev.sh, bun run test, build, start, serve, format, clean. Chain commands with &&.\nLong listings use simulated permissions, owners, and timestamps; file sizes are UTF-8 bytes.\nUse quotes, $VARIABLE, *.txt, |, > and >>.\nNo host commands, downloads, scripts, loops, or command substitution are executed.\n');
   case 'pwd':return ok(this.cwd+'\n');
   case 'ls':{
    let all=false,long=false,options=true;const paths=[];
    for(const arg of a){
     if(options&&arg==='--'){options=false;continue;}
     if(options&&arg.startsWith('-')&&arg!=='-'){
      for(const flag of arg.slice(1)){if(flag==='a')all=true;else if(flag==='l')long=true;else throw Error(`ls: unsupported option -${flag}. Supported: -a, -l, -la.`);}
     }else paths.push(arg);
    }
    if(paths.length>1)throw Error('Use one file or directory with ls.');
    const target=this.path(paths[0]||'.'),directory=this.dirs.has(target);
    if(!directory&&!this.files.has(target))throw Error(`ls: ${paths[0]}: no such file or directory`);
    const names=directory?[...(all?['.','..']:[]),...this.children(target,all)]:[paths[0]];
    if(!long)return ok(names.join('  ')+'\n');
    // Permissions, owners, and timestamps model the virtual filesystem only.
    const rows=names.map(name=>{
     const path=directory?this.path(target+'/'+name):target,isDir=this.dirs.has(path),file=this.files.get(path);
     const links=isDir?2+this.children(path,true).filter(child=>this.dirs.has(this.path(path+'/'+child))).length:1;
     const size=isDir?0:new TextEncoder().encode(file.text).length;
     const time=new Date((file?.time||0)*1000).toISOString().slice(11,19);
     return [isDir?'drwxr-xr-x':'-rw-r--r--',String(links),'learner','learner',String(size),'Jan 01',time,name];
    });
    const linkWidth=Math.max(1,...rows.map(row=>row[1].length)),sizeWidth=Math.max(1,...rows.map(row=>row[4].length));
    return ok(rows.map(row=>{row[1]=row[1].padStart(linkWidth);row[4]=row[4].padStart(sizeWidth);return row.join(' ');}).join('\n')+(rows.length?'\n':''));
   }
   case 'cd':{if(a.length>1)throw Error('cd: too many arguments');const p=this.path(a[0]||'~');if(!this.dirs.has(p))throw Error(`cd: ${a[0]}: no such directory`);this.cwd=p;return ok('');}
   case 'cat':{if(a.some(x=>x.startsWith('-')))throw Error('cat options are outside this simulator.');return ok(a.length?a.map(p=>this.read(p)).join(''):input);}
   case 'echo':return ok(a.join(' ')+'\n');
   case 'mkdir':{const recursive=a[0]==='-p',paths=recursive?a.slice(1):a;if(!paths.length)throw Error('mkdir needs a directory name');for(const name of paths){if(name.startsWith('-'))throw Error('Supported option: mkdir -p');const p=this.path(name);if(this.files.has(p))throw Error(`${name}: file exists`);if(recursive){const bits=p.split('/').filter(Boolean);let cur='';for(const b of bits){cur+='/'+b;if(this.files.has(cur))throw Error(`${cur}: is a file`);this.dirs.add(cur);}}else{if(this.dirs.has(p))throw Error(`${name}: directory exists`);const parent=p.slice(0,p.lastIndexOf('/'))||'/';if(!this.dirs.has(parent))throw Error(`${parent}: no such directory`);this.dirs.add(p);}}return ok('');}
   case 'touch':{if(!a.length)throw Error('touch needs a filename');for(const p of a)this.write(p,this.files.get(this.path(p))?.text||'');return ok('');}
   case 'cp':{if(a.length!==2)throw Error('Use cp SOURCE DESTINATION');const dest=this.dirs.has(this.path(a[1]))?a[1]+'/'+a[0].split('/').at(-1):a[1];this.write(dest,this.read(a[0]));return ok('');}
   case 'grep':{if(!a.length||a[0].startsWith('-'))throw Error('Use grep PATTERN [FILE]. This simulator matches literal text.');const text=a.length>1?a.slice(1).map(p=>this.read(p)).join(''):input;const lines=text.replace(/\n$/,'').split('\n').filter(l=>l.includes(a[0]));return {output:lines.length?lines.join('\n')+'\n':'',code:lines.length?0:1};}
   case 'wc':{if(a[0]!=='-l'||a.length>2)throw Error('Use wc -l [FILE]');const text=a[1]?this.read(a[1]):input;return ok(String((text.match(/\n/g)||[]).length)+'\n');}
   case 'export':{if(a.length!==1||!/^([A-Za-z_]\w*)(=.*)?$/.test(a[0]))throw Error('Use export NAME=value or export NAME');const pos=a[0].indexOf('='),name=pos<0?a[0]:a[0].slice(0,pos);this.env[name]=pos<0?(this.vars[name]??this.env[name]??''):a[0].slice(pos+1);delete this.vars[name];return ok('');}
   case 'printenv':return a[0]?(this.env[a[0]]===undefined?{output:'',code:1}:ok(this.env[a[0]]+'\n')):ok(Object.entries(this.env).map(([k,v])=>k+'='+v).join('\n')+'\n');
   case 'history':return ok(this.history.map((x,i)=>`${i+1}  ${x}`).join('\n')+'\n');
   case 'clear':return ok('');
   case 'sh':{if(!this.initialFiles||a.length!==1||!a[0].endsWith('.sh'))throw Error('Use sh scripts/hello.sh or sh scripts/dev.sh in the workflow lesson.');return this.runScript(a[0]);}
   case 'bash':case 'zsh':{if(cmd==='bash'&&this.initialFiles&&a.length===1&&a[0].endsWith('.sh'))return this.runScript(a[0]);if(a.length)throw Error('Shell scripts are outside this simulator. Use bash or zsh to switch modes.');this.shell=cmd;this.env.SHELL='/bin/'+cmd;return ok(`Switched simulation to ${cmd}. Directory and variables retained.\n`);}
   case 'make':{if(a.length>1)throw Error('Use one Make target at a time.');return this.make(a[0]);}
   case 'bun':{
    if(!this.initialFiles)throw Error('Bun commands are available in the try-makefile lesson.');
    let script=a.join(' ');
    if(a[0]==='run'&&a.length===2){
     const command=JSON.parse(this.read('package.json')).scripts?.[a[1]];
     if(!command||!/^bun scripts\/[a-z]+\.js$/.test(command))throw Error('Use bun run test, build, start, serve, format, or clean.');
     script=command.slice(4);
    }
    if(!['scripts/check.js','scripts/build.js','scripts/serve.js','scripts/start.js','scripts/clean.js','scripts/format.js'].includes(script))throw Error('Only the supplied Bun project scripts are simulated.');
    if(this.read(script)!==this.initialFiles[script])throw Error('This script has changed. Download the project to run your edited script with Bun locally.');
    if(script==='scripts/format.js'){if(this.read('scripts/format-text.js')!==this.initialFiles['scripts/format-text.js'])throw Error('Download to run your edited formatter locally.');const source=this.read('src/index.html'),formatted=formatText(source);if(source!==formatted)this.write('src/index.html',formatted);return ok('Formatted src/index.html: removed trailing whitespace and normalized the final newline.\n');}
    if(script==='scripts/check.js')return this.command(['node','scripts/check.js']);
    if(script==='scripts/build.js'){this.dirs.add(this.path('dist'));this.write('dist/index.html',this.read('src/index.html'));return ok('Built dist/index.html from src/index.html.\n');}
    if(script==='scripts/start.js'){const built=this.command(['bun','scripts/build.js']);const served=this.command(['bun','scripts/serve.js']);return ok(built.output+served.output);}
    if(script==='scripts/serve.js')return this.command(['preview','dist/index.html']);
    for(const path of this.files.keys())if(path.startsWith(this.path('dist')+'/'))this.files.delete(path);
    for(const path of this.dirs)if(path===this.path('dist')||path.startsWith(this.path('dist')+'/'))this.dirs.delete(path);
    this.served=false;return ok('Removed dist/.\n');
   }
   case 'node':{if(a.join(' ')!=='scripts/check.js')throw Error('Only the lesson’s fixed scripts/check.js check is simulated.');const pass=/<h1>\s*[^<\s][\s\S]*?<\/h1>/.test(this.read('src/index.html'));return {output:pass?'PASS: source has a non-empty h1.\n':'FAIL: add a non-empty <h1> heading to src/index.html.\n',code:pass?0:1};}
   case 'preview':{if(a.join(' ')!=='dist/index.html')throw Error('Preview supports dist/index.html only.');this.read(a[0]);this.served=true;return ok('Serving a simulated snapshot of dist/index.html. See the browser preview panel.\n');}
   case 'remove-build':{this.files.delete(this.path('dist/index.html'));this.served=false;return ok('Removed the simulated build artifact.\n');}
   default:return {output:`${this.shell}: ${cmd}: command not found in this simulator. Type help.\n`,code:127};
  }
 }
 make(target){if(this.makeActive)throw Error('Recursive make is outside this simulator.');this.makeActive=true;try{return this.buildMake(target);}finally{this.makeActive=false;}}
 buildMake(target){
  // Parse the lesson's Makefile subset rather than hard-code a target sequence.
  const rules=new Map(),phony=new Set();let current=null;
  for(const line of this.read('Makefile').split('\n')){
   if(!line.trim()||line.trimStart().startsWith('#'))continue;
   if(line.startsWith('\t')){if(!current)throw Error('Makefile: recipe without a target');rules.get(current).recipes.push(line.trim());continue;}
   if(line.startsWith(' '))throw Error('Makefile: recipe lines must begin with a TAB, not spaces.');
   const m=line.match(/^([\w./-]+):\s*(.*)$/);if(!m)throw Error('This Makefile simulator supports targets, prerequisites, .PHONY, and tab-indented recipes.');
   if(m[1]==='.PHONY'){m[2].split(/\s+/).filter(Boolean).forEach(x=>phony.add(x));current=null;}else{current=m[1];rules.set(current,{deps:m[2].split(/\s+/).filter(Boolean),recipes:[]});}
  }
  target=target||rules.keys().next().value;if(!target)throw Error('Makefile has no targets.');
  let output='';const done=new Set(),visiting=new Set();
  const build=t=>{if(done.has(t))return;if(visiting.has(t))throw Error(`Circular dependency at ${t}`);const r=rules.get(t),file=this.files.get(this.path(t));if(!r){if(file)return;throw Error(`No rule to make target '${t}'.`);}visiting.add(t);r.deps.forEach(build);visiting.delete(t);
   const stale=phony.has(t)||!file||r.deps.some(d=>phony.has(d)||(this.files.get(this.path(d))?.time||0)>file.time);
   if(stale){for(const recipe of r.recipes){if(recipe.startsWith('make '))throw Error('Recursive make is outside this simulator.');output+='$ '+recipe+'\n';const res=this.initialFiles?this.executeLine(recipe):this.command(this.lex(recipe).flatMap(x=>{if(x.op)throw Error('Recipe pipes and redirection are outside this simulator.');return this.expand(x);}));output+=res.output;if(res.code)throw Error(`Recipe failed; remaining targets were not run.\n${output}`);}}done.add(t);};
  build(target);return {output:output||`make: '${target}' is up to date; no recipe needed.\n`,code:0};
 }
}
