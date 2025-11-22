import Skeleton from "@/shared/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="space-y-3 text-center">
      <Skeleton className="mx-auto h-36 w-36 rounded-full sm:h-44 sm:w-44" />
      <Skeleton className="mx-auto h-4 w-20" />
    </div>
  );
}
