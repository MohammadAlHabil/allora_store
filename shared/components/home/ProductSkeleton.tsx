"use client";

export default function ProductSkeleton() {
  return (
    <div className="space-y-3 animate-pulse bg-card rounded-2xl border overflow-hidden p-4">
      {/* Image skeleton */}
      <div className="relative h-56 w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg" />

      {/* Content skeleton */}
      <div className="space-y-2">
        {/* Title lines */}
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />

        {/* Price and rating */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-10 bg-gray-200 rounded-full w-10 ml-auto" />
    </div>
  );
}
