import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = [
  'http://localhost:3000',
  // добавьте другие разрешенные домены здесь
]

export default function middleware(request: NextRequest) {
  console.log('Middleware processing request to:', request.nextUrl.pathname);
  
  // Check for Authorization header
  const authHeader = request.headers.get('authorization');
  let sessionToken = request.cookies.get('next-auth.session-token')?.value || '';
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('Found Bearer token in Authorization header:', token);
    sessionToken = token;
  }

  console.log('Middleware request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    cookies: request.cookies.getAll(),
    authHeader: authHeader,
    sessionToken: sessionToken
  });
  
  const origin = request.headers.get('origin') || ''
  const isAllowedOrigin = allowedOrigins.includes(origin) || !origin

  const response = NextResponse.next()
  
  // Ensure cookies are properly set for auth
  console.log('Middleware session token:', sessionToken);
  
  if (sessionToken) {
    console.log('Setting session cookie with token:', sessionToken);
    response.cookies.set({
      name: 'next-auth.session-token',
      value: sessionToken,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      httpOnly: true,
      domain: undefined
    });
  } else {
    console.log('No session token found in request');
  }
  
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
    )
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 })
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}