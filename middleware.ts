import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes - no auth required
  const publicPaths = ['/shop', '/api/shop']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (isPublic) {
    return NextResponse.next({ request })
  }

  // Portal routes - use shop_customer session cookie (JWT stored in cookie)
  if (pathname.startsWith('/portal') && !pathname.startsWith('/portal/login')) {
    const token = request.cookies.get('portal_token')?.value
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  // Admin routes - use admin session cookie
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  // Existing IR platform auth (Supabase)
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !pathname.startsWith('/auth') && !pathname.startsWith('/api') && !pathname.startsWith('/admin') && !pathname.startsWith('/portal')) {
    const url = request.nextUrl.clone()
    url.pathname = '/shop'
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
