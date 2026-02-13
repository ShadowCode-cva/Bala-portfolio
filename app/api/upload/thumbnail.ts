import { NextResponse } from 'next/server'
import { cookies } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const maxDuration = 30

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File too large (Max 10MB)' },
        { status: 400 }
      )
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
    await mkdir(uploadDir, { recursive: true })

    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`
    const filePath = path.join(uploadDir, fileName)

    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    return NextResponse.json({
      success: true,
      path: `/uploads/thumbnails/${fileName}`
    })
  } catch (error) {
    console.error('Thumbnail upload error:', error)
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    )
  }
}