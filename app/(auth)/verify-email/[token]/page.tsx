"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { verifyEmailAction } from "@/features/auth/actions";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type VerificationState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState<string>("");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) return;

    const verify = async () => {
      hasVerified.current = true;

      try {
        const result = await verifyEmailAction(token);
        if (result.success) {
          setState("success");
          setMessage(result.message || "Email verified successfully! You can now sign in.");
        } else {
          setState("error");
          setMessage(result.error.message || "Email verification failed");
        }
      } catch (error: unknown) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border rounded-lg p-8 shadow-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {state === "loading" && (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
            {state === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            {state === "error" && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2">
            {state === "loading" && "Verifying Your Email"}
            {state === "success" && "Email Verified!"}
            {state === "error" && "Verification Failed"}
          </h1>

          {/* Message */}
          <div
            className={cn(
              "text-center mb-6 p-4 rounded-md",
              state === "loading" && "text-muted-foreground",
              state === "success" && "bg-green-50 text-green-800",
              state === "error" && "bg-red-50 text-red-800"
            )}
          >
            {state === "loading" && "Please wait while we verify your email address..."}
            {(state === "success" || state === "error") && message}
          </div>

          {/* Actions */}
          {state === "success" && (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/signin">Continue to Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/signup">Create New Account</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
