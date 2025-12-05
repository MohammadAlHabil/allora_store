"use client";

import Skeleton from "@/shared/components/ui/skeleton";

export default function WishlistSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-28 mb-5" />
              <Skeleton className="h-10 w-56 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <article
              key={i}
              className="group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300"
            >
              <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>

              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <Skeleton className="h-10 w-10 rounded-full!" />
                </div>

                <div className="ml-3">
                  <Skeleton className="h-10 w-10 rounded-full!" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
