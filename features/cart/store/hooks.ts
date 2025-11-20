// Redux hooks removed — use React Query hooks or feature-specific hooks instead.
// These functions remain as developer-time guidance only. Do NOT import
// `useAppDispatch`/`useAppSelector` in new code; migrate to React Query or
// local/component state. If you hit one of these at runtime, it means a
// migration is incomplete.

export const useAppDispatch = () => {
  throw new Error(
    "Deprecated: `useAppDispatch` removed. Use feature-specific React Query mutations instead."
  );
};

export const useAppSelector = () => {
  throw new Error(
    "Deprecated: `useAppSelector` removed. Use React Query `useQuery` or local state instead."
  );
};
