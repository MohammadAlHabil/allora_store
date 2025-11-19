"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Result } from "../core/types";

/**
 * React Hook for handling form submissions with Result<T>
 *
 * @example
 * ```tsx
 * function SignUpForm() {
 *   const { handleSubmit, isLoading } = useFormHandler();
 *
 *   const onSubmit = async (formData: FormData) => {
 *     await handleSubmit(
 *       signUpAction,
 *       formData,
 *       () => router.push('/verify-email')
 *     );
 *   };
 *
 *   return (
 *     <form action={onSubmit}>
 *       <input name="email" />
 *       <button type="submit" disabled={isLoading}>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormHandler() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit<T>(
    action: (formData: FormData) => Promise<Result<T>>,
    formData: FormData,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ) {
    setIsLoading(true);

    try {
      const result = await action(formData);

      if (result.success) {
        // Show success message
        if (result.message) {
          toast.success(result.message);
        }

        // Call success callback
        onSuccess?.(result.data);
      } else {
        // Show field errors (validation errors)
        if (result.error.fieldErrors) {
          Object.entries(result.error.fieldErrors).forEach(([field, message]) => {
            toast.error(`${field}: ${message}`);
          });
        } else {
          // Show general error
          toast.error(result.error.message);
        }

        // Call error callback
        onError?.(result.error.message);
      }
    } catch (error) {
      // Unexpected error
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  }

  return { handleSubmit, isLoading };
}
