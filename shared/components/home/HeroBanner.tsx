"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";

export default function HeroBanner() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <section
      className="relative w-full h-screen flex items-center justify-start overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/images/banner.png')",
      }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-left w-full">
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-secondary">
              Welcome to Allora Store
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-secondary">
              Discover Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                Style
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-secondary max-w-2xl leading-relaxed">
            Curated fashion, beauty, and accessories designed for modern women. Elevate your
            wardrobe with our exclusive collection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="px-8 py-6 md:text-lg" onClick={() => router.push("/shop")}>
              Shop Now
            </Button>
            {!session ? (
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-6 md:text-lg"
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-6 md:text-lg"
                onClick={() => router.push("/orders")}
              >
                My Orders
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white" strokeWidth={2} />
      </div>
    </section>
  );
}
