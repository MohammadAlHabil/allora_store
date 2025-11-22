"use client";

import { Search, SlidersHorizontal, X, Grid3x3, LayoutGrid, Package } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/features/products/hooks/useCategories";
import { useAllProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "@/shared/components/home/ProductCard";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import { Slider } from "@/shared/components/ui/slider";
import { useDebounce } from "@/shared/lib/hooks/useDebounce";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating";

export default function ProductsPageContent() {
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [gridView, setGridView] = useState<"3" | "4">("3");

  // Only debounce if search has 2+ characters, otherwise keep empty to prevent unnecessary queries
  const searchValue = searchInput.length >= 2 ? searchInput : "";
  const debouncedSearch = useDebounce(searchValue, 500);

  // Fetch categories
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Use React Query to fetch products with filters
  const { data, isLoading, isError } = useAllProducts(
    {
      search: debouncedSearch,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      category: selectedCategory,
      inStock: inStockOnly,
      sortBy: sortBy,
      limit: 100,
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  const products = data?.products || [];
  const total = data?.total || 0;

  const clearFilters = () => {
    setSearchInput("");
    setSortBy("featured");
    setPriceRange([0, 1000]);
    setSelectedCategory("");
    setInStockOnly(false);
  };

  const hasActiveFilters =
    debouncedSearch || priceRange[0] > 0 || priceRange[1] < 1000 || selectedCategory || inStockOnly;

  const renderFilterSection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-semibold">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 h-10"
          />
          {searchValue !== debouncedSearch && searchInput.length >= 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {searchInput.length >= 2 && searchValue !== debouncedSearch && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
            Searching...
          </p>
        )}
      </div>

      <div className="border-t pt-6">
        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Categories</Label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedCategory ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 transition-all hover:scale-105 hover:shadow-sm"
              onClick={() => setSelectedCategory("")}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 transition-all hover:scale-105 hover:shadow-sm"
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
                <span className="ml-1.5 text-xs opacity-70">({category._count.products})</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {/* Price Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Price Range</Label>
            <span className="text-xs text-muted-foreground">
              ${priceRange[0]} - ${priceRange[1]}
            </span>
          </div>
          <div className="px-2 py-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={1000}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                Min
              </Label>
              <Input
                id="minPrice"
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value <= priceRange[1]) {
                    setPriceRange([value, priceRange[1]]);
                  }
                }}
                className="h-9 mt-1"
                min={0}
                max={priceRange[1]}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                Max
              </Label>
              <Input
                id="maxPrice"
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= priceRange[0] && value <= 500) {
                    setPriceRange([priceRange[0], value]);
                  }
                }}
                className="h-9 mt-1"
                min={priceRange[0]}
                max={1000}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {/* Availability */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Availability</Label>
          <div
            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setInStockOnly(!inStockOnly)}
          >
            <Checkbox
              id="inStock"
              checked={inStockOnly}
              onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
            />
            <label
              htmlFor="inStock"
              className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2 flex-1"
            >
              <Package className="w-4 h-4 text-muted-foreground" />
              In Stock Only
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Shop All Products</h1>
              <p className="text-muted-foreground">
                Discover our complete collection of premium products
              </p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {total} {total === 1 ? "Product" : "Products"}
                </Badge>
                {hasActiveFilters && (
                  <Badge variant="outline" className="text-sm">
                    Filters Active
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Grid View Toggle */}
                <div className="hidden lg:flex items-center gap-2 border rounded-lg p-1">
                  <Button
                    variant={gridView === "3" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setGridView("3")}
                    className="h-8"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={gridView === "4" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setGridView("4")}
                    className="h-8"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    {renderFilterSection()}
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">{renderFilterSection()}</CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto flex items-center justify-center">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold">Error loading products</h3>
                  <p className="text-muted-foreground">
                    Something went wrong while fetching products. Please try again.
                  </p>
                </div>
              </Card>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear all filters
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                  gridView === "4" ? "lg:grid-cols-4" : "lg:grid-cols-3"
                }`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
