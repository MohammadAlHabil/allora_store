import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Spinner size="lg" />
    </div>
  );
}

export function ButtonLoader() {
  return <Spinner size="sm" className="mr-2" />;
}
