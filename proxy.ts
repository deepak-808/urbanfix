// Next.js Edge Middleware — runs on every request matched by `config.matcher`.
// Guards protected routes (dashboard, setup, admin) against unauthenticated access
// and prevents authenticated users from revisiting the auth pages.

import { NextRequest, NextResponse } from "next/server"

// Pages that logged-in users should not be able to visit (redirect → home)
const AUTH_ROUTES = ["/login", "/register"]

// Pages that require an active session (redirect → login if no token)
const PROTECTED_ROUTES = ["/provider/dashboard", "/provider/setup", "/admin"]

export default function proxy(req: NextRequest) {
  // The JWT is mirrored into this cookie by AuthSync / the auth store
  const token = req.cookies.get("urbanfix-token")?.value
  const { pathname } = req.nextUrl

  // Logged-in user tries to visit /login or /register → send to home
  if (token && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Unauthenticated user tries to visit a protected route → redirect to login
  // and preserve the original path so the user can be sent back after signing in
  if (!token && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Only run middleware on the routes we care about — skip static assets and API routes
export const config = {
  matcher: ["/login", "/register", "/provider/:path*", "/admin"],
}
