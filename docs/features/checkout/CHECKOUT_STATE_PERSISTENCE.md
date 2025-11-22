# Checkout State Persistence

## Overview

The checkout flow preserves user progress across page refreshes using `sessionStorage`, improving UX and preventing data loss during in-progress orders.

## Key Features

- Persist current checkout step (address, shipping, payment)
- Persist form data: selected addresses, shipping method, payment method, special notes

## Checkout State Persistence (improved)

TL;DR — The checkout flow preserves in-progress state (step and form data) in `sessionStorage`, with a short expiry and hydration guards so UI renders only after state is restored.

Why

- Prevents data loss on accidental refreshes
- Allows multi-step checkout to resume where the user left off

Key behaviors

- Persists current step (address → shipping → payment) and form data (addresses, selected shipping method, payment choice, notes)
- Expires stored state after 30 minutes to avoid stale data
- Uses `sessionStorage` (tab-scoped) and hydration flag (`isHydrated`) to avoid UI flash

Implementation summary

- Storage key & expiry:

```ts
const STORAGE_KEY = "checkout_state";
const STORAGE_EXPIRY = 30 * 60 * 1000; // 30 minutes
```

- Stored shape:

```ts
interface StoredCheckoutState {
  currentStep: CheckoutStep;
  formData: Partial<CheckoutFormData>;
  timestamp: number;
}
```

- Lifecycle:
  1. On mount: load state, validate timestamp, restore step & formData
  2. On change: write state + timestamp to `sessionStorage`
  3. On order success: clear saved state
  4. On expiry: clear stale data and start fresh

Hook interface (usage)

```ts
const { currentStep, formData, updateFormData, nextStep, previousStep, resetCheckout, isHydrated } =
  useCheckoutFlow();

// wait for isHydrated before rendering checkout UI
```

Best practices

- Always wait for `isHydrated` before rendering checkout forms or selections
- Use `updateFormData()` to update persistent state; avoid direct `sessionStorage` manipulation
- Call `resetCheckout()` after successful order completion

Security & compatibility

- Uses `sessionStorage` (tab-scoped) — data cleared on tab close
- No sensitive payment details are stored (Stripe handles card data)
- Works in modern browsers that support `sessionStorage`

See also: `docs/SELECTION_PERSISTENCE_FIX.md` for a related restoration fix.
