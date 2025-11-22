"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import { OrderStatus, PaymentStatus, ShippingStatus } from "../types";
import type { OrderFilterParams } from "../types";

type OrderFiltersProps = {
  filters: OrderFilterParams;
  onFiltersChange: (filters: OrderFilterParams) => void;
};

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = filters.status || filters.paymentStatus || filters.shippingStatus;

  const activeFiltersCount = [filters.status, filters.paymentStatus, filters.shippingStatus].filter(
    Boolean
  ).length;

  const handleClear = () => {
    onFiltersChange({});
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4 shrink-0" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Filter Orders</SheetTitle>
          <SheetDescription>Refine your orders by status, payment, and shipping</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Order Status Filter */}
            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm font-semibold">
                Order Status
              </Label>
              <Select
                value={Array.isArray(filters.status) ? "all" : filters.status || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value === "all" ? undefined : (value as OrderStatus),
                  })
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                  <SelectItem value="PARTIALLY_FULFILLED">Partially Fulfilled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Payment Status Filter */}
            <div className="space-y-3">
              <Label htmlFor="paymentStatus" className="text-sm font-semibold">
                Payment Status
              </Label>
              <Select
                value={
                  Array.isArray(filters.paymentStatus) ? "all" : filters.paymentStatus || "all"
                }
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    paymentStatus: value === "all" ? undefined : (value as PaymentStatus),
                  })
                }
              >
                <SelectTrigger id="paymentStatus" className="w-full">
                  <SelectValue placeholder="All payment statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Shipping Status Filter */}
            <div className="space-y-3">
              <Label htmlFor="shippingStatus" className="text-sm font-semibold">
                Shipping Status
              </Label>
              <Select
                value={
                  Array.isArray(filters.shippingStatus) ? "all" : filters.shippingStatus || "all"
                }
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    shippingStatus: value === "all" ? undefined : (value as ShippingStatus),
                  })
                }
              >
                <SelectTrigger id="shippingStatus" className="w-full">
                  <SelectValue placeholder="All shipping statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shipping Statuses</SelectItem>
                  <SelectItem value="NOT_REQUIRED">Not Required</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row! gap-3 border-t px-6 py-4">
          <Button onClick={() => setIsOpen(false)} className="flex-1">
            Apply Filters
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={!hasActiveFilters}
            className="flex-1 gap-2"
          >
            <X className="h-4 w-4 shrink-0" />
            Clear
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
