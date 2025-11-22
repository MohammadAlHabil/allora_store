# Selection Persistence Fix — Summary

Problem

After adding checkout state persistence, the checkout step was restored correctly after refresh, but some UI selections (selected address, shipping method, shipping cost) were not being restored. The saved `formData` existed but local component state wasn't being synced back from it after hydration.

Root cause

- `formData` included the values, but the component-level local state (`selectedAddress`, `selectedMethodId`, `shippingCost`) was not restored from `formData` when the hook signalled hydration.

Fix implemented

1. Add `shippingCost` to `CheckoutFormData` to persist cost with the method.

```ts
// features/checkout/types/checkout.types.ts
export type CheckoutFormData = {
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  useSameAddress: boolean;
  shippingMethodId: string;
  shippingCost?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
};
```

2. Restore local selection state after hydration in `CheckoutPageContent`:

```ts
useEffect(() => {
  if (!isHydrated) return;

  if (formData.shippingMethodId) setSelectedMethodId(formData.shippingMethodId);
  if (formData.shippingCost !== undefined) setShippingCost(formData.shippingCost);
  if (formData.shippingAddress?.id) setSelectedAddress(formData.shippingAddress as AddressResponse);
}, [isHydrated, formData]);
```

3. Save shipping cost when user selects a shipping method:

```tsx
<ShippingMethodStep
  addressId={selectedAddress.id}
  onMethodSelected={(methodId, cost) => {
    setSelectedMethodId(methodId);
    setShippingCost(cost);
    updateFormData({ shippingMethodId: methodId, shippingCost: cost });
  }}
/>
```

Testing checklist

- Select an address → refresh → selected address remains
- Select a shipping method → refresh → selected method and cost remain
- Go through payment selection and refresh → payment method should remain

Files modified

- `features/checkout/types/checkout.types.ts` (add `shippingCost`)
- `app/checkout/CheckoutPageContent.tsx` (restore local selections from `formData`)

See `docs/features/checkout/CHECKOUT_STATE_PERSISTENCE.md` for the full persistence design.
