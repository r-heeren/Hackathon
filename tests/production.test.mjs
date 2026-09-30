import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

let server;
let origin;
before(async () => {
  if (process.env.PRODUCTION_URL) { origin = process.env.PRODUCTION_URL; return; }
  server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  origin = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server did not start')), 10000);
    server.once('error', reject);
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
    server.stdout.on('data', data => { const url = data.toString().match(/http:\/\/localhost:\d+/)?.[0]; if (url) { clearTimeout(timeout); resolve(url); } });
  });
});
after(() => server?.kill());

test('Railway health check and exported app serve on the assigned port', async () => {
  const health = await fetch(`${origin}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });
  const app = await fetch(origin);
  assert.equal(app.status, 200);
  assert.match(app.headers.get('content-type'), /text\/html/);
  assert.match(await app.text(), /Kate/);
});

test('exported JavaScript and styles have browser-compatible types', async () => {
  const html = await (await fetch(origin)).text();
  const js = html.match(/src="([^" ]+\.js[^" ]*)"/)?.[1];
  const css = html.match(/href="([^" ]+\.css[^" ]*)"/)?.[1];
  assert.ok(js, 'Export must include JavaScript');
  assert.ok(css, 'Export must include a stylesheet');
  for (const [asset, type] of [[js, 'text/javascript'], [css, 'text/css']]) {
    const response = await fetch(new URL(asset.replaceAll('&amp;', '&'), origin));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), new RegExp(type));
    assert.match(response.headers.get('cache-control'), /immutable/);
  }
});

test('HEAD works and unsupported methods or missing files fail correctly', async () => {
  const head = await fetch(origin, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${origin}/does-not-exist.js`)).status, 404);
});
