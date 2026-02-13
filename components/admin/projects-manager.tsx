'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Loader2, Star, ImageIcon, Video, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import type { Project } from '@/lib/types'
import { getEmbedUrl, detectVideoType } from '@/lib/video-utils'
import { VideoUploadWidget } from './video-upload-widget'
import { ThumbnailManager } from './thumbnail-manager'

interface ProjectsManagerProps {
  projects: Project[]
}

export function ProjectsManager({ projects }: ProjectsManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [previewThumbnail, setPreviewThumbnail] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Video Editing',
    thumbnail_url: '',
    video_url: '',
    video_type: 'file' as 'file' | 'embed',
    link: '',
    featured: false
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Video Editing',
      thumbnail_url: '',
      video_url: '',
      video_type: 'file',
      link: '',
      featured: false
    })
    setEditingProject(null)
    setPreviewThumbnail('')
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    // Defensive: Ensure video_type defaults to detected type or 'file'
    const detectedType = project.video_type || detectVideoType(project.video_url || '')
    setFormData({
      title: project.title,
      description: project.description || '',
      category: project.category,
      thumbnail_url: project.thumbnail_url || '',
      video_url: project.video_url || '',
      video_type: detectedType || 'file',
      link: project.link || '',
      featured: project.featured
    })
    setPreviewThumbnail(project.thumbnail_url || '')
    setIsDialogOpen(true)
  }

  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail_url' | 'video_url') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side size validation (fast feedback, no network round-trip)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024
    const maxLabel = isVideo ? '500MB' : '10MB'
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setUploadStatus(`✗ File too large (${sizeMB}MB). Max: ${maxLabel}`)
      return
    }

    // Show preview immediately for images
    if (field === 'thumbnail_url' && file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewThumbnail(objectUrl)
    }

    setUploadProgress(0)
    setUploadStatus(`Uploading ${file.name}...`)

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    // Use XMLHttpRequest for upload progress tracking
    // fetch() does not support upload progress events
    try {
      const result = await new Promise<{ success: boolean; url?: string; message?: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(pct)
            setUploadStatus(`Uploading ${file.name}... ${pct}%`)
          }
        })

        xhr.addEventListener('load', () => {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve(data)
          } catch {
            reject(new Error('Invalid response from server'))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
        xhr.addEventListener('timeout', () => reject(new Error('Upload timed out. Try a smaller file.')))

        xhr.open('POST', '/api/upload')
        xhr.timeout = 120000 // 2 minute timeout matching server
        xhr.send(uploadFormData)
      })

      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, [field]: result.url! }))
        if (field === 'thumbnail_url') {
          setPreviewThumbnail(result.url)
        }
        setUploadStatus(`✓ Uploaded ${file.name}`)
        setUploadProgress(100)
        setTimeout(() => { setUploadStatus(''); setUploadProgress(0) }, 3000)
      } else {
        setUploadStatus(`✗ ${result.message || 'Upload failed'}`)
        setUploadProgress(0)
        if (field === 'thumbnail_url') setPreviewThumbnail('')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadStatus(`✗ ${error.message || 'Network error'}`)
      setUploadProgress(0)
      if (field === 'thumbnail_url') setPreviewThumbnail('')
    }

    // Reset file input so the same file can be re-selected
    e.target.value = ''
  }

  // Helper to save projects updates
  const saveProjects = async (updatedProjects: Project[]) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'projects', data: updatedProjects }),
      })

      if (!res.ok) throw new Error('Failed to save')

      router.refresh()
      return true
    } catch (error) {
      console.error('Error saving projects:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updatedProjects = [...projects]

      if (editingProject) {
        // Update existing
        updatedProjects = updatedProjects.map(p =>
          p.id === editingProject.id
            ? {
              ...p,
              ...formData,
              updated_at: new Date().toISOString()
            }
            : p
        )
      } else {
        // Create new
        const newProject: Project = {
          id: crypto.randomUUID(),
          ...formData,
          // Sort order is next in line
          sort_order: projects.length > 0 ? Math.max(...projects.map(p => p.sort_order)) + 1 : 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        updatedProjects.push(newProject)
      }

      await saveProjects(updatedProjects)

      setIsLoading(false)
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving project:', error)
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== id)
      await saveProjects(updatedProjects)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const toggleFeatured = async (project: Project) => {
    try {
      const updatedProjects = projects.map(p =>
        p.id === project.id ? { ...p, featured: !p.featured } : p
      )
      await saveProjects(updatedProjects)
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const moveProject = async (project: Project, direction: 'up' | 'down') => {
    const index = projects.findIndex(p => p.id === project.id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === projects.length - 1)) {
      return
    }

    const otherIndex = direction === 'up' ? index - 1 : index + 1
    const otherProject = projects[otherIndex]

    // Swap sort orders
    const updatedProjects = projects.map(p => {
      if (p.id === project.id) return { ...p, sort_order: otherProject.sort_order }
      if (p.id === otherProject.id) return { ...p, sort_order: project.sort_order }
      return p
    })

    // Optimistic UI update could be done here, but router.refresh handles it via server sort
    await saveProjects(updatedProjects)
  }

  const categories = ['Video Editing', 'Graphic Design', 'Motion Graphics', 'Photography']

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Library</h2>
          <p className="text-muted-foreground mt-1">Manage and organize your portfolio projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              <DialogDescription>
                {editingProject ? 'Update the project details below.' : 'Create a new portfolio project.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Thumbnail Preview */}
              {previewThumbnail && (
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewThumbnail || "/placeholder.svg"}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Project Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Brand Film - Tech Startup"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the project..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium block mb-2">Thumbnail Image (9:16 portrait)</Label>
                <ThumbnailManager
                  onThumbnailChange={(url) => {
                    setFormData(prev => ({ ...prev, thumbnail_url: url }))
                    setPreviewThumbnail(url)
                  }}
                  currentThumbnail={formData.thumbnail_url}
                />
              </div>

              <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-primary" />
                  <Label className="font-semibold text-sm">Video (Upload or Embed URL)</Label>
                </div>

                <VideoUploadWidget
                  onVideoUrlChange={(url, source) => {
                    setFormData(prev => ({
                      ...prev,
                      video_url: url,
                      video_type: source === 'local' ? 'file' : 'embed'
                    }))
                  }}
                  currentUrl={formData.video_url}
                />

                {/* Video Preview - Defensive rendering */}
                {formData.video_url ? (
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs font-semibold">Live Preview</Label>
                    <div className="relative aspect-video bg-black rounded-md overflow-hidden border">
                      {formData.video_type === 'file' && formData.video_url ? (
                        <video
                          key={formData.video_url}
                          src={formData.video_url}
                          controls
                          className="w-full h-full object-contain"
                          onError={() => console.error('Video load error:', formData.video_url)}
                        />
                      ) : formData.video_type === 'embed' && formData.video_url ? (
                        <iframe
                          key={getEmbedUrl(formData.video_url)}
                          src={getEmbedUrl(formData.video_url) || ''}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          onError={() => console.error('Embed load error:', formData.video_url)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <AlertCircle className="w-6 h-6 mr-2" />
                          <span className="text-sm">Invalid or unsupported video URL</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">External Portfolio Link (Optional)</label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://behance.net/..."
                  type="url"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Featured Project</p>
                  <p className="text-sm text-muted-foreground">Show this project prominently</p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary text-primary-foreground"
                  disabled={isLoading || !formData.title || !formData.category}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold mb-1">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Get started by creating your first project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              {project.thumbnail_url && (
                <div className="relative w-full aspect-[9/16] bg-muted overflow-hidden">
                  <img
                    src={project.thumbnail_url || "/placeholder.svg"}
                    alt={project.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{project.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{project.category}</CardDescription>
                  </div>
                  <button
                    onClick={() => toggleFeatured(project)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Star className={`w-4 h-4 ${project.featured ? 'fill-primary text-primary' : ''}`} />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(project)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <AlertDialog open={deleteConfirm === project.id} onOpenChange={(open) => {
                    if (!open) setDeleteConfirm(null)
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive bg-transparent"
                        onClick={() => setDeleteConfirm(project.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(project.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Reorder buttons */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    disabled={index === 0}
                    onClick={() => moveProject(project, 'up')}
                  >
                    ↑ Move Up
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    disabled={index === projects.length - 1}
                    onClick={() => moveProject(project, 'down')}
                  >
                    Move Down ↓
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Use portrait-oriented images (9:16 aspect ratio) for thumbnails</p>
          <p>• Featured projects are highlighted on your portfolio</p>
          <p>• Reorder projects to showcase your best work first</p>
          <p>• Add YouTube or Vimeo links for video projects</p>
        </CardContent>
      </Card>
    </div>
  )
}
