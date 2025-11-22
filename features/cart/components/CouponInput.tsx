"use client";

import { Loader2, Ticket, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { isValidCouponCode, sanitizeCouponCode } from "@/shared/lib/utils/validation";

export interface CouponInputProps {
  className?: string;
  onApply?: (code: string) => Promise<void> | void;
  appliedCode?: string | null;
  onRemove?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Coupon Input Component
 * Allows users to apply discount coupons to their cart
 *
 * @example
 * ```tsx
 * <CouponInput
 *   onApply={async (code) => {
 *     await applyCoupon(code);
 *   }}
 *   appliedCode={appliedCoupon}
 *   onRemove={() => removeCoupon()}
 * />
 * ```
 */
export function CouponInput({
  className,
  onApply,
  appliedCode,
  onRemove,
  disabled = false,
  placeholder = "Enter coupon code",
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!onApply) {
      toast.error("Coupon functionality not available");
      return;
    }

    // Validate and sanitize coupon code
    const sanitizedCode = sanitizeCouponCode(code.trim());
    if (!isValidCouponCode(sanitizedCode)) {
      toast.error("Invalid coupon code format");
      return;
    }

    setIsApplying(true);
    try {
      await onApply(sanitizedCode);
      setCode("");
    } catch (error: unknown) {
      let errorMessage = "Failed to apply coupon";
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        const msg = (error as { message?: unknown }).message;
        if (typeof msg === "string") {
          errorMessage = msg;
        }
      }
      toast.error(errorMessage);
      // Don't clear code on error so user can fix it
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      toast.success("Coupon removed");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !appliedCode && !isApplying) {
      handleApply();
    }
  };

  if (appliedCode) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium">Applied Coupon</p>
                <p className="text-xs text-muted-foreground">{appliedCode}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleRemove}
              disabled={disabled || isApplying}
              className="h-8 w-8"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="coupon-code" className="text-sm font-medium">
              Have a coupon?
            </label>
          </div>
          <div className="flex gap-2">
            <Input
              id="coupon-code"
              type="text"
              placeholder={placeholder}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              disabled={disabled || isApplying}
              className="flex-1 uppercase"
              aria-label="Coupon code"
            />
            <Button
              type="button"
              onClick={handleApply}
              disabled={disabled || isApplying || !code.trim()}
              variant="outline"
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Apply
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
