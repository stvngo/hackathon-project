import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public pages that don't require authentication
  const publicPages = ['/', '/about', '/contact', '/how-it-works', '/login', '/signup', '/verify-email', '/email-verified']
  
  // If user is not signed in and trying to access a protected page
  if (!user && !publicPages.includes(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in
  if (user) {
    // Check if user has verified their email
    const isEmailVerified = user.email_confirmed_at !== null
    
    if (!isEmailVerified) {
      // Unverified users can only access verify-email and public pages
      if (request.nextUrl.pathname !== '/verify-email' && !publicPages.includes(request.nextUrl.pathname)) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/verify-email'
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // Email verified users - check if they have completed onboarding
      let hasCompletedOnboarding = false
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        
        hasCompletedOnboarding = profile?.onboarding_completed === true
      } catch (error) {
        // If there's an error, assume onboarding is not complete
        hasCompletedOnboarding = false
      }

      if (!hasCompletedOnboarding) {
        // Verified users without onboarding can only access onboarding and public pages
        if (request.nextUrl.pathname !== '/onboarding' && !publicPages.includes(request.nextUrl.pathname)) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/onboarding'
          return NextResponse.redirect(redirectUrl)
        }
      } else {
        // Fully set up users - redirect away from auth pages to dashboard
        if (['/login', '/signup', '/verify-email', '/onboarding'].includes(request.nextUrl.pathname)) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/dashboard'
          return NextResponse.redirect(redirectUrl)
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 