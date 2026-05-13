import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Define routes that need auth
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/notification') || pathname.startsWith('/account')
  const authRoutes = ['/dang-nhap', '/dang-ky', '/quen-mat-khau']
  const isAuthRoute = authRoutes.includes(pathname)

  // 2. Only fetch user if we are on a route that needs it (Gating or Auth redirect)
  if (isAdminRoute || isProtectedRoute || isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Admin protection
    if (isAdminRoute) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dang-nhap'
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
        return response
      }

      const { data: privateData } = await supabase
        .from('user_private_data')
        .select('role')
        .eq('id', user.id)
        .single()

      if (privateData?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
        return response
      }
    }

    // Protected user routes
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dang-nhap'
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
      return response
    }

    // Auth routes (redirect if already logged in)
    if (isAuthRoute && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
      return response
    }
  }

  return supabaseResponse
}

