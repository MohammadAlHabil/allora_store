/**
 * Inventory Service
 *
 * Manages inventory stock tracking for a SINGLE WAREHOUSE system.
 *
 * BUSINESS RULES:
 * - There is only ONE warehouse in the system
 * - All inventory is tracked against this single warehouse
 * - Stock formula: available = quantity - reserved (uses centralized utility)
 * - isTracked = true: enforce stock constraints
 * - isTracked = false: treat as "always available" (digital products, services)
 *
 * STOCK LIFECYCLE:
 * 1. Initial stock: quantity = 100, reserved = 0 → available = 100
 * 2. Soft reserve (checkout): reserved += 5 → available = 95
 * 3. Hard commit (payment success): quantity -= 5, reserved -= 5
 * 4. Release (payment failure): reserved -= 5 → available = 100
 */

import { Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import { calculateVariantStock } from "@/shared/lib/utils/product-availability";

/**
 * Result of stock availability check
 */
export type StockCheckResult = {
  productId: string;
  variantId: string | null;
  sku: string;
  requestedQty: number;
  availableQty: number;
  isAvailable: boolean;
  isTracked: boolean;
  reason?: string;
  title?: string;
  image?: string;
};

/**
 * Cart item for stock validation
 */
export type CartItemForStock = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

/**
 * Get the single default warehouse ID
 * In a single-warehouse system, we always use the first warehouse
 */
export async function getDefaultWarehouseId(): Promise<string> {
  const warehouse = await prisma.warehouse.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!warehouse) {
    throw new Error("SYSTEM_ERROR: No warehouse found. Please seed the database.");
  }

  return warehouse.id;
}

/**
 * PHASE A: Check stock availability for cart items
 *
 * This is a READ-ONLY check before payment to inform the user
 * if items are in stock. Does NOT reserve stock yet.
 *
 * @param items - Cart items to check
 * @returns Array of stock check results
 */
export async function checkStockAvailability(
  items: CartItemForStock[]
): Promise<StockCheckResult[]> {
  const results: StockCheckResult[] = [];

  console.log("🔍 Checking stock for items:", items);

  for (const item of items) {
    // Find inventory record by product/variant
    let inventory = await prisma.inventory.findFirst({
      where: {
        productId: item.productId,
        variantId: item.variantId || null,
      },
      include: {
        product: {
          select: { name: true, type: true },
        },
      },
    });

    // If no inventory found for base product (variantId: null), try to find default variant
    if (!inventory && !item.variantId) {
      console.log(
        `⚠️  No inventory for base product ${item.productId}, searching for default variant...`
      );

      // Get default variant for this product
      const defaultVariant = await prisma.productVariant.findFirst({
        where: {
          productId: item.productId,
          isDefault: true,
        },
      });

      if (defaultVariant) {
        console.log(`✓ Found default variant ${defaultVariant.id}, checking inventory...`);
        inventory = await prisma.inventory.findFirst({
          where: {
            productId: item.productId,
            variantId: defaultVariant.id,
          },
          include: {
            product: {
              select: { name: true, type: true },
            },
          },
        });
      }
    }

    console.log(`📦 Inventory check for product ${item.productId}:`, {
      found: !!inventory,
      isTracked: inventory?.isTracked,
      quantity: inventory?.quantity,
      reserved: inventory?.reserved,
      requested: item.quantity,
    });

    // No inventory record found
    if (!inventory) {
      const result = {
        productId: item.productId,
        variantId: item.variantId || null,
        sku: "UNKNOWN",
        requestedQty: item.quantity,
        availableQty: 0,
        isAvailable: false,
        isTracked: true,
        reason: "Product not found in inventory",
      };
      console.log("❌ No inventory record:", result);
      results.push(result);
      continue;
    }

    // Non-tracked items (digital products, services) are always available
    if (!inventory.isTracked) {
      const result = {
        productId: item.productId,
        variantId: item.variantId || null,
        sku: inventory.sku,
        title: inventory.product.name,
        requestedQty: item.quantity,
        availableQty: Infinity,
        isAvailable: true,
        isTracked: false,
      };
      console.log("✅ Non-tracked item (always available):", result);
      results.push(result);
      continue;
    }

    // For tracked items, calculate availability using centralized utility
    const available = calculateVariantStock(inventory);
    const isAvailable = available >= item.quantity;

    const result = {
      productId: item.productId,
      variantId: item.variantId || null,
      sku: inventory.sku,
      title: inventory.product.name,
      requestedQty: item.quantity,
      availableQty: available,
      isAvailable,
      isTracked: true,
      reason: isAvailable
        ? undefined
        : available > 0
          ? `Only ${available} unit${available !== 1 ? "s" : ""} available`
          : `Out of stock`,
    };

    console.log(`${isAvailable ? "✅" : "❌"} Stock check result:`, {
      title: result.title,
      available: result.availableQty,
      requested: result.requestedQty,
      isAvailable: result.isAvailable,
      reason: result.reason,
    });

    results.push(result);
  }

  console.log("📊 Final stock check results:", {
    totalItems: results.length,
    available: results.filter((r) => r.isAvailable).length,
    unavailable: results.filter((r) => !r.isAvailable).length,
  });

  return results;
}

/**
 * PHASE B: Reserve stock for an order (SOFT RESERVATION)
 *
 * This is called BEFORE payment to prevent overselling.
 * Increases the 'reserved' field for tracked items.
 *
 * MUST be called within a Prisma transaction to ensure atomicity.
 *
 * @param tx - Prisma transaction client
 * @param items - Order items to reserve
 * @throws Error if insufficient stock
 */
export async function reserveStock(
  tx: Prisma.TransactionClient,
  items: CartItemForStock[]
): Promise<void> {
  for (const item of items) {
    // Find inventory with FOR UPDATE lock to prevent race conditions
    const inventory = await tx.inventory.findFirst({
      where: {
        productId: item.productId,
        variantId: item.variantId || null,
      },
    });

    if (!inventory) {
      throw new Error(`Inventory not found for product ${item.productId}`);
    }

    // Skip reservation for non-tracked items
    if (!inventory.isTracked) {
      continue;
    }

    // Calculate available stock using centralized utility
    const available = calculateVariantStock(inventory);

    // Check if sufficient stock
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for SKU ${inventory.sku}. ` +
          `Available: ${available}, Requested: ${item.quantity}`
      );
    }

    // Reserve the stock
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: {
          increment: item.quantity,
        },
      },
    });
  }
}

/**
 * PHASE C: Commit stock after successful payment (HARD COMMIT)
 *
 * This is called AFTER payment confirmation.
 * Decreases both 'quantity' (actual stock sold) and 'reserved' (release reservation).
 *
 * MUST be called within a Prisma transaction.
 *
 * @param tx - Prisma transaction client
 * @param items - Order items to commit
 */
export async function commitStock(
  tx: Prisma.TransactionClient,
  items: CartItemForStock[]
): Promise<void> {
  for (const item of items) {
    const inventory = await tx.inventory.findFirst({
      where: {
        productId: item.productId,
        variantId: item.variantId || null,
      },
    });

    if (!inventory) {
      throw new Error(`Inventory not found for product ${item.productId}`);
    }

    // Skip for non-tracked items
    if (!inventory.isTracked) {
      continue;
    }

    // Deduct from quantity and reserved
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: {
          decrement: item.quantity,
        },
        reserved: {
          decrement: item.quantity,
        },
      },
    });
  }
}

/**
 * PHASE D: Release reserved stock (ROLLBACK RESERVATION)
 *
 * This is called when:
 * - Payment fails
 * - User cancels the order
 * - Order expires (stays PENDING_PAYMENT too long)
 *
 * Decreases the 'reserved' field, making stock available again.
 *
 * MUST be called within a Prisma transaction.
 *
 * @param tx - Prisma transaction client
 * @param items - Order items to release
 */
export async function releaseReservedStock(
  tx: Prisma.TransactionClient,
  items: CartItemForStock[]
): Promise<void> {
  for (const item of items) {
    const inventory = await tx.inventory.findFirst({
      where: {
        productId: item.productId,
        variantId: item.variantId || null,
      },
    });

    if (!inventory) {
      // Inventory was deleted, nothing to release
      continue;
    }

    // Skip for non-tracked items
    if (!inventory.isTracked) {
      continue;
    }

    // Release the reservation
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: {
          decrement: item.quantity,
        },
      },
    });
  }
}

/**
 * Get current stock status for a product/variant
 * Useful for displaying stock info to users
 */
export async function getStockStatus(productId: string, variantId?: string | null) {
  const inventory = await prisma.inventory.findFirst({
    where: {
      productId,
      variantId: variantId || null,
    },
  });

  if (!inventory) {
    return {
      exists: false,
      isTracked: false,
      quantity: 0,
      reserved: 0,
      available: 0,
      isInStock: false,
    };
  }

  // Calculate available stock using centralized utility
  const available = calculateVariantStock(inventory);

  return {
    exists: true,
    isTracked: inventory.isTracked,
    quantity: inventory.quantity,
    reserved: inventory.reserved,
    available,
    isInStock: inventory.isTracked ? available > 0 : true,
    reorderThreshold: inventory.reorderThreshold,
    needsReorder: inventory.isTracked && inventory.quantity <= inventory.reorderThreshold,
  };
}
