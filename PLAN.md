# Plan: אופה אופה — Catering Catalog & WhatsApp Order Site

## Overview

A static single-page Hebrew (RTL) website for a catering company. Users browse a product catalog with filters, build an order cart, and send the order via WhatsApp. No backend, no frameworks — plain HTML/CSS/JS.

## Tech Stack

- HTML5, CSS3 (Grid/Flexbox, RTL), Vanilla JS (ES6)
- Product data in `products.json`
- Cart in `localStorage`
- Order via WhatsApp `wa.me` API
- Static hosting (GitHub Pages / Netlify / any)

## Decisions

- Hebrew-only UI, RTL layout
- Placeholder images for products (no real photos yet)
- WhatsApp number: 0542041964 → international format: 972542041964
- No backend, no auth, no order history on server
- Single page, no routing

## Files to Create

- `index.html` — single page: header, filters bar, product grid, cart sidebar, footer
- `styles.css` — responsive layout, RTL, mobile-first
- `app.js` — catalog rendering, filters, cart logic, WhatsApp integration
- `products.json` — sample product data (~10 items, categories like עוגות/מאפים/כריכים etc.)
- `assets/` — folder for placeholder product images

## Steps

### Phase 1 — Foundation (steps 1-3)

1. Create `index.html` with semantic structure:
   - `<header>` — logo/business name "אופה אופה", tagline
   - `<section id="filters">` — category buttons, price range, search input
   - `<main id="catalog">` — product cards grid
   - `<aside id="cart">` — sliding cart sidebar (hidden by default)
   - `<footer>` — contact info, WhatsApp link
   - Cart toggle button (floating, shows item count badge)
2. Create `styles.css`:
   - `direction: rtl; font-family` with Hebrew-friendly fonts (e.g. Assistant from Google Fonts)
   - CSS Grid for product cards (auto-fill, responsive columns)
   - Cart sidebar: fixed position, slides in from left (RTL)
   - Filter bar: horizontal scroll on mobile
   - Mobile-first responsive breakpoints
   - Color scheme: warm/bakery tones (can be adjusted later)
3. Create `products.json` with ~10 sample products:
   - Fields: `id`, `name`, `description`, `price`, `category`, `image`
   - Categories: "עוגות", "מאפים", "כריכים", "סלטים", "משקאות"
   - Prices in ILS (₪)

### Phase 2 — Catalog & Filters (steps 4-5)

4. In `app.js`: fetch `products.json`, render product cards into `#catalog` grid
   - Each card: image, name, description, price, category tag, "הוסף להזמנה" button
5. Implement filter logic:
   - Category filter: clickable buttons, toggle active, filter cards
   - Price sort: low-to-high / high-to-low toggle
   - Text search: filters by product name in real-time (input event)
   - All filters combine (intersection)

### Phase 3 — Cart (steps 6-8)

6. "הוסף להזמנה" button on each card → adds item to cart state (JS object/array)
   - If item already in cart, increment quantity
   - Show brief visual feedback (e.g. button text change, badge update)
7. Cart state synced to `localStorage` on every change
   - On page load, restore cart from `localStorage`
8. Cart sidebar UI:
   - List of cart items: name, quantity (+/- buttons), unit price, subtotal
   - "הסר" (remove) button per item
   - Total price (sum) displayed at bottom
   - "שלח הזמנה בוואטסאפ" (send order) button
   - "נקה הזמנה" (clear cart) button
   - Empty state message when cart is empty

### Phase 4 — WhatsApp Order (steps 9-10)

9. "שלח הזמנה" button builds formatted message string:
   ```
   הזמנה חדשה מאופה אופה 🍰
   ─────────────
   - עוגת שוקולד x2 — ₪120
   - כריך טונה x1 — ₪35
   ─────────────
   סה"כ: ₪155
   ```
10. Opens `https://wa.me/972542041964?text=<URI_encoded_message>`
    - Uses `encodeURIComponent()` for the message text
    - Works on both mobile (opens WhatsApp app) and desktop (opens WhatsApp Web)

## Verification

1. Open `index.html` with VS Code Live Server — catalog renders with all products
2. Click category filters → only matching products shown; type in search → filters by name
3. Add items to cart → badge updates, sidebar shows items with correct quantities and prices
4. Refresh page → cart persists (localStorage)
5. Remove items / change quantities → total recalculates correctly
6. Click "שלח הזמנה" → WhatsApp opens with correctly formatted Hebrew message and total
7. Test responsive: resize browser to mobile width → layout adapts, cart works as overlay
8. Validate RTL: all text right-aligned, sidebar from left, layout mirrors correctly
