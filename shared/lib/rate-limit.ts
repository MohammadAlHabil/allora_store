import { Duration, Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Global limiter "safe default"
export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
});

// Reusable factory for per-route limiters
export function createLimiter(limit: number, duration: Duration) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, duration),
    analytics: true,
  });
}

// Common patterns (best practices)
export const loginLimiter = createLimiter(5, "1 m");
export const signupLimiter = createLimiter(3, "10 m");
export const otpLimiter = createLimiter(1, "30 s");
export const resetPasswordLimiter = createLimiter(2, "5 m");

export async function checkRateLimit(limiter: Ratelimit, key: string): Promise<void> {
  const { success } = await limiter.limit(key);

  if (!success) {
    throw new Error("Too many requests, please wait before retrying.");
  }

  return;
}
