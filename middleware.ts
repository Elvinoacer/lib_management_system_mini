import NextAuth from 'next-auth'
import { authConfig } from './lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req: any) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isProtectedRoute = ['/my-library', '/orders', '/profile', '/settings', '/checkout'].some(
    p => nextUrl.pathname.startsWith(p)
  )

  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return Response.redirect(new URL('/login', nextUrl))
  }

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ['/admin/:path*', '/my-library/:path*', '/orders/:path*', '/profile/:path*', '/settings/:path*', '/checkout/:path*']
}
