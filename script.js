// Telegram username that receives form requests (without @). Replace with the real one.
const TELEGRAM_USERNAME = 'pedestal';

const i18n = {
  uz: {
    'nav.products': 'Mahsulotlar', 'nav.materials': 'Materiallar', 'nav.process': 'Jarayon', 'nav.works': 'Ishlarimiz', 'nav.contact': 'Aloqa',
    'hero.eyebrow': 'Buyurtma asosida ishlab chiqarish',
    'hero.title': 'Mahsulotingizga munosib postament',
    'hero.lead': "Do'konlar, galereyalar, muzeylar va ko'rgazmalar uchun postament, podium va vitrinalar. Loyihadan o'rnatishgacha — hammasi bir joyda.",
    'hero.cta': 'Buyurtma berish', 'hero.cta2': "Katalogni ko'rish",
    'stats.custom': "o'lchamga moslab", 'stats.materials': 'turdagi material', 'stats.design': 'eskiz bepul',
    'products.eyebrow': 'Mahsulotlar', 'products.title': 'Nima tayyorlaymiz',
    'p1.title': 'Postamentlar', 'p1.text': 'Haykal, vaza va eksponatlar uchun klassik va zamonaviy postamentlar.',
    'p2.title': 'Podiumlar', 'p2.text': "Do'kon vitrinasi, mashina taqdimoti va sahna uchun past va keng podiumlar.",
    'p3.title': 'Vitrinalar', 'p3.text': 'Zargarlik, muzey va kolleksiyalar uchun shisha qopqoqli, yoritilgan vitrinalar.',
    'p4.title': "Ko'rgazma stendlari", 'p4.text': "Ko'rgazma va yarmarkalar uchun yig'ma, brendlangan stend va resepshn stollari.",
    'materials.eyebrow': 'Materiallar', 'materials.title': "Har bir loyihaga — o'z materiali",
    'materials.lead': 'Materialni byudjet, interyer va yuklamaga qarab birgalikda tanlaymiz.',
    m1: "Yog'och (eman, yong'oq)", m2: "Bo'yalgan MDF", m3: "Marmar va sun'iy tosh", m4: "Metall (po'lat, latun)", m5: 'Akril va shisha', m6: 'Dekorativ beton',
    'process.eyebrow': 'Jarayon', 'process.title': "Buyurtmadan o'rnatishgacha",
    's1.title': 'Ariza', 's1.text': "Vazifa, o'lcham va muddatni muhokama qilamiz.",
    's2.title': '3D eskiz', 's2.text': 'Bepul vizualizatsiya va aniq narx taklifi.',
    's3.title': 'Ishlab chiqarish', 's3.text': "O'z sexmizda, har bir bosqich nazorati bilan.",
    's4.title': "Yetkazish va o'rnatish", 's4.text': "Obyektga olib borib, joyida o'rnatib beramiz.",
    'works.eyebrow': 'Ishlarimiz', 'works.title': 'Kimlar uchun ishlaymiz',
    w1: 'Butiklar va shourumlar', w2: 'Galereya va muzeylar', w3: "Ko'rgazma va taqdimotlar", w4: 'Mehmonxona va restoranlar',
    'contact.eyebrow': 'Aloqa', 'contact.title': 'Loyihangizni muhokama qilaylik',
    'contact.lead': "Ariza qoldiring — 1 ish kuni ichida bog'lanamiz va bepul maslahat beramiz.",
    'contact.phone': 'Telefon', 'contact.address': 'Manzil', 'contact.city': "Toshkent, O'zbekiston",
    'form.name': 'Ismingiz', 'form.phone': 'Telefon', 'form.type': 'Nima kerak?', 'form.msg': "Izoh (o'lcham, soni, muddat)", 'form.send': 'Yuborish',
    'form.error': "Iltimos, ism va telefonni to'ldiring.",
    'form.ok': 'Ariza matni nusxalandi — Telegram ochilmoqda, uni chatga joylab yuboring.',
    'form.heading': 'Yangi ariza', 'footer.tag': 'Postament, podium va vitrinalar',
    title: 'Pedestal — postament va podiumlar',
  },
  ru: {
    'nav.products': 'Продукция', 'nav.materials': 'Материалы', 'nav.process': 'Процесс', 'nav.works': 'Работы', 'nav.contact': 'Контакты',
    'hero.eyebrow': 'Производство на заказ',
    'hero.title': 'Постамент, достойный вашего продукта',
    'hero.lead': 'Постаменты, подиумы и витрины для магазинов, галерей, музеев и выставок. От проекта до монтажа — всё в одном месте.',
    'hero.cta': 'Оставить заявку', 'hero.cta2': 'Смотреть каталог',
    'stats.custom': 'под ваши размеры', 'stats.materials': 'видов материалов', 'stats.design': 'эскиз бесплатно',
    'products.eyebrow': 'Продукция', 'products.title': 'Что мы делаем',
    'p1.title': 'Постаменты', 'p1.text': 'Классические и современные постаменты для скульптур, ваз и экспонатов.',
    'p2.title': 'Подиумы', 'p2.text': 'Низкие и широкие подиумы для витрин, презентаций автомобилей и сцены.',
    'p3.title': 'Витрины', 'p3.text': 'Витрины со стеклянным колпаком и подсветкой для ювелирных изделий, музеев и коллекций.',
    'p4.title': 'Выставочные стенды', 'p4.text': 'Сборные брендированные стенды и ресепшн-стойки для выставок и ярмарок.',
    'materials.eyebrow': 'Материалы', 'materials.title': 'Каждому проекту — свой материал',
    'materials.lead': 'Подбираем материал вместе с вами — под бюджет, интерьер и нагрузку.',
    m1: 'Дерево (дуб, орех)', m2: 'Крашеный МДФ', m3: 'Мрамор и искусственный камень', m4: 'Металл (сталь, латунь)', m5: 'Акрил и стекло', m6: 'Декоративный бетон',
    'process.eyebrow': 'Процесс', 'process.title': 'От заявки до монтажа',
    's1.title': 'Заявка', 's1.text': 'Обсуждаем задачу, размеры и сроки.',
    's2.title': '3D-эскиз', 's2.text': 'Бесплатная визуализация и точное коммерческое предложение.',
    's3.title': 'Производство', 's3.text': 'В собственном цеху, с контролем на каждом этапе.',
    's4.title': 'Доставка и монтаж', 's4.text': 'Привозим на объект и устанавливаем на месте.',
    'works.eyebrow': 'Работы', 'works.title': 'Для кого мы работаем',
    w1: 'Бутики и шоурумы', w2: 'Галереи и музеи', w3: 'Выставки и презентации', w4: 'Отели и рестораны',
    'contact.eyebrow': 'Контакты', 'contact.title': 'Обсудим ваш проект',
    'contact.lead': 'Оставьте заявку — свяжемся в течение 1 рабочего дня и бесплатно проконсультируем.',
    'contact.phone': 'Телефон', 'contact.address': 'Адрес', 'contact.city': 'Ташкент, Узбекистан',
    'form.name': 'Ваше имя', 'form.phone': 'Телефон', 'form.type': 'Что нужно?', 'form.msg': 'Комментарий (размер, количество, сроки)', 'form.send': 'Отправить',
    'form.error': 'Пожалуйста, укажите имя и телефон.',
    'form.ok': 'Текст заявки скопирован — открывается Telegram, вставьте его в чат и отправьте.',
    'form.heading': 'Новая заявка', 'footer.tag': 'Постаменты, подиумы и витрины',
    title: 'Pedestal — постаменты и подиумы',
  },
  en: {
    'nav.products': 'Products', 'nav.materials': 'Materials', 'nav.process': 'Process', 'nav.works': 'Work', 'nav.contact': 'Contact',
    'hero.eyebrow': 'Made to order',
    'hero.title': 'A pedestal worthy of your product',
    'hero.lead': 'Pedestals, podiums and display cases for shops, galleries, museums and exhibitions. From design to installation — all in one place.',
    'hero.cta': 'Place an order', 'hero.cta2': 'View catalogue',
    'stats.custom': 'made to your size', 'stats.materials': 'material types', 'stats.design': 'free sketch',
    'products.eyebrow': 'Products', 'products.title': 'What we make',
    'p1.title': 'Pedestals', 'p1.text': 'Classic and modern pedestals for sculptures, vases and exhibits.',
    'p2.title': 'Podiums', 'p2.text': 'Low, wide podiums for shop windows, car launches and stages.',
    'p3.title': 'Display cases', 'p3.text': 'Lit display cases with glass covers for jewellery, museums and collections.',
    'p4.title': 'Exhibition stands', 'p4.text': 'Modular branded stands and reception desks for exhibitions and trade fairs.',
    'materials.eyebrow': 'Materials', 'materials.title': 'The right material for every project',
    'materials.lead': 'We choose the material together with you — to fit the budget, interior and load.',
    m1: 'Wood (oak, walnut)', m2: 'Painted MDF', m3: 'Marble and engineered stone', m4: 'Metal (steel, brass)', m5: 'Acrylic and glass', m6: 'Decorative concrete',
    'process.eyebrow': 'Process', 'process.title': 'From request to installation',
    's1.title': 'Request', 's1.text': 'We discuss the brief, dimensions and deadline.',
    's2.title': '3D sketch', 's2.text': 'A free visualisation and an exact quote.',
    's3.title': 'Production', 's3.text': 'In our own workshop, with checks at every stage.',
    's4.title': 'Delivery & installation', 's4.text': 'We deliver to the site and install on the spot.',
    'works.eyebrow': 'Work', 'works.title': 'Who we work for',
    w1: 'Boutiques and showrooms', w2: 'Galleries and museums', w3: 'Exhibitions and launches', w4: 'Hotels and restaurants',
    'contact.eyebrow': 'Contact', 'contact.title': "Let's discuss your project",
    'contact.lead': "Leave a request — we'll get back to you within 1 business day with free advice.",
    'contact.phone': 'Phone', 'contact.address': 'Address', 'contact.city': 'Tashkent, Uzbekistan',
    'form.name': 'Your name', 'form.phone': 'Phone', 'form.type': 'What do you need?', 'form.msg': 'Notes (size, quantity, deadline)', 'form.send': 'Send',
    'form.error': 'Please fill in your name and phone.',
    'form.ok': 'Request text copied — Telegram is opening, paste it into the chat and send.',
    'form.heading': 'New request', 'footer.tag': 'Pedestals, podiums and display cases',
    title: 'Pedestal — pedestals and podiums',
  },
};

let lang = 'uz';

function readStoredLang() {
  try { return localStorage.getItem('lang'); } catch { return null; }
}

function setLang(next) {
  if (!i18n[next]) return;
  lang = next;
  const dict = i18n[lang];
  document.documentElement.lang = lang;
  document.title = dict.title;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = dict[el.dataset.i18n];
    if (value) el.textContent = value;
  });
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));
  document.getElementById('formNote').textContent = '';
  try { localStorage.setItem('lang', lang); } catch { /* storage unavailable */ }
}

document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
setLang(readStoredLang() || 'uz');

// mobile menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}));

// reveal on scroll
const revealTargets = document.querySelectorAll('.card, .steps li, .work, .swatches li');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  revealTargets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// form: builds the request text, copies it and opens the Telegram chat
const form = document.getElementById('form');
const note = document.getElementById('formNote');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const dict = i18n[lang];
  const f = form.elements;
  const required = [f.name, f.phone];
  required.forEach((el) => el.classList.toggle('is-invalid', !el.value.trim()));
  if (required.some((el) => !el.value.trim())) {
    note.textContent = dict['form.error'];
    return;
  }
  const text = [
    `${dict['form.heading']} — Pedestal`,
    `${dict['form.name']}: ${f.name.value.trim()}`,
    `${dict['form.phone']}: ${f.phone.value.trim()}`,
    `${dict['form.type']} ${f.type.value}`,
    f.msg.value.trim() && `${dict['form.msg']}: ${f.msg.value.trim()}`,
  ].filter(Boolean).join('\n');
  try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
  note.textContent = dict['form.ok'];
  window.open(`https://t.me/${TELEGRAM_USERNAME}`, '_blank', 'noopener');
});

document.getElementById('year').textContent = new Date().getFullYear();
