import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import authConfig from "./auth.config";
import { createLimiter } from "./shared/lib/rate-limit";

const { auth: middleware } = NextAuth(authConfig);
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/admin-panel", "/profile/edit"];
const authRoutes = ["/signin", "/signup", "/reset-password", "/verify-email", "/forget-password"];

type NextRequestWithAuth = NextRequest & { auth?: Session | null };

const ratelimit = createLimiter(10, "1 s");

export default middleware(async (req: NextRequestWithAuth) => {
  const isAuthenticated = !!req.auth;
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  if (req.nextUrl.pathname.startsWith("/api")) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse("Too many requests.", { status: 429 });
    }
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return Response.redirect(new URL("/", nextUrl));
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    return Response.redirect(new URL("/signin", nextUrl));
  }

  return NextResponse.next();
});
