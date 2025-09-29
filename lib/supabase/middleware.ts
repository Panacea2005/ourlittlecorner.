import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = ['/auth', '/api', '/public']
  const isPublic = publicPaths.some((p) => req.nextUrl.pathname.startsWith(p))

  // Redirect unauthenticated users to /auth for all non-public routes
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // If authenticated and navigating to /auth, send home
  if (user && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|public|audio|api/).*)'
  ]
}