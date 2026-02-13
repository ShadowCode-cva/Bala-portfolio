import { NextResponse } from 'next/server'

/**
 * Global 404 Handler for API routes
 * Ensures structured JSON errors instead of HTML pages for failed API calls.
 */
export async function GET() {
    return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
    )
}

export async function POST() {
    return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
    )
}
