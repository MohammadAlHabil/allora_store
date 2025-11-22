# Product Feature (Feature README)

High-performance, production-ready product page implementation with optimal user experience.

## Features

### Core Functionality

- Complete product details with variants, pricing, and availability
- Interactive image gallery with zoom and keyboard navigation
- Size & color selection with availability indicators
- Quantity selector with stock validation
- Add to cart, buy now, wishlist, and share functionality
- Real-time stock tracking with low-stock warnings
- Dynamic pricing and discount calculation
- Product reviews with ratings and verified purchase badges

### Performance Optimizations

- React Query integration for caching and efficient fetching
- Optimistic updates for instant UI feedback
- Skeleton loading states
- Next.js image optimization and lazy loading
- Code splitting and dynamic imports

### User Experience

- Mobile-first responsive design
- Accessibility (keyboard navigation, ARIA labels)
- Graceful error handling

# Product Feature (Feature README)

High-performance product detail implementation with a focus on UX, accessibility, and testability.

Table of contents

- Features
- Architecture & file structure
- Data flow & API
- Utilities
- Testing
- Future enhancements

Features

- Complete product details with variants, pricing, and availability
- Interactive image gallery with zoom and keyboard navigation
- Size & color selection UI with availability indicators
- Quantity selector with stock validation and min/max enforcement
- Add to Cart (optimistic), Buy Now, Wishlist, and Share
- Reviews, metadata, and SEO-friendly metadata support

Architecture & file structure

```
features/products/
├── components/          # Reusable components for the product page
├── hooks/               # Custom hooks (useProduct, useProducts)
├── types/               # TypeScript types
├── utils/               # Business logic helpers
└── index.ts             # Public exports
```

Key files (examples):

- `features/products/components/ProductPageContent.tsx` — main container
- `features/products/hooks/useProduct.ts` — product fetcher
- `app/api/products/[slug]/route.ts` — product API route

Data flow & API

1. API returns product with images, variants, inventory, categories, and recent reviews.
2. Client components fetch via React Query and display skeleton loaders while loading.
3. Local selection state (size/color/quantity) drives variant matching and price display.
4. Cart mutations use optimistic updates and rollback on failure.

Utilities

- `getAvailableSizes()`, `getAvailableColors()` — derive options from variants
- `findMatchingVariant()` — resolve variant from selected options
- `getPriceInfo()` — pricing and discount calculations
- `getStockStatus()` — availability and low-stock indicators

Testing

1. Seed test data (if needed):

```bash
pnpm seed
```

2. Manual test flows:

- Open `/products/<slug>` and verify selection, pricing, and gallery
- Try adding to cart with different variants and quantities
- Validate optimistic update behavior and error fallback

Future enhancements

- Zoom modal with high-res images
- Size guide modal and measurement helper
- Product comparison and recommendations

See the quick guide for end-to-end testing: `docs/PRODUCT_PAGE_GUIDE.md`.
