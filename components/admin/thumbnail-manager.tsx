'use client'

import React, { useState, useRef } from 'react'
import { Upload, AlertCircle, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateFileBeforeUpload } from '@/lib/upload-manager'

interface ThumbnailManagerProps {
  onThumbnailChange: (url: string) => void
  currentThumbnail?: string
}

export function ThumbnailManager({ onThumbnailChange, currentThumbnail }: ThumbnailManagerProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url')
  const [thumbnailUrl, setThumbnailUrl] = useState(currentThumbnail || '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentThumbnail || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlChange = (url: string) => {
    setThumbnailUrl(url)
    setError(null)
    
    if (url) {
      if (url.startsWith('http') || url.startsWith('data:')) {
        setPreviewUrl(url)
        onThumbnailChange(url)
      } else {
        setError('Invalid image URL')
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    const validation = validateFileBeforeUpload(file, false)
    if (!validation.valid) {
      setError(validation.error)
      setUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'thumbnail')

      const response = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      const reader = new FileReader()
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string
        setPreviewUrl(dataUrl)
        onThumbnailChange(data.path)
      }
      reader.readAsDataURL(file)
      
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError((err as Error).message)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'upload')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Image URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-3">
          <Input
            placeholder="https://example.com/image.jpg"
            value={thumbnailUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          <p className="text-xs text-neutral-500">
            Paste image URL. Best aspect ratio: 9:16 (portrait)
          </p>
        </TabsContent>

        <TabsContent value="upload" className="space-y-3">
          <div
            className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            <p className="text-sm font-medium mb-1">Upload Thumbnail</p>
            <p className="text-xs text-neutral-500">JPG, PNG, WebP (Max 10MB)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading && (
            <div className="flex items-center justify-center gap-2 p-3 bg-neutral-900 rounded">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm">Uploading...</span>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {previewUrl && (
        <div className="relative w-full aspect-[9/16] bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700">
          <img
            src={previewUrl}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setPreviewUrl(null)
              setThumbnailUrl('')
              onThumbnailChange('')
            }}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}