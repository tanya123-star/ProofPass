import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "questlog_session";

interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "STUDENT" | "LITS" | "ADMIN";
  expiresAt: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, internal Next.js routes, API routes, and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Parse session cookie if available
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session: SessionPayload | null = null;

  if (sessionCookie) {
    try {
      const decoded = decodeURIComponent(sessionCookie);
      const parsed = JSON.parse(decoded);
      if (
        parsed &&
        typeof parsed.expiresAt === "number" &&
        parsed.expiresAt > Date.now() &&
        parsed.role
      ) {
        session = parsed;
      }
    } catch {
      // Malformed cookie
    }
  }

  // If user visits /auth/login while a valid session cookie exists, redirect to their role home
  if (pathname === "/auth/login") {
    // Only redirect away from login if we have a valid confirmed session
    if (session) {
      const roleHome =
        session.role === "ADMIN"
          ? "/admin"
          : session.role === "LITS"
          ? "/lits"
          : "/student";
      return NextResponse.redirect(new URL(roleHome, request.url));
    }
    return NextResponse.next();
  }

  // Role-based protection: only intervene if a session is present and there's a role mismatch.
  // Note: We do NOT bounce to /auth/login here if !session, because inside cross-origin
  // preview iframes third-party cookies may be delayed or partitioned; client-side
  // AppShell handles authentication seamlessly with localStorage fallback.
  if (session) {
    // Protect Admin routes
    if (pathname.startsWith("/admin")) {
      if (session.role !== "ADMIN") {
        const target =
          session.role === "LITS"
            ? `/lits?notice=role_restricted&attempted=${encodeURIComponent(pathname)}`
            : `/student?notice=role_restricted&attempted=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(new URL(target, request.url));
      }
    }

    // Protect LITS routes
    if (pathname.startsWith("/lits")) {
      if (session.role !== "LITS" && session.role !== "ADMIN") {
        const target = `/student?notice=role_restricted&attempted=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(new URL(target, request.url));
      }
    }

    // Protect Student routes
    if (pathname.startsWith("/student")) {
      if (session.role === "LITS") {
        const target = `/lits?notice=role_restricted&attempted=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/lits/:path*",
    "/student/:path*",
    "/auth/login",
  ],
};
