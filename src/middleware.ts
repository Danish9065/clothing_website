import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({
        request: { headers: request.headers },
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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } =
        await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        // Not logged in → redirect to login
        if (!user) {
            return NextResponse.redirect(
                new URL('/login?redirect=/admin',
                    request.url)
            )
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const isAdmin =
            profile?.role === 'admin' ||
            user.app_metadata?.role === 'admin'

        if (!isAdmin) {
            // Not admin → redirect to home
            return NextResponse.redirect(
                new URL('/?error=unauthorized', request.url)
            )
        }
    }

    // Protect /checkout → must be logged in
    if (pathname === '/checkout' && !user) {
        return NextResponse.redirect(
            new URL('/login?redirect=/checkout', request.url)
        )
    }

    return response
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/checkout',
    ],
}
