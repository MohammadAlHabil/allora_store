/**
 * Product variant option values (e.g., size, color)
 */
export interface ProductVariantOptions {
  size?: string;
  color?: string;
  [key: string]: string | undefined;
}

/**
 * Product image from database
 */
export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  createdAt: Date;
}

/**
 * Inventory information for a variant
 */
export interface Inventory {
  id: string;
  variantId: string | null;
  quantity: number;
  reserved: number; // Changed from reservedQuantity to match Prisma schema
  reorderThreshold: number; // Changed from lowStockThreshold to match Prisma schema
  isTracked: boolean;
}

/**
 * Product variant with inventory
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  title: string | null;
  optionValues: ProductVariantOptions | null;
  price: number | null;
  compareAt: number | null;
  barcode: string | null;
  isDefault: boolean;
  inventory: Inventory | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Product category relationship
 */
export interface ProductCategory {
  id: string;
  productId: string;
  categoryId: string;
  sortOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Product review user
 */
export interface ReviewUser {
  id: string;
  name: string | null;
  image: string | null;
}

/**
 * Product review
 */
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  user: ReviewUser;
}

/**
 * Complete product details from database
 */
export interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDesc: string | null;
  description: string | null;
  type: "PHYSICAL" | "DIGITAL" | "SERVICE";
  basePrice: number;
  currency: string;
  handle: string | null;
  isAvailable: boolean;
  isArchived: boolean;
  publishedAt: Date | null;
  metadata: Record<string, unknown> | null;
  avgRating: number | null;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date | null;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: ProductCategory[];
  reviews: ProductReview[];
}

/**
 * Available sizes extracted from variants
 */
export interface AvailableSize {
  value: string;
  label: string;
  isAvailable: boolean;
  stockCount: number;
}

/**
 * Available colors extracted from variants
 */
export interface AvailableColor {
  value: string;
  label: string;
  isAvailable: boolean;
  hexCode?: string;
}

/**
 * Product selection state
 */
export interface ProductSelection {
  size: string | null;
  color: string | null;
  quantity: number;
  selectedVariantId: string | null;
}

/**
 * Stock status for product
 */
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "pre_order";

/**
 * Price information
 */
export interface PriceInfo {
  current: number;
  original: number | null;
  discount: number | null;
  discountPercentage: number | null;
}

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}
