const source = await Bun.file(new URL('../src/index.html', import.meta.url)).text();
const pass = /<h1>\s*[^<\s][\s\S]*?<\/h1>/.test(source);
console.log(pass
  ? 'PASS: source has a non-empty h1.'
  : 'FAIL: add a non-empty <h1> heading to src/index.html.');
if (!pass) process.exit(1);
