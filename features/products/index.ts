// Components
export { ProductPageContent } from "./components/ProductPageContent";
export { ProductPageSkeleton, ProductSkeleton } from "./components/ProductPageSkeleton";
export { ProductImageGallery } from "./components/ProductImageGallery";
export { ProductInfo } from "./components/ProductInfo";
export { SizeColorSelector } from "./components/SizeColorSelector";
export { QuantitySelector } from "./components/QuantitySelector";

// Hooks
export { useProduct } from "./hooks/useProduct";
export { useNewArrivals, useBestSellers } from "./hooks/useProducts";

// Types
export type {
  ProductDetails,
  ProductImage,
  ProductVariant,
  ProductCategory,
  ProductReview,
  ProductVariantOptions,
  AvailableSize,
  AvailableColor,
  ProductSelection,
  StockStatus,
  PriceInfo,
  BreadcrumbItem,
  Inventory,
  ReviewUser,
} from "./types/product.types";

// Utils
export {
  getAvailableSizes,
  getAvailableColors,
  findMatchingVariant,
  getPriceInfo,
  getStockStatus,
  getAvailableQuantity,
  isValidSelection,
  validateSelection,
  getProductBreadcrumbs,
  formatPrice,
  getStockStatusMessage,
  getAvailableColorsForSize,
  getAvailableSizesForColor,
} from "./utils/product.utils";
