# ZEKRA — Event Planning App 💜

<div dir="rtl">

**ZEKRA** منصة رقمية بتجمع كل خدمات المناسبات في مكان واحد — أفراح، خطوبة، أعياد ميلاد، حنة، وحفلات الشركات — وبتحوّل التخطيط من تجربة متعبة لرحلة منظمة وسهلة، من تحديد الميزانية لآخر رقصة.

</div>

A mobile-first **PWA** (installable web app) for the ZEKRA event-planning platform. Bilingual **Arabic (RTL) / English**, dark & light themes, works fully offline.

## ✨ Features

- **Onboarding** — animated intro + splash.
- **Home** — occasions, quick tools, featured & top-rated vendors.
- **Explore** — filter vendors by service & budget, live search.
- **Vendor detail** — packages, reviews, booking, add-to-budget.
- **AI Planning Bot** — a guided chat that asks a few questions and generates a full budget split, vendor recommendations, and a checklist.
- **Budget tracker** — set a total, log expenses, and get a suggested split per occasion.
- **Smart checklist** — auto-generated, time-lined tasks per occasion with progress.
- **Bookings** — track your bookings and their status.
- **Profile** — loyalty points, language toggle (AR/EN), theme toggle (dark/light).
- **PWA** — installable to the home screen, offline-ready via a service worker.

## 🎨 Brand

Purple & black · watercolor · minimalist. Built to match the ZEKRA pitch deck.

## 🧱 Tech

Pure **HTML / CSS / vanilla JS** — no build step, no framework. State persists in `localStorage`.

```
zekra-app/
├── index.html
├── css/styles.css
├── js/
│   ├── data.js      # vendors, categories, checklist & budget templates
│   ├── i18n.js      # AR/EN strings + inline SVG icons
│   └── app.js       # routing, screens, state
├── manifest.webmanifest
├── sw.js            # offline service worker
├── icons/icon.svg
└── server.js        # tiny static dev server (node server.js [port])
```

## ▶️ Run locally

```bash
node server.js 8955
# then open http://localhost:8955
```

Or serve the folder with any static server.

## 👥 Team

Hanna Ahmed · Habiba Tarek · Mariam Gamal · Ahmed Hanafy · Mohamed Tarek · Youssef Bakr
