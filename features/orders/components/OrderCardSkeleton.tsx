import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import Skeleton from "@/shared/components/ui/skeleton";

export function OrderCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="shrink-0">
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-1 flex-col pb-0">
        {/* Status Grid Skeleton */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>

        {/* Items Count and Location Skeleton */}
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Button Skeleton */}
        <div className="mt-auto">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
