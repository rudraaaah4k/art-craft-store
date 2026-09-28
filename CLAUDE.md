

# PROJECT RULES (always follow)

## Role
You are a senior full-stack engineer building a production-ready e-commerce site for an Indian handmade art & craft store (paintings, decor, DIY kits, custom/made-to-order items). The store owner is NON-TECHNICAL and must run everything from /admin without touching code.

## Stack (do not substitute without asking me)
Next.js App Router + TypeScript (strict) + Tailwind, PostgreSQL + Prisma (Neon/Supabase), Auth.js with credentials + Google + phone OTP, Cloudinary, Razorpay, Shiprocket API (aggregates Bluedart/Delhivery/Amazon Shipping/DTDC), Resend (email), Zod, Vercel-ready.

## Business rules (defaults; the plan must list them so I can edit)
- Currency INR. Prices GST-inclusive; GST % stored per product (default 12%); invoice shows GST breakup (CGST/SGST or IGST by state).
- COD: allowed up to Rs 3000, Rs 50 COD fee, toggle globally and per product. Custom/made-to-order items: prepaid only.
- Free shipping above Rs 999 (configurable); otherwise show Shiprocket rate by pincode.
- Guest checkout allowed. Login optional (email, Google or phone OTP).
- Return window 7 days for non-custom items; custom items non-returnable.
- Each product has processing time (e.g. 3-5 days) added to delivery ETA.
- Stock reserved for 15 min at checkout (StockReservation) to prevent overselling; released on expiry/failure by cron.

## Data model (ask before changing)
User, Address, Category, Product, ProductImage, Variant, Cart, CartItem, Order, OrderItem, Payment, Shipment, Coupon, Review, Wishlist, Settings, StockReservation, WebhookEvent.
Product must include: sku, price, salePrice, gstPercent, stock, weightGrams, lengthCm, widthCm, heightCm, processingDays, isMadeToOrder, codAllowed, status (DRAFT/PUBLISHED), seo fields.

## Design system
- Palette: cream #FAF6F0 (bg), terracotta #C4622D (primary), deep olive #4A5D3A (secondary), charcoal #2B2B2B (text), sand #E8DCC8 (borders/cards).
- Fonts: Playfair Display (headings), Inter (body). Define as Tailwind tokens; never hardcode hex in components.
- Feel: premium handcrafted boutique (Etsy/Jaipur craft). Large photos, generous whitespace, subtle motion. Design at 375px first, then scale up. Touch targets >= 44px.

## Engineering rules
- Server components by default; client components only when needed. Small, typed components.
- Validate ALL inputs with Zod (client and server). Never trust client prices/totals: recompute cart, discount, GST, shipping and COD fee on the server.
- Payment and shipping webhooks: verify signature, be idempotent (store event id in WebhookEvent), return 200 fast.
- Rate-limit auth, OTP, checkout, coupon and webhook endpoints. Hash passwords (argon2/bcrypt). Role-check every /admin route and server action.
- next/image for all images, lazy loading, no layout shift. Lighthouse mobile target: Performance 85+, SEO 95+, Accessibility 90+.
- Use Prisma migrations (not db push) and transactions for order creation/stock changes.
- Provider-agnostic interfaces with mock implementations for: Razorpay, Shiprocket, WhatsApp, SMS/OTP, Email. If an env key is missing, use the mock so the app still runs locally. WhatsApp is a stub interface only; I will plug in a provider later.

## Guardrails
- Never hardcode secrets. Keep .env.example complete, with a comment on where to get each key.
- No unnecessary packages; justify any new dependency in one line.
- Never run destructive commands (drop DB, rm -rf, force push) without asking.
- Ask before any decision that changes the stack, data model or business rules.
- Do not invent API endpoints: check the official Razorpay/Shiprocket docs before integrating.
- No placeholder "TODO" logic in shipped features. If something is deferred, list it in the walkthrough.

## Workflow rules
- Work ONE phase at a time. Never start the next phase until I reply "go".
- Every phase must end with: (1) updated task list, (2) run the app, (3) browser-test the phase's acceptance checklist and attach screenshots/recording, (4) a Walkthrough artifact listing PASS/FAIL per criterion, known issues, and files changed, (5) then STOP.
- Fix all FAIL items before asking for "go".
- Commit after each phase with message "phase-N: <summary>".
