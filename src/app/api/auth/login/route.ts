import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const VALID_USER = 'alviglobal.com';
    const VALID_PASS = 'AlvyGlobal@#123';

    // Normalize username/email
    const inputUser = (username || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    if (inputUser === VALID_USER.toLowerCase() && inputPass === VALID_PASS) {
      const response = NextResponse.json({ success: true, message: 'Authentication successful' });
      
      // Set secure HTTP-only cookie valid for 7 days
      response.cookies.set('vault_session', 'authenticated_alviglobal_session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    );
  }
}
