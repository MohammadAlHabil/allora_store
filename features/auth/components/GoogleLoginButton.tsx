"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "../hooks";

export function GoogleLoginButton({ className }: { className?: string }) {
  const { googleSignIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    try {
      setLoading(true);
      // googleSignIn triggers next-auth signIn flow
      await Promise.resolve(googleSignIn());
      // Note: signIn typically redirects the browser; code after may not run.
    } catch (err: unknown) {
      console.error("Google sign in failed", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        onClick={onClick}
        variant="outline"
        className={className}
        aria-label="Sign in with Google"
        disabled={loading}
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-4 w-4"
            aria-hidden
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.9 0 7.3 1.4 9.9 3.8l7.4-7.4C36.6 2.4 30.6 0 24 0 14.7 0 6.9 5.4 3 13.2l8.6 6.7C13.9 15 18.6 9.5 24 9.5z"
            />
            <path
              fill="#34A853"
              d="M46.5 24.5c0-1.6-.1-3-.4-4.5H24v8.5h12.7c-.5 2.7-2 5-4.3 6.6l6.7 5.1c3.9-3.5 6.9-8.9 6.9-15.7z"
            />
            <path
              fill="#4A90E2"
              d="M11.6 28.4A14.7 14.7 0 0 1 11 24.5c0-1.6.3-3.1.7-4.5L3 13.2C1.1 16.8 0 20.6 0 24.5c0 3.9 1.1 7.7 3 11.3l8.6-6.7z"
            />
            <path
              fill="#FBBC05"
              d="M24 48c6.6 0 12.6-2.4 17.3-6.5l-8.2-6.2c-2.6 1.8-6 2.9-9.1 2.9-5.4 0-10.1-5.5-11.4-12.2L3 34.8C6.9 42.6 14.7 48 24 48z"
            />
          </svg>
          <span>{loading ? "Continuing with Google..." : "Continue with Google"}</span>
        </span>
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default GoogleLoginButton;
