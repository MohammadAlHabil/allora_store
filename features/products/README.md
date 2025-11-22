# Product Feature

High-performance, production-ready product page implementation with optimal user experience.

## Features

### ✨ Core Functionality

- **Complete Product Details**: Full product information with variants, pricing, and availability
- **Image Gallery**: Interactive gallery with zoom, keyboard navigation, and thumbnails
- **Size & Color Selection**: Smart variant selection with availability indicators
- **Quantity Selector**: Intuitive quantity control with stock validation
- **Shopping Actions**: Add to cart, buy now, wishlist, and share functionality
- **Stock Management**: Real-time stock tracking with low stock warnings
- **Price Display**: Dynamic pricing with discount calculations and savings display
- **Product Reviews**: Customer reviews with ratings and verified purchase badges

### 🚀 Performance Optimizations

- **React Query Integration**: Efficient data fetching with caching and invalidation
- **Optimistic Updates**: Instant UI feedback for better UX
- **Skeleton Loading**: Realistic loading states matching actual content
- **Image Optimization**: Next.js Image with proper sizing and lazy loading
- **Code Splitting**: Dynamic imports for better bundle size

### 🎨 User Experience

- **Responsive Design**: Mobile-first approach with breakpoint optimizations
- **Accessibility**: Full keyboard navigation and ARIA labels
- **Error Handling**: Graceful error states with helpful messages
- **Toast Notifications**: Real-time feedback for user actions
- **Smart Filtering**: Dynamic size/color availability based on selection

## Architecture

### File Structure

```
features/products/
├── components/
│   ├── ProductPageContent.tsx       # Main page component
│   ├── ProductPageSkeleton.tsx      # Loading states
│   ├── ProductImageGallery.tsx      # Image viewer with zoom
│   ├── ProductInfo.tsx              # Product details & actions
│   ├── SizeColorSelector.tsx        # Variant selection
│   └── QuantitySelector.tsx         # Quantity control
├── hooks/
│   ├── useProduct.ts                # Product data fetching
│   └── useProducts.ts               # Product lists (new/best sellers)
├── types/
│   └── product.types.ts             # TypeScript definitions
├── utils/
│   └── product.utils.ts             # Business logic utilities
└── index.ts                         # Public exports

app/
├── api/products/[slug]/route.ts     # Product API endpoint
└── products/[slug]/page.tsx         # Product page route
```

### Data Flow

1. **Server**: API fetches product from Prisma with full relations
2. **Client**: React Query manages caching and refetching
3. **State**: Local state for user selections (size, color, quantity)
4. **Actions**: Cart mutations with optimistic updates
5. **UI**: Real-time updates with loading/error states

## API Endpoint

### GET `/api/products/[slug]`

Fetches complete product details including:

- Product metadata and pricing
- All product images (sorted)
- Variants with inventory
- Categories
- Latest reviews (10 most recent)

**Response:**

```typescript
{
  id: string
  name: string
  slug: string
  basePrice: number
  images: ProductImage[]
  variants: ProductVariant[]
  categories: ProductCategory[]
  reviews: ProductReview[]
  // ... more fields
}
```

## Components

### ProductPageContent

Main container component handling:

- Data fetching with React Query
- Loading states (skeleton)
- Error states
- Breadcrumb navigation
- Product tabs (description, specs, reviews)

### ProductImageGallery

Interactive image viewer:

- Main image with zoom on click
- Navigation arrows
- Thumbnail grid
- Keyboard navigation (arrow keys)
- Image counter
- Responsive sizing

### ProductInfo

Product details and purchase flow:

- Dynamic pricing display
- Stock status badges
- Size/color selection
- Quantity control
- Add to cart with validation
- Buy now (quick checkout)
- Wishlist toggle
- Share functionality
- Product metadata

### SizeColorSelector

Variant selection interface:

- Color swatches with hex codes
- Size buttons with availability
- Stock count display
- Visual disabled states
- Smart filtering (sizes update based on color selection)

### QuantitySelector

Quantity input with controls:

- Increment/decrement buttons
- Direct input field
- Min/max validation
- Availability display
- Disabled states

## Utilities

### Product Utils (`product.utils.ts`)

**Available Functions:**

- `getAvailableSizes()` - Extract sizes from variants
- `getAvailableColors()` - Extract colors from variants
- `findMatchingVariant()` - Find variant by selection
- `getPriceInfo()` - Calculate pricing with discounts
- `getStockStatus()` - Check stock availability
- `getAvailableQuantity()` - Get available stock
- `isValidSelection()` - Validate user selection
- `formatPrice()` - Format currency display
- `getProductBreadcrumbs()` - Generate navigation

## Types

### Key Types

```typescript
ProductDetails; // Complete product with relations
ProductVariant; // Variant with options & inventory
ProductImage; // Image with metadata
ProductSelection; // User's current selection
AvailableSize; // Size option with availability
AvailableColor; // Color option with hex code
StockStatus; // in_stock | low_stock | out_of_stock
PriceInfo; // Price breakdown with discounts
```

## Usage Examples

### Basic Product Page

```tsx
// app/products/[slug]/page.tsx
import { ProductPageContent } from "@/features/products";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  return <ProductPageContent slug={slug} />;
}
```

### Custom Product Display

```tsx
import { useProduct, ProductImageGallery, ProductInfo } from "@/features/products";

function CustomProduct({ slug }) {
  const { data: product, isLoading } = useProduct(slug);

  if (isLoading) return <ProductPageSkeleton />;
  if (!product) return <div>Not found</div>;

  return (
    <div>
      <ProductImageGallery images={product.images} productName={product.name} />
      <ProductInfo product={product} />
    </div>
  );
}
```

### Using Product Utils

```tsx
import { getAvailableSizes, formatPrice, getStockStatus } from "@/features/products";

const sizes = getAvailableSizes(product.variants);
const price = formatPrice(product.basePrice, product.currency);
const status = getStockStatus(product, selectedVariant);
```

## Best Practices

### Performance

- Use React Query for caching (5 min stale time)
- Implement skeleton loaders matching content
- Optimize images with Next.js Image
- Lazy load non-critical components

### User Experience

- Provide instant feedback with optimistic updates
- Show clear error messages
- Disable invalid actions (e.g., out of stock)
- Auto-validate selections
- Use toast notifications for actions

### Accessibility

- Full keyboard navigation support
- ARIA labels on interactive elements
- Semantic HTML structure
- Focus management
- Screen reader friendly

### Code Quality

- Type-safe with TypeScript
- Proper error boundaries
- Consistent naming conventions
- Separated concerns (UI/logic/data)
- Comprehensive JSDoc comments

## SEO & Metadata

Product pages include:

- Dynamic meta titles and descriptions
- Open Graph tags for social sharing
- Product images in metadata
- Structured breadcrumbs
- Clean URLs with slugs

## Future Enhancements

Potential additions:

- [ ] Product zoom modal with high-res images
- [ ] Size guide modal
- [ ] Product comparison
- [ ] Recently viewed products
- [ ] Product recommendations
- [ ] Virtual try-on (AR)
- [ ] Video reviews
- [ ] Q&A section
- [ ] Notify when back in stock
- [ ] Price drop alerts

## Testing

To test the product page:

1. **Ensure database is seeded:**

```bash
pnpm prisma:seed
```

2. **Navigate to a product:**

```
/products/floral-midi-dress
```

3. **Test scenarios:**

- Select different sizes and colors
- Try adding to cart with/without selection
- Test quantity limits
- Check responsive design
- Verify loading states
- Test keyboard navigation
- Share product link
- Add/remove from wishlist

## Dependencies

- React Query (@tanstack/react-query)
- Radix UI (@radix-ui/react-tabs)
- Lucide Icons (lucide-react)
- Sonner (toast notifications)
- Next.js Image optimization

## Notes

- All monetary values stored as Decimal in database, converted to number for display
- Stock calculated as: available = quantity - reservedQuantity
- Variants support flexible option values (size, color, custom attributes)
- Images sorted by sortOrder field
- Reviews limited to 10 most recent
- Cache invalidation handled automatically by React Query
