"use client";

import { AlertTriangle, XCircle, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

export interface CheckoutIssue {
  productId: string;
  variantId?: string | null;
  title: string;
  reason: string; // "Out of stock", "Price changed", etc.
  available?: number;
  requested?: number;
  image?: string;
  type?: "stock" | "price";
}

interface CheckoutAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: CheckoutIssue[];
  generalErrors?: string[];
  onRemoveItem?: (productId: string, variantId?: string | null) => void;
  onUpdateQuantity?: (
    productId: string,
    variantId: string | null | undefined,
    quantity: number
  ) => void;
  onUpdatePrice?: (productId: string, variantId?: string | null) => void;
  isProcessing?: boolean;
}

export function CheckoutAlertModal({
  open,
  onOpenChange,
  issues,
  generalErrors = [],
  onRemoveItem,
  onUpdateQuantity,
  onUpdatePrice,
  isProcessing = false,
}: CheckoutAlertModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-xl">Cannot Proceed to Checkout</DialogTitle>
          </div>
          <DialogDescription>
            Please review the following issues with items in your cart before proceeding.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-4 py-4">
            {generalErrors.length > 0 && (
              <div className="space-y-2">
                {generalErrors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  >
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {issues.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Item Issues
                </h4>
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors"
                  >
                    {/* Product Image */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {issue.image ? (
                        <img
                          src={issue.image}
                          alt={issue.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                          <AlertTriangle className="h-6 w-6 opacity-20" />
                        </div>
                      )}
                    </div>

                    {/* Issue Details */}
                    <div className="flex-1 space-y-2">
                      <div className="font-semibold text-sm">{issue.title}</div>
                      <div className="text-sm text-destructive font-medium flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {issue.reason}
                      </div>
                      {issue.available !== undefined && issue.requested !== undefined && (
                        <div className="text-xs text-muted-foreground mt-1 bg-muted/50 inline-block px-2 py-1 rounded-md">
                          Requested: <span className="font-medium">{issue.requested}</span>
                          <span className="mx-1.5 text-muted-foreground/40">|</span>
                          Available: <span className="font-medium">{issue.available}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-2">
                        {issue.type === "stock" && (
                          <>
                            {issue.available === 0 ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onRemoveItem?.(issue.productId, issue.variantId)}
                                disabled={isProcessing}
                                className="h-8 text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove Item
                              </Button>
                            ) : (
                              issue.available !== undefined && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    onUpdateQuantity?.(
                                      issue.productId,
                                      issue.variantId,
                                      issue.available!
                                    )
                                  }
                                  disabled={isProcessing}
                                  className="h-8 text-xs"
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Get {issue.available} Available
                                </Button>
                              )
                            )}
                          </>
                        )}
                        {issue.type === "price" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onUpdatePrice?.(issue.productId, issue.variantId)}
                            disabled={isProcessing}
                            className="h-8 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Update Price
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Back to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
