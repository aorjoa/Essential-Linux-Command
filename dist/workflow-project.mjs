export const WORKFLOW_NAME = 'try-makefile';
export const WORKFLOW_FILES = [
  'scripts/hello.sh', 'scripts/dev.sh', 'src/index.html', 'Makefile', 'package.json', 'README.md', '.gitignore',
  'scripts/check.js', 'scripts/build.js', 'scripts/serve.js', 'scripts/start.js', 'scripts/clean.js', 'scripts/format.js', 'scripts/format-text.js'
];
export async function loadWorkflowFiles() {
  return Object.fromEntries(await Promise.all(WORKFLOW_FILES.map(async path => {
    const response = await fetch(new URL(`./projects/${WORKFLOW_NAME}/${path}`, import.meta.url));
    if (!response.ok) throw new Error(`Could not load ${path}: ${response.status}`);
    return [path, await response.text()];
  })));
}
