# ESSGRAY PUB & RESTAURANT — Website

A restaurant website built with HTML, CSS, and vanilla JavaScript, with orders
sent straight to a Telegram chat via a Vercel serverless function.

---

## 📁 Folder Structure

```
essgray/
├── index.html
├── style.css
├── main.js
├── api/
│   └── send-order.js   ← Vercel serverless function, talks to Telegram
├── images/              ← put ALL your images here
├── vercel.json
└── README.md
```

Everything is **flat** — `style.css` and `main.js` sit directly next to
`index.html`, not inside `css/` or `js/` subfolders. Make sure any file
references match this.

---

## 🖼️ Images

Put all images in an `images/` folder right next to `index.html`. The site
expects these exact filenames (case-sensitive):

**Food:** jollof.jpg, grilled5.jpg, friedrice.jpg, banku.jpg, fufu.jpg, grilled2.jpg
**Drinks:** guinness.jpg, shandy.jpg, club.jpg, miniclub.jpg, gulder.jpg, star.jpg,
egalewhite.jpg, egaleblack.jpg, smirnoff.jpg, kiss.jpg, vody.jpg, bullet.jpg,
BBcococktail.jpg, redbull.jpg, savanna.jpg, heineken.jpg, hunters.jpg, budweiser.jpg,
orijin.jpg, cocacola.jpg, malt.jpg, hennessy.jpg, blacklabel.jpg, andre.jpg
**Gallery/About:** pub1.jpg, pub2.jpg, pub3.jpg, pub6.jpg
**Logo:** logo.png

> If a file is missing or misnamed, the site shows a gold-on-black placeholder
> automatically — so it won't break, but it also won't look right until the
> real photo is in place with the exact matching filename.

---

## 🤖 Telegram Order Setup

Orders are sent through `/api/send-order.js`, a serverless function that
forwards them to your Telegram bot. **Your bot token must never appear in any
frontend file** — it lives only as an environment variable on Vercel.

### 1. Get your bot token and chat ID
You said you already have these from @BotFather. Keep them somewhere safe —
you'll paste them into Vercel, not into any code file.

### 2. Add environment variables in Vercel
In your Vercel project dashboard:
**Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | your bot token |
| `TELEGRAM_CHAT_ID` | the chat ID that should receive orders |

Apply to all environments (Production, Preview, Development), then redeploy.

### 3. How it works
When a customer submits the order form:
1. The browser sends the order (name, phone, items, total, etc.) to `/api/send-order`
2. That serverless function reads your bot token/chat ID from environment
   variables and calls Telegram's `sendMessage` API
3. Telegram delivers the formatted order to your chat instantly

If sending fails (e.g. bad token, network issue), the customer sees a toast
message asking them to try again or call — the form does **not** silently
pretend to succeed.

### 4. Testing locally
Local testing needs the Vercel CLI so the `/api` function actually runs:
```
npm i -g vercel
vercel dev
```
Then open the printed `localhost` URL — **not** Live Server — since Live
Server can't run the serverless function.

---

## 🚀 Deploying to Vercel

1. Create a free account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. In the `essgray` folder, run: `vercel`
4. Add the two environment variables above in the project dashboard
5. Redeploy: `vercel --prod`

---

## ✨ Features

- Smooth loading screen with a 4-second failsafe (never gets permanently stuck)
- Sticky navigation with mobile hamburger menu
- Food & Drinks tabs on the menu
- Add to Cart with quantity control
- Cart drawer slides in from the right
- Order form sends straight to your **Telegram** chat
- Gallery with lightbox image viewer
- Contact form with toast notification
- Back to top button
- Fully responsive — mobile, tablet, desktop

---

© 2026 ESSGRAY Pub & Restaurant
