/**
 * Product Availability Utilities
 * Centralized utilities for checking product availability and stock status
 *
 * IMPORTANT DISTINCTION:
 * - isAvailable: Product publication status (is the product published/active?)
 * - isArchived: Product archival status (is the product archived?)
 * - stock: Actual inventory quantity (how many units are in stock?)
 *
 * A product can be isAvailable=true but stock=0 (published but out of stock)
 * A product can be isAvailable=false but stock>0 (unpublished but has inventory)
 */

export type ProductAvailabilityData = {
  isAvailable: boolean; // Product is published/active
  isArchived: boolean; // Product is archived
  stock: number; // Actual inventory quantity
};

/**
 * Inventory-like shape used by availability utilities.
 * This is intentionally permissive so it can accept both variant.inventory
 * and product-level inventory rows returned by the API.
 */
export type InventoryRow = {
  id?: string;
  variantId?: string | null;
  quantity?: number;
  reserved?: number;
  reorderThreshold?: number;
  isTracked?: boolean;
};

/**
 * Variant with inventory for stock calculation
 */
type VariantWithInventory = {
  id: string;
  isDefault?: boolean;
  inventory: InventoryRow | null;
};

/**
 * Calculate available stock from a single variant's inventory
 * Formula: available = quantity - reserved
 */
export function calculateVariantStock(inventory: InventoryRow | null | undefined): number {
  if (!inventory) return 0;
  const quantity = inventory.quantity || 0;
  const reserved = inventory.reserved || 0;
  return Math.max(0, quantity - reserved);
}

/**
 * Find the default variant ID for a product
 * Priority: default variant > variant with stock > first variant
 *
 * Used when adding products to cart from ProductCard (no user selection)
 */
export function getDefaultVariantId(variants: VariantWithInventory[]): string | null {
  if (variants.length === 0) return null;

  const defaultVariant =
    variants.find((v) => v.isDefault) ||
    variants.find((v) => calculateVariantStock(v.inventory) > 0) ||
    variants[0];

  return defaultVariant?.id || null;
}

/**
 * Calculate total available stock from all product variants
 * This is the centralized function used across the entire app
 *
 * IMPORTANT: This function handles two cases:
 * 1. Products with variants: stock is calculated from variant.inventory
 * 2. Products without variants: stock is calculated from product.inventories (variantId: null)
 */
export function calculateTotalStock(
  variants: VariantWithInventory[],
  directInventories?: InventoryRow[]
): number {
  // Calculate stock from variants
  const variantStock = variants.reduce((sum, variant) => {
    return sum + calculateVariantStock(variant.inventory);
  }, 0);

  // If product has variants with stock, use that
  if (variantStock > 0) {
    return variantStock;
  }

  // Otherwise, calculate from direct inventories (products without variants)
  if (directInventories && directInventories.length > 0) {
    return directInventories.reduce((sum, inventory) => {
      return sum + calculateVariantStock(inventory);
    }, 0);
  }

  return 0;
}

/**
 * Check if a product is available for purchase
 * Product must be: published (isAvailable), not archived, AND have stock
 */
export function isProductAvailable(product: ProductAvailabilityData): boolean {
  return product.isAvailable && !product.isArchived && product.stock > 0;
}

/**
 * Check if a product is out of stock
 * Note: This only checks inventory, not publication status
 */
export function isOutOfStock(product: ProductAvailabilityData): boolean {
  return product.stock <= 0;
}

/**
 * Check if a product is archived
 */
export function isArchived(product: ProductAvailabilityData): boolean {
  return product.isArchived;
}

/**
 * Check if a product is unpublished (not available for sale)
 * Note: This is different from out of stock
 */
export function isUnavailable(product: ProductAvailabilityData): boolean {
  return !product.isAvailable;
}

/**
 * Get availability status message for UI display
 * Priority: Archived > Unpublished > Out of Stock > Low Stock > In Stock
 */
export function getAvailabilityMessage(product: ProductAvailabilityData): string {
  if (product.isArchived) {
    return "Archived";
  }

  if (!product.isAvailable) {
    return "Unavailable";
  }

  if (product.stock <= 0) {
    return "Out of Stock";
  }

  if (product.stock < 5) {
    return `Only ${product.stock} left`;
  }

  return "In Stock";
}

/**
 * Get availability status type for styling
 */
export type AvailabilityStatus =
  | "available"
  | "low-stock"
  | "out-of-stock"
  | "archived"
  | "unavailable";

export function getAvailabilityStatus(product: ProductAvailabilityData): AvailabilityStatus {
  if (product.isArchived) {
    return "archived";
  }

  if (!product.isAvailable) {
    return "unavailable";
  }

  if (product.stock <= 0) {
    return "out-of-stock";
  }

  if (product.stock < 5) {
    return "low-stock";
  }

  return "available";
}

/**
 * Check if add to cart should be disabled
 */
export function shouldDisableAddToCart(product: ProductAvailabilityData): boolean {
  return !isProductAvailable(product);
}

/**
 * Get disabled reason for add to cart button
 */
export function getDisabledReason(product: ProductAvailabilityData): string | null {
  if (product.isArchived) {
    return "This product has been archived";
  }

  if (!product.isAvailable) {
    return "This product is currently unavailable";
  }

  if (product.stock <= 0) {
    return "This product is out of stock";
  }

  return null;
}
