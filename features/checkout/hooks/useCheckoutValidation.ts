"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CheckoutIssue } from "../components/CheckoutAlertModal";

interface StockResult {
  productId: string;
  variantId?: string | null;
  requestedQty: number;
  availableQty: number;
  isAvailable: boolean;
  title?: string;
  image?: string;
}

interface ValidationResult {
  success: boolean;
  canProceed: boolean;
  stockResults?: StockResult[];
  errors?: (string | { message?: string; code?: string; field?: string; image?: string })[];
}

export function useCheckoutValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [issues, setIssues] = useState<CheckoutIssue[]>([]);
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const validateCheckout = async (): Promise<boolean> => {
    setIsValidating(true);
    setIssues([]);
    setGeneralErrors([]);

    try {
      const response = await fetch("/api/checkout/validate");
      const data: ValidationResult = await response.json();

      if (data.canProceed) {
        return true;
      }

      // Process errors
      const newIssues: CheckoutIssue[] = [];
      const newGeneralErrors: string[] = [];

      if (data.stockResults) {
        data.stockResults.forEach((result) => {
          if (!result.isAvailable) {
            newIssues.push({
              productId: result.productId,
              variantId: result.variantId,
              title: result.title || "Unknown Product",
              reason: !result.isAvailable
                ? "Product is unavailable"
                : `Out of stock (Only ${result.availableQty} available)`,
              available: result.availableQty,
              requested: result.requestedQty,
              image: result.image,
            });
          }
        });
      }

      if (data.errors) {
        // Filter and process errors
        data.errors.forEach((err: unknown) => {
          if (typeof err === "string") {
            // Filter out specific redundant strings if needed, or just add
            if (err !== "Item not available" && err !== "Product not found in inventory") {
              newGeneralErrors.push(err);
            }
            return;
          }

          if (typeof err === "object" && err !== null) {
            const errorObj = err as {
              message?: string;
              code?: string;
              field?: string;
              image?: string;
            };

            // Handle Price Changes as Issues
            if (errorObj.code === "PRICE_CHANGED" && errorObj.message) {
              // Parse message: "Price changed for [Title] (was [Old], now [New])"
              const match = errorObj.message.match(/Price changed for (.*) \(was (.*), now (.*)\)/);
              if (match) {
                newIssues.push({
                  productId: "price-change", // Placeholder
                  title: match[1],
                  reason: `Price updated: ${match[2]} ⟶ ${match[3]}`,
                  image: errorObj.image,
                  // No available/requested needed
                });
                return;
              }
              // Fallback if regex fails
              newGeneralErrors.push(errorObj.message);
              return;
            }

            // Filter out redundant stock errors
            if (
              errorObj.message === "Item not available" ||
              errorObj.message === "Product not found in inventory"
            ) {
              // Only skip if we have issues (which we likely do if this error is present)
              if (newIssues.length > 0) return;
            }

            newGeneralErrors.push(errorObj.message || errorObj.code || JSON.stringify(err));
          }
        });
      }

      // If no specific issues found but canProceed is false, show generic error
      if (newIssues.length === 0 && newGeneralErrors.length === 0) {
        newGeneralErrors.push("Unable to proceed with checkout. Please try again.");
      }

      setIssues(newIssues);
      setGeneralErrors(newGeneralErrors);
      setShowModal(true);
      return false;
    } catch (error) {
      console.error("Checkout validation error:", error);
      toast.error("Failed to validate checkout. Please try again.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateCheckout,
    isValidating,
    issues,
    generalErrors,
    showModal,
    setShowModal,
  };
}
