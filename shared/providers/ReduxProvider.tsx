"use client";

// Deprecated ReduxProvider. The app now uses React Query as the source of truth.
// This file remains so accidental imports don't crash the build; it warns at
// runtime and instructs developers to migrate usage.

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined") {
    console.warn(
      "Deprecated: ReduxProvider removed. The app uses React Query now — remove this provider import and migrate to QueryProvider."
    );
  }

  return <>{children}</>;
}
