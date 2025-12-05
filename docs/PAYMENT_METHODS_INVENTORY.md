# Payment Methods & Inventory Management

## Overview

This document explains how inventory is managed differently for Cash on Delivery (COD) vs Credit Card (Visa) payments.

## Payment Methods

### 1. Credit Card (Visa/Stripe) 💳

**Flow:**

```
1. User adds items to cart
2. User proceeds to checkout
3. reserveStock() - Stock is RESERVED (quantity unchanged, reserved++)
4. Order created with status: PENDING_PAYMENT
5. User redirected to Stripe payment page
6. User completes payment
7. Stripe webhook confirms payment ✅
8. commitStock() - Stock is COMMITTED (quantity--, reserved--)
9. Order status updated to: PAID
```

**Inventory Changes:**

- **Before Payment:** `quantity=100, reserved=5` (stock reserved but not committed)
- **After Payment:** `quantity=95, reserved=0` (stock committed - deducted from inventory)

**Why?**

- Customer must pay BEFORE we commit stock
- If payment fails, we release the reservation
- Prevents fraud and ensures payment before deducting inventory

---

### 2. Cash on Delivery (COD) 💵

**Flow:**

```
1. User adds items to cart
2. User proceeds to checkout
3. reserveStock() - Stock is RESERVED (quantity unchanged, reserved++)
4. Order created with status: PENDING_PAYMENT
5. Stock STAYS RESERVED (NO commitStock call)
6. Order marked as "Awaiting Delivery"
7. Driver delivers order
8. Customer pays cash
9. Admin confirms payment in system
10. commitStock() - Stock is COMMITTED (quantity--, reserved--)
11. Order status updated to: PAID
```

**Inventory Changes:**

- **After Order:** `quantity=100, reserved=5` (stock reserved but NOT committed)
- **After Delivery & Payment:** `quantity=95, reserved=0` (stock committed)

**Why?**

- Stock is reserved when order is placed (prevents overselling)
- Stock is NOT committed until customer actually pays on delivery
- If customer refuses delivery, we can easily release the reservation
- Protects against customers who order but don't pay

---

## Code Implementation

### createOrder() in checkout.service.ts

```typescript
// For COD: Keep stock RESERVED (not committed)
if (isCOD) {
  // NO commitStock() call here!
  // Stock stays in reserved state until delivery
  await tx.order.update({
    where: { id: newOrder.id },
    data: {
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
    },
  });
}

// For Card: COMMIT stock immediately (payment confirmed)
else if (hasPaymentIntent) {
  // Stock is committed - deducted from inventory
  await commitStock(tx, stockItems);

  await tx.order.update({
    where: { id: newOrder.id },
    data: {
      status: "PAID",
      paymentStatus: "PAID",
      paidAt: new Date(),
    },
  });
}
```

### processPaymentSuccess() in payment.service.ts

```typescript
// For Visa: Commit stock when webhook confirms payment
export async function processPaymentSuccess(webhookEvent) {
  await prisma.$transaction(async (tx) => {
    // 1. Commit stock (deduct from inventory)
    await commitStock(tx, stockItems);

    // 2. Mark order as PAID
    await markOrderAsPaid(tx, orderId, paymentData);
  });
}
```

---

## Inventory States

### Reserved Stock

- Stock is "on hold" for a specific order
- Still counts in total quantity
- Not available for other customers
- Can be released if order is cancelled

**Database:**

```sql
Inventory {
  quantity: 100    -- Total stock
  reserved: 5      -- Reserved for pending orders
  available: 95    -- quantity - reserved
}
```

### Committed Stock

- Stock has been deducted from inventory
- Order is confirmed and paid
- Cannot be released (unless refunded)

**Database:**

```sql
Inventory {
  quantity: 95     -- Total stock (decreased)
  reserved: 0      -- No longer reserved
  available: 95    -- All remaining stock is available
}
```

---

## Stock Calculation Formula

```typescript
// From product-availability.ts
export function calculateVariantStock(inventory) {
  const quantity = inventory.quantity || 0;
  const reserved = inventory.reserved || 0;
  return Math.max(0, quantity - reserved);
}
```

**Example:**

- Product has `quantity=100, reserved=5`
- Available for purchase: `100 - 5 = 95`
- If customer adds 95+ items to cart, checkout will fail

---

## Important Notes

⚠️ **Key Differences:**

1. **Visa:** Stock committed IMMEDIATELY after payment succeeds
2. **COD:** Stock stays RESERVED until delivery confirmation
3. **Reserved stock** is NOT available for other customers
4. **Committed stock** is permanently deducted from inventory

✅ **Benefits:**

- Prevents overselling (both methods reserve stock)
- Protects against COD order cancellations (stock not committed)
- Ensures payment before inventory deduction (Visa)
- Clear audit trail of stock movements

🔐 **Security:**

- Stripe webhooks verify payment authenticity
- COD requires admin confirmation before committing stock
- All operations are atomic (database transactions)
- Idempotent webhook handling prevents double-processing

---

## Admin Actions Required

### For COD Orders:

1. Order placed → Stock RESERVED
2. Driver delivers → Customer pays cash
3. **Admin must:** Confirm payment in admin panel
4. System calls `commitStock()` → Stock COMMITTED
5. Order status updated to PAID

### For Card Orders:

1. Order placed → Stock RESERVED
2. Customer pays on Stripe → Webhook received
3. **System automatically:** Calls `commitStock()` → Stock COMMITTED
4. Order status updated to PAID
5. No admin action needed! ✨

---

## Related Files

- `features/checkout/services/checkout.service.ts` - Main checkout logic
- `features/checkout/services/payment.service.ts` - Payment webhook handling
- `features/checkout/services/inventory.service.ts` - Stock management (reserve, commit, release)
- `features/checkout/services/order.service.ts` - Order state management
- `shared/lib/utils/product-availability.ts` - Stock availability calculation
