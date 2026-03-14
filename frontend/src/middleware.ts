import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Dashboard auth + role routing.
 * When API is ready: verify JWT from cookie, decode role, redirect wrong-role to correct dashboard.
 * For now: allow all dashboard access (mock mode).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Optional: check for auth cookie when backend auth is ready
  // const token = request.cookies.get('btb_token')?.value;
  // if (!token) return NextResponse.redirect(new URL('/login', request.url));

  // Optional: decode JWT and redirect wrong role to correct dashboard
  // e.g. if role is USER and path is /dashboard/admin -> redirect to /dashboard/user
  // For now we allow all routes so user can preview each dashboard.

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
