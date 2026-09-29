// ============================================================
// SITE DATA — edit here.
// Product facts come from the company presentation "AX Pedestal — Регулируемые опоры".
// ============================================================

// Public contacts. Leave a value empty ('') and the site shows "to be added".
// (The Telegram BOT token is NOT here — it lives only on the server, see README.)
window.CONTACTS = {
  phone: '+998 90 207 50 20',      // e.g. '+998 90 123 45 67'
  telegram: '',                    // manager's Telegram username without @, e.g. 'axpedestal'
  telegramChannel: 'axpedestal',   // public Telegram channel username without @
  instagram: 'axpedestal_com',     // Instagram username without @
  email: 'axpedestal@gmail.com',
};

// Spec values: a plain string is shown as is in every language;
// { t: 'key' } or { t: ['key1', 'key2'] } is translated via js/i18n.js.
const PP = { t: 'v.pp' };
const BLACK = { t: 'v.black' };
const ADJ_COMMON = (kitCode) => [
  ['s.load', '600–1100 kg'],
  ['s.material', PP],
  ['s.color', BLACK],
  ['s.top', { t: ['v.topTile', 'v.topDeck'] }],
  ['s.use', { t: ['v.useDeck', 'v.useTile'] }],
  ['s.area', { t: ['v.areaOutdoorDeck', 'v.areaIndoor'] }],
  ['s.base', { t: ['v.baseSolid', 'v.baseSloped'] }],
  ['s.kit', { t: ['v.kitTop', `AX PEDESTAL ${kitCode}`] }],
];

// Catalogue.
//   slug      — used in the product page URL: product.html?id=<slug>
//   code      — model code shown on the site
//   category  — 'adjustable' | 'fixed' | 'accessory'
//   image     — main photo; gallery — extra images (drawing, usage example)
//   height    — short height label for cards; specs — rows for the product page
//   details   — false when the presentation gives only the height range (full specs on request)
window.PRODUCTS = [
  { slug: 'pa-a-01', code: 'PA-A-01', category: 'adjustable', image: 'images/pa-a-01.webp', gallery: ['images/pa-a-01-drawing.webp'],
    height: '30–45 mm', load: '600–1100 kg',
    specs: [['s.height', '30–45 mm'], ['s.size', '150 × 195 × (30–45) mm'], ...ADJ_COMMON('030–045')] },
  { slug: 'pa-a-02', code: 'PA-A-02', category: 'adjustable', image: 'images/pa-a-02.webp', gallery: ['images/pa-a-02-drawing.webp'],
    height: '45–70 mm', load: '600–1100 kg',
    specs: [['s.height', '45–70 mm'], ['s.size', '150 × 195 × (45–70) mm'], ...ADJ_COMMON('045–070')] },
  { slug: 'pa-a-03', code: 'PA-A-03', category: 'adjustable', image: 'images/pa-a-03.webp', gallery: ['images/pa-a-03-drawing.webp'],
    height: '70–120 mm', load: '600–1100 kg',
    specs: [['s.height', '70–120 mm'], ['s.size', '150 × 195 × (70–120) mm'], ...ADJ_COMMON('070–120')] },
  { slug: 'pa-a-04', code: 'PA-A-04', category: 'adjustable', image: 'images/pa-a-04.webp', gallery: [],
    height: '145–170 mm', details: false,
    specs: [['s.height', '145–170 mm'], ['s.material', PP], ['s.top', { t: ['v.topTile', 'v.topDeck'] }]] },
  { slug: 'pa-a-05', code: 'PA-A-05', category: 'adjustable', image: 'images/pa-a-05.webp', gallery: [],
    height: '170–220 mm', details: false,
    specs: [['s.height', '170–220 mm'], ['s.material', PP], ['s.top', { t: ['v.topTile', 'v.topDeck'] }]] },
  { slug: 'pa-a-06', code: 'PA-A-06', category: 'adjustable', image: 'images/pa-a-06.webp', gallery: [],
    height: '270–320 mm', details: false,
    specs: [['s.height', '270–320 mm'], ['s.material', PP], ['s.top', { t: ['v.topTile', 'v.topDeck'] }]] },
  { slug: 'pa-01', code: 'PA-01', category: 'fixed', image: 'images/pa-01.webp', gallery: ['images/pa-01-drawing.webp'],
    height: '20 mm', load: '1000–1800 kg',
    specs: [
      ['s.height', '20 mm'], ['s.stack', { t: 'v.stack' }], ['s.size', '150 × 150 × 38 mm'], ['s.spacer', '3.8 mm'],
      ['s.load', '1000–1800 kg'], ['s.material', PP], ['s.color', BLACK], ['s.use', { t: 'v.useTile' }],
      ['s.area', { t: 'v.areaOutdoor' }], ['s.base', { t: 'v.baseSolid' }], ['s.temp', '−30 … +90 °C'],
    ] },
  { slug: 'sh-0135', code: 'SH-0135', category: 'accessory', kind: 'pad', image: 'images/sh-0135.webp', gallery: ['images/use-sh-0135.webp'],
    specs: [['s.purpose', { t: 'v.padPurpose' }], ['s.diameter', '135 mm'], ['s.addHeight', '1.5 mm'], ['s.material', { t: 'v.pvc' }]] },
  { slug: 'pa-sp-02', code: 'PA-SP-02', category: 'accessory', kind: 'tileHead', image: 'images/pa-sp-02.webp', gallery: ['images/use-pa-sp-02.webp'],
    specs: [['s.purpose', { t: 'v.tileHeadPurpose' }], ['s.joint', '2 mm'], ['s.material', PP]] },
  { slug: 'pa-ad', code: 'PA-AD', category: 'accessory', kind: 'joistHead', image: 'images/pa-ad.webp', gallery: ['images/use-pa-ad.webp'],
    specs: [['s.purpose', { t: 'v.joistHeadPurpose' }], ['s.joists', { t: 'v.joistTypes' }], ['s.material', PP]] },
  { slug: 'ps-100', code: 'PS (100 mm)', category: 'accessory', kind: 'extender', image: 'images/ps-100.webp', gallery: ['images/use-ps-100.webp'],
    specs: [['s.purpose', { t: 'v.extenderPurpose' }], ['s.addHeight', '100 mm'], ['s.material', PP]] },
  { slug: 'sl-0-5', code: 'SL (0–5%)', category: 'accessory', kind: 'slope', image: 'images/sl-0-5.webp', gallery: ['images/use-sl-0-5.webp'],
    specs: [['s.purpose', { t: 'v.slopePurpose' }], ['s.slope', '0–5%'], ['s.addHeight', '16 mm'], ['s.material', PP]] },
];

// Order API. Default: same server that serves the site (see server/server.js).
// If the site is hosted separately (e.g. GitHub Pages), put the backend URL here,
// e.g. 'https://api.axpedestal.uz/api/orders', and set ALLOWED_ORIGIN on the server.
window.ORDER_API_URL = '/api/orders';
