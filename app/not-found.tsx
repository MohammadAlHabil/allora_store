"use client";

import { Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/50 to-red-50/50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-200/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-red-200/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 rounded-full bg-amber-200/15 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center space-y-8">
            {/* Animated 404 */}
            <div className="relative">
              <h1 className="text-[12rem] md:text-[16rem] font-black leading-none">
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent animate-gradient">
                  404
                </span>
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-r from-orange-300 to-red-300 opacity-15 blur-2xl animate-pulse" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4 px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-700">Oops! Page Not Found</h2>
              <p className="text-lg text-gray-500 max-w-md mx-auto">
                The page you&apos;re looking for seems to have wandered off into the digital void.
                Let&apos;s get you back on track!
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-300/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-400/40 hover:scale-105"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Back to Home
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="group border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                Go Back
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="group border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 hover:scale-105"
              >
                <Link href="/products">
                  <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Browse Products
                </Link>
              </Button>
            </div>

            {/* Decorative elements */}
            <div className="flex justify-center gap-2 pt-8">
              <div className="h-2 w-2 rounded-full bg-orange-300 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-red-300 animate-bounce delay-100" />
              <div className="h-2 w-2 rounded-full bg-amber-300 animate-bounce delay-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
