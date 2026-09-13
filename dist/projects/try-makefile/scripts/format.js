import { formatText } from './format-text.js';
const path = new URL('../src/index.html', import.meta.url);
const source = await Bun.file(path).text();
const formatted = formatText(source);
if (formatted !== source) await Bun.write(path, formatted);
console.log('Formatted src/index.html: removed trailing whitespace and normalized the final newline.');
