"use client";

import Skeleton from "@/shared/components/ui/skeleton";

export default function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full h-44 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
