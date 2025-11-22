/**
 * Express Checkout Hook
 * Manages single-product express checkout (Buy Now)
 */

"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface ExpressCheckoutItem {
  productId: string;
  productName: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  image?: string;
  sku?: string;
}

interface ExpressCheckoutContextValue {
  expressItem: ExpressCheckoutItem | null;
  setExpressItem: (item: ExpressCheckoutItem | null) => void;
  clearExpressItem: () => void;
  isExpressMode: boolean;
}

const ExpressCheckoutContext = createContext<ExpressCheckoutContextValue | undefined>(undefined);

export function ExpressCheckoutProvider({ children }: { children: ReactNode }) {
  const [expressItem, setExpressItemState] = useState<ExpressCheckoutItem | null>(null);

  const setExpressItem = useCallback((item: ExpressCheckoutItem | null) => {
    setExpressItemState(item);

    // Also store in sessionStorage for persistence across page reloads
    if (item) {
      sessionStorage.setItem("expressCheckoutItem", JSON.stringify(item));
    } else {
      sessionStorage.removeItem("expressCheckoutItem");
    }
  }, []);

  const clearExpressItem = useCallback(() => {
    setExpressItemState(null);
    sessionStorage.removeItem("expressCheckoutItem");
  }, []);

  // Load from sessionStorage on mount
  useState(() => {
    const stored = sessionStorage.getItem("expressCheckoutItem");
    if (stored) {
      try {
        setExpressItemState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse express checkout item:", e);
        sessionStorage.removeItem("expressCheckoutItem");
      }
    }
  });

  const value: ExpressCheckoutContextValue = {
    expressItem,
    setExpressItem,
    clearExpressItem,
    isExpressMode: expressItem !== null,
  };

  return (
    <ExpressCheckoutContext.Provider value={value}>{children}</ExpressCheckoutContext.Provider>
  );
}

export function useExpressCheckout() {
  const context = useContext(ExpressCheckoutContext);

  if (context === undefined) {
    throw new Error("useExpressCheckout must be used within ExpressCheckoutProvider");
  }

  return context;
}
