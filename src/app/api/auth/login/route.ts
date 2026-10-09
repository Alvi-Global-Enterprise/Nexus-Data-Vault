import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, token } = await req.json();

    const inputUser = (username || email || '').trim();
    const inputPass = (password || '').trim();

    // 1. If client already authenticated with backend and passed token
    if (token) {
      const response = NextResponse.json({ success: true, message: 'Session established', token });
      response.cookies.set('vault_session', 'authenticated_alviglobal_session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // 2. Check local fallback credentials
    const VALID_USER = 'alviglobal.com';
    const VALID_PASS = 'AlvyGlobal@#123';

    if (inputUser.toLowerCase() === VALID_USER.toLowerCase() && inputPass === VALID_PASS) {
      const response = NextResponse.json({ success: true, message: 'Authentication successful' });
      response.cookies.set('vault_session', 'authenticated_alviglobal_session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // 3. Try upstream API authentication
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.148.244.66:8003/api/v1/';
      const cleanUrl = baseUrl.endsWith('/') ? `${baseUrl}auth/login` : `${baseUrl}/auth/login`;

      const apiRes = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: inputUser, password: inputPass }),
      });

      const apiData = await apiRes.json().catch(() => null);

      if (apiRes.ok && apiData) {
        const response = NextResponse.json({
          success: true,
          message: 'Authentication successful',
          data: apiData,
          token: apiData.token || apiData.access_token,
        });

        response.cookies.set('vault_session', 'authenticated_alviglobal_session_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      }

      return NextResponse.json(
        {
          success: false,
          message: apiData?.message || 'Invalid email or password',
          errors: apiData?.errors,
        },
        { status: apiRes.status || 401 }
      );
    } catch (upstreamErr: any) {
      return NextResponse.json(
        { success: false, message: 'Unable to connect to authentication server' },
        { status: 502 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    );
  }
}

