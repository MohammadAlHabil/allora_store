Allora Store — Project README

## Overview

Allora Store is a production-ready e-commerce application built with Next.js (App Router), React 19, Prisma, and Stripe. The repository follows a feature-based architecture and provides domain modules for products, cart, checkout, orders, authentication, and shared UI/logic.

## Table of contents

- Quick start
- Project layout
- Main user flows (where to find code)
- Key features & tech highlights
- Environment & security notes
- Documentation & next steps

## Quick start

Prerequisites

- Node 18+ (recommended)
- pnpm (preferred) or npm/yarn

Install and run (development):

```bash
pnpm install
pnpm dev
```

Build and run production:

```bash
pnpm build
pnpm start
```

Useful scripts (see `package.json`):

```bash
pnpm lint        # run ESLint
pnpm format      # run Prettier
pnpm seed        # run Prisma seed script
pnpm generate    # generate test data
pnpm dev:clear   # clear .next then run dev
```

## Project layout

```
app/                # Next.js App Router pages, layouts and routes
features/           # feature domains (products, checkout, orders, auth, cart, wishlist)
shared/             # shared components, libs, UI primitives, services
prisma/             # Prisma schema, seeds, generate-data scripts
public/             # static assets
docs/               # consolidated documentation (docs/en/ and docs/archive/)
```

## Where to look

- Pages/routes: `app/products`, `app/cart`, `app/checkout`, `app/orders`, etc.
- Feature code: `features/<domain>/` (components, hooks, services, repositories, types)
- Shared utilities: `shared/lib` (errors, logger, helpers)
- Database & seeds: `prisma/` (schema.prisma, seed.ts)

## Main user flows (quick pointers)

- Browse & search products: `app/products/page.tsx` and `features/products/hooks/useProducts.ts`
- Product detail page: `app/products/[slug]/page.tsx` and `features/products/components/*` (see `docs/en/PRODUCT_PAGE_GUIDE.md`)
- Cart: `app/cart/page.tsx` and `features/cart`
- Checkout (multi-step & persistence): `app/checkout/CheckoutPageContent.tsx` and `features/checkout` (`docs/en/features/checkout/CHECKOUT_STATE_PERSISTENCE.md`)
- Authentication & profile: `app/(auth)/` and `app/profile/page.tsx`
- Orders: `app/orders` and `features/orders` (`docs/en/features/orders/README.md`)

## Key features & technical highlights

- React 19 + Next.js 16 (App Router)
- TypeScript across the codebase
- Prisma ORM, seed scripts, and DB helpers
- React Query for caching and optimistic updates
- Stripe integration for payments
- Centralized error handling & logging in `shared/lib`
- Accessibility-minded UI and mobile-first design

## Environment & security notes

Environment variables commonly required (examples):

- `DATABASE_URL` — Prisma connection string
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET` — authentication
- `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` — Stripe
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — email

Security considerations:

- Do not store raw payment card data in the repository or server. Use Stripe best practices.
- Keep secrets in environment variables or your deployment provider's secret store.

## Documentation & next steps

All user- and developer-facing docs are consolidated under `docs/en/`. Key docs:

- `docs/en/PRODUCT_PAGE_GUIDE.md`
- `docs/en/features/checkout/CHECKOUT_STATE_PERSISTENCE.md`
- `docs/en/SELECTION_PERSISTENCE_FIX.md`
- `docs/en/error.md` and `docs/en/shared/lib/errors/README.md`
- `docs/en/features/orders/README.md`

Suggested next actions (I can perform these on request):

1. Move remaining in-place docs to `docs/en/` for a single source of truth.
2. Add `CONTRIBUTING.md` and `DEVELOPER_GUIDE.md` under `docs/en/`.
3. Run Prettier on docs and commit changes.

If you want me to proceed with any of the above, tell me which action to run next.
