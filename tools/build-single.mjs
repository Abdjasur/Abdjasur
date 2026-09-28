// Builds dist/ax-pedestal.html — the whole site in ONE self-contained HTML file
// (styles, scripts and images inlined; product and confirmation pages become views
// switched by the URL hash). Opens with a double-click, no server needed.
// Orders still go to ORDER_API_URL (js/data.js); without a reachable backend the
// form shows its error message and the "order via Telegram" button remains.
//
// Usage: npm run build
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFile(path.join(ROOT, f), 'utf8');
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

const cache = new Map();
async function dataUri(rel) {
  if (!cache.has(rel)) {
    const buf = await fs.readFile(path.join(ROOT, rel));
    cache.set(rel, `data:${MIME[path.extname(rel)]};base64,${buf.toString('base64')}`);
  }
  return cache.get(rel);
}
async function inlineImages(text) {
  const refs = [...new Set(text.match(/images\/[\w.-]+\.(?:webp|png|jpg|svg)/g) || [])];
  for (const ref of refs) text = text.split(ref).join(await dataUri(ref));
  return text;
}
function replaceOnce(text, from, to) {
  if (!text.includes(from)) throw new Error(`build-single: marker not found: ${from.slice(0, 60)}`);
  return text.replace(from, () => to);
}
const script = (code) => `<script>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`;

let html = await read('index.html');
html = replaceOnce(html, '<link rel="stylesheet" href="styles.css">', `<style>\n${await read('styles.css')}\n</style>`);
html = html.replace(/\s*<meta property="og:image"[^>]*>/, '');
html = replaceOnce(html, '<body data-page="home">', '<body data-page="home" data-standalone="true">');
html = replaceOnce(html, '<main id="top">', '<main id="top" data-view="home">');
html = html.replace(/href="product\.html\?id=([\w-]+)"/g, 'href="#product=$1"');
html = replaceOnce(html, '  <footer class="footer">', `  <main class="section section--page" data-view="product" hidden>
    <div class="container" id="productPage"></div>
  </main>
  <main class="section section--page success" data-view="success" hidden>
    <div class="container" id="successPage"></div>
  </main>

  <footer class="footer">`);
html = replaceOnce(html, `  <script src="js/data.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/app.js"></script>`, [
  script(await read('js/data.js')),
  script(await read('js/i18n.js')),
  script(await read('js/app.js')),
].join('\n'));
html = await inlineImages(html);

const leftovers = html.match(/(?:src|href)="(?!#|data:|https:|tel:|mailto:|\$\{)[^"]+"/g);
if (leftovers) throw new Error(`build-single: unresolved local references: ${leftovers.join(', ')}`);

await fs.mkdir(path.join(ROOT, 'dist'), { recursive: true });
const out = path.join(ROOT, 'dist', 'ax-pedestal.html');
await fs.writeFile(out, html);
console.log(`dist/ax-pedestal.html  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB, ${cache.size} images inlined`);
