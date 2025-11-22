"use client";

import { AlertCircle, Package } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useOrders } from "../hooks";
import type { OrderFilterParams } from "../types";
import { OrderCard } from "./OrderCard";
import { OrderFilters } from "./OrderFilters";
import { OrdersListSkeleton } from "./OrdersListSkeleton";

export function OrdersList() {
  const [filters, setFilters] = useState<OrderFilterParams>({});
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useOrders({
    ...filters,
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (isLoading) {
    return <OrdersListSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load orders. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  const hasOrders = data && data.orders.length > 0;
  const hasMore = data && data.pagination.page < data.pagination.totalPages;
  const hasActiveFilters = Boolean(
    filters.status || filters.paymentStatus || filters.shippingStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          {data?.pagination && (
            <p className="text-muted-foreground mt-1">
              {data.pagination.total} {data.pagination.total === 1 ? "order" : "orders"} found
            </p>
          )}
        </div>
        <OrderFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={data.stats.total} />
          <StatCard label="Pending" value={data.stats.pending} variant="secondary" />
          <StatCard label="Paid" value={data.stats.paid} variant="success" />
          <StatCard label="Fulfilled" value={data.stats.fulfilled} variant="success" />
          <StatCard label="Cancelled" value={data.stats.cancelled} variant="destructive" />
        </div>
      )}

      {/* Orders Grid */}
      {hasOrders ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button onClick={() => setPage((p) => p + 1)} variant="outline" size="lg">
                Load More Orders
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={() => setFilters({})} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "secondary" | "success" | "destructive";
}) {
  const variantStyles = {
    default: "bg-card",
    secondary: "bg-blue-50 dark:bg-blue-950",
    success: "bg-green-50 dark:bg-green-950",
    destructive: "bg-red-50 dark:bg-red-950",
  };

  return (
    <div className={`p-4 rounded-lg border ${variantStyles[variant]}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  if (hasActiveFilters) {
    // No results for current filters
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No orders found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          No orders match your current filters. Try adjusting your filters or clear them to see all
          orders.
        </p>
        <Button onClick={onClearFilters} variant="outline">
          Clear Filters
        </Button>
      </div>
    );
  }

  // No orders at all
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        When you place your first order, it will appear here. Start shopping to see your order
        history!
      </p>
      <Button asChild>
        <a href="/products">Browse Products</a>
      </Button>
    </div>
  );
}
