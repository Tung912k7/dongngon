import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Generate a cryptographically secure nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  const cspHeader = [
    "default-src 'self'",
    isDev
      ? `script-src 'self' 'unsafe-eval' 'unsafe-inline' 'nonce-${nonce}'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://lqlobokdwcebvoitwxkt.supabase.co",
    [
      "connect-src 'self'",
      "https://lqlobokdwcebvoitwxkt.supabase.co",
      "wss://lqlobokdwcebvoitwxkt.supabase.co",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://app.posthog.com",
      "https://eu.posthog.com",
      "https://eu.i.posthog.com",
    ].join(' '),
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')

  // Forward nonce to Server Components via REQUEST headers
  // (next/headers reads request headers, not response headers)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // Run Supabase session update with ORIGINAL request (NextRequest type preserved)
  const supabaseResponse = await updateSession(request)

  // Build final response forwarding nonce via request headers
  // This makes it readable in layout.tsx via `headers().get('x-nonce')`
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Copy cookies from Supabase response to our response (auth state)
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })

  // Apply CSP to response
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/profile',
    '/settings',
    '/admin/:path*',
    '/api/:path*'
  ],
}
