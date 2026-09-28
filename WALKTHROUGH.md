# Phase 2A Walkthrough

## Acceptance Criteria

| Criterion | Result | Evidence |
| --- | --- | --- |
| Prisma schema covers the requested Phase 2A models | PASS | `prisma/schema.prisma` contains Category, Product, ProductImage, Variant, Address, User, Cart, CartItem, Order, OrderItem, Payment, Shipment, Coupon, Review, Wishlist, Settings, StockReservation, and WebhookEvent. |
| Product contract uses integer paise money fields | PASS | Product and order money fields are integers; seeded product price is `500000` paise. |
| Migration created and applied | PASS | `20260928165444_phase2_data_model`; `prisma migrate status` reports two migrations applied. |
| Seed is idempotent | PASS | `prisma db seed` ran twice successfully; read-only verification found 12 products and one settings row. |
| Provider-agnostic mock interfaces exist | PASS | Typed payment, shipping, WhatsApp, OTP, and email interfaces/factories exist under `src/lib/providers/`. |
| Existing app still builds | PASS | `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass. |
| Admin UI was added | NOT STARTED | Intentionally deferred to Stage B. |

## Migration Summary

- Added address, cart, order, payment, shipment, review, wishlist, settings, stock reservation, and webhook event tables.
- Converted product, variant, coupon, GST, and weight numeric storage to integers.
- Added product stock/GST/SKU/COD fields and mapped legacy database column names where needed.
- Added foreign keys, cascade/set-null behavior, composite uniqueness, and query indexes.
- Existing legacy image ordering data is migrated into the new `sortOrder` contract; Prisma warned that the old `order` column is dropped.

## Known Issues

- Prisma CLI requires `DIRECT_URL`; the current local environment does not define it, so local CLI commands need the direct connection variable populated from `.env.example`.
- Provider implementations are mocks only. No external provider API calls were invented in Stage 2A.
- Stage B admin catalog and public product queries are not started.

## Files Changed

- `prisma/schema.prisma`
- `prisma/migrations/20260928165444_phase2_data_model/migration.sql`
- `prisma/seed.ts`
- `src/lib/providers/`
- `PROGRESS.md`
