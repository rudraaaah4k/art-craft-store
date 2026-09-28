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

## Remaining

- Commit the completed repair as `phase-1: repair`.

## Known Issues

- NextAuth logs an optional `NEXTAUTH_URL` warning during development; the app boots and flows pass without it.
- PostgreSQL emits a node-pg SSL mode compatibility warning; the configured connection remains functional.
- The project rules file is currently empty, so no additional rule content was available to merge into `CLAUDE.md`.
