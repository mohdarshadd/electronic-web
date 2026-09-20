# VoltCart — Project Memory

Comprehensive memory of the VoltCart e-commerce project. Update this file whenever architecture, features, or decisions change.

---

## 1. Project identity

- **Name:** VoltCart ("Your ideas. Our parts.")
- **Legal name:** VoltCart Electronics Pvt. Ltd. (fictional, for now)
- **What it is:** A student-first e-commerce store for electronics & robotics components in India (modeled on Robu.in) — sensors, development boards, motors, IoT modules, DIY kits and more.
- **Target users:** Indian students building for competitions, exhibitions and hackathons.
- **Root directory:** `C:\Users\Acer\CodeBase\ElecWeb`
- **Contact/defaults (in `src/lib/site.ts`):** hello@volcart.in · +91 1800-266-6123 · "Innovation Park, Mumbai".

---

## 2. Technologies & tooling

| Layer | Choice |
|---|---|
| Framework | Next.js **16.3.5** (App Router, Turbopack) |
| UI library | React **19.2.8** |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS **v4** (CSS-first via `@import "tailwindcss"`, no config file) |
| Package manager | npm 11.13.0 |
| Runtime (local) | Node v24.11.1, Windows PowerShell |
| Payments | Cashfree Payment Gateway (UPI / Cards / NetBanking), + Cash on Delivery |
| Data persistence | JSON file stores under `.data/`: `orders.json`, `inventory.json` (price/stock overrides), `settings.json` (announcement, shipping, coupons) — fs-backed, **not serverless-safe** |
| Project layout | `src/` dir, import alias `@/*`, `canary`-style `PageProps`/`LayoutProps`/`RouteContext` helpers |

### Next.js 16 conventions to respect (read `node_modules/next/dist/docs/` before code)
- `params` and `searchParams` are **Promises** — must be `await`ed.
- Use `PageProps<"/route">`, `LayoutProps<"/">`, `RouteContext<"/api/...">` global types instead of manual typing.
- No `page.tsx` + `route.ts` in the same segment.
- Reading `searchParams` requires the **Suspense boundary** pattern (see `/search`, `/shop`, `/category/[slug]`).
- `generateStaticParams` used for `/product/[slug]` and `/category/[slug]`.
- The AGENTS.md block at repo root is auto-maintained by `next dev` — re-verify it exists after builds.

---

## 3. What has been done (completed)

- [x] Scaffolded Next.js app, moved to workspace root, all deps installed (0 vulnerabilities).
- [x] **Data layer**
  - `src/lib/types.ts` — `Product`, `Category`, `Order`, `Address`, `CartLine`, status unions.
  - `src/lib/products.ts` — catalog: **10 categories / ~42 products**, SKUs modeled on Robu.in; `COUPONS` map (`STUDENT10`, `HACK10` — both 10%); helper functions.
  - `src/lib/format.ts` — `formatINR`, discount %, shipping (₹49 under ₹499; free above ₹49900).
  - `src/lib/cart.ts` — `computeCart(lines, coupon)` re-computes everything server-side → totals can't be tampered with client-side.
  - `src/lib/site.ts` — brand, announcement bar, nav + footer links.
- [x] **Cart state** — `src/context/CartContext.tsx`; localStorage persistence (`voltcart.lines.v1`, `voltcart.coupon.v1`), hydrate-on-mount (effect suppressed for `react-hooks/set-state-in-effect`), drawer open state. Only `STUDENT10` accepted via `STUDENT_DISCOUNT_CODE`.
- [x] **Components** — Header (search, cart badge, mobile nav, announcement bar), Footer, CartDrawer, ProductCard, CategoryCard, BuyBox, AddToCartButton, Price, StarRating, ProductImage (dummy SVG in `public/products/`), ProductGridSkeleton, ShopContent (shared filter/sort), StaticShell (info pages).
- [x] **Pages** — `/`, `/shop`, `/category/[slug]`, `/product/[slug]`, `/search`, `/cart`, `/checkout`, `/order/[id]`, `/student-offers`, `/about`, `/contact`, `/shipping`, `/returns`, `/faqs`, `/bulk-orders`, custom `not-found`.
- [x] **Cashfree & orders**
  - `src/lib/cashfree.ts` — server: `createCashfreeOrder`, `fetchCashfreeOrder`, `verifyWebhookSignature` (HMAC-SHA256 base64 of `timestamp + rawBody` w/ client secret), `cashfreeConfigured()`.
  - `src/lib/cashfree-checkout.ts` — client SDK loader + `renderCashfreeCheckout` (checkout.js v3).
  - `src/lib/orders.ts` — JSON-file order store; `persistOrder`, `fetchOrder`, `updateOrder` (audit-aware: records `activity` entries for status changes), `generateOrderId` (`VOLT…`); **defensive parse** (accepts bare array or `{orders:[…]}`).
  - `POST /api/checkout` — validates, creates order, creates Cashfree session (or **demo mode** when keys missing → order marked PAID, `{demo:true}`).
  - `GET /api/orders/[id]`.
  - `POST /api/payments/webhook` (HMAC-verified) + `GET /api/payments/webhook?order_id=` (manual sync from Cashfree).
- [x] **Order flow & statuses**
  - Order status: `PLACED → CONFIRMED → SHIPPED → DELIVERED` / `CANCELLED`.
  - Payment status: `PENDING → PAID` / `FAILED`.
  - `/order/[id]` re-verifies Cashfree payment status on load while PENDING.
- [x] **Verification** — `npm run lint` clean (0 errors/warnings); `npm run build` clean (66 SSG pages + 3 dynamic routes); live smoke tests passed (pages 200, 404 works, demo Cashfree checkout + COD checkout + order page render OK).
- [x] **Admin panel** — full admin app under `/admin` (password login, `ADMIN_PASSWORD` env → HMAC token in `voltcart_admin` httpOnly cookie, 12 h expiry).
  - **Shell** — `layout.tsx` + `AdminSidebar` (Dashboard / Orders / Customers / Inventory / Settings, sign-out, active states); every admin page server-gates via cookie check → `redirect("/admin")`.
  - **Dashboard** — KPI cards (orders, paid revenue, COD expected, AOV, customers, cancellation rate), 14-day revenue bar chart, status & payment breakdown bars, top products, recent orders.
  - **Orders** (`/admin/orders`) — search (id/customer/phone/email/city), filters (order status, payment status, method), 4 sort orders, CSV export.
  - **Order detail** (`/admin/orders/[id]`) — customer/items/totals, status controls, **lifecycle timeline** + **audit log** (every status change recorded with actor `admin`/`system` + timestamp in `order.activity`), printable **invoice** (`/admin/orders/[id]/invoice`, print CSS).
  - **Customers** (`/admin/customers`) — directory aggregated by phone+email: spend, order count, last-order, expandable order history.
  - **Inventory** (`/admin/inventory`) — full catalog with editable price / MRP / stock / active toggle → persists overrides to `.data/inventory.json`; `computeCart` at checkout uses live product prices/stock (`getLiveProduct`); CSV export.
  - **Settings** (`/admin/settings`) — announcement bar text + toggle, free-shipping threshold/fee, coupon enable/disable (STUDENT10 / HACK10); public `/api/site/settings` drives Header announcement + `CartContext.applyCoupon` acceptance + checkout server-side coupon enforcement.
  - **Protected APIs** — `/api/admin/login`, `/logout`, `/orders` (GET), `/orders/[id]` (GET+POST), `/customers`, `/inventory`, `/inventory/[id]` (PATCH), `/settings` (GET+POST), `/export/orders`, `/export/inventory` (CSV). Shared `isAdminRequest` guard (`src/app/api/admin/guard.ts`).
  - **Analytics/model helpers** — `src/lib/admin-metrics.ts` (pure, no fs: `computeMetrics`, `dailyStats`, `countBy`, `topProducts`, `aggregateCustomers`), `src/lib/csv.ts` (`toCSV` + BOM).
- [x] **Dummy product images** — `scripts/generate-product-images.mjs` creates `public/products/{slug}.svg` for all 40 products (gradient + emoji); `ProductImage` uses plain `<img>`; homepage featured chips use `ProductImage` too.
- [x] **Housekeeping** — `.env.example`, `.gitignore` covers `.env*` (except example) and `/.data/`; dead footer links (`/track-order`, `/careers`) removed; static info pages added.

---

## 4. Features planned / roadmap (not done yet)

- [ ] **Admin hardening** — rate limiting on login, real admin accounts/sessions, audit-log persistence concerns. (Audit log itself is done: every order-status/payment-status change appends to `order.activity` with actor + timestamp.)
- [ ] **Real Cashfree keys** — configure `.env.local` with `CASHFREE_CLIENT_ID` / `CASHFREE_CLIENT_SECRET` / `CASHFREE_ENV`; test end-to-end sandbox payment + webhook. Until keys exist, checkout runs in demo mode.
- [ ] **Replace JSON file stores with a database** — order/inventory/settings stores are NOT persistent on serverless / Vercel (file fs unavailable). Candidates: Postgres (Vercel/Neon), SQLite/Turso, or Supabase. Inventory price/stock overrides and settings would also move into the DB.
- [ ] **Student ID verification flow** — page copy promises verification within 48h; no mechanism yet (email check / document upload).
- [ ] **Real product photos** — replace the dummy SVGs in `public/products/` with real images; switch `ProductImage` from `<img>` to Next `<Image>`.
- [ ] **Deploy + domain** — user requirement: *domain is a must*. Deploy to Vercel, connect domain, add `CASHFREE_ENV=PROD`.
- [ ] **README rewrite** documenting setup + deploy.
- [ ] Manual browser walkthrough of the full funnel (browse → cart → coupon → checkout → order → admin).

---

## 5. Theme & style guide

Visual language is a clean, "student-maker" marketplace look. Light theme only (dark removed).

### Palette
| Purpose | Token |
|---|---|
| Page background | `gray-50` (`#f9fafb`) |
| Surface (cards) | `white`, border `gray-200` |
| Text heading | `gray-900` |
| Text body/muted | `gray-600` / `gray-500` |
| **Primary brand** | `indigo-600` buttons/links/badges; hover `indigo-700`; subtle tints `indigo-50`/`indigo-100` |
| Brand gradient (logo, hero accents) | `from-indigo-600 to-violet-600` |
| **Positive / success / student** | `emerald` (`emerald-600/700` text, `emerald-50` bg) |
| Warn / COD | `amber` (`amber-100`) |
| Error / danger | `red-50` bg, `red-600/700` text |
| Announcement bar | `bg-indigo-950 text-indigo-100` |

### Product images: dummy SVG placeholders
Product photos are **dummy SVGs** (gradient + emoji) generated into `public/products/{productSlug}.svg` by `node scripts/generate-product-images.mjs` (parses the catalog from `src/lib/products.ts`, handles escaped quotes like `0.96\" …`). `ProductImage` renders them with a plain `<img>` — the Next Image optimizer refuses SVGs unless `dangerouslyAllowSVG` is set, so the `@next/next/no-img-element` rule is disabled there. **Replace later:** drop real photos (jpg/png) into `public/products/{slug}.…`, then swap `<img>` for Next `<Image>` in `ProductImage.tsx`.

The SVG dummy uses the same gradient-emoji language as before, with category-coloured gradients:
- Sensors 📡 `from-emerald-400 to-teal-600`
- Development boards 🔌 `from-sky-400 to-blue-600`
- Motors & Drivers ⚙️ `from-orange-400 to-red-600`
- ICs & Modules 🔬 `from-violet-400 to-purple-600`
- Displays 🖥️ `from-pink-400 to-fuchsia-600`
- IoT & Wireless 📶 `from-indigo-400 to-violet-600`
- Power 🔋 `from-amber-400 to-yellow-600`
- Mechanical 🛠️ `from-slate-400 to-gray-600`
- DIY Kits 📦 `from-teal-400 to-emerald-600`
- 3D Printing 🗜️ `from-rose-400 to-pink-600`

### Shape, depth, motion
- Radius: buttons/inputs `rounded-xl`, cards `rounded-2xl`, badges `rounded-full`.
- Shadows: default `shadow-sm`; cards lift on hover (`hover:-translate-y-0.5` + `hover:shadow-lg`).
- Buttons: filled has `active:scale-[0.99]` press feedback; secondary = bordered/outline variants.
- Focus: `outline-none` + `focus:ring-4`.
- `prefers-reduced-motion` honored (animation/transition durations nulled).

### Typography & layout
- Font stack: Inter → system-ui fallback (set on `body` in `globals.css`; html uses `font-sans` = Geist var).
- Layout: body is `flex min-h-full flex-col`, `Header → <main class="flex-1"> → Footer`, plus `CartDrawer` overlay; everything wrapped in `CartProvider`.
- Pricing display: `formatINR` (paise→₹), MRP strikethrough + % discount badge (emerald), "FREE" shipping in emerald.
- Content max-width patterns via standard container utilities; tags/pills use `rounded-full bordered` chips.

---

## 6. Data & money rules (important)

- **Prices stored in paise (₹ × 100)** — e.g. ₹349.00 = `34900`.
- Coupons 10% off: `STUDENT10` and `HACK10`, each **toggleable** from `/admin/settings` (rejected server-side and hidden from the storefront when disabled).
- Shipping defaults: ₹0 over ₹499, else ₹49 (paise: threshold `49900`, fee `4900`) — **overridable** from `/admin/settings` (threshold + fee).
- Cart totals always recomputed on the server at checkout (`computeCart` with **live inventory overrides** from `getLiveProduct` + current shipping policy + enabled coupons). Client-side `CartContext` uses base catalog defaults.
- Order ID format: `VOLT…` from `generateOrderId()`.
- **Inventory overrides** (`.data/inventory.json`) feed cart pricing + stock checks at **checkout**; static SSG pages (`/product/[slug]`, `/shop`, etc.) still render base catalog values until rebuilt.

---

## 7. Cashfree integration reference

- API version header: `x-api-version: 2025-01-01`.
- Auth headers: `x-client-id`, `x-client-secret`.
- Base URL: sandbox `https://sandbox.cashfree.com/pg`, prod `https://api.cashfree.com/pg` (select via `CASHFREE_ENV`).
- Create order returns `payment_session_id`; render checkout via `https://sdk.cashfree.com/js/v3/cashfree.js` (`Cashfree`, `render`).
- Webhook: HMAC-SHA256 base64 over `${x-webhook-timestamp}${rawBody}` using client secret; compare to header `x-webhook-signature`; confirm `x-webhook-timestamp`.
- Return/notify URLs are built server-side from request origin (`/order/{id}`, `/api/payments/webhook`).
- **Demo mode:** when `CASHFREE_CLIENT_ID`/`CASHFREE_CLIENT_SECRET` unset → order created as PAID, client simulates a 1.5s "successful payment".

---

## 8. Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # production build (type-checks)
npm run start      # serve production build
npm run lint       # eslint
node scripts/generate-product-images.mjs   # regenerate dummy product SVGs
```

### Admin panel
- Visit `/admin`; set `ADMIN_PASSWORD` in `.env.local` to enable. Login issues an HMAC-signed token (secret = `ADMIN_PASSWORD`) stored as cookie `voltcart_admin` (httpOnly, 12 h). All `/api/admin/*` routes verify it via `isAdminRequest(req)` (`src/app/api/admin/guard.ts`). `NextResponse.cookies` is used to set the cookie (plain `Response` has no `.cookies`).
- Admin pages: `/admin` (dashboard/analytics), `/admin/orders` (list + filters), `/admin/orders/[id]` (detail + status), `/admin/orders/[id]/invoice` (print), `/admin/customers`, `/admin/inventory` (price/stock overrides), `/admin/settings`.
- Admin APIs (all auth-gated): `GET /api/admin/orders`, `GET+POST /api/admin/orders/[id]` (POST → `updateOrder(…, "admin")` writes an audit entry), `GET /api/admin/customers`, `GET /api/admin/inventory`, `PATCH /api/admin/inventory/[id]`, `GET+POST /api/admin/settings`, `GET /api/admin/export/orders` + `GET /api/admin/export/inventory` (CSV).
- Public settings endpoint: `GET /api/site/settings` (announcement, shipping policy, enabled coupons) — consumed by Header and `CartContext`.
- Helper modules: `src/lib/admin-metrics.ts` (client-safe analytics), `src/lib/csv.ts` (CSV with BOM), `src/lib/inventory.ts` (fs override store; server-only), `src/lib/settings.ts` (fs settings store; server-only). Don't import fs-based libs (`inventory`, `settings`) from client components — `computeCart`/`cart.ts` stays fs-free so `CartContext` can bundle it.

---

## 9. Known issues & gotchas

- JSON order store is **not persistent on serverless** (Vercel) — needs DB before production.
- Cashfree `fetchCashfreeOrder` + webhook require network access; in demo mode they're skipped.
- `react-hooks/set-state-in-effect` is suppressed in `CartContext` hydration effect (approved pattern).
- Turbopack may warn that `package-lock.json` is outside the git root — benign; set `turbopack.root` in `next.config.ts` if it bothers you.
- `HACK10` coupon is now **configurable** from `/admin/settings` (was defined-but-unwired; `CartContext.applyCoupon` accepts any enabled coupon).
- Inventory price/stock overrides affect **checkout only** — static product/shop pages can drift until a rebuild (see §6).
- Student verification is copy-only (no verification backend yet).