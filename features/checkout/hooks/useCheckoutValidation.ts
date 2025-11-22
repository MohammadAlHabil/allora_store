"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CheckoutIssue } from "../components/CheckoutAlertModal";

// Cart item type for filtering
interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface StockResult {
  productId: string;
  variantId?: string | null;
  requestedQty: number;
  availableQty: number;
  isAvailable: boolean;
  reason?: string;
  title?: string;
  image?: string;
  reason?: string;
}

interface ValidationResult {
  success: boolean;
  canProceed: boolean;
  stockResults?: StockResult[];
  errors?: (string | { message?: string; code?: string; field?: string; image?: string })[];
}

export function useCheckoutValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [issues, setIssues] = useState<CheckoutIssue[]>([]);
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleRemoveItem = async (productId: string, variantId?: string | null) => {
    setIsProcessing(true);
    try {
      // Get cart to find the item ID
      const cartResponse = await fetch("/api/cart");
      const cartData = await cartResponse.json();

      if (!cartData.success) {
        toast.error("Failed to fetch cart");
        return;
      }

      // Find the cart item
      const cart = cartData.data;
      const cartItem = cart.items.find(
        (item: CartItem) =>
          item.productId === productId &&
          (variantId ? item.variantId === variantId : !item.variantId)
      );

      if (!cartItem) {
        toast.error("Item not found in cart");
        return;
      }

      // Remove the item
      const response = await fetch(`/api/cart/${cartItem.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Failed to remove item");
        return;
      }

      toast.success("Item removed from cart");

      // Force refetch cart data by invalidating React Query cache
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }

      // Re-validate to update the issues list
      await validateCheckout();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    variantId: string | null | undefined,
    newQuantity: number
  ) => {
    setIsProcessing(true);
    try {
      // Get cart to find the item ID
      const cartResponse = await fetch("/api/cart");
      const cartData = await cartResponse.json();

      if (!cartData.success) {
        toast.error("Failed to fetch cart");
        return;
      }

      // Find the cart item
      const cart = cartData.data;
      const cartItem = cart.items.find(
        (item: CartItem) =>
          item.productId === productId &&
          (variantId ? item.variantId === variantId : !item.variantId)
      );

      if (!cartItem) {
        toast.error("Item not found in cart");
        return;
      }

      // Update quantity
      const response = await fetch(`/api/cart/${cartItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        toast.error("Failed to update quantity");
        return;
      }

      toast.success("Quantity updated");

      // Force refetch cart data by invalidating React Query cache
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }

      // Re-validate to update the issues list
      await validateCheckout();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePrice = async (productId: string, variantId?: string | null) => {
    setIsProcessing(true);
    try {
      // Fetch latest price and update cart
      const response = await fetch("/api/cart/update-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId }),
      });

      if (!response.ok) {
        toast.error("Failed to update price");
        return;
      }

      toast.success("Price updated");

      // Force refetch cart data by invalidating React Query cache
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }

      // Re-validate to update the issues list
      await validateCheckout();
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update price");
    } finally {
      setIsProcessing(false);
    }
  };

  const validateCheckout = async (): Promise<boolean> => {
    setIsValidating(true);
    setIssues([]);
    setGeneralErrors([]);

    try {
      const response = await fetch("/api/checkout/validate");
      const data: ValidationResult = await response.json();

      console.log("🔍 Validation Response:", {
        canProceed: data.canProceed,
        stockResults: data.stockResults,
        errors: data.errors,
      });

      if (data.canProceed) {
        setShowModal(false);
        return true;
      }

      // Process errors
      const newIssues: CheckoutIssue[] = [];
      const newGeneralErrors: string[] = [];

      if (data.stockResults) {
        data.stockResults.forEach((result) => {
          if (!result.isAvailable) {
            console.log("❌ Stock Issue Found:", {
              productId: result.productId,
              title: result.title,
              requested: result.requestedQty,
              available: result.availableQty,
              reason: result.reason,
            });

            newIssues.push({
              productId: result.productId,
              variantId: result.variantId,
              title: result.title || "Unknown Product",
              reason: result.reason || "Product is unavailable",
              available: result.availableQty,
              requested: result.requestedQty,
              image: result.image,
              type: "stock",
            });
          }
        });
      }

      if (data.errors) {
        // Filter and process errors
        data.errors.forEach((err: unknown) => {
          if (typeof err === "string") {
            // Filter out redundant stock error messages since we show them as issues
            if (
              err !== "Item not available" &&
              err !== "Product not found in inventory" &&
              !err.includes("Only") &&
              !err.includes("units available")
            ) {
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

            // Skip stock-related errors - they're already in issues
            if (errorObj.code === "OUT_OF_STOCK") {
              return;
            }

            // Handle Price Changes as Issues
            if (errorObj.code === "PRICE_CHANGED" && errorObj.message) {
              // Parse message: "Price changed for [Title] (was [Old], now [New])"
              const match = errorObj.message.match(/Price changed for (.*) \(was (.*), now (.*)\)/);
              if (match) {
                newIssues.push({
                  productId: (errorObj as { productId?: string }).productId || "price-change",
                  variantId: (errorObj as { variantId?: string | null }).variantId,
                  title: match[1],
                  reason: `Price updated: ${match[2]} ⟶ ${match[3]}`,
                  image: errorObj.image,
                  type: "price",
                  // No available/requested needed
                });
                return;
              }
              // Fallback if regex fails
              newGeneralErrors.push(errorObj.message);
              return;
            }

            // Add other errors
            if (errorObj.message) {
              newGeneralErrors.push(errorObj.message);
            }
          }
        });
      }

      // If no specific issues found but canProceed is false, show generic error
      if (newIssues.length === 0 && newGeneralErrors.length === 0) {
        newGeneralErrors.push("Unable to proceed with checkout. Please try again.");
      }

      console.log("📋 Final Validation Result:", {
        issuesCount: newIssues.length,
        issues: newIssues,
        generalErrorsCount: newGeneralErrors.length,
        generalErrors: newGeneralErrors,
      });

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
    isProcessing,
    issues,
    generalErrors,
    showModal,
    setShowModal,
    handleRemoveItem,
    handleUpdateQuantity,
    handleUpdatePrice,
  };
}
