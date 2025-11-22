# Selection Persistence Fix

## Problem

After implementing checkout state persistence with sessionStorage, the checkout **step** was preserved on refresh, but user **selections** (selected address, selected shipping method, shipping cost) were lost.

## Root Cause

- The `formData` was being saved to sessionStorage correctly
- But the **local state variables** (`selectedAddress`, `selectedMethodId`, `shippingCost`) were not being restored from `formData` on page load
- This caused the UI to show the correct step but lose the visual selection indicators

## Solution

### 1. Enhanced `CheckoutFormData` Type

Added `shippingCost` field to persist shipping cost:

```typescript
// features/checkout/types/checkout.types.ts
export type CheckoutFormData = {
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  useSameAddress: boolean;
  shippingMethodId: string;
  shippingCost?: number; // ✅ NEW - preserve shipping cost
  paymentMethod: PaymentMethod;
  notes?: string;
};
```

### 2. Updated Restoration Logic

Modified the `useEffect` in `CheckoutPageContent.tsx` to restore all selections:

```typescript
// Restore state from formData after hydration
useEffect(() => {
  if (!isHydrated) return;

  // Restore shipping method if it was saved
  if (formData.shippingMethodId) {
    setSelectedMethodId(formData.shippingMethodId);
  }

  // ✅ NEW - Restore shipping cost
  if (formData.shippingCost !== undefined) {
    setShippingCost(formData.shippingCost);
  }

  // ✅ NEW - Restore selected address from saved formData
  if (formData.shippingAddress?.id) {
    setSelectedAddress(formData.shippingAddress as unknown as AddressResponse);
  }
}, [isHydrated, formData.shippingMethodId, formData.shippingCost, formData.shippingAddress]);
```

### 3. Save Shipping Cost on Selection

Updated the shipping method selection handler to save both method ID and cost:

```typescript
<ShippingMethodStep
  addressId={selectedAddress.id}
  onMethodSelected={(methodId, cost) => {
    setSelectedMethodId(methodId);
    setShippingCost(cost);
    updateFormData({
      shippingMethodId: methodId,
      shippingCost: cost  // ✅ Save cost to formData
    });
  }}
/>
```

## How It Works

### Before Fix

1. User selects address → `formData.shippingAddress` saved ✅
2. User refreshes page → Step restored ✅, but `selectedAddress` = null ❌
3. UI doesn't show which address is selected ❌

### After Fix

1. User selects address → `formData.shippingAddress` saved ✅
2. User refreshes page → Step restored ✅
3. `useEffect` runs after hydration:
   - Reads `formData.shippingAddress.id`
   - Sets `selectedAddress` with the saved address ✅
   - UI shows the selected address ✅

### Same for Shipping Method

1. User selects method → `formData.shippingMethodId` + `shippingCost` saved ✅
2. User refreshes → Both restored ✅
3. UI shows selected method with correct cost ✅

## Testing Checklist

Test the following flow:

1. **Address Selection**
   - [ ] Go to checkout
   - [ ] Select an address
   - [ ] Refresh page → Address should still be selected ✅

2. **Shipping Method Selection**
   - [ ] Select address → Go to shipping step
   - [ ] Select a shipping method
   - [ ] Refresh page → Method should still be selected ✅
   - [ ] Order summary should show correct shipping cost ✅

3. **Payment Method Selection**
   - [ ] Complete address & shipping
   - [ ] Select payment method
   - [ ] Refresh page → Payment method should be selected ✅

4. **Full Flow with Multiple Refreshes**
   - [ ] Select address → Refresh → Still selected ✅
   - [ ] Select shipping → Refresh → Still selected ✅
   - [ ] Select payment → Refresh → Still selected ✅
   - [ ] Place order → Success ✅

## Files Modified

1. `features/checkout/types/checkout.types.ts`
   - Added `shippingCost?: number` to `CheckoutFormData`

2. `app/checkout/CheckoutPageContent.tsx`
   - Enhanced restoration `useEffect` to restore `selectedAddress`, `selectedMethodId`, and `shippingCost`
   - Updated shipping method selection to save `shippingCost` to `formData`

## Related Documentation

- See `CHECKOUT_STATE_PERSISTENCE.md` for overall persistence architecture
- This fix completes the persistence feature by ensuring UI state matches saved data
