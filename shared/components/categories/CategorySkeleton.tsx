import { Card } from "@/shared/components/ui/card";

export default function CategorySkeleton() {
  return (
    <Card className="min-h-[200px] p-6 overflow-hidden">
      <div className="animate-pulse flex flex-col h-full justify-between">
        {/* Top Section */}
        <div className="space-y-3">
          {/* Icon Skeleton */}
          <div className="w-14 h-14 rounded-xl bg-muted" />

          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-7 bg-muted rounded w-3/4" />
            <div className="h-7 bg-muted rounded w-1/2" />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-6">
          {/* Badge Skeleton */}
          <div className="h-8 bg-muted rounded-full w-24" />

          {/* Arrow Skeleton */}
          <div className="w-10 h-10 rounded-full bg-muted" />
        </div>
      </div>
    </Card>
  );
}
