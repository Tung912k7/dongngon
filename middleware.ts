import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// CSP is defined statically in next.config.ts headers() for all routes.
// Middleware handles only Supabase auth session refresh.
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public static assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/profile',
    '/settings',
    '/admin/:path*',
    '/api/:path*'
  ],
}
