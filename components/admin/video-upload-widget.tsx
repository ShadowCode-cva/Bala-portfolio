'use client'

import React, { useState, useRef } from 'react'
import { AlertCircle, Link as LinkIcon, FileVideo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateFileBeforeUpload } from '@/lib/upload-manager'
import { validateVideoUrl } from '@/lib/video-handler'

interface VideoUploadWidgetProps {
  onVideoUrlChange: (url: string, source: 'local' | 'embed') => void
  currentUrl?: string
}

export function VideoUploadWidget({ onVideoUrlChange, currentUrl }: VideoUploadWidgetProps) {
  const [activeTab, setActiveTab] = useState<'embed' | 'local'>('embed')
  const [embedUrl, setEmbedUrl] = useState(currentUrl || '')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [urlSuccess, setUrlSuccess] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    const validation = validateFileBeforeUpload(file, true)
    if (!validation.valid) {
      setUploadError(validation.error || 'Validation failed')
      setIsUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(pct)
        }
      })

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          try {
            const data = JSON.parse(xhr.responseText)
            if (data.success && data.url) {
              onVideoUrlChange(data.url, 'local')
              setIsUploading(false)
              setUploadProgress(0)
              if (fileInputRef.current) fileInputRef.current.value = ''
              resolve()
            } else {
              reject(new Error(data.message || 'Upload failed'))
            }
          } catch (err) {
            reject(new Error('Invalid response'))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.open('POST', '/api/upload')
        xhr.timeout = 120000
        xhr.send(formData)
      })
    } catch (error) {
      setUploadError((error as Error).message)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleValidateEmbedUrl = () => {
    setUrlError(null)
    setUrlSuccess(false)
    
    if (!embedUrl.trim()) {
      setUrlError('Please enter a video URL')
      return
    }

    const metadata = validateVideoUrl(embedUrl)
    
    if (metadata.error) {
      setUrlError(metadata.error)
      return
    }

    setUrlSuccess(true)
    onVideoUrlChange(embedUrl, 'embed')
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'embed' | 'local')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="embed" className="gap-2">
            <LinkIcon className="w-4 h-4" />
            Embed URL
          </TabsTrigger>
          <TabsTrigger value="local" className="gap-2">
            <FileVideo className="w-4 h-4" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="embed" className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Video URL</label>
            <Input
              placeholder="YouTube, Vimeo, Google Drive, or video URL"
              value={embedUrl}
              onChange={(e) => {
                setEmbedUrl(e.target.value)
                setUrlError(null)
                setUrlSuccess(false)
              }}
              onBlur={handleValidateEmbedUrl}
            />
            <div className="text-xs text-neutral-500 space-y-1">
              <p className="font-medium">✓ Accepted formats:</p>
              <ul className="list-disc list-inside pl-1">
                <li>YouTube: youtube.com/watch?v=... or youtu.be/...</li>
                <li>YouTube Embed: youtube.com/embed/VIDEO_ID</li>
                <li>YouTube Shorts: youtube.com/shorts/VIDEO_ID</li>
                <li>Vimeo: vimeo.com/123456</li>
                <li>Google Drive: drive.google.com/file/d/.../view</li>
                <li>Iframe code: &lt;iframe src="..."&gt; - we'll extract the URL</li>
              </ul>
            </div>
          </div>

          {urlError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{urlError}</AlertDescription>
            </Alert>
          )}

          {urlSuccess && (
            <Alert className="bg-green-950 text-green-200 border-green-800">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>✓ Video URL validated and ready!</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="local" className="space-y-3">
          <div
            className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileVideo className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            <p className="text-sm font-medium mb-1">Upload Video</p>
            <p className="text-xs text-neutral-500 mb-3">MP4, WebM, MOV (Max 500MB)</p>
            <Button size="sm" variant="outline">
              Choose File
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading && (
            <div className="space-y-2 p-3 bg-neutral-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">Uploading...</p>
                <p className="text-xs text-neutral-400">{uploadProgress}%</p>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}