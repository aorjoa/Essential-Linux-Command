// Deliberately small teaching subset: one literal KEY=value per line.
export function parseEnv(text){
 const values={};
 for(const [index,line] of text.split('\n').entries()){
  const trimmed=line.trim();if(!trimmed||trimmed.startsWith('#'))continue;
  const match=trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if(!match)throw Error(`Line ${index+1}: use KEY=value.`);
  let value=match[2];
  if(value.includes('$')||value.includes('\\'))throw Error(`Line ${index+1}: this exercise accepts literal values only; expansion and escapes are not simulated.`);
  if(/^["'`]/.test(value)){if(value.length<2||value.at(-1)!==value[0])throw Error(`Line ${index+1}: close the quoted value.`);value=value.slice(1,-1);}
  else value=value.split('#')[0].trim();
  Object.defineProperty(values,match[1],{value,enumerable:true,configurable:true,writable:true});
 }
 return values;
}
export function runEnv(files,mode='auto'){
 const paths=mode==='off'?[]:mode==='custom'?['.env.example']:['.env','.env.local'];
 const env={},sources={};
 for(const path of paths){for(const [key,value] of Object.entries(parseEnv(files[path]||''))){Object.defineProperty(env,key,{value,enumerable:true,configurable:true,writable:true});Object.defineProperty(sources,key,{value:path,enumerable:true,configurable:true,writable:true});}}
 const port=Number(env.PORT??3000);
 const error=!env.APP_NAME?'APP_NAME is required.':!Number.isInteger(port)||port<1||port>65535?'PORT must be an integer from 1 to 65535.':null;
 return {env,sources,paths,port,error};
}
