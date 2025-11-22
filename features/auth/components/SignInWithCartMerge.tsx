"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useMergeCart } from "@/features/cart/hooks";
import { SignInForm } from "./SignInForm";

/**
 * SignInForm wrapper that automatically merges cart after login
 * Handles both credentials and Google login
 */
export function SignInWithCartMerge() {
  const { data: session, status } = useSession();
  const { mutate: mergeCart } = useMergeCart();
  const hasMergedRef = useRef(false);

  // Merge cart when user logs in (only once per session)
  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasMergedRef.current) {
      // User just logged in, merge anonymous cart
      hasMergedRef.current = true;
      mergeCart();
    }

    // Reset merge flag if user logs out
    if (status === "unauthenticated") {
      hasMergedRef.current = false;
    }
  }, [status, session, mergeCart]);

  return <SignInForm />;
}
