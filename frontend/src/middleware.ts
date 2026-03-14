import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Dashboard auth: require btb_token cookie for /dashboard/* and redirect to /login if missing.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('btb_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
