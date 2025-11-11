import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import authConfig from "./auth.config";

const { auth: middleware } = NextAuth(authConfig);
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/admin-panel", "/profile/edit"];
const authRoutes = ["/signin", "/signup", "/reset-password", "/verify-email", "/forget-password"];

type NextRequestWithAuth = NextRequest & { auth?: Session | null };

export default middleware((req: NextRequestWithAuth) => {
  const isAuthenticated = !!req.auth;
  const { nextUrl } = req;
  const { pathname } = nextUrl;

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
