import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that do not require authentication
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get('vault_session')?.value;
  const isAuthenticated = sessionCookie === 'authenticated_alviglobal_session_token';

  // If user is already authenticated and visits /login, redirect to dashboard /
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // If not authenticated
  if (!isAuthenticated) {
    // For API requests, return 401 Unauthorized
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access this resource.' },
        { status: 401 }
      );
    }
    // For web page requests, redirect to /login
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
