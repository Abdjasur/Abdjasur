// AX Pedestal — static site + order API. No external dependencies (Node 18+).
//
// Environment:
//   PORT                 default 3000
//   TELEGRAM_BOT_TOKEN   bot token from @BotFather (never put it in frontend code)
//   TELEGRAM_CHAT_ID     chat / group id that receives orders
//   DATA_DIR             where orders are stored, default server/data
//   TELEGRAM_API_BASE    default https://api.telegram.org (overridable for tests)
//   RETRY_INTERVAL_MS    how often unsent orders are retried, default 60000
//   ALLOWED_ORIGIN       only if the site is hosted on another domain, e.g. https://axpedestal.uz

import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'server', 'data'));
const ORDERS_FILE = path.join(DATA_DIR, 'orders.jsonl');
const UNSENT_FILE = path.join(DATA_DIR, 'unsent.json');
const TG_BASE = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const RETRY_INTERVAL_MS = Number(process.env.RETRY_INTERVAL_MS) || 60_000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

// Only these files/folders of the site are served; server code and data never are.
const PUBLIC_FILES = new Set(['index.html', 'product.html', 'order-success.html', 'styles.css', 'site.webmanifest', 'favicon.ico', 'robots.txt', 'sitemap.xml']);
const PUBLIC_DIRS = ['js/', 'images/'];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  // Analytics hosts (Yandex Metrika, Google Analytics) are allowed; their scripts only load when an ID is set in js/data.js.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://mc.yandex.ru https://yastatic.net https://www.googletagmanager.com",
    "img-src 'self' data: https://mc.yandex.ru https://*.google-analytics.com https://*.googletagmanager.com",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "connect-src 'self' https://mc.yandex.ru https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
    "frame-src https://mc.yandex.ru",
    "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'",
  ].join('; '),
};

// ---------- validation ----------
const LIMITS = { product: 120, name: 80, region: 60, address: 300, comment: 1000 };
const MAX_ITEMS = 50;

export function validateOrder(body) {
  const errors = {};
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const order = {
    product: str(body.product),
    quantity: Number(body.quantity),
    name: str(body.name),
    phone: str(body.phone),
    region: str(body.region),
    address: str(body.address),
    comment: str(body.comment),
  };
  const validQty = (q) => Number.isInteger(q) && q >= 1 && q <= 100000;
  if (Array.isArray(body.items)) {
    // Cart order: several products in one request.
    order.items = body.items.slice(0, MAX_ITEMS).map((it) => ({ product: str(it?.product), quantity: Number(it?.quantity) }));
    if (!body.items.length || body.items.length > MAX_ITEMS
      || order.items.some((it) => !it.product || it.product.length > LIMITS.product || !validQty(it.quantity))) errors.items = 'invalid';
    order.product = order.items.length === 1 ? order.items[0].product : `${order.items.length} ta mahsulot`;
    order.quantity = order.items.reduce((sum, it) => sum + (validQty(it.quantity) ? it.quantity : 0), 0);
  } else {
    if (!order.product) errors.product = 'required';
    if (!validQty(order.quantity)) errors.quantity = 'invalid';
    order.items = [{ product: order.product, quantity: order.quantity }];
  }
  for (const key of ['name', 'region', 'address']) {
    if (!order[key]) errors[key] = 'required';
  }
  for (const [key, max] of Object.entries(LIMITS)) {
    if (order[key].length > max) errors[key] = 'too_long';
  }
  const digits = order.phone.replace(/\D/g, '');
  if (!order.phone) errors.phone = 'required';
  else if (!/^[+\d\s()-]+$/.test(order.phone) || digits.length < 9 || digits.length > 15) errors.phone = 'invalid';
  return { order, errors };
}

export function formatTelegramMessage(o) {
  // Sent as plain text (no parse_mode), so customer input cannot inject markup.
  return [
    `🆕 Yangi buyurtma — ${o.id}`,
    '',
    ...(o.items && o.items.length > 1
      ? ['📦 Mahsulotlar:', ...o.items.map((it, i) => `   ${i + 1}. ${it.product} — ${it.quantity} dona`), `🔢 Jami: ${o.quantity} dona`]
      : [`📦 Mahsulot: ${o.product}`, `🔢 Miqdori: ${o.quantity} dona`]),
    `👤 Mijoz: ${o.name}`,
    `📞 Telefon: ${o.phone}`,
    `📍 Manzil: ${o.region}, ${o.address}`,
    `💬 Izoh: ${o.comment || '—'}`,
    '',
    `🕒 ${new Date(o.createdAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`,
  ].join('\n');
}

// ---------- storage ----------
let unsent = [];               // orders not yet delivered to Telegram
const recentKeys = new Map();  // idempotency key -> order id (dedupe double submits)

async function loadUnsent() {
  try { unsent = JSON.parse(await fs.readFile(UNSENT_FILE, 'utf8')); } catch { unsent = []; }
}
async function saveUnsent() {
  const tmp = `${UNSENT_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(unsent));
  await fs.rename(tmp, UNSENT_FILE);
}
async function appendOrder(order) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(ORDERS_FILE, `${JSON.stringify(order)}\n`);
}

// ---------- telegram ----------
async function sendToTelegram(order) {
  if (!TG_TOKEN || !TG_CHAT) throw new Error('Telegram is not configured');
  const res = await fetch(`${TG_BASE}/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT, text: formatTelegramMessage(order), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(`Telegram API error ${res.status}: ${data.description || 'unknown'}`);
}

let retrying = false;
export async function retryUnsent() {
  if (retrying || !unsent.length) return;
  retrying = true;
  try {
    for (const order of [...unsent]) {
      try {
        await sendToTelegram(order);
        unsent = unsent.filter((o) => o.id !== order.id);
        await saveUnsent();
        console.log(`[telegram] delivered ${order.id} on retry`);
      } catch (err) {
        console.warn(`[telegram] retry failed for ${order.id}: ${err.message}`);
        break; // Telegram still down; try again next interval
      }
    }
  } finally { retrying = false; }
}

// ---------- rate limit ----------
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 10;
}

// ---------- http ----------
function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    ...(isJson ? { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } : {}),
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

async function readJson(req, maxBytes = 16 * 1024) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw Object.assign(new Error('too large'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch {
    throw Object.assign(new Error('bad json'), { status: 400 });
  }
}

async function handleOrder(req, res) {
  if (!(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, { ok: false, error: 'unsupported_media_type' });
  if (rateLimited(req.socket.remoteAddress)) return send(res, 429, { ok: false, error: 'rate_limited' });

  let body;
  try { body = await readJson(req); } catch (err) { return send(res, err.status || 400, { ok: false, error: 'bad_request' }); }
  if (body.website) return send(res, 200, { ok: true, id: 'AX-0' }); // honeypot: silently drop bots

  const key = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.slice(0, 64) : '';
  if (key && recentKeys.has(key)) return send(res, 200, { ok: true, id: recentKeys.get(key), duplicate: true });

  const { order, errors } = validateOrder(body);
  if (Object.keys(errors).length) return send(res, 400, { ok: false, error: 'validation', fields: errors });

  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  order.id = `AX-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  order.createdAt = new Date().toISOString();

  // 1) Persist first: once this succeeds the order cannot be lost.
  try { await appendOrder(order); } catch (err) {
    console.error('[orders] failed to save order', err);
    return send(res, 500, { ok: false, error: 'storage_failed' });
  }
  if (key) {
    recentKeys.set(key, order.id);
    if (recentKeys.size > 5000) recentKeys.delete(recentKeys.keys().next().value);
  }

  // 2) Notify Telegram; on failure queue it for retry — the customer's order is still accepted.
  let telegram = 'sent';
  try { await sendToTelegram(order); } catch (err) {
    telegram = 'queued';
    console.warn(`[telegram] ${order.id} queued: ${err.message}`);
    unsent.push(order);
    await saveUnsent().catch((e) => console.error('[orders] failed to save retry queue', e));
  }
  return send(res, 201, { ok: true, id: order.id, telegram });
}

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';
  const allowed = PUBLIC_FILES.has(rel) || PUBLIC_DIRS.some((d) => rel.startsWith(d));
  const file = path.resolve(ROOT, rel);
  if (!allowed || !file.startsWith(ROOT + path.sep) || rel.split('/').some((p) => p.startsWith('.'))) {
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
  try {
    const data = await fs.readFile(file);
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    return send(res, 200, req.method === 'HEAD' ? '' : data, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  } catch {
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      if (pathname === '/api/orders') {
        if (ALLOWED_ORIGIN && req.headers.origin === ALLOWED_ORIGIN) {
          res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
          res.setHeader('Vary', 'Origin');
          if (req.method === 'OPTIONS') {
            return send(res, 204, '', { 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' });
          }
        }
        if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' });
        return await handleOrder(req, res);
      }
      if (pathname === '/api/health') return send(res, 200, { ok: true, telegramConfigured: Boolean(TG_TOKEN && TG_CHAT), unsent: unsent.length });
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { ok: false, error: 'method_not_allowed' });
      return await serveStatic(req, res, pathname);
    } catch (err) {
      console.error('[http] unexpected error', err);
      if (!res.headersSent) send(res, 500, { ok: false, error: 'server_error' });
    }
  });
}

export async function start(port = PORT) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await loadUnsent();
  const server = createServer();
  const timer = setInterval(retryUnsent, RETRY_INTERVAL_MS);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  await new Promise((resolve) => server.listen(port, resolve));
  if (!TG_TOKEN || !TG_CHAT) console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — orders are saved and queued until configured');
  console.log(`AX Pedestal running on http://localhost:${server.address().port}`);
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) start();
