import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public routes — accessible without authentication.
 * Everything else requires the `has_session` cookie.
 */
const PUBLIC_ROUTES = ["/login", "/register", "/forget-password", "/reset-password"];

/** Routes where logged-in users should be bounced away from (back to dashboard). */
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("has_session")?.value === "1";

  // Logged-in user hitting login/register → redirect to dashboard
  if (hasSession && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public routes — always allow
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Protected route without session cookie → redirect to login with ?redirect=
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|public).*)",
  ],
};
