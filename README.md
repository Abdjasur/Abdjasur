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

## Bitta HTML fayl (tayyor versiya)

`dist/ax-pedestal.html` — butun sayt bitta faylda: dizayn, skriptlar va barcha rasmlar
ichiga joylangan. Ikki marta bosib brauzerda ochiladi, server shart emas.
Mahsulot va tasdiqlash sahifalari shu fayl ichida ochiladi (`#product=pa-a-01`).

- `js/data.js` yoki boshqa fayllarni o'zgartirgandan keyin qayta yig'ing: `npm run build`
- Buyurtma formasi `ORDER_API_URL` ga yuboradi. Faylni serversiz ochganda buyurtma
  serverga ketmaydi — forma xato xabarini ko'rsatadi va «Telegram orqali buyurtma
  berish» tugmasi ishlaydi. Buyurtmalar Telegram botga tushishi uchun backendni
  ishga tushiring va `ORDER_API_URL` ga uning to'liq manzilini yozing.

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

## Mahsulotlar va rasmlar

Katalog ma'lumotlari kompaniya taqdimotidan ("AX Pedestal — Регулируемые опоры") olingan:
PA-A-01…PA-A-06 rostlanadigan tayanchlar, PA-01 rostlanmaydigan tayanch va 5 ta aksessuar
(SH-0135, PA-SP-02, PA-AD, PS 100 mm, SL 0–5%). Rasmlar `images/` papkasida — taqdimotdan
ajratib olingan (fonsiz WebP). Logotip: `images/logo.png`, `images/logo-mark.png`,
ijtimoiy tarmoqlar uchun `images/logo-3d.webp`.

## Mahsulot qo'shish

`js/data.js` dagi `PRODUCTS` ro'yxatiga yozing (mavjud yozuvlarni namuna sifatida ishlating):

```js
{ slug: 'pa-a-07', code: 'PA-A-07', category: 'adjustable', image: 'images/pa-a-07.webp', gallery: [],
  height: '320–420 mm', specs: [['s.height', '320–420 mm'], ['s.material', { t: 'v.pp' }]] },
```

`category`: `adjustable` (rostlanadigan), `fixed` (rostlanmaydigan) yoki `accessory` (aksessuar).
