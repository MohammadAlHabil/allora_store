"use client";

import { useState, useEffect } from "react";
import type { Result } from "../core/types";

export type UseFetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * React Hook for fetching data with Result<T> handling
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { data, isLoading, error, refetch } = useFetch<User>(
 *     '/api/user',
 *     { method: 'GET' }
 *   );
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return <div>Hello {data.name}</div>;
 * }
 * ```
 */
export function useFetch<T>(
  url: string,
  options?: RequestInit,
  autoFetch = true
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const result: Result<T> = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, isLoading, error, refetch: fetchData };
}
