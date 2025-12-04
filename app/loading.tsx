export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/30">
      <div className="text-center">
        <div className="relative mx-auto w-36 h-36">
          {/* pulsing ring slightly larger than the logo to create spacing */}
          <div className="absolute -inset-3 rounded-full border-4 border-primary/20 animate-pulse pointer-events-none" />

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img src="/logo/icon.svg" alt="Allora" className="w-full h-full object-contain" />
          </div>
        </div>

        <p className="mt-6 text-lg font-semibold text-primary">Loading your experience…</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Preparing your cart and checkout details
        </p>
      </div>
    </div>
  );
}
