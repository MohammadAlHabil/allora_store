# Product Page — Quick Guide

This guide describes the product detail page implementation and how to test or extend it.

Table of contents

- Features
- Access & test data
- Files & where to find code
- Quick developer usage
- Testing checklist
- Future improvements

Features

- Interactive image gallery with keyboard navigation and zoom
- Size & color selectors with availability filtering
- Quantity selector with stock validation
- Dynamic pricing with discount calculation and savings display
- Add to Cart, Buy Now (quick checkout), Wishlist, and Share actions
- Tabs for Description, Specifications, and Reviews
- Skeleton/placeholder loading states and responsive layout

Access & test data

- Product listing: `/products`
- Product detail: `/products/[slug]` (example: `/products/floral-midi-dress`)

Seeded test slugs (examples):

- `floral-midi-dress`
- `leather-ankle-boots`
- `silk-scarf`

Files & where to find code

- API: `app/api/products/[slug]/route.ts` — server route returning product with relations
- Pages: `app/products/page.tsx`, `app/products/[slug]/page.tsx`
- Feature implementation: `features/products/` (components, hooks, utils, types)

Quick developer usage

- Utilities to reuse: `getAvailableSizes()`, `findMatchingVariant()`, `formatPrice()`, `getStockStatus()` — exported from `features/products`.
- To change product content, update the API route or seed data under `prisma/`.

Testing checklist (recommended)

1. Ensure database seed (if needed):

```bash
pnpm seed
```

2. Open a product page and verify:

- Image gallery loads and supports keyboard navigation and zoom
- Size & color selectors show correct availability and filter each other
- Quantity selector enforces min/max and stock limits
- Price and discount calculations are correct in the UI and add-to-cart summary
- Optimistic updates: add to cart shows immediate feedback and recovers on error

Future improvements (suggested)

- High-resolution zoom modal
- Size guide and measurement helper
- Product comparison and recommendations
- Recently viewed products and price-drop alerts

See the feature README for implementation details: `docs/features/products/README.md`.
