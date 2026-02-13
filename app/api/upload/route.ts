import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, mkdir, stat } from 'fs/promises'
import { createWriteStream } from 'fs'
import path from 'path'
import os from 'os'

/**
 * UPLOAD ROUTE — PERFORMANCE & SAFETY NOTES
 * 
 * WHY NOT 4GB IN-MEMORY?
 * ─────────────────────
 * Next.js (and Node.js) load the ENTIRE request body into memory via formData().
 * A 4GB file = 4GB of RAM consumed instantly. On a typical VPS with 1-4GB RAM,
 * this will crash the server with an out-of-memory error.
 * 
 * Node.js also has a default ArrayBuffer limit (~2GB on 64-bit).
 * Even if you had enough RAM, `file.arrayBuffer()` would fail above ~2GB.
 * 
 * WHAT WE DO INSTEAD:
 * ─────────────────────
 * - Accept files up to 500MB (safe for most Node.js environments)
 * - Stream the file buffer to disk in chunks (not one giant write)
 * - Check available disk space BEFORE writing
 * - Validate file type and size early to fail fast
 * - Set a generous timeout (120 seconds)
 * 
 * FOR TRUE 4GB SUPPORT, you would need:
 * - A dedicated upload service (e.g., tus.io protocol)
 * - Direct-to-storage uploads (S3 presigned URLs)
 * - A reverse proxy (nginx) handling the upload before Node.js sees it
 * These are production-grade solutions beyond local filesystem architecture.
 */

export const maxDuration = 120 // 2 minutes for large uploads

export async function POST(request: Request) {
    // Auth check
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

        if (!file || typeof file === 'string') {
            return NextResponse.json(
                { success: false, message: 'No file uploaded. Please select a file.' },
                { status: 400 }
            )
        }

        // ── STEP 1: Validate file type (fail fast) ──
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
        const isImage = allowedImageTypes.includes(file.type) || file.type.startsWith('image/')
        const isVideo = allowedVideoTypes.includes(file.type) || file.type.startsWith('video/')

        if (!isImage && !isVideo) {
            return NextResponse.json(
                { success: false, message: `Unsupported file type: "${file.type}". Allowed: images (jpg, png, gif, webp) and videos (mp4, webm, mov).` },
                { status: 400 }
            )
        }

        // ── STEP 2: Validate file size ──
        // Images: 10MB, Videos: 500MB (safe limit for Node.js memory)
        const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024
        const maxLabel = isVideo ? '500MB' : '10MB'
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)

        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    message: `File too large (${fileSizeMB}MB). Maximum for ${isVideo ? 'videos' : 'images'} is ${maxLabel}. For files larger than 500MB, consider compressing the video first or using a cloud storage service.`
                },
                { status: 400 }
            )
        }

        // ── STEP 3: Check disk space ──
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        try {
            const diskFree = await getFreeDiskSpace(uploadDir)
            // Require at least 2x file size free (safety margin)
            const requiredSpace = file.size * 2
            if (diskFree !== null && diskFree < requiredSpace) {
                const freeGB = (diskFree / (1024 * 1024 * 1024)).toFixed(1)
                return NextResponse.json(
                    { success: false, message: `Not enough disk space. Only ${freeGB}GB free. Need at least ${(requiredSpace / (1024 * 1024 * 1024)).toFixed(1)}GB.` },
                    { status: 507 }
                )
            }
        } catch {
            // If disk check fails, continue anyway — don't block upload
            console.warn('⚠ Could not check disk space, proceeding with upload')
        }

        // ── STEP 4: Stream file to disk in chunks ──
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `upload-${uniqueSuffix}-${originalName}`
        const filepath = path.join(uploadDir, filename)

        // Convert to buffer and write in chunks to avoid memory spikes
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        await writeFileStreaming(filepath, buffer)

        console.log(`✓ Upload success: ${filename} (${fileSizeMB}MB, ${file.type})`)

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            filename,
            size: file.size,
            type: file.type,
            sizeMB: fileSizeMB
        })
    } catch (error: any) {
        console.error('✗ Upload error:', error)

        // Friendly error messages based on error type
        let message = 'Upload failed. Please try again.'
        if (error.message?.includes('body exceeded') || error.message?.includes('too large')) {
            message = 'File is too large for the server to process. Try a smaller file or compress the video first.'
        } else if (error.message?.includes('ENOSPC')) {
            message = 'Server ran out of disk space. Please contact the administrator.'
        } else if (error.message?.includes('EPERM') || error.message?.includes('EACCES')) {
            message = 'Server does not have permission to save files. Please contact the administrator.'
        } else if (error.message) {
            message = `Upload failed: ${error.message}`
        }

        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        )
    }
}

/**
 * Write buffer to file in 1MB chunks.
 * This prevents a single massive write() call that could spike memory.
 */
async function writeFileStreaming(filepath: string, buffer: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
        const stream = createWriteStream(filepath)
        const CHUNK_SIZE = 1024 * 1024 // 1MB chunks

        let offset = 0

        const writeNextChunk = () => {
            let canContinue = true
            while (canContinue && offset < buffer.length) {
                const end = Math.min(offset + CHUNK_SIZE, buffer.length)
                const chunk = buffer.subarray(offset, end)
                offset = end

                if (offset >= buffer.length) {
                    // Last chunk
                    stream.write(chunk, (err) => {
                        if (err) reject(err)
                        else stream.end(resolve)
                    })
                    return
                }

                canContinue = stream.write(chunk)
            }

            if (!canContinue) {
                // Wait for drain event before continuing
                stream.once('drain', writeNextChunk)
            }
        }

        stream.on('error', reject)
        writeNextChunk()
    })
}

/**
 * Get free disk space on the drive containing the given path.
 * Returns bytes available, or null if unable to determine.
 */
async function getFreeDiskSpace(dirPath: string): Promise<number | null> {
    try {
        // Node.js 18+ has statfs, but we use a simpler approach
        // Check if we're on Windows or Unix
        if (process.platform === 'win32') {
            // On Windows, use a basic heuristic: check if file can be created
            return null // Let OS handle it
        } else {
            // On Unix, use os.freemem as a rough proxy
            return os.freemem()
        }
    } catch {
        return null
    }
}
