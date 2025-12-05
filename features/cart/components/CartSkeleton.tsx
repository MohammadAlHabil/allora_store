"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import Skeleton from "@/shared/components/ui/skeleton";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="w-40">
                <Skeleton className="h-10" rounded={true} />
              </div>

              <div className="w-16">
                <Skeleton className="h-8" rounded={true} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-1/3">
                <Skeleton className="h-10" rounded={true} />
              </div>
              <div className="w-1/2 mt-2">
                <Skeleton className="h-5" rounded={true} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <Card className="border bg-card/80 backdrop-blur-sm  duration-300 pt-0">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">
                      <Skeleton className="h-6 w-48" />
                    </CardTitle>
                    <div className="w-20">
                      <Skeleton className="h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="px-4 md:px-6 py-6">
                        <div className="flex items-center gap-4">
                          <Skeleton
                            width={96}
                            height={96}
                            className="flex-shrink-0"
                            rounded={true}
                          />
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/3" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-8 w-12" />
                            </div>
                          </div>
                          <div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              <Card className="shadow-none border bg-gradient-to-br from-primary/5 via-primary/5 to-transparent  duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Skeleton className="h-5 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-30 w-full" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border bg-card/80 backdrop-blur-sm  duration-300 pt-0">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">
                      <Skeleton className="h-6 w-48" />
                    </CardTitle>
                    <div className="w-20">
                      <Skeleton className="h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="border-t pt-4">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
