// AX Pedestal — shared site logic: language, header, catalogue, product page, order modal, success page.
(() => {
  const I18N = window.I18N;
  const PRODUCTS = window.PRODUCTS;
  const CONTACTS = window.CONTACTS;
  const ORDER_API_URL = window.ORDER_API_URL || '/api/orders';
  const DRAFT_KEY = 'ax-order-draft';
  const LAST_ORDER_KEY = 'ax-last-order';
  const page = document.body.dataset.page;

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
  const productUrl = (p) => `product.html?id=${encodeURIComponent(p.slug)}`;
  const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;
  const tgUrl = () => (CONTACTS.telegram ? `https://t.me/${encodeURIComponent(CONTACTS.telegram)}` : '');

  const PLACEHOLDER_SVG = '<svg viewBox="0 0 120 120" aria-hidden="true"><rect class="a" x="20" y="16" width="80" height="10" rx="3"/><rect class="b" x="48" y="26" width="24" height="56"/><rect class="a" x="40" y="66" width="40" height="10" rx="3"/><path class="a" d="M14 104 L40 82 L80 82 L106 104 Z"/></svg>';
  const TG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 4.3 2.9 11.5c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.5c.3-1.3-.5-1.8-1.4-1.3ZM8.6 14.2l9.5-6c.5-.3.9-.1.5.2l-7.9 7.1-.3 3.3-1.8-4.6Z"/></svg>';

  function specsHtml(p) {
    return `<dl class="specs">
      <div><dt>${t('spec.material')}</dt><dd>${t('spec.materialV')}</dd></div>
      <div><dt>${t('spec.load')}</dt><dd>${t('spec.loadV')}</dd></div>
      <div><dt>${t('spec.height')}</dt><dd>${p.height ? esc(p.height) : `<i>${t('pending')}</i>`}</dd></div>
    </dl>`;
  }
  const imageHtml = (p, eager) => (p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" ${eager ? '' : 'loading="lazy"'}>`
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
    if (page === 'home') renderCatalog();
    if (page === 'product') renderProduct();
    if (page === 'success') renderSuccess();
    if (modal) renderModalOptions();
    document.title = page === 'product' && currentProduct ? `${currentProduct.name} — AX Pedestal`
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
    };
    $$('[data-contact]').forEach((el) => { el.innerHTML = links[el.dataset.contact] || `<span class="pending">${t('pending')}</span>`; });
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
  function renderCatalog() {
    const box = $('#products');
    if (!box) return;
    box.innerHTML = PRODUCTS.map((p) => `
      <article class="product">
        <a class="product__img" href="${productUrl(p)}" aria-label="${esc(p.name)}">${imageHtml(p)}</a>
        <div class="product__body">
          <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
          ${specsHtml(p)}
          <div class="product__actions">
            <button type="button" class="btn btn--primary btn--sm" data-order="${esc(p.slug)}">${t('order')}</button>
            <a class="btn btn--ghost btn--sm" href="${productUrl(p)}">${t('details')}</a>
          </div>
        </div>
      </article>`).join('');
  }

  // ---------------- product page ----------------
  let currentProduct = null;
  let qty = 1;
  function renderProduct() {
    const box = $('#productPage');
    if (!box) return;
    const slug = new URLSearchParams(location.search).get('id');
    currentProduct = productBySlug(slug) || null;
    if (!currentProduct) {
      box.innerHTML = `<div class="empty"><h1>${t('pp.notFound')}</h1><a class="btn btn--primary" href="index.html#catalog">${t('pp.back')}</a></div>`;
      return;
    }
    const p = currentProduct;
    box.innerHTML = `
      <nav class="crumbs"><a href="index.html#catalog">← ${t('pp.back')}</a></nav>
      <div class="pp">
        <div class="pp__media">${imageHtml(p, true)}</div>
        <div class="pp__info">
          <p class="badge"><span class="dot"></span>ECO PRODUCTS</p>
          <h1 class="pp__title">${esc(p.name)}</h1>
          <p class="pp__desc">${t('pp.desc')}</p>
          <h2 class="pp__h">${t('pp.specs')}</h2>
          ${specsHtml(p)}
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
      ${PRODUCTS.length > 1 ? `<section class="pp__others"><h2>${t('pp.others')}</h2><div class="others">${PRODUCTS.filter((o) => o !== p).map((o) => `
        <a class="other" href="${productUrl(o)}"><span class="other__img">${imageHtml(o)}</span><span>${esc(o.name)}</span></a>`).join('')}</div></section>` : ''}`;
    bindStepper($('.qty', box), (v) => { qty = v; });
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
    product.innerHTML = PRODUCTS.map((p) => `<option value="${esc(p.slug)}">${esc(p.name)}</option>`).join('');
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
      product: productBySlug(f.product.value)?.name || '',
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
        location.href = `order-success.html?id=${encodeURIComponent(body.id)}`;
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
    const id = new URLSearchParams(location.search).get('id');
    if (!id) { location.replace('index.html'); return; }
    const o = store.get('sessionStorage', LAST_ORDER_KEY);
    const summary = o && o.id === id ? `
      <h2 class="success__h">${t('s.summary')}</h2>
      <dl class="specs specs--summary">
        <div><dt>${t('m.product')}</dt><dd>${esc(o.product)}</dd></div>
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
          <a class="btn btn--primary btn--lg" href="index.html">${t('s.home')}</a>
          <a class="btn btn--ghost btn--lg" href="index.html#catalog">${t('s.catalog')}</a>
        </div>
      </div>`;
  }

  // ---------------- boot ----------------
  initHeader();
  if (page !== 'success') initModal();
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
