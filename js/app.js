// AX Pedestal — shared site logic: language, header, catalogue, product page, order modal, success page.
(() => {
  const I18N = window.I18N;
  const PRODUCTS = window.PRODUCTS;
  const CONTACTS = window.CONTACTS;
  const ORDER_API_URL = window.ORDER_API_URL || '/api/orders';
  const DRAFT_KEY = 'ax-order-draft';
  const LAST_ORDER_KEY = 'ax-last-order';
  // Standalone build (one HTML file, see tools/build-single.mjs): pages are views switched by the URL hash
  const STANDALONE = document.body.dataset.standalone === 'true';
  const hashParam = (k) => new URLSearchParams(location.hash.slice(1)).get(k);
  const currentPage = () => {
    if (!STANDALONE) return document.body.dataset.page;
    if (hashParam('product')) return 'product';
    if (hashParam('success')) return 'success';
    return 'home';
  };
  let page = currentPage();
  const routeId = () => (STANDALONE ? hashParam(page) : new URLSearchParams(location.search).get('id'));
  const homeUrl = (anchor = '') => (STANDALONE ? `#${anchor || 'top'}` : `index.html${anchor ? `#${anchor}` : ''}`);

  let lang = 'uz';
  const t = (key) => I18N[lang][key] ?? I18N.uz[key] ?? key;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(area, key) { try { return JSON.parse(window[area].getItem(key)); } catch { return null; } },
    set(area, key, value) { try { window[area].setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
    remove(area, key) { try { window[area].removeItem(key); } catch { /* storage unavailable */ } },
  };
  const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
  const productUrl = (p) => (STANDALONE ? `#product=${encodeURIComponent(p.slug)}` : `product.html?id=${encodeURIComponent(p.slug)}`);
  const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;
  const tgUrl = () => (CONTACTS.telegram ? `https://t.me/${encodeURIComponent(CONTACTS.telegram)}` : '');

  const PLACEHOLDER_SVG = '<svg viewBox="0 0 120 120" aria-hidden="true"><rect class="a" x="20" y="16" width="80" height="10" rx="3"/><rect class="b" x="48" y="26" width="24" height="56"/><rect class="a" x="40" y="66" width="40" height="10" rx="3"/><path class="a" d="M14 104 L40 82 L80 82 L106 104 Z"/></svg>';
  const TG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 4.3 2.9 11.5c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.5c.3-1.3-.5-1.8-1.4-1.3ZM8.6 14.2l9.5-6c.5-.3.9-.1.5.2l-7.9 7.1-.3 3.3-1.8-4.6Z"/></svg>';

  // "Rostlanadigan tayanch" / "Rezina qistirma" etc. — the descriptive half of a product name
  const typeName = (p, tr = t) => tr(p.category === 'accessory' ? `k.${p.kind}` : `cat.${p.category}`);
  const productName = (p, tr = t) => `${typeName(p, tr)} ${p.code}`;
  // Name sent to the manager's Telegram: always Uzbek, whatever the site language
  const tUz = (key) => I18N.uz[key] ?? key;
  const specValue = (v) => {
    if (v && typeof v === 'object') {
      const keys = Array.isArray(v.t) ? v.t : [v.t];
      const items = keys.map((k) => esc(k.includes('.') && I18N.uz[k] ? t(k) : k));
      return items.length > 1 ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : items[0];
    }
    return esc(v);
  };
  function specsHtml(rows) {
    return `<dl class="specs">${rows.map(([label, value]) => `<div><dt>${t(label)}</dt><dd>${specValue(value)}</dd></div>`).join('')}</dl>`;
  }
  // Short spec rows for catalogue cards
  const cardSpecs = (p) => (p.category === 'accessory'
    ? p.specs.filter(([k]) => k !== 's.material' && k !== 's.purpose').slice(0, 2)
    : [['s.height', p.height], ...(p.load ? [['s.load', p.load]] : [])]);
  const cardDesc = (p) => {
    const purpose = p.specs.find(([k]) => k === 's.purpose');
    return purpose ? `<p class="product__desc">${specValue(purpose[1])}</p>` : '';
  };
  const imageHtml = (p, eager) => (p.image
    ? `<img src="${esc(p.image)}" alt="${esc(productName(p))}" ${eager ? '' : 'loading="lazy"'}>`
    : PLACEHOLDER_SVG);

  // ---------------- language ----------------
  function applyLang(next) {
    if (!I18N[next]) return;
    lang = next;
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('.lang button').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));
    store.set('localStorage', 'lang', lang);
    renderContacts();
    renderSocials();
    renderRowIcons();
    renderFooterProducts();
    if (page === 'home') { renderCatalog(); renderRange(); renderSpecTable(); }
    if (page === 'product') renderProduct();
    if (page === 'success') renderSuccess();
    if (modal) renderModalOptions();
    document.title = page === 'product' && currentProduct ? `${productName(currentProduct)} — AX Pedestal`
      : page === 'success' ? `${t('s.title')} — AX Pedestal` : t('title');
  }

  // ---------------- header ----------------
  function initHeader() {
    $$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));
    const burger = $('#burger');
    const nav = $('#nav');
    if (!burger || !nav) return;
    const close = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', () => burger.setAttribute('aria-expanded', String(nav.classList.toggle('is-open'))));
    $$('a', nav).forEach((a) => a.addEventListener('click', close));
  }

  function renderContacts() {
    const links = {
      phone: CONTACTS.phone && `<a href="${telHref(CONTACTS.phone)}">${esc(CONTACTS.phone)}</a>`,
      telegram: CONTACTS.telegram && `<a href="${tgUrl()}" target="_blank" rel="noopener">@${esc(CONTACTS.telegram)}</a>`,
      instagram: CONTACTS.instagram && `<a href="https://instagram.com/${encodeURIComponent(CONTACTS.instagram)}" target="_blank" rel="noopener">@${esc(CONTACTS.instagram)}</a>`,
      telegramChannel: CONTACTS.telegramChannel && `<a href="https://t.me/${encodeURIComponent(CONTACTS.telegramChannel)}" target="_blank" rel="noopener">@${esc(CONTACTS.telegramChannel)}</a>`,
      youtube: CONTACTS.youtube && `<a href="${esc(CONTACTS.youtube)}" target="_blank" rel="noopener">@AxPedestal</a>`,
      facebook: CONTACTS.facebook && `<a href="${esc(CONTACTS.facebook)}" target="_blank" rel="noopener">${esc(CONTACTS.facebook.replace(/^https?:\/\/(www\.)?/, ''))}</a>`,
      email: CONTACTS.email && `<a href="mailto:${encodeURIComponent(CONTACTS.email).replace('%40', '@')}">${esc(CONTACTS.email)}</a>`,
    };
    $$('[data-contact]').forEach((el) => { el.innerHTML = links[el.dataset.contact] || `<span class="pending">${t('pending')}</span>`; });
  }

  // Social icons: <div data-socials></div>. Networks without a link are skipped.
  const SOCIAL_ICONS = {
    youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/>',
    telegram: '<path d="M21.5 4.3 2.9 11.5c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.5c.3-1.3-.5-1.8-1.4-1.3ZM8.6 14.2l9.5-6c.5-.3.9-.1.5.2l-7.9 7.1-.3 3.3-1.8-4.6Z"/>',
    facebook: '<path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4Z"/>',
    instagram: '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 3c-2.4 0-2.7 0-3.7.1-3.3.1-5 1.9-5.2 5.2C3 9.3 3 9.6 3 12s0 2.7.1 3.7c.1 3.3 1.9 5 5.2 5.2 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c3.3-.1 5-1.9 5.2-5.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c-.1-3.3-1.9-5-5.2-5.2C14.7 3 14.4 3 12 3Zm0 1.6c2.4 0 2.7 0 3.6.1 2.4.1 3.5 1.2 3.6 3.6.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.2 3.5-3.6 3.6-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.4-.1-3.5-1.2-3.6-3.6-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6c.1-2.4 1.2-3.5 3.6-3.6.9-.1 1.2-.1 3.6-.1Z"/>',
  };
  const ROW_ICONS = {
    address: '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>',
    phone: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/>',
    email: '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/>',
  };
  function renderRowIcons() {
    $$('[data-icon]').forEach((el) => {
      const k = el.dataset.icon;
      const path = ROW_ICONS[k] || SOCIAL_ICONS[k];
      if (path) el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
    });
  }
  function renderSocials() {
    const links = [
      ['youtube', 'YouTube', CONTACTS.youtube],
      ['telegram', 'Telegram', CONTACTS.telegramChannel && `https://t.me/${encodeURIComponent(CONTACTS.telegramChannel)}`],
      ['facebook', 'Facebook', CONTACTS.facebook],
      ['instagram', 'Instagram', CONTACTS.instagram && `https://instagram.com/${encodeURIComponent(CONTACTS.instagram)}`],
    ].filter(([, , url]) => url);
    const html = links.map(([k, label, url]) => `<a class="social social--${k}" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL_ICONS[k]}</svg></a>`).join('');
    $$('[data-socials]').forEach((el) => { el.innerHTML = html; });
  }

  // "Contact via Telegram" buttons: open the chat, or explain that it is not set up yet.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tg-contact]');
    if (!btn) return;
    if (tgUrl()) { window.open(tgUrl(), '_blank', 'noopener'); return; }
    const note = btn.parentElement.querySelector('.inline-note') || btn.insertAdjacentElement('afterend', Object.assign(document.createElement('p'), { className: 'inline-note' }));
    note.textContent = t('e.tgMissing').split('.')[0] + '.';
  });

  // ---------------- home ----------------
  let filter = 'all';
  function renderCatalog() {
    const box = $('#products');
    if (!box) return;
    $$('#filters [data-filter]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.filter === filter);
      b.setAttribute('aria-selected', String(b.dataset.filter === filter));
    });
    box.innerHTML = PRODUCTS.filter((p) => filter === 'all' || p.category === filter).map((p) => `
      <article class="product">
        <a class="product__img" href="${productUrl(p)}" aria-label="${esc(productName(p))}">${imageHtml(p)}</a>
        <div class="product__body">
          <p class="product__type">${esc(typeName(p))}</p>
          <h3><a href="${productUrl(p)}">${esc(p.code)}</a></h3>
          ${cardDesc(p)}
          ${specsHtml(cardSpecs(p))}
          <div class="product__actions">
            <button type="button" class="btn btn--primary btn--sm" data-order="${esc(p.slug)}">${t('order')}</button>
            <a class="btn btn--ghost btn--sm" href="${productUrl(p)}">${t('details')}</a>
          </div>
        </div>
      </article>`).join('');
  }

  // Footer product links: every pedestal plus the accessories filter.
  function renderFooterProducts() {
    const peds = PRODUCTS.filter((p) => p.category !== 'accessory');
    const html = peds.map((p) => `<li><a href="${productUrl(p)}">${esc(p.code)} <small>${esc(p.height)}</small></a></li>`).join('')
      + `<li><a href="index.html#catalog">${t('ft.accessories')}</a></li>`;
    $$('[data-footer-products]').forEach((el) => { el.innerHTML = html; });
  }

  // Technical comparison table of all pedestals (values straight from PRODUCTS).
  function renderSpecTable() {
    const box = $('#specTable');
    if (!box) return;
    const spec = (p, key) => (p.specs.find(([k]) => k === key) || [])[1];
    const tops = (p) => (p.category === 'fixed' ? [t('specs.tile')] : [t('specs.tile'), t('specs.deck')]);
    const rows = PRODUCTS.filter((p) => p.category !== 'accessory').map((p) => `
      <tr>
        <th scope="row"><a href="${productUrl(p)}"><img src="${esc(p.image)}" alt="" loading="lazy">${esc(p.code)}</a></th>
        <td>${esc(p.height)}</td>
        <td>${esc(p.load || '—')}</td>
        <td>${esc(spec(p, 's.size') || '—')}</td>
        <td>${tops(p).map((x) => `<span class="tag">${esc(x)}</span>`).join(' ')}</td>
      </tr>`).join('');
    box.innerHTML = `<thead><tr><th scope="col">${t('specs.model')}</th><th scope="col">${t('specs.height')}</th><th scope="col">${t('specs.load')}</th><th scope="col">${t('specs.size')}</th><th scope="col">${t('specs.top')}</th></tr></thead><tbody>${rows}</tbody>`;
  }

  // Height range chart: every pedestal on one 0–340 mm scale
  function renderRange() {
    const box = $('#rangeChart');
    if (!box) return;
    const MAX = 340;
    const peds = PRODUCTS.filter((p) => p.category !== 'accessory')
      .map((p) => ({ p, r: p.height.match(/\d+/g).map(Number) }))
      .sort((x, y) => x.r[0] - y.r[0]);
    const ticks = [0, 100, 200, 300];
    box.innerHTML = `
      <div class="range__scale" aria-hidden="true">${ticks.map((v) => `<span data-x="${(v / MAX) * 100}">${v}</span>`).join('')}<span class="range__unit">mm</span></div>
      ${peds.map(({ p, r }) => {
        const from = r[0]; const to = r[1] ?? r[0];
        return `<a class="range__row" href="${productUrl(p)}">
          <span class="range__img">${imageHtml(p)}</span>
          <span class="range__name"><b>${esc(p.code)}</b><small>${esc(typeName(p))}</small></span>
          <span class="range__track"><span class="range__bar${from === to ? ' range__bar--fixed' : ''}" data-from="${(from / MAX) * 100}" data-to="${(to / MAX) * 100}"></span></span>
          <span class="range__val">${esc(p.height)}</span>
        </a>`;
      }).join('')}`;
    // positions via CSSOM (inline style attributes are blocked by the Content-Security-Policy)
    $$('[data-x]', box).forEach((el) => el.style.setProperty('--x', `${el.dataset.x}%`));
    $$('[data-from]', box).forEach((el) => { el.style.setProperty('--from', `${el.dataset.from}%`); el.style.setProperty('--to', `${el.dataset.to}%`); });
  }

  // ---------------- product page ----------------
  let currentProduct = null;
  let qty = 1;
  let shot = 0;
  function renderProduct() {
    const box = $('#productPage');
    if (!box) return;
    const slug = routeId();
    if (!currentProduct || currentProduct.slug !== slug) shot = 0;
    currentProduct = productBySlug(slug) || null;
    if (!currentProduct) {
      box.innerHTML = `<div class="empty"><h1>${t('pp.notFound')}</h1><a class="btn btn--primary" href="${homeUrl('catalog')}">${t('pp.back')}</a></div>`;
      return;
    }
    const p = currentProduct;
    const shots = [{ src: p.image, label: t('pp.photo') }, ...p.gallery.map((src) => ({ src, label: t(p.category === 'accessory' ? 'pp.example' : 'pp.drawing') }))];
    const cur = shots[Math.min(shot, shots.length - 1)];
    const accessories = p.category === 'adjustable' ? PRODUCTS.filter((o) => o.category === 'accessory') : [];
    const others = PRODUCTS.filter((o) => o !== p && !accessories.includes(o));
    const tile = (o) => `<a class="other" href="${productUrl(o)}"><span class="other__img">${imageHtml(o)}</span><span><b>${esc(o.code)}</b><small>${esc(typeName(o))}</small></span></a>`;
    box.innerHTML = `
      <nav class="crumbs"><a href="${homeUrl('catalog')}">← ${t('pp.back')}</a></nav>
      <div class="pp">
        <div class="pp__gallery">
          <div class="pp__media${cur.src.includes('drawing') ? ' pp__media--drawing' : ''}"><img src="${esc(cur.src)}" alt="${esc(`${productName(p)} — ${cur.label}`)}"></div>
          ${shots.length > 1 ? `<div class="pp__thumbs" role="tablist">${shots.map((s, i) => `
            <button type="button" role="tab" class="pp__thumb${i === shot ? ' is-active' : ''}" data-shot="${i}" aria-selected="${i === shot}" aria-label="${esc(s.label)}"><img src="${esc(s.src)}" alt=""><span>${esc(s.label)}</span></button>`).join('')}</div>` : ''}
        </div>
        <div class="pp__info">
          <p class="badge"><span class="dot"></span>${esc(typeName(p))}</p>
          <h1 class="pp__title">${esc(p.code)}</h1>
          <p class="pp__desc">${t(`d.${p.category}`)}</p>
          <h2 class="pp__h">${t('pp.specs')}</h2>
          ${specsHtml(p.specs)}
          ${p.details === false ? `<p class="pp__more">${t('pp.more')}</p>` : ''}
          <p class="pp__price">${t('pp.price')}</p>
          <div class="pp__buy">
            <div class="qty" role="group" aria-label="${t('pp.qty')}">
              <button type="button" data-step="-1" aria-label="${t('m.decrease')}">−</button>
              <input type="number" id="ppQty" inputmode="numeric" min="1" max="100000" value="${qty}" aria-label="${t('pp.qty')}">
              <button type="button" data-step="1" aria-label="${t('m.increase')}">+</button>
              <span class="qty__unit">${t('pcs')}</span>
            </div>
            <button type="button" class="btn btn--primary btn--lg" data-order="${esc(p.slug)}" data-order-qty>${t('order')}</button>
            <button type="button" class="btn btn--tg btn--lg" data-tg-contact>${TG_ICON}<span>${t('tgContact')}</span></button>
          </div>
          <ul class="pp__perks">
            <li>${t('pp.delivery')}</li><li>${t('pp.wholesale')}</li><li>${t('pp.consult')}</li>
          </ul>
        </div>
      </div>
      ${accessories.length ? `<section class="pp__others"><h2>${t('pp.accessories')}</h2><div class="others">${accessories.map(tile).join('')}</div></section>` : ''}
      ${others.length ? `<section class="pp__others"><h2>${t('pp.others')}</h2><div class="others">${others.map(tile).join('')}</div></section>` : ''}`;
    bindStepper($('.qty', box), (v) => { qty = v; });
    $$('[data-shot]', box).forEach((b) => b.addEventListener('click', () => { shot = Number(b.dataset.shot); renderProduct(); $(`[data-shot="${shot}"]`, box)?.focus(); }));
  }

  function clampQty(v) { return Math.min(100000, Math.max(1, Math.floor(Number(v)) || 1)); }
  function bindStepper(root, onChange) {
    const input = $('input', root);
    $$('[data-step]', root).forEach((b) => b.addEventListener('click', () => {
      input.value = clampQty(Number(input.value) + Number(b.dataset.step));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }));
    input.addEventListener('input', () => { if (input.value !== '') onChange(clampQty(input.value)); });
    input.addEventListener('blur', () => { input.value = clampQty(input.value); onChange(Number(input.value)); input.dispatchEvent(new Event('input', { bubbles: true })); });
  }

  // ---------------- order modal ----------------
  let modal = null;
  let lastFocus = null;
  const FIELDS = ['product', 'quantity', 'name', 'phone', 'region', 'address', 'comment'];

  function buildModal() {
    const el = document.createElement('div');
    el.className = 'modal';
    el.id = 'orderModal';
    el.hidden = true;
    el.innerHTML = `
      <div class="modal__backdrop" data-close></div>
      <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="orderTitle">
        <div class="modal__head">
          <h2 id="orderTitle" data-i18n="m.title"></h2>
          <button type="button" class="modal__x" data-close data-i18n-aria="m.close">×</button>
        </div>
        <form class="order" id="orderForm" novalidate>
          <div class="order__body">
            <p class="order__req"><span class="req">*</span> — <span data-i18n="m.required"></span></p>
            <p class="order__draft" id="draftNote" hidden data-i18n="m.draft"></p>
            <div class="field field--wide">
              <label for="f-product"><span data-i18n="m.product"></span> <span class="req">*</span></label>
              <select id="f-product" name="product" required></select>
              <p class="field__err" id="err-product"></p>
            </div>
            <div class="field">
              <label for="f-quantity"><span data-i18n="m.qty"></span> <span class="req">*</span></label>
              <div class="qty qty--field">
                <button type="button" data-step="-1" data-i18n-aria="m.decrease">−</button>
                <input id="f-quantity" name="quantity" type="number" inputmode="numeric" min="1" max="100000" value="1" required aria-describedby="err-quantity">
                <button type="button" data-step="1" data-i18n-aria="m.increase">+</button>
                <span class="qty__unit" data-i18n="pcs"></span>
              </div>
              <p class="field__err" id="err-quantity"></p>
            </div>
            <div class="field">
              <label for="f-name"><span data-i18n="m.name"></span> <span class="req">*</span></label>
              <input id="f-name" name="name" autocomplete="name" maxlength="80" required data-i18n-ph="m.namePh" aria-describedby="err-name">
              <p class="field__err" id="err-name"></p>
            </div>
            <div class="field">
              <label for="f-phone"><span data-i18n="m.phone"></span> <span class="req">*</span></label>
              <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" required aria-describedby="err-phone">
              <p class="field__err" id="err-phone"></p>
            </div>
            <div class="field">
              <label for="f-region"><span data-i18n="m.region"></span> <span class="req">*</span></label>
              <select id="f-region" name="region" required aria-describedby="err-region"></select>
              <p class="field__err" id="err-region"></p>
            </div>
            <div class="field field--wide">
              <label for="f-address"><span data-i18n="m.address"></span> <span class="req">*</span></label>
              <input id="f-address" name="address" autocomplete="street-address" maxlength="300" required data-i18n-ph="m.addressPh" aria-describedby="err-address">
              <p class="field__err" id="err-address"></p>
            </div>
            <div class="field field--wide">
              <label for="f-comment" data-i18n="m.comment"></label>
              <textarea id="f-comment" name="comment" rows="3" maxlength="1000" data-i18n-ph="m.commentPh"></textarea>
            </div>
            <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          </div>
          <div class="order__foot">
            <p class="order__status" id="orderStatus" role="alert"></p>
            <button type="submit" class="btn btn--primary btn--lg btn--block" id="orderSubmit"><span data-i18n="m.submit"></span></button>
            <button type="button" class="btn btn--tg btn--lg btn--block" id="orderTg">${TG_ICON}<span data-i18n="m.tg"></span></button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  function renderModalOptions() {
    const product = $('#f-product');
    const region = $('#f-region');
    const pv = product.value;
    const rv = region.value;
    product.innerHTML = ['adjustable', 'fixed', 'accessory'].map((cat) => `<optgroup label="${esc(t(`f.${cat}`))}">${PRODUCTS.filter((p) => p.category === cat)
      .map((p) => `<option value="${esc(p.slug)}">${esc(p.code)} — ${esc(typeName(p))}</option>`).join('')}</optgroup>`).join('');
    region.innerHTML = `<option value="">${t('m.regionPh')}</option>` + I18N.uz.regions.map((r, i) => `<option value="${i}">${esc(t('regions')[i])}</option>`).join('');
    if (pv) product.value = pv;
    region.value = rv;
  }

  // Phone: always "+998 XX XXX XX XX"
  function formatPhone(value) {
    let d = value.replace(/\D/g, '');
    if (d.startsWith('998')) d = d.slice(3);
    d = d.slice(0, 9);
    const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
    return `+998${parts.length ? ' ' : ''}${parts.join(' ')}`;
  }
  const phoneDigits = (v) => v.replace(/\D/g, '').replace(/^998/, '');

  function formData() {
    const f = $('#orderForm').elements;
    const regionIdx = f.region.value;
    return {
      slug: f.product.value,
      product: productBySlug(f.product.value) ? productName(productBySlug(f.product.value), tUz) : '', // Uzbek name for the manager
      quantity: Number(f.quantity.value),
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      regionIdx,
      region: regionIdx === '' ? '' : I18N.uz.regions[regionIdx], // stored in Uzbek for the manager
      address: f.address.value.trim(),
      comment: f.comment.value.trim(),
      website: f.website.value,
    };
  }

  function setFieldError(name, msg) {
    const input = $(`#f-${name}`);
    const err = $(`#err-${name}`);
    if (!input || !err) return;
    input.classList.toggle('is-invalid', Boolean(msg));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg || '';
  }

  function validate(data) {
    const errors = {};
    if (!data.product) errors.product = t('e.required');
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 100000) errors.quantity = t('e.qty');
    if (!data.name) errors.name = t('e.required');
    if (phoneDigits(data.phone).length !== 9) errors.phone = data.phone.replace(/\D/g, '').length > 3 ? t('e.phone') : t('e.required');
    if (data.regionIdx === '') errors.region = t('e.required');
    if (!data.address) errors.address = t('e.required');
    FIELDS.forEach((k) => setFieldError(k, errors[k]));
    return errors;
  }

  function saveDraft() {
    const d = formData();
    const draft = store.get('localStorage', DRAFT_KEY) || {};
    store.set('localStorage', DRAFT_KEY, { ...draft, slug: d.slug, quantity: d.quantity, name: d.name, phone: d.phone, regionIdx: d.regionIdx, address: d.address, comment: d.comment });
  }

  function openOrder(slug, quantity) {
    if (!modal) return;
    const f = $('#orderForm').elements;
    const draft = store.get('localStorage', DRAFT_KEY);
    // A fresh idempotency key per order attempt; kept in the draft so a retry after an error is not duplicated.
    if (!draft?.key) store.set('localStorage', DRAFT_KEY, { ...(draft || {}), key: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random() });
    const restored = draft && (draft.name || draft.phone || draft.address);
    if (draft) {
      f.name.value = draft.name || '';
      f.phone.value = draft.phone || '';
      f.region.value = draft.regionIdx ?? '';
      f.address.value = draft.address || '';
      f.comment.value = draft.comment || '';
    }
    f.product.value = slug || draft?.slug || PRODUCTS[0]?.slug || '';
    f.quantity.value = clampQty(quantity ?? draft?.quantity ?? 1);
    $('#draftNote').hidden = !restored;
    FIELDS.forEach((k) => setFieldError(k, ''));
    $('#orderStatus').textContent = '';
    $('#orderStatus').className = 'order__status';
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('modal-open');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    const firstEmpty = [f.name, f.phone, f.region, f.address].find((el) => !el.value);
    (firstEmpty || f.name).focus({ preventScroll: true });
  }

  function closeOrder() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
    modal.hidden = true;
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function showStatus(msg, kind = 'error') {
    const el = $('#orderStatus');
    el.textContent = msg;
    el.className = `order__status order__status--${kind}`;
  }

  async function submitOrder(e) {
    e.preventDefault();
    const data = formData();
    saveDraft();
    const errors = validate(data);
    if (Object.keys(errors).length) {
      showStatus(t('e.form'));
      $(`#f-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    const btn = $('#orderSubmit');
    btn.disabled = true;
    btn.classList.add('is-loading');
    btn.querySelector('span').textContent = t('m.sending');
    showStatus('', 'info');
    try {
      const res = await fetch(ORDER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: data.product, quantity: data.quantity, name: data.name, phone: data.phone,
          region: data.region, address: data.address, comment: data.comment, website: data.website,
          idempotencyKey: store.get('localStorage', DRAFT_KEY)?.key,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        store.set('sessionStorage', LAST_ORDER_KEY, { id: body.id, ...data });
        store.remove('localStorage', DRAFT_KEY);
        if (STANDALONE) { closeOrder(); location.hash = `success=${encodeURIComponent(body.id)}`; } else location.href = `order-success.html?id=${encodeURIComponent(body.id)}`;
        return;
      }
      if (res.status === 400 && body.fields) {
        Object.keys(body.fields).forEach((k) => setFieldError(k, k === 'phone' ? t('e.phone') : k === 'quantity' ? t('e.qty') : t('e.required')));
        showStatus(t('e.form'));
      } else if (res.status === 429) showStatus(t('e.rate'));
      else showStatus(t('e.server'));
    } catch {
      showStatus(t('e.network'));
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      btn.querySelector('span').textContent = t('m.submit');
    }
  }

  async function orderViaTelegram() {
    const data = formData();
    saveDraft();
    if (!tgUrl()) { showStatus(t('e.tgMissing')); return; }
    if (Object.keys(validate(data)).length) { showStatus(t('e.form')); return; }
    const text = [
      `${t('tg.heading')} — AX Pedestal`,
      `${t('m.product')}: ${data.product}`,
      `${t('m.qty')}: ${data.quantity} ${t('pcs')}`,
      `${t('m.name')}: ${data.name}`,
      `${t('m.phone')}: ${data.phone}`,
      `${t('m.address')}: ${t('regions')[data.regionIdx]}, ${data.address}`,
      data.comment && `${t('m.comment')}: ${data.comment}`,
    ].filter(Boolean).join('\n');
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    showStatus(t('tg.copied'), 'info');
    window.open(tgUrl(), '_blank', 'noopener');
  }

  function initModal() {
    modal = buildModal();
    const form = $('#orderForm');
    const f = form.elements;
    bindStepper($('.qty--field', modal), () => {});
    f.phone.addEventListener('focus', () => { if (!f.phone.value) f.phone.value = '+998 '; });
    f.phone.addEventListener('input', () => {
      const pos = f.phone.selectionStart === f.phone.value.length;
      f.phone.value = formatPhone(f.phone.value);
      if (pos) f.phone.setSelectionRange(f.phone.value.length, f.phone.value.length);
    });
    form.addEventListener('input', (e) => {
      saveDraft();
      if (e.target.name && e.target.classList.contains('is-invalid')) setFieldError(e.target.name, '');
    });
    form.addEventListener('change', saveDraft);
    form.addEventListener('submit', submitOrder);
    $('#orderTg').addEventListener('click', orderViaTelegram);
    $$('[data-close]', modal).forEach((el) => el.addEventListener('click', closeOrder));
    document.addEventListener('keydown', (e) => {
      if (modal.hidden) return;
      if (e.key === 'Escape') closeOrder();
      if (e.key === 'Tab') { // keep focus inside the dialog
        const items = $$('button, input, select, textarea, a[href]', $('.modal__dialog', modal)).filter((x) => !x.disabled && x.offsetParent && x.tabIndex !== -1);
        const first = items[0]; const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-order]');
      if (!btn) return;
      e.preventDefault();
      openOrder(btn.dataset.order || undefined, btn.hasAttribute('data-order-qty') ? qty : undefined);
    });
  }

  // ---------------- success page ----------------
  function renderSuccess() {
    const box = $('#successPage');
    if (!box) return;
    const id = routeId();
    if (!id) { if (STANDALONE) location.hash = 'top'; else location.replace('index.html'); return; }
    const o = store.get('sessionStorage', LAST_ORDER_KEY);
    const summary = o && o.id === id ? `
      <h2 class="success__h">${t('s.summary')}</h2>
      <dl class="specs specs--summary">
        <div><dt>${t('m.product')}</dt><dd>${esc(productBySlug(o.slug) ? productName(productBySlug(o.slug)) : o.product)}</dd></div>
        <div><dt>${t('m.qty')}</dt><dd>${esc(o.quantity)} ${t('pcs')}</dd></div>
        <div><dt>${t('m.name')}</dt><dd>${esc(o.name)}</dd></div>
        <div><dt>${t('m.phone')}</dt><dd>${esc(o.phone)}</dd></div>
        <div><dt>${t('m.address')}</dt><dd>${esc(t('regions')[o.regionIdx] || o.region)}, ${esc(o.address)}</dd></div>
        ${o.comment ? `<div><dt>${t('m.comment')}</dt><dd>${esc(o.comment)}</dd></div>` : ''}
      </dl>` : '';
    box.innerHTML = `
      <div class="success__card">
        <div class="success__icon" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="25"/><path d="M15 27l7 7 15-16"/></svg></div>
        <h1 class="success__title">${t('s.title')}</h1>
        <p class="success__text">${t('s.line1')}<br>${t('s.line2')}</p>
        <p class="success__id">${t('s.number')}: <b>${esc(id)}</b></p>
        ${summary}
        <div class="success__actions">
          <a class="btn btn--primary btn--lg" href="${homeUrl()}">${t('s.home')}</a>
          <a class="btn btn--ghost btn--lg" href="${homeUrl('catalog')}">${t('s.catalog')}</a>
        </div>
      </div>`;
  }

  // ---------------- boot ----------------
  $('#filters')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    renderCatalog();
  });
  initHeader();
  if (STANDALONE || page !== 'success') initModal();
  if (STANDALONE) {
    const showView = () => $$('[data-view]').forEach((v) => { v.hidden = v.dataset.view !== page; });
    showView();
    window.addEventListener('hashchange', () => {
      const prev = page;
      page = currentPage();
      showView();
      applyLang(lang);
      const anchor = page === 'home' && location.hash.length > 1 && document.getElementById(location.hash.slice(1));
      // a view switch acts like a page load: jump, don't animate (html has scroll-behavior: smooth)
      if (anchor) anchor.scrollIntoView({ behavior: page !== prev ? 'instant' : 'smooth' });
      else if (page !== prev || page === 'product') window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  applyLang(store.get('localStorage', 'lang') || 'uz');

  // reveal on scroll (home)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    $$('.uses li, .service, .list li').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
