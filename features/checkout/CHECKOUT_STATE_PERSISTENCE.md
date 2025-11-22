# Checkout State Persistence

## Overview

The checkout flow maintains user progress across page refreshes using `sessionStorage` for optimal performance and user experience.

## Features

### ✅ Automatic State Persistence

- **Current Step**: Preserves which step the user is on (address, shipping, payment)
- **Form Data**: Saves all form inputs including:
  - Selected addresses
  - Shipping method selection
  - Payment method choice
  - Special instructions/notes

### ✅ Smart Expiry

- State expires after **30 minutes** of inactivity
- Automatically clears expired state on next visit
- Prevents stale data from being loaded

### ✅ Performance Optimized

- Uses `sessionStorage` (faster than localStorage)
- Memoized callbacks with `useCallback`
- Prevents unnecessary re-renders
- Shows loading state during hydration

### ✅ User Experience

- No data loss on accidental refresh
- Smooth continuation of checkout process
- Loading state prevents flash of wrong content
- Automatic cleanup on successful order

## Technical Implementation

### Storage Key

```typescript
const STORAGE_KEY = "checkout_state";
const STORAGE_EXPIRY = 30 * 60 * 1000; // 30 minutes
```

### Stored Data Structure

```typescript
interface StoredCheckoutState {
  currentStep: CheckoutStep;
  formData: Partial<CheckoutFormData>;
  timestamp: number;
}
```

### Lifecycle

1. **On Mount**:
   - Load state from `sessionStorage`
   - Validate timestamp (not expired)
   - Restore step and form data

2. **On Change**:
   - Save state to `sessionStorage`
   - Update timestamp

3. **On Order Success**:
   - Clear all saved state
   - Reset to initial step

4. **On Expiry**:
   - Automatically clear stale data
   - Start fresh checkout

## Usage

The state persistence is handled automatically by `useCheckoutFlow` hook:

```typescript
const {
  currentStep,
  formData,
  updateFormData,
  nextStep,
  previousStep,
  resetCheckout,
  isHydrated, // Wait for this before rendering
} = useCheckoutFlow();
```

## Best Practices

1. Always check `isHydrated` before rendering content
2. Use `resetCheckout()` after successful order
3. Let the hook manage state - don't manually manipulate sessionStorage
4. Form components should update via `updateFormData()`

## Browser Compatibility

Works in all modern browsers that support `sessionStorage`:

- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)
- Opera 10.5+

## Security

- Uses `sessionStorage` (tab-scoped, not shared across tabs)
- Data cleared when browser/tab closes
- No sensitive payment info stored (handled by Stripe)
- Auto-expires after 30 minutes
