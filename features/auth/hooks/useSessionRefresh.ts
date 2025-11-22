"use client";

import { useSession } from "next-auth/react";

/**
 * Custom hook to force session refresh after authentication
 * This ensures the Header component shows the correct auth state immediately
 */
export function useSessionRefresh() {
  const { data: session, status, update } = useSession();

  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  };

  return {
    session,
    status,
    refreshSession,
  };
}
