const path = new URL('../dist/index.html', import.meta.url);
if (!(await Bun.file(path).exists())) {
  console.error('No build yet. Run bun run build or make build first.');
  process.exit(1);
}
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error('PORT must be an integer from 0 to 65535.');
  process.exit(1);
}
const server = Bun.serve({
  hostname: '127.0.0.1',
  port,
  fetch(request) {
    const pathname = new URL(request.url).pathname;
    if (pathname !== '/' && pathname !== '/index.html') {
      return new Response('Not found', { status: 404 });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return new Response(request.method === 'HEAD' ? null : Bun.file(path), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
});
console.log(`try-makefile is running at ${server.url}`);
console.log('Edit src/index.html, run make build in another terminal, then refresh. Ctrl+C stops the server.');
