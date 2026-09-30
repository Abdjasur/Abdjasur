import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';

// Fake Telegram Bot API: records messages; can be switched to fail.
const received = [];
let telegramDown = false;
const fakeTelegram = http.createServer(async (req, res) => {
  let body = '';
  for await (const c of req) body += c;
  if (telegramDown) { res.writeHead(502); return res.end('{"ok":false,"description":"down"}'); }
  received.push({ url: req.url, body: JSON.parse(body) });
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('{"ok":true}');
});

let server; let base; let dataDir; let mod;

before(async () => {
  await new Promise((r) => fakeTelegram.listen(0, r));
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ax-orders-'));
  Object.assign(process.env, {
    TELEGRAM_BOT_TOKEN: 'TEST_TOKEN', TELEGRAM_CHAT_ID: '12345', DATA_DIR: dataDir,
    TELEGRAM_API_BASE: `http://127.0.0.1:${fakeTelegram.address().port}`, RETRY_INTERVAL_MS: '3600000',
  });
  mod = await import('./server.js');
  server = await mod.start(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fakeTelegram.close(); });

const valid = {
  product: 'AX Pedestal — 1', quantity: 25, name: 'Ali Valiyev', phone: '+998 90 123 45 67',
  region: "Farg'ona viloyati", address: "Marg'ilon sh., Mustaqillik ko'chasi 1", comment: 'Tezroq kerak',
};
const post = (body, headers = { 'Content-Type': 'application/json' }) =>
  fetch(`${base}/api/orders`, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });

test('valid order is saved and sent to Telegram with all fields', async () => {
  const res = await post({ ...valid, idempotencyKey: 'k1' });
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.ok, true);
  assert.match(data.id, /^AX-\d{6}-[0-9A-F]{6}$/);
  assert.equal(data.telegram, 'sent');

  const msg = received.at(-1);
  assert.equal(msg.url, '/botTEST_TOKEN/sendMessage');
  assert.equal(msg.body.chat_id, '12345');
  assert.equal(msg.body.parse_mode, undefined, 'plain text, no markup injection');
  for (const v of [valid.product, '25', valid.name, valid.phone, valid.address, valid.comment]) assert.ok(msg.body.text.includes(v), v);

  const saved = (await fs.readFile(path.join(dataDir, 'orders.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(saved.at(-1).id, data.id);
});

test('cart order with several products is saved and sent as one message', async () => {
  const items = [{ product: 'PA-A-03', quantity: 200 }, { product: 'PA-SP-02', quantity: 200 }, { product: 'SH-0135', quantity: 50 }];
  const { product, quantity, ...rest } = valid;
  const res = await post({ ...rest, items, idempotencyKey: 'cart1' });
  const data = await res.json();
  assert.equal(res.status, 201);
  const text = received.at(-1).body.text;
  items.forEach((it, i) => assert.ok(text.includes(`${i + 1}. ${it.product} — ${it.quantity} dona`), it.product));
  assert.ok(text.includes('Jami: 450 dona'));
  const saved = (await fs.readFile(path.join(dataDir, 'orders.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse).at(-1);
  assert.equal(saved.id, data.id);
  assert.deepEqual(saved.items, items);
  assert.equal(saved.quantity, 450);
});

test('cart order rejects empty, oversized or invalid item lists', () => {
  const { product, quantity, ...rest } = valid;
  // Checked on validateOrder directly: HTTP requests here would trip the per-IP rate limit for later tests.
  for (const items of [[], Array.from({ length: 51 }, () => ({ product: 'X', quantity: 1 })), [{ product: 'X', quantity: 0 }], [{ product: '', quantity: 3 }]]) {
    assert.equal(mod.validateOrder({ ...rest, items }).errors.items, 'invalid', JSON.stringify(items).slice(0, 60));
  }
  assert.deepEqual(mod.validateOrder({ ...rest, items: [{ product: 'X', quantity: 2 }] }).errors, {});
});

test('double submit with the same idempotency key creates one order', async () => {
  const before = received.length;
  const again = await (await post({ ...valid, idempotencyKey: 'k1' })).json();
  assert.equal(again.duplicate, true);
  assert.equal(received.length, before);
});

test('validation errors are reported per field', async () => {
  const res = await post({ product: '', quantity: 0, name: '', phone: 'abc', region: '', address: '' });
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.deepEqual(Object.keys(data.fields).sort(), ['address', 'name', 'phone', 'product', 'quantity', 'region']);
});

test('rejects non-JSON, bad JSON and oversized bodies', async () => {
  assert.equal((await post('x', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post('{bad')).status, 400);
  assert.equal((await post({ ...valid, comment: 'x'.repeat(20000) })).status, 413);
});

test('when Telegram is down the order is still accepted and delivered on retry', async () => {
  telegramDown = true;
  const data = await (await post({ ...valid, name: 'Retry Test' })).json();
  assert.equal(data.ok, true);
  assert.equal(data.telegram, 'queued');
  const queue = JSON.parse(await fs.readFile(path.join(dataDir, 'unsent.json'), 'utf8'));
  assert.equal(queue[0].id, data.id);

  telegramDown = false;
  await mod.retryUnsent();
  assert.ok(received.at(-1).body.text.includes('Retry Test'));
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(dataDir, 'unsent.json'), 'utf8')), []);
});

test('bot token and server files are never served', async () => {
  for (const p of ['/server/server.js', '/server/data/orders.jsonl', '/package.json', '/.env', '/js/../server/server.js', '/%2e%2e/etc/passwd']) {
    const res = await fetch(base + p);
    assert.equal(res.status, 404, p);
  }
  const html = await (await fetch(`${base}/`)).text();
  assert.ok(!html.includes('TEST_TOKEN'));
  assert.equal((await fetch(`${base}/api/orders`)).status, 405);
});
