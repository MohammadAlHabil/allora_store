"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import Skeleton from "@/shared/components/ui/skeleton";

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Title and subtitle skeleton */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4">
            <Skeleton className="h-8 w-64" />
          </h1>
          <p className="text-sm text-muted-foreground">
            <Skeleton className="h-4 w-48" />
          </p>
        </div>

        {/* Stepper skeleton - three circular steps with connectors */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center w-full">
              <div className="flex items-center flex-col gap-3">
                <Skeleton width={42} height={42} className="rounded-full!" />
                <div className="hidden md:block">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <div className="flex-1 h-[2px] bg-border mx-4" />

              <div className="flex items-center flex-col gap-3">
                <Skeleton width={42} height={42} className="rounded-full!" />
                <div className="hidden md:block">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <div className="flex-1 h-[2px] bg-border mx-4" />

              <div className="flex items-center flex-col gap-3">
                <Skeleton width={42} height={42} className="rounded-full!" />
                <div className="hidden md:block">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Main column (forms) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border bg-card/80 backdrop-blur-sm">
              <CardHeader className="border-b pt-6 pb-4">
                <CardTitle>
                  <Skeleton className="h-6 w-48" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="gap-4 flex justify-between mb-4">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-10 w-40" />
                </div>
                <div className="gap-4 flex">
                  <Skeleton className="h-60 w-full" />
                  <Skeleton className="h-60 w-full" />
                  <Skeleton className="h-60 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (summary) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pt-6 pb-4 border-b">
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <div className="border-t pt-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
