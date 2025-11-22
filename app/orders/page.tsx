import { Metadata } from "next";
import { Suspense } from "react";
import { OrdersList } from "@/features/orders/components/OrdersList";
import { OrdersListSkeleton } from "@/features/orders/components/OrdersListSkeleton";

export const metadata: Metadata = {
  title: "My Orders | Allora Store",
  description: "View and manage your orders",
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense fallback={<OrdersListSkeleton />}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
