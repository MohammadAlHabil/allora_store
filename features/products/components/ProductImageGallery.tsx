"use client";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ProductImage } from "../types/product.types";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Product image gallery with thumbnails and zoom
 */
export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayImages =
    images.length > 0
      ? images
      : [{ id: "placeholder", url: "/images/placeholder.png", alt: "Product placeholder" }];
  const currentImage = displayImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  if (!currentImage) return null;

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-lg bg-muted"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Product image ${selectedIndex + 1} of ${displayImages.length}`}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt || `${productName} - Image ${selectedIndex + 1}`}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            isZoomed && "scale-150 cursor-zoom-out",
            !isZoomed && "cursor-zoom-in"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/50 text-white rounded-md px-3 py-1.5 text-sm flex items-center gap-2">
            <ZoomIn className="h-4 w-4" />
            Click to zoom
          </div>
        </div>

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/50 text-white rounded-md px-3 py-1.5 text-sm">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail images */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-transparent hover:border-primary/50"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
