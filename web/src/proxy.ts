import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hakori_admin";

/**
 * UX-level guard only — avoids a round-trip to a page that will just bounce
 * back. The backend still enforces real authorization on every /api/admin
 * call (the cookie here could be present but expired/invalid).
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!request.cookies.has(COOKIE_NAME)) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
