// Deprecated: `shared/lib/api` shim removed — use the centralized
// error/result builders in `@/shared/lib/errors` instead.
// This file remains as a warning for accidental imports.

export default {
  ok() {
    throw new Error(
      "Deprecated: use `ok()` from '@/shared/lib/errors' instead of '@/shared/lib/api'"
    );
  },
  fail() {
    throw new Error(
      "Deprecated: use `fail()` from '@/shared/lib/errors' instead of '@/shared/lib/api'"
    );
  },
};
