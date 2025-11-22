"use client";

import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFeaturedCategories } from "@/features/categories/hooks/useCategories";
import { Button } from "@/shared/components/ui/button";

export default function FeaturedCategories() {
  const { data: categories = [], isLoading, isError, error, refetch } = useFeaturedCategories();

  // Error state
  if (isError) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Featured Categories</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load categories</h3>
          <p className="text-muted-foreground mb-4">{error?.message || "Something went wrong"}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Featured Categories</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="group block overflow-hidden text-center w-full max-w-[220px]">
                <div className="overflow-hidden relative h-36 w-36 sm:h-44 sm:w-44 mx-auto mb-3 rounded-full shadow-md bg-gray-200 animate-pulse" />
                <div className="h-5 w-20 mx-auto bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          : categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group block overflow-hidden text-center w-full max-w-[220px]"
              >
                <div className="overflow-hidden relative h-36 w-36 sm:h-44 sm:w-44 mx-auto mb-3 rounded-full shadow-md">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 144px, 176px"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc2IiBoZWlnaHQ9IjE3NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmM2Y0ZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2U1ZTdlYjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxNzYiIGhlaWdodD0iMTc2IiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgo8L3N2Zz4="
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/banner.png";
                    }}
                  />
                </div>
                <div className="px-3">
                  <h3 className="font-medium">{cat.name}</h3>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
