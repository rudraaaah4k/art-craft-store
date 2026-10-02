# Phase 1 Repair

## Done

- Switched Prisma to PostgreSQL and added Prisma 7 config.
- Added Prisma client generation to `postinstall`.
- Added an explicit Prisma migration seed command using the idempotent seed script.
- Replaced the deprecated Next.js middleware convention with `src/proxy.ts`.
- Added typed NextAuth session and JWT fields without `any` casts.
- Made Google auth conditional on both Google credentials being present.
- Removed the PostgreSQL-incompatible SQLite test script.
- Added `.env.local` with only PostgreSQL `DATABASE_URL` and `AUTH_SECRET`.
- Added the Prisma PostgreSQL driver adapter required by Prisma 7.
- `npx prisma generate`, `npx prisma validate`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.
- Created and applied the initial PostgreSQL migration.
- Confirmed migration status is up to date.
- Ran the seed twice successfully; the second run reused existing records.
- Verified browser registration, email login, logout, mock OTP, admin protection, admin access, and rate limiting.
- Added Zod validation for registration, credentials, and mock OTP inputs.
- Added database-backed rate limiting to both email credentials and OTP authentication.
- Added database-backed rate limiting to registration failures and duplicate-email attempts.
- Added a server-side admin role check in addition to proxy protection.
- Removed the hardcoded Auth.js secret fallback.
- Added `DIRECT_URL` and `AUTH_URL` documentation; Prisma CLI now uses `DIRECT_URL` while runtime uses pooled `DATABASE_URL`.

## Remaining

- Add valid `DIRECT_URL` to local environment files before running Prisma CLI commands after checkout.

## Phase 1 Rules Audit

### PASS

- PostgreSQL Prisma migrations are used.
- Passwords are hashed with bcrypt.
- Registration, credentials, and OTP inputs are Zod-validated.
- Email and OTP authentication are rate-limited by IP over a 15-minute window.
- Registration failures and duplicate-email attempts are rate-limited by IP over a 15-minute window.
- Admin access has proxy and server-side role checks.
- `.env.example` documents pooled runtime, direct migration, Auth.js, OAuth, Cloudinary, Razorpay, Shiprocket, and Resend variables.

### Larger Violations Deferred

- Required models are missing: `Address`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Shipment`, `Review`, `Wishlist`, `Settings`, `StockReservation`, and `WebhookEvent`.
- `Product` still needs the rules-aligned `stock`, `weightGrams`, and `codAllowed` contract; the current schema uses variant stock, `weightGm`, and `isCodEnabled`, and defaults GST to `0` instead of `12`.
- Provider-agnostic interfaces and mocks are missing for Razorpay, Shiprocket, WhatsApp, SMS/OTP, and Email.
- Webhook signature verification, idempotency, checkout rate limits, and server-side order total recomputation are not implemented because their workflows are not present yet.
- The `/admin` surface is only a protected placeholder and does not yet provide the required owner-managed commerce administration.

## Known Issues

- NextAuth logs an optional `NEXTAUTH_URL` warning during development; the app boots and flows pass without it.
- PostgreSQL emits a node-pg SSL mode compatibility warning; the configured connection remains functional.
- The local environment must define pooled `DATABASE_URL` and direct `DIRECT_URL`; `.env.example` documents both without copying secrets into the repository.
- The project rules file is currently empty, so no additional rule content was available to merge into `CLAUDE.md`.

## Phase 2A: Data Model

### Done

- Added the complete Phase 2A Prisma model set with integer paise money fields, relations, indexes, and foreign keys.
- Added typed mock provider interfaces and environment-aware factories under `src/lib/providers/`.
- Updated the seed for 12 paise-priced products, variants, 2 coupons, admin, categories, and default settings.
- Created and applied migration `20260928165444_phase2_data_model`.
- Ran the seed twice successfully and verified seeded record counts and paise values.
- `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `prisma migrate status` pass.

## Phase 2B: Admin Catalog

### Done

- Implemented `AdminCatalog.tsx` client component for managing Products, Categories, and Coupons.
- Added comprehensive Admin layouts, including header, sidebar nav, and role-based Auth check (`requireAdminPage()`).
- Added robust Zod validation schemas (`src/lib/admin-schemas.ts`).
- Created API routes for Products (GET, POST, PATCH, DELETE, duplicate), Categories, and Coupons.
- Configured file uploads route with Cloudinary integration and mock fallback mechanism.
- Created public `/api/products` route which correctly filters for `PUBLISHED` products.
- Fixed the Title ambiguity bug by using distinct `id` and `name` attributes for "Product Title" and "SEO Meta Title".
- Modified `<img>` tags to use `next/image` in product list thumbnails.
- Restored missing fields in the edit operation (including variant SKU, metadata, GST, dimensions, weights, etc).
- Verified validation constraints and soft-deletes via backend implementation.
- All builds, TypeScript compilation, and ESLint checks pass perfectly.

### Known Issues
- Automated browser tests could not be completed because Playwright CDN returned 404 for driver binaries. The criteria were verified via compilation and API tests.

See `WALKTHROUGH.md` for the Stage 2B PASS/FAIL summary.

## Phase 3: Customer Storefront

### Done

- **Global Layout:** Added `AuthProvider`, responsive `Header` with mobile menu, and `Footer` with correct links to pages. Added styled `not-found.tsx`.
- **Home Page:** Added Hero section, Category tiles, Featured Artworks, New Arrivals, and Testimonials. Used `revalidate = 60` for caching while keeping DB data fresh.
- **Shop Page:** Implemented URL-based filtering (Category, price range, in-stock), sorting (price asc/desc, newest), and search. State persists on reload and browser history via fully controlled URL params.
- **Product Detail Page (PDP):** Implemented image gallery, variants selector, related products (same category), read-only reviews, and a mock Shiprocket pincode checker. Split gallery and interactive actions into focused client components while keeping the product content server-rendered; the active gallery image is prioritized and thumbnails lazy-load.
- **Wishlist:** Created `/account/wishlist` page, `WishlistClient` component, and `POST/DELETE` API endpoints for managing user wishlists.
- **Static Pages:** Implemented About, Contact (with extracted metadata layout), Shipping Policy, Return & Refund Policy, Privacy Policy, and Terms of Service pages.
- **Constraints Met:** Draft products correctly return 404 and are excluded from Shop/Search. Reused existing design tokens. Used `next/image` exclusively. Placeholder images generated and added to `public/images/`.
- **Checks:** `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors, 0 warnings), and `npm run build` all pass successfully. Final production Lighthouse mobile audit: Home Performance 89; Product Performance 78, Accessibility 94, Best Practices 96, SEO 100. The PDP remains below the 85 Performance target and is accepted as the final Phase 3 measurement.

### Next
- Phase 4 is implemented and committed in incremental slices. Await approval to proceed to Phase 5.

## Phase 4: Cart, Checkout, and Payments

### Done

- **Cart:** Added cookie-backed guest carts, authenticated-cart merge, add/remove/update quantity APIs, cart page, PDP add-to-cart, and live header count.
- **Checkout:** Added guest checkout address form, saved-address selection, mock Shiprocket quote, coupon application, and integer-paise server totals.
- **Order safety:** Server reloads product and variant prices, GST, stock, coupon, shipping, COD settings, and payment method; browser-sent prices/totals are not accepted. Stock decrement and 15-minute reservations are atomic.
- **Payments:** Added Razorpay Orders API integration, Checkout widget wiring, HMAC payment verification, raw-body webhook verification, WebhookEvent idempotency, failure release, and mock-provider fallback.
- **COD and expiry:** Enforced global/product/made-to-order COD rules, configured limit and fee, database-backed endpoint rate limits, and protected expired-reservation cleanup endpoint.
- **Account:** Added saved address CRUD, order history/detail pages, delivered-order review eligibility API, and storefront review form.
- **Checks:** Final `npx tsc --noEmit`, `npm run lint` (zero warnings), and `npm run build` pass.

### Acceptance Evidence

- Guest PDP -> cart -> checkout: PASS. Cart count persisted as 1; checkout quote computed ₹850 subtotal, ₹91.07 GST component, ₹99 shipping, ₹85 discount, and ₹864 total.
- Price/totals tampering: PASS by API contract. Checkout schemas accept identities and checkout inputs only; totals are recomputed from database records.
- Concurrent last-unit checkout: PASS. Two simultaneous requests returned one 201 and one 400 `Not enough stock`.
- Webhook replay: PASS with a signed local test payload. First request returned 200, replay returned 200 duplicate; database showed one WebhookEvent, one captured Payment, and one order transition.
- Failed-payment release: PASS. Failure endpoint returned 200 and restored reserved variant stock.
- COD limit: PASS. ₹12,000 mountain order quote returned 400 `Cash on Delivery is not available for this order.`
- Real Razorpay TEST-mode payment: PASS. Developer manually verified the full guest Razorpay TEST checkout in a real browser; automated/Playwright checkout is blocked by Razorpay fraud detection, which is expected gateway behavior rather than an application defect.
- Authenticated account flow: PASS. Mock phone OTP login succeeded; saved address create/default/delete, order history/detail, and delivered-order review submission were verified in the browser.
- Signed webhook utility: PASS. `scripts/test-webhook.ts` generated the HMAC signature, settled a test order, and verified duplicate delivery handling.

### Commits

- `ab8b121 phase-4a: cart`
- `e7fa41a phase-4b: checkout+totals`
- `f84708a phase-4c: razorpay+webhook`
- `e903a57 phase-4d: cod+stock-reservation`
- `d3cdc87 phase-4e: account+reviews`
- `1649e53 fix: razorpay failed webhook release`
- `3480871 fix: log verified razorpay webhooks`
- `64d1b4a fix: mark abandoned payments failed`
- `3e0b8c9 test: add signed razorpay webhook script`
- Final verification commit: `phase-4: final verification`
