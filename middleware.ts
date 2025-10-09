import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define route matchers for different access levels
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/payments/webhook(.*)'
])

const isAdminRoute = createRouteMatcher([
  '/admin/(.*)',
  '/api/admin/(.*)'
])

const isReaderRoute = createRouteMatcher([
  '/reader/(.*)',
])

const isClientRoute = createRouteMatcher([
  '/client/(.*)',
])

const isDashboardRoute = createRouteMatcher([
  '/dashboard/(.*)',
  '/(dashboard)/(.*)'  // Support both patterns during transition
])

export default clerkMiddleware(async (auth, req) => {
  // Admin routes require admin role
  if (isAdminRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }
    
    // For admin routes, we'll let the React components handle role checking
    // since the middleware has limited access to user metadata
    return
  }

  // Reader profile view pages (/reader/profile/:id) are accessible to all authenticated users
  // Reader management pages (/reader/profile/edit, /reader/dashboard, etc.) require reader role
  if (isReaderRoute(req)) {
    const pathname = req.nextUrl.pathname
    
    // Check if it's a reader profile view page (e.g., /reader/profile/user_123)
    // Allow access if it matches /reader/profile/{id} but not /reader/profile/edit
    const profileViewMatch = pathname.match(/^\/reader\/profile\/[^\/]+$/)
    const isEditPage = pathname === '/reader/profile/edit'
    
    if (profileViewMatch && !isEditPage) {
      // Profile view pages are accessible to all authenticated users
      await auth.protect()
      return
    }
    
    // All other reader routes require authentication (role checking done in components)
    await auth.protect()
    return
  }

  // Client routes require client role, except profile view pages
  if (isClientRoute(req)) {
    const pathname = req.nextUrl.pathname
    
    // Check if it's a client profile view page (e.g., /client/profile/user_123)
    // Allow access if it matches /client/profile/{id} but not /client/profile/edit
    const profileViewMatch = pathname.match(/^\/client\/profile\/[^\/]+$/)
    const isEditPage = pathname === '/client/profile/edit'
    
    if (profileViewMatch && !isEditPage) {
      // Profile view pages are accessible to all authenticated users
      await auth.protect()
      return
    }
    
    // All other client routes require authentication (role checking done in components)
    await auth.protect()
    return
  }

  // Dashboard routes require authentication
  if (isDashboardRoute(req)) {
    await auth.protect()
    return
  }

  // Protect all other routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
