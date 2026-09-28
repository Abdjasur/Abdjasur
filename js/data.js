// ============================================================
// SITE DATA — edit here.
// ============================================================

// Public contacts. Leave a value empty ('') and the site shows "to be added".
// (The Telegram BOT token is NOT here — it lives only on the server, see README.)
window.CONTACTS = {
  phone: '',      // e.g. '+998 90 123 45 67'
  telegram: '',   // manager's Telegram username without @, e.g. 'axpedestal'
  instagram: '',  // Instagram username without @
};

// Catalogue. One object per model.
//   slug   — used in the product page URL: product.html?id=<slug>
//   name   — model name (shown as is in every language)
//   image  — path to the photo, e.g. 'images/ax-100.jpg' ('' = placeholder drawing)
//   height — height range, e.g. '30–50 mm' ('' = "to be added")
// Material (plastic) and load (up to 1 tonne) come from the company brief and apply to every model.
// The entries below are placeholders until the real model list is provided.
window.PRODUCTS = [
  { slug: 'model-1', name: 'AX Pedestal — 1', image: '', height: '' },
  { slug: 'model-2', name: 'AX Pedestal — 2', image: '', height: '' },
  { slug: 'model-3', name: 'AX Pedestal — 3', image: '', height: '' },
];

// Order API. Default: same server that serves the site (see server/server.js).
// If the site is hosted separately (e.g. GitHub Pages), put the backend URL here,
// e.g. 'https://api.axpedestal.uz/api/orders', and set ALLOWED_ORIGIN on the server.
window.ORDER_API_URL = '/api/orders';
