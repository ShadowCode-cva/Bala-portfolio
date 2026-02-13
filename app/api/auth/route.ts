import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body

        console.log('[AUTH API] Received login attempt for username:', username)
        
        // Simple env var based auth
        const adminUser = process.env.ADMIN_USER || 'admin'
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

        console.log('[AUTH API] Expected user:', adminUser)
        console.log('[AUTH API] Credentials match:', username === adminUser && password === adminPass)

        if (username === adminUser && password === adminPass) {
            const cookieStore = await cookies()
            // Set a simple session cookie
            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            })

            console.log('[AUTH API] ✅ Authentication successful, cookie set')
            return NextResponse.json({ success: true })
        }

        console.warn('[AUTH API] ❌ Invalid credentials')
        return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
        )
    } catch (error) {
        console.error('[AUTH API] ❌ Error during authentication:', error)
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    return NextResponse.json({ success: true })
}
