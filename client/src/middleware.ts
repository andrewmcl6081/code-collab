import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  const session = await auth0.getSession(request);

  const protectedRoutes = ["/dashboard", "/editor"];

  const isProtectedRoute = protectedRoutes.some((route) => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return authResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*"],
};