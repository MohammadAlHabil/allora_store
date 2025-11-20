"use client";

import { useState } from "react";
import type { CheckoutStep, CheckoutFormData } from "../types";

/**
 * Hook to manage checkout flow state
 * - Current step
 * - Form data across steps
 * - Navigation between steps
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

  const steps: CheckoutStep[] = ["address", "shipping", "payment", "review", "confirmation"];

  const updateFormData = (data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const resetCheckout = () => {
    setCurrentStep("address");
    setFormData({ useSameAddress: true });
  };

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    previousStep,
    goToStep,
    resetCheckout,
    canGoBack: currentStep !== "address",
    isLastStep: currentStep === "review",
  };
}
