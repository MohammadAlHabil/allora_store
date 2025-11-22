// Cart slice removed — cart is managed by React Query now.
// Kept as a deprecated stub for history; do not import in live code.

export const setCart = () => {
  throw new Error("Deprecated: setCart (Redux) has been removed. Use React Query hooks instead.");
};

export const addItem = () => {
  throw new Error("Deprecated: addItem (Redux) has been removed. Use React Query hooks instead.");
};

export const removeItem = () => {
  throw new Error(
    "Deprecated: removeItem (Redux) has been removed. Use React Query hooks instead."
  );
};

export const updateQuantity = () => {
  throw new Error(
    "Deprecated: updateQuantity (Redux) has been removed. Use React Query hooks instead."
  );
};

export default null as unknown as (state: unknown) => unknown;
