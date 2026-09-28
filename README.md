# AX Pedestal — veb-sayt va buyurtma tizimi

Plastik pedestal va tayanch tizimlari katalogi, mahsulot sahifalari, buyurtma
formasi va buyurtmalarni kompaniyaning Telegram botiga yuboruvchi backend.

## Tuzilishi

| Fayl | Vazifasi |
|---|---|
| `index.html` | Bosh sahifa: katalog, qo'llanilishi, mijozlar, xizmatlar, aloqa |
| `product.html?id=<slug>` | Mahsulot sahifasi: rasm, tavsif, texnik xususiyatlar, miqdor, buyurtma |
| `order-success.html` | Buyurtma tasdiqlash sahifasi |
| `js/data.js` | **Tahrirlanadigan ma'lumotlar**: mahsulotlar, telefon, Telegram, Instagram |
| `js/i18n.js` | UZ / RU / EN matnlar |
| `js/app.js` | Sayt logikasi: til, katalog, buyurtma oynasi, validatsiya |
| `styles.css` | Dizayn (mobil ≤767px, planshet 768–1439px, desktop ≥1440px) |
| `server/server.js` | Backend: saytni ko'rsatadi, `POST /api/orders` → diskka yozadi → Telegram bot |

## Ishga tushirish

Node.js 18 yoki undan yangi versiya kerak. Tashqi paketlar yo'q.

```bash
cp .env.example .env        # qiymatlarni to'ldiring
set -a; . ./.env; set +a    # yoki hosting panelida environment variables sifatida kiriting
npm start                   # http://localhost:3000
npm test                    # backend testlari
```

## Telegram botni ulash

1. Telegramda **@BotFather** → `/newbot` → bot yarating va **token**ni oling.
2. Buyurtmalar tushadigan guruh yarating va botni unga qo'shing
   (yoki botga shaxsiy xabar yozing).
3. Guruhga istalgan xabar yozing, so'ng brauzerda oching:
   `https://api.telegram.org/bot<TOKEN>/getUpdates` — `"chat":{"id": ...}`
   dagi raqam **TELEGRAM_CHAT_ID** bo'ladi (guruhlarda u `-100…` bilan boshlanadi).
4. `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` ni serverning environment
   variables'iga kiriting va serverni qayta ishga tushiring.
5. Tekshirish: `http://<sayt>/api/health` → `"telegramConfigured": true`.

**Xavfsizlik:** bot tokeni faqat serverda turadi — frontend kodida, `js/data.js`
da yoki GitHub'da bo'lmasligi kerak. `.env` fayli `.gitignore` da.

## Buyurtma yo'qolmasligi

- Server buyurtmani **avval** `server/data/orders.jsonl` ga yozadi, keyin Telegramga yuboradi.
- Telegram ishlamay qolsa, buyurtma baribir qabul qilinadi, `server/data/unsent.json`
  navbatiga tushadi va har daqiqada qayta yuboriladi.
- Brauzerda forma ma'lumotlari qoralama sifatida saqlanadi: xato bo'lsa yoki sahifa
  yopilsa, qayta ochilganda tiklanadi. Qayta bosishda buyurtma ikki marta yaratilmaydi.
- `server/data/` papkasini doimiy diskda saqlang va zaxira nusxasini oling.

## Hosting

Backend Node.js server bo'lgani uchun GitHub Pages yetarli emas. Mos variantlar:
VPS (masalan, `pm2 start server/server.js`), Render, Railway va boshqa Node hostinglar.
Sayt va API bitta serverda bo'lsa, qo'shimcha sozlash kerak emas.

Agar sayt alohida domenda (masalan, GitHub Pages'da) tursa:
`js/data.js` dagi `ORDER_API_URL` ga backend manzilini yozing va serverda
`ALLOWED_ORIGIN=https://sayt-domeni` ni belgilang.

## Mahsulot qo'shish

`js/data.js` dagi `PRODUCTS` ro'yxatiga yozing:

```js
{ slug: 'ax-100', name: 'AX-100', image: 'images/ax-100.jpg', height: '30–50 mm' },
```

Rasmlarni `images/` papkasiga joylang.
