import { NextResponse } from 'next/server'
import { getPortfolioData, savePortfolioData } from '@/lib/storage'
import { cookies } from 'next/headers'

export async function GET() {
    const data = await getPortfolioData()
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    // Check auth
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    if (!session || session.value !== 'authenticated') {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()
        const { section, data } = body

        if (!section || !data) {
            return NextResponse.json(
                { success: false, message: 'Missing section or data' },
                { status: 400 }
            )
        }

        // 1. Get current data
        const currentData = await getPortfolioData()

        // 2. Update the specific section
        // We use type assertion since we know the structure matches
        // @ts-ignore
        currentData[section] = data

        // 3. Save the full object back
        const success = await savePortfolioData(currentData)

        if (success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                { success: false, message: 'Failed to save data' },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { success: false, message: 'Invalid data format' },
            { status: 400 }
        )
    }
}
