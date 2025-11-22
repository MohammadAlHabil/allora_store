"use client";

import { useState, useEffect, useCallback } from "react";
import type { CheckoutStep, CheckoutFormData } from "../types";

const STORAGE_KEY = "checkout_state";
const STORAGE_EXPIRY = 30 * 60 * 1000; // 30 minutes

interface StoredCheckoutState {
  currentStep: CheckoutStep;
  formData: Partial<CheckoutFormData>;
  timestamp: number;
}

/**
 * Hook to manage checkout flow state with persistent storage
 * - Current step
 * - Form data across steps
 * - Navigation between steps
 * - Automatic state persistence in sessionStorage
 * - Auto-cleanup on expiry
 *
 * @example
 * const {
 *   currentStep,
 *   formData,
 *   updateFormData,
 *   nextStep,
 *   previousStep,
 *   goToStep,
 * } = useCheckoutFlow();
 */
export function useCheckoutFlow() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({
    useSameAddress: true,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  const steps: CheckoutStep[] = ["address", "shipping", "payment", "confirmation"];

  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: StoredCheckoutState = JSON.parse(stored);
        const now = Date.now();

        // Check if state is still valid (not expired)
        if (now - state.timestamp < STORAGE_EXPIRY) {
          setCurrentStep(state.currentStep);
          setFormData(state.formData);
          console.log("✅ Checkout state restored from session");
        } else {
          // Clear expired state
          sessionStorage.removeItem(STORAGE_KEY);
          console.log("🗑️ Expired checkout state cleared");
        }
      }
    } catch (error) {
      console.error("Error loading checkout state:", error);
      sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    try {
      const state: StoredCheckoutState = {
        currentStep,
        formData,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving checkout state:", error);
    }
  }, [currentStep, formData, isHydrated]);

  const updateFormData = useCallback((data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep, steps]);

  const previousStep = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep, steps]);

  const goToStep = useCallback((step: CheckoutStep) => {
    setCurrentStep(step);
  }, []);

  const resetCheckout = useCallback(() => {
    setCurrentStep("address");
    setFormData({ useSameAddress: true });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      console.log("🔄 Checkout state reset");
    }
  }, []);

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    previousStep,
    goToStep,
    resetCheckout,
    canGoBack: currentStep !== "address",
    isLastStep: currentStep === "payment",
    isHydrated, // Expose hydration state to prevent flash of wrong content
  };
}
