import { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetails } from "@/features/orders/components/OrderDetails";
import { OrderDetailsSkeleton } from "@/features/orders/components/OrderDetailsSkeleton";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Order #${id.slice(-8).toUpperCase()} | Allora Store`,
    description: "View your order details",
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense fallback={<OrderDetailsSkeleton />}>
        <OrderDetails orderId={id} />
      </Suspense>
    </div>
  );
}
