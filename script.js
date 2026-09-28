// ============================================================
// SITE DATA — edit here.
// ============================================================

// Contacts. Leave a value empty ('') and the site shows "to be added".
const CONTACTS = {
  phone: '',      // e.g. '+998 90 123 45 67'
  telegram: '',   // username without @, e.g. 'axpedestal'
  instagram: '',  // username without @, e.g. 'axpedestal'
};

// Catalogue. One object per model.
//   name   — model name (shown as is in every language)
//   image  — path to the photo, e.g. 'images/ax-100.jpg' ('' = placeholder drawing)
//   height — height range, e.g. '30–50 mm' ('' = "to be added")
// Material (plastic) and load (up to 1 tonne) come from the brief and apply to every model.
// The entries below are placeholders until the real model list is provided.
const PRODUCTS = [
  { name: 'AX Pedestal — 1', image: '', height: '' },
  { name: 'AX Pedestal — 2', image: '', height: '' },
  { name: 'AX Pedestal — 3', image: '', height: '' },
];

// ============================================================

const i18n = {
  uz: {
    title: 'AX Pedestal — plastik pedestal va tayanch tizimlari',
    'nav.catalog': 'Katalog', 'nav.uses': "Qo'llanilishi", 'nav.services': 'Xizmatlar', 'nav.contact': 'Aloqa',
    'hero.title': 'Plastik pedestal va tayanch tizimlari',
    'hero.lead': "Terassa, balkon, tom maydonlari va ochiq havodagi pol qoplamalarini kerakli balandlikda ushlab turadi va tekislaydi.",
    'hero.cta': "Katalogni ko'rish", 'hero.cta2': 'Narxni bilish',
    'hero.load': '1 tonnagacha', 'hero.loadText': "yuk ko'tarish qobiliyati",
    'f1.k': 'Material', 'f1.v': 'Plastik', 'f2.k': "Yuk ko'tarish", 'f2.v': '1 tonnagacha',
    'f3.k': 'Balandlik', 'f3.v': 'Modelga qarab', 'f4.k': 'Vazifasi', 'f4.v': 'Ushlab turish va tekislash',
    'catalog.eyebrow': 'Katalog', 'catalog.title': 'Mahsulotlar',
    'catalog.lead': "Narxlar so'rov bo'yicha. Kerakli modelda «Narxni bilish» tugmasini bosing — siz bilan bog'lanamiz.",
    'spec.material': 'Material', 'spec.materialV': 'Plastik', 'spec.load': "Yuk ko'tarish", 'spec.loadV': '1 tonnagacha',
    'spec.height': 'Balandlik', price: 'Narxni bilish', pending: 'kiritiladi',
    'uses.eyebrow': "Qo'llanilishi", 'uses.title': 'Qayerda ishlatiladi',
    u1: 'Terassalar', u2: 'Balkonlar', u3: 'Tom maydonlari', u4: 'Ochiq havodagi pol qoplamalari', u5: 'Qurilish va obodonlashtirish loyihalari',
    'clients.eyebrow': 'Mijozlarimiz', 'clients.title': 'Kimlar uchun',
    'clients.lead': 'Kichik balkondan tortib yirik qurilish loyihasigacha — har bir mijozga mos yechim.',
    c1: 'Qurilish kompaniyalari', c2: 'Arxitektorlar va dizaynerlar', c3: 'Qurilish materiallari sotuvchilari', c4: 'Qurilish ustalari', c5: 'Xususiy uy va tijorat binolari egalari',
    'services.eyebrow': 'Xizmatlar', 'services.title': 'Biz nima qilamiz',
    'sv1.t': 'Sotish', 'sv1.d': 'Plastik pedestal va tayanch tizimlarini sotamiz.',
    'sv2.t': 'Ulgurji savdo', 'sv2.d': 'Katta hajmdagi buyurtmalar va sotuvchilar uchun ulgurji savdo.',
    'sv3.t': 'Maslahat', 'sv3.d': 'Loyihangizga mos mahsulotni tanlashda yordam beramiz.',
    'sv4.t': 'Yetkazib berish', 'sv4.d': 'Mahsulotlarni yetkazib berish xizmati mavjud.',
    'contact.eyebrow': 'Aloqa', 'contact.title': 'Narxni bilish va buyurtma',
    'contact.lead': "Ariza qoldiring yoki biz bilan to'g'ridan-to'g'ri bog'laning.",
    'contact.address': 'Manzil', 'contact.city': "Farg'ona, O'zbekiston", 'contact.phone': 'Telefon',
    'form.name': 'Ismingiz', 'form.phone': 'Telefon', 'form.product': 'Mahsulot', 'form.msg': 'Izoh (miqdor, balandlik, obyekt)', 'form.send': 'Narxni bilish',
    'form.error': "Iltimos, ism va telefonni to'ldiring.",
    'form.okTg': 'Ariza matni nusxalandi — Telegram ochilmoqda, uni chatga joylab yuboring.',
    'form.okPhone': "Rahmat! Tezroq javob olish uchun qo'ng'iroq qiling:",
    'form.noContacts': "Aloqa ma'lumotlari tez orada qo'shiladi.",
    'form.heading': "Narx so'rovi", 'footer.tag': "Farg'ona, O'zbekiston",
  },
  ru: {
    title: 'AX Pedestal — пластиковые опоры и опорные системы',
    'nav.catalog': 'Каталог', 'nav.uses': 'Применение', 'nav.services': 'Услуги', 'nav.contact': 'Контакты',
    'hero.title': 'Пластиковые опоры и опорные системы',
    'hero.lead': 'Удерживают и выравнивают напольные покрытия террас, балконов, кровель и открытых площадок на нужной высоте.',
    'hero.cta': 'Смотреть каталог', 'hero.cta2': 'Узнать цену',
    'hero.load': 'до 1 тонны', 'hero.loadText': 'грузоподъёмность',
    'f1.k': 'Материал', 'f1.v': 'Пластик', 'f2.k': 'Нагрузка', 'f2.v': 'до 1 тонны',
    'f3.k': 'Высота', 'f3.v': 'Зависит от модели', 'f4.k': 'Назначение', 'f4.v': 'Опора и выравнивание',
    'catalog.eyebrow': 'Каталог', 'catalog.title': 'Продукция',
    'catalog.lead': 'Цены по запросу. Нажмите «Узнать цену» у нужной модели — мы свяжемся с вами.',
    'spec.material': 'Материал', 'spec.materialV': 'Пластик', 'spec.load': 'Нагрузка', 'spec.loadV': 'до 1 тонны',
    'spec.height': 'Высота', price: 'Узнать цену', pending: 'будет добавлено',
    'uses.eyebrow': 'Применение', 'uses.title': 'Где используется',
    u1: 'Террасы', u2: 'Балконы', u3: 'Кровли', u4: 'Уличные напольные покрытия', u5: 'Строительство и благоустройство',
    'clients.eyebrow': 'Клиенты', 'clients.title': 'Для кого',
    'clients.lead': 'От небольшого балкона до крупного строительного проекта — решение для каждого клиента.',
    c1: 'Строительные компании', c2: 'Архитекторы и дизайнеры', c3: 'Продавцы стройматериалов', c4: 'Строители и мастера', c5: 'Владельцы частных домов и коммерческих зданий',
    'services.eyebrow': 'Услуги', 'services.title': 'Что мы делаем',
    'sv1.t': 'Продажа', 'sv1.d': 'Продаём пластиковые опоры и опорные системы.',
    'sv2.t': 'Оптовая торговля', 'sv2.d': 'Оптовые поставки для крупных заказов и продавцов.',
    'sv3.t': 'Консультация', 'sv3.d': 'Поможем подобрать продукцию под ваш проект.',
    'sv4.t': 'Доставка', 'sv4.d': 'Осуществляем доставку продукции.',
    'contact.eyebrow': 'Контакты', 'contact.title': 'Узнать цену и заказать',
    'contact.lead': 'Оставьте заявку или свяжитесь с нами напрямую.',
    'contact.address': 'Адрес', 'contact.city': 'Фергана, Узбекистан', 'contact.phone': 'Телефон',
    'form.name': 'Ваше имя', 'form.phone': 'Телефон', 'form.product': 'Продукт', 'form.msg': 'Комментарий (количество, высота, объект)', 'form.send': 'Узнать цену',
    'form.error': 'Пожалуйста, укажите имя и телефон.',
    'form.okTg': 'Текст заявки скопирован — открывается Telegram, вставьте его в чат и отправьте.',
    'form.okPhone': 'Спасибо! Для быстрого ответа позвоните:',
    'form.noContacts': 'Контактные данные скоро будут добавлены.',
    'form.heading': 'Запрос цены', 'footer.tag': 'Фергана, Узбекистан',
  },
  en: {
    title: 'AX Pedestal — plastic pedestals and support systems',
    'nav.catalog': 'Catalogue', 'nav.uses': 'Applications', 'nav.services': 'Services', 'nav.contact': 'Contact',
    'hero.title': 'Plastic pedestals and support systems',
    'hero.lead': 'They hold and level terrace, balcony, rooftop and outdoor flooring at the required height.',
    'hero.cta': 'View catalogue', 'hero.cta2': 'Get a price',
    'hero.load': 'Up to 1 tonne', 'hero.loadText': 'load capacity',
    'f1.k': 'Material', 'f1.v': 'Plastic', 'f2.k': 'Load capacity', 'f2.v': 'Up to 1 tonne',
    'f3.k': 'Height', 'f3.v': 'Depends on model', 'f4.k': 'Purpose', 'f4.v': 'Support and levelling',
    'catalog.eyebrow': 'Catalogue', 'catalog.title': 'Products',
    'catalog.lead': "Prices on request. Press “Get a price” on the model you need and we'll contact you.",
    'spec.material': 'Material', 'spec.materialV': 'Plastic', 'spec.load': 'Load capacity', 'spec.loadV': 'Up to 1 tonne',
    'spec.height': 'Height', price: 'Get a price', pending: 'to be added',
    'uses.eyebrow': 'Applications', 'uses.title': 'Where they are used',
    u1: 'Terraces', u2: 'Balconies', u3: 'Rooftops', u4: 'Outdoor flooring', u5: 'Construction and landscaping projects',
    'clients.eyebrow': 'Clients', 'clients.title': 'Who we serve',
    'clients.lead': 'From a small balcony to a large construction project — the right solution for every client.',
    c1: 'Construction companies', c2: 'Architects and designers', c3: 'Building materials retailers', c4: 'Builders and contractors', c5: 'Owners of private homes and commercial buildings',
    'services.eyebrow': 'Services', 'services.title': 'What we do',
    'sv1.t': 'Sales', 'sv1.d': 'We sell plastic pedestals and support systems.',
    'sv2.t': 'Wholesale', 'sv2.d': 'Wholesale supply for large orders and resellers.',
    'sv3.t': 'Consultation', 'sv3.d': 'We help you choose the right product for your project.',
    'sv4.t': 'Delivery', 'sv4.d': 'Product delivery is available.',
    'contact.eyebrow': 'Contact', 'contact.title': 'Get a price and order',
    'contact.lead': 'Leave a request or contact us directly.',
    'contact.address': 'Address', 'contact.city': 'Fergana, Uzbekistan', 'contact.phone': 'Phone',
    'form.name': 'Your name', 'form.phone': 'Phone', 'form.product': 'Product', 'form.msg': 'Notes (quantity, height, site)', 'form.send': 'Get a price',
    'form.error': 'Please fill in your name and phone.',
    'form.okTg': 'Request text copied — Telegram is opening, paste it into the chat and send.',
    'form.okPhone': 'Thank you! For a quick answer, call:',
    'form.noContacts': 'Contact details will be added soon.',
    'form.heading': 'Price request', 'footer.tag': 'Fergana, Uzbekistan',
  },
};

const PLACEHOLDER_SVG = '<svg viewBox="0 0 120 120" aria-hidden="true"><rect class="a" x="20" y="16" width="80" height="10" rx="3"/><rect class="b" x="48" y="26" width="24" height="56"/><rect class="a" x="40" y="66" width="40" height="10" rx="3"/><path class="a" d="M14 104 L40 82 L80 82 L106 104 Z"/></svg>';

let lang = 'uz';
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;

function renderProducts() {
  const d = i18n[lang];
  $('#products').innerHTML = PRODUCTS.map((p, i) => `
    <article class="product">
      <div class="product__img">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : PLACEHOLDER_SVG}</div>
      <div class="product__body">
        <h3>${esc(p.name)}</h3>
        <dl class="specs">
          <div><dt>${d['spec.material']}</dt><dd>${d['spec.materialV']}</dd></div>
          <div><dt>${d['spec.load']}</dt><dd>${d['spec.loadV']}</dd></div>
          <div><dt>${d['spec.height']}</dt><dd>${p.height ? esc(p.height) : `<i>${d.pending}</i>`}</dd></div>
        </dl>
        <button type="button" class="btn btn--primary btn--sm" data-product="${i}">${d.price}</button>
      </div>
    </article>`).join('');
  $('#productSelect').innerHTML = PRODUCTS.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join('');
}

function renderContacts() {
  const d = i18n[lang];
  const links = {
    phone: CONTACTS.phone && `<a href="${telHref(CONTACTS.phone)}">${esc(CONTACTS.phone)}</a>`,
    telegram: CONTACTS.telegram && `<a href="https://t.me/${encodeURIComponent(CONTACTS.telegram)}" target="_blank" rel="noopener">@${esc(CONTACTS.telegram)}</a>`,
    instagram: CONTACTS.instagram && `<a href="https://instagram.com/${encodeURIComponent(CONTACTS.instagram)}" target="_blank" rel="noopener">@${esc(CONTACTS.instagram)}</a>`,
  };
  document.querySelectorAll('[data-contact]').forEach((el) => {
    el.innerHTML = links[el.dataset.contact] || `<span class="pending">${d.pending}</span>`;
  });
}

function setLang(next) {
  if (!i18n[next]) return;
  const selected = $('#productSelect').value;
  lang = next;
  const d = i18n[lang];
  document.documentElement.lang = lang;
  document.title = d.title;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = d[el.dataset.i18n];
    if (v) el.textContent = v;
  });
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));
  renderProducts();
  renderContacts();
  if (selected) $('#productSelect').value = selected;
  $('#formNote').textContent = '';
  try { localStorage.setItem('lang', lang); } catch { /* storage unavailable */ }
}

document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
let stored = null;
try { stored = localStorage.getItem('lang'); } catch { /* storage unavailable */ }
setLang(stored || 'uz');

// "Get a price" on a product card: preselect it in the form and scroll there
$('#products').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-product]');
  if (!btn) return;
  $('#productSelect').value = btn.dataset.product;
  $('#contact').scrollIntoView();
  setTimeout(() => $('#form').elements.name.focus({ preventScroll: true }), 400);
});

// mobile menu
const burger = $('#burger');
const nav = $('#nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}));

// reveal on scroll
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.uses li, .service, .list li').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// form: Telegram if configured, otherwise phone, otherwise an honest notice
const form = $('#form');
const note = $('#formNote');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = i18n[lang];
  const f = form.elements;
  const required = [f.name, f.phone];
  required.forEach((el) => el.classList.toggle('is-invalid', !el.value.trim()));
  if (required.some((el) => !el.value.trim())) { note.textContent = d['form.error']; return; }

  if (CONTACTS.telegram) {
    const text = [
      `${d['form.heading']} — AX Pedestal`,
      `${d['form.name']}: ${f.name.value.trim()}`,
      `${d['form.phone']}: ${f.phone.value.trim()}`,
      `${d['form.product']}: ${PRODUCTS[f.product.value]?.name ?? ''}`,
      f.msg.value.trim() && `${d['form.msg']}: ${f.msg.value.trim()}`,
    ].filter(Boolean).join('\n');
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    note.textContent = d['form.okTg'];
    window.open(`https://t.me/${encodeURIComponent(CONTACTS.telegram)}`, '_blank', 'noopener');
  } else if (CONTACTS.phone) {
    note.innerHTML = `${esc(d['form.okPhone'])} <a href="${telHref(CONTACTS.phone)}">${esc(CONTACTS.phone)}</a>`;
  } else {
    note.textContent = d['form.noContacts'];
  }
});

$('#year').textContent = new Date().getFullYear();
