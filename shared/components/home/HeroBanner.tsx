"use client";

import { Button } from "@/shared/components/ui/button";

export default function HeroBanner() {
  return (
    <section
      className="relative w-full h-screen flex items-center justify-start overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/banner.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-left w-full">
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-secondary">
              Welcome to Allora Store
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-secondary ">
              Discover Your{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-accent to-primary">
                Style
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-secondary max-w-2xl leading-relaxed">
            Curated fashion, beauty, and accessories designed for modern women. Elevate your
            wardrobe with our exclusive collection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="px-8 py-6 md:text-lg "
              // className="px-8 py-6 text-base md:text-lg font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300"
              onClick={() => (window.location.href = "/shop")}
            >
              Shop Now
            </Button>
            <Button
              size="lg"
              variant="secondary"
              // className="px-8 py-6 text-base md:text-lg font-semibold rounded-lg text-secondary border-2 border-secondary hover:bg-secondary/10 transition-all duration-300"
              className="px-8 py-6 md:text-lg "
              onClick={() => (window.location.href = "/collections")}
            >
              View Collections
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
}
