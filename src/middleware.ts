import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static files & public assets (always bypass auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Read session & auth token cookies
  const sessionCookie = req.cookies.get('vault_session')?.value;
  const tokenCookie = req.cookies.get('nexus_auth_token')?.value;

  const isAuthenticated = Boolean(
    sessionCookie === 'authenticated_alviglobal_session_token' ||
    (tokenCookie && tokenCookie !== 'local_authenticated_token' && tokenCookie.trim().length > 5)
  );

  // 3. Login page handling: if already authenticated, redirect to dashboard /
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // 4. Public auth API endpoints
  if (pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
    return NextResponse.next();
  }

  // 5. Protected routes enforcement
  if (!isAuthenticated) {
    // Return 401 JSON for any API endpoints
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Access denied. Please log in to access this resource.',
        },
        { status: 401 }
      );
    }

    // For dashboard and all other web pages, redirect straight to /login
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

