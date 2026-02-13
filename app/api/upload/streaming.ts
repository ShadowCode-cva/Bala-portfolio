import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, mkdir, readFile, unlink } from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'

export const maxDuration = 120

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
    const chunk = formData.get('file') as File
    const chunkIndex = formData.get('chunkIndex') as string
    const totalChunks = formData.get('totalChunks') as string
    const fileName = formData.get('fileName') as string

    if (!chunk || !chunkIndex || !totalChunks || !fileName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const uploadId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadId)
    await mkdir(uploadDir, { recursive: true })

    const chunkPath = path.join(uploadDir, `chunk_${chunkIndex}`)
    const buffer = await chunk.arrayBuffer()
    await writeFile(chunkPath, Buffer.from(buffer))

    const currentChunk = parseInt(chunkIndex, 10)
    const total = parseInt(totalChunks, 10)

    if (currentChunk === total - 1) {
      const outputPath = path.join(uploadDir, fileName)
      const writeStream = createWriteStream(outputPath)

      for (let i = 0; i < total; i++) {
        const chunkData = await readFile(path.join(uploadDir, `chunk_${i}`))
        writeStream.write(chunkData)
        await unlink(path.join(uploadDir, `chunk_${i}`))
      }

      writeStream.end()

      const relativePath = `/uploads/${uploadId}/${fileName}`
      
      return NextResponse.json({
        success: true,
        url: relativePath,
        fileName
      })
    } else {
      return NextResponse.json({
        success: true,
        message: `Chunk ${currentChunk + 1}/${total} received`
      })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    )
  }
}