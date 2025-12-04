import { Product } from "@/app/generated/prisma";
import { calculateTotalStock } from "@/shared/lib/utils/product-availability";
import type {
  AvailableColor,
  AvailableSize,
  PriceInfo,
  ProductDetails,
  ProductSelection,
  ProductVariant,
  StockStatus,
} from "../types/product.types";

/**
 * Color name to hex code mapping
 */
const COLOR_HEX_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#F59E0B",
  purple: "#8B5CF6",
  pink: "#EC4899",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#92400E",
  orange: "#F97316",
  navy: "#1E3A8A",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  olive: "#808000",
  maroon: "#800000",
  teal: "#14B8A6",
  coral: "#FF7F50",
  lavender: "#E6E6FA",
};

/**
 * Get hex code for a color name
 */
function getColorHex(color: string): string | undefined {
  return COLOR_HEX_MAP[color.toLowerCase()];
}

/**
 * Extract available sizes from product variants
 */
export function getAvailableSizes(variants: ProductVariant[]): AvailableSize[] {
  const sizesMap = new Map<string, AvailableSize>();

  variants.forEach((variant) => {
    const size = variant.optionValues?.size;
    if (!size) return;

    const stockCount = variant.inventory?.quantity || 0;
    const reserved = variant.inventory?.reserved || 0;
    const available = stockCount - reserved;

    if (sizesMap.has(size)) {
      const existing = sizesMap.get(size)!;
      existing.stockCount += available;
      existing.isAvailable = existing.isAvailable || available > 0;
    } else {
      sizesMap.set(size, {
        value: size,
        label: size.toUpperCase(),
        isAvailable: available > 0,
        stockCount: available,
      });
    }
  });

  // Sort sizes by common size order
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  return Array.from(sizesMap.values()).sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.value.toUpperCase());
    const indexB = sizeOrder.indexOf(b.value.toUpperCase());

    if (indexA === -1 && indexB === -1) return a.value.localeCompare(b.value);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

/**
 * Extract available colors from product variants
 */
export function getAvailableColors(variants: ProductVariant[]): AvailableColor[] {
  const colorsMap = new Map<string, AvailableColor>();

  variants.forEach((variant) => {
    const color = variant.optionValues?.color;
    if (!color) return;

    const stockCount = variant.inventory?.quantity || 0;
    const reserved = variant.inventory?.reserved || 0;
    const available = stockCount - reserved;

    if (colorsMap.has(color)) {
      const existing = colorsMap.get(color)!;
      existing.isAvailable = existing.isAvailable || available > 0;
    } else {
      colorsMap.set(color, {
        value: color,
        label: color.charAt(0).toUpperCase() + color.slice(1),
        isAvailable: available > 0,
        hexCode: getColorHex(color),
      });
    }
  });

  return Array.from(colorsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Find matching variant based on selection
 */
export function findMatchingVariant(
  variants: ProductVariant[],
  selection: ProductSelection
): ProductVariant | null {
  return (
    variants.find((variant) => {
      const options = variant.optionValues;
      if (!options) return false;

      const sizeMatch = !selection.size || options.size === selection.size;
      const colorMatch = !selection.color || options.color === selection.color;

      return sizeMatch && colorMatch;
    }) || null
  );
}

/**
 * Get price information for a product or variant
 */
export function getPriceInfo(
  product: ProductDetails,
  selectedVariant?: ProductVariant | null
): PriceInfo {
  const currentPrice = selectedVariant?.price || product.basePrice;
  const compareAtPrice = selectedVariant?.compareAt || null;

  let discount = null;
  let discountPercentage = null;

  if (compareAtPrice && compareAtPrice > currentPrice) {
    discount = compareAtPrice - currentPrice;
    discountPercentage = Math.round((discount / compareAtPrice) * 100);
  }

  return {
    current: currentPrice,
    original: compareAtPrice,
    discount,
    discountPercentage,
  };
}

/**
 * Get stock status for a variant or product
 */
export function getStockStatus(
  product: ProductDetails,
  selectedVariant?: ProductVariant | null
): StockStatus {
  if (!product.isAvailable) {
    return "out_of_stock";
  }

  const inventory = selectedVariant?.inventory;

  if (!inventory) {
    // Check if any variant has stock
    const hasStock = product.variants.some((v) => {
      const stock = v.inventory?.quantity || 0;
      const reserved = v.inventory?.reserved || 0;
      return stock - reserved > 0;
    });
    return hasStock ? "in_stock" : "out_of_stock";
  }

  const available = inventory.quantity - inventory.reserved;

  if (available <= 0) return "out_of_stock";
  if (available <= inventory.reorderThreshold) return "low_stock";
  return "in_stock";
}

/**
 * Get available quantity for a variant
 * Ensures the quantity is never negative
 */
export function getAvailableQuantity(variant: ProductVariant | null): number {
  if (!variant?.inventory) return 0;

  const quantity = variant.inventory.quantity || 0;
  const reserved = variant.inventory.reserved || 0;

  // Ensure we never return negative quantity
  return Math.max(0, quantity - reserved);
}

/**
 * Check if a selection is valid with detailed validation
 */
export function isValidSelection(product: ProductDetails, selection: ProductSelection): boolean {
  // Product must be available
  if (!product.isAvailable || product.isArchived) return false;

  // Check if product has variants with options
  const hasSize = product.variants.some((v) => v.optionValues?.size);
  const hasColor = product.variants.some((v) => v.optionValues?.color);

  // If product has size options, size must be selected
  if (hasSize && !selection.size) return false;

  // If product has color options, color must be selected
  if (hasColor && !selection.color) return false;

  // Quantity must be at least 1
  if (selection.quantity < 1) return false;

  // If product has no variants, validate against product-level inventories
  const hasVariants = product.variants && product.variants.length > 0;
  if (!hasVariants) {
    const directInventories = product.inventories || [];
    const totalAvailable = calculateTotalStock([], directInventories);

    if (totalAvailable <= 0) return false;
    if (selection.quantity > totalAvailable) return false;

    return true;
  }

  // Find matching variant and check stock
  const variant = findMatchingVariant(product.variants, selection);
  if (!variant) return false;

  const available = getAvailableQuantity(variant);

  // Check if requested quantity is available
  if (available <= 0) return false;
  if (selection.quantity > available) return false;

  return true;
}

/**
 * Validate selection and return detailed error message
 */
export function validateSelection(
  product: ProductDetails,
  selection: ProductSelection
): { isValid: boolean; error?: string } {
  // Product availability check
  if (!product.isAvailable) {
    return { isValid: false, error: "This product is currently unavailable" };
  }

  if (product.isArchived) {
    return { isValid: false, error: "This product is no longer available" };
  }

  // Check required options
  const hasSize = product.variants.some((v) => v.optionValues?.size);
  const hasColor = product.variants.some((v) => v.optionValues?.color);

  const missing = [];
  if (hasSize && !selection.size) missing.push("size");
  if (hasColor && !selection.color) missing.push("color");

  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Please select ${missing.join(" and ")}`,
    };
  }

  // Quantity validation
  if (selection.quantity < 1) {
    return { isValid: false, error: "Quantity must be at least 1" };
  }

  // Find matching variant
  // If product has no variants, validate against product-level inventories
  const hasVariants = product.variants && product.variants.length > 0;
  if (!hasVariants) {
    const directInventories = product.inventories || [];
    const totalAvailable = calculateTotalStock([], directInventories);

    if (totalAvailable <= 0) {
      return { isValid: false, error: "This product is currently out of stock" };
    }

    if (selection.quantity > totalAvailable) {
      return {
        isValid: false,
        error: `Only ${totalAvailable} item${totalAvailable !== 1 ? "s" : ""} available`,
      };
    }

    return { isValid: true };
  }

  // Find matching variant
  const variant = findMatchingVariant(product.variants, selection);
  if (!variant) {
    return {
      isValid: false,
      error: "Selected combination is not available",
    };
  }

  // Stock availability check
  const available = getAvailableQuantity(variant);

  if (available <= 0) {
    return {
      isValid: false,
      error: "This variant is currently out of stock",
    };
  }

  if (selection.quantity > available) {
    return {
      isValid: false,
      error: `Only ${available} item${available !== 1 ? "s" : ""} available`,
    };
  }

  return { isValid: true };
}

/**
 * Get product breadcrumbs
 */
export function getProductBreadcrumbs(product: ProductDetails) {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
  ];

  // Add first category if available
  if (product.categories.length > 0) {
    const category = product.categories[0].category;
    breadcrumbs.push({
      label: category.name,
      href: `/categories/${category.slug}`,
    });
  }

  breadcrumbs.push({
    label: product.name,
    href: `/products/${product.slug}`,
  });

  return breadcrumbs;
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Get stock status message
 */
export function getStockStatusMessage(status: StockStatus): string {
  const messages: Record<StockStatus, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    pre_order: "Pre-Order",
  };
  return messages[status];
}

/**
 * Get available colors for a specific size
 */
export function getAvailableColorsForSize(
  variants: ProductVariant[],
  size: string | null
): AvailableColor[] {
  if (!size) return getAvailableColors(variants);

  const filteredVariants = variants.filter((v) => v.optionValues?.size === size);

  return getAvailableColors(filteredVariants);
}

/**
 * Get available sizes for a specific color
 */
export function getAvailableSizesForColor(
  variants: ProductVariant[],
  color: string | null
): AvailableSize[] {
  if (!color) return getAvailableSizes(variants);

  const filteredVariants = variants.filter((v) => v.optionValues?.color === color);

  return getAvailableSizes(filteredVariants);
}
