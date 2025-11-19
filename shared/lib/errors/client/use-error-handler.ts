"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { ErrorDetails } from "../core/types";

/**
 * React Hook for generic error handling with toast notifications
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { handleError, handleSuccess } = useErrorHandler();
 *
 *   async function doSomething() {
 *     const result = await someAction();
 *     if (result.success) {
 *       handleSuccess("Operation completed!");
 *     } else {
 *       handleError(result.error);
 *     }
 *   }
 * }
 * ```
 */
export function useErrorHandler() {
  const handleError = useCallback((error: ErrorDetails) => {
    // Show field errors if present (validation errors)
    if (error.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        toast.error(`${field}: ${message}`);
      });
    } else {
      // Show general error message
      toast.error(error.message);
    }
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const handleInfo = useCallback((message: string) => {
    toast.info(message);
  }, []);

  const handleWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleInfo,
    handleWarning,
  };
}
