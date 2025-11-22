"use client";

import { AlertCircle, Grid3x3, Search } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/features/products/hooks/useCategories";
import CategoryCard from "@/shared/components/categories/CategoryCard";
import CategorySkeleton from "@/shared/components/categories/CategorySkeleton";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: categories, isLoading, isError, refetch } = useCategories();

  // Filter categories based on search query
  const filteredCategories =
    categories?.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Calculate total products
  const totalProducts =
    categories?.reduce((sum, category) => sum + category._count.products, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4">
            {/* Title & Description */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Shop by Category</h1>
              <p className="text-muted-foreground">
                Discover our complete collection organized by categories
              </p>
            </div>

            {/* Stats & Search Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Stats */}
              {!isLoading && !isError && categories && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {filteredCategories.length}{" "}
                    {filteredCategories.length === 1 ? "Category" : "Categories"}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {totalProducts} Total Products
                  </Badge>
                </div>
              )}

              {/* Search Bar */}
              <div className="w-full sm:w-auto sm:min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold">Failed to load categories</h3>
              <p className="text-muted-foreground">
                Something went wrong while fetching categories. Please try again.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Categories */}
        {!isLoading && !isError && categories && categories.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No categories available</h3>
              <p className="text-muted-foreground">
                Categories will appear here once they are added to the store.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Search Results */}
        {!isLoading &&
          !isError &&
          categories &&
          categories.length > 0 &&
          filteredCategories.length === 0 && (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No categories found</h3>
                <p className="text-muted-foreground">
                  No categories match &quot;{searchQuery}&quot;. Try a different search term.
                </p>
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Success State - Categories Grid */}
        {!isLoading && !isError && filteredCategories.length > 0 && (
          <div className="space-y-6">
            {/* Search Results Badge */}
            {searchQuery && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  {filteredCategories.length}{" "}
                  {filteredCategories.length === 1 ? "result" : "results"} for &quot;{searchQuery}
                  &quot;
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                  Clear
                </Button>
              </div>
            )}

            {/* Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              style={{
                animation: "fadeIn 0.5s ease-out",
              }}
            >
              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CategoryCard category={category} index={index} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
