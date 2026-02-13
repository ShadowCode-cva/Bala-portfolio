'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Tool } from '@/lib/types'

interface ToolsManagerProps {
  tools: Tool[]
}

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export function ToolsManager({ tools }: ToolsManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    level: 'Intermediate',
    proficiency: 50,
    icon_url: ''
  })

  const resetForm = () => {
    setFormData({ name: '', level: 'Intermediate', proficiency: 50, icon_url: '' })
    setEditingTool(null)
  }

  const openEditDialog = (tool: Tool) => {
    setEditingTool(tool)
    setFormData({
      name: tool.name,
      level: tool.level,
      proficiency: tool.proficiency,
      icon_url: tool.icon_url || ''
    })
    setIsDialogOpen(true)
  }

  // Helper to save tools updates
  const saveTools = async (updatedTools: Tool[]) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'tools', data: updatedTools }),
      })

      if (!res.ok) throw new Error('Failed to save')

      router.refresh()
      return true
    } catch (error) {
      console.error('Error saving tools:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updatedTools = [...tools]

      if (editingTool) {
        // Update existing
        updatedTools = updatedTools.map(t =>
          t.id === editingTool.id
            ? {
              ...t,
              ...formData,
              updated_at: new Date().toISOString()
            }
            : t
        )
      } else {
        // Create new
        const newTool: Tool = {
          id: crypto.randomUUID(),
          ...formData,
          sort_order: tools.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        updatedTools.push(newTool)
      }

      await saveTools(updatedTools)

      setIsLoading(false)
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving tool:', error)
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return

    try {
      const updatedTools = tools.filter(t => t.id !== id)
      await saveTools(updatedTools)
    } catch (error) {
      console.error('Error deleting tool:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTool ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
              <DialogDescription>
                {editingTool ? 'Update the tool details below.' : 'Add a new tool to your portfolio.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tool Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Adobe Premiere Pro"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Proficiency Level</label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Proficiency ({formData.proficiency}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.proficiency}
                  onChange={(e) => setFormData({ ...formData, proficiency: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Icon URL (Optional)</label>
                <Input
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  placeholder="https://example.com/icon.png"
                  type="url"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTool ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tools Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map(tool => (
          <Card key={tool.id} className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(tool)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(tool.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <h3 className="font-medium mb-1">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{tool.level}</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${tool.proficiency}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">{tool.proficiency}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {tools.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tools added yet. Click "Add Tool" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
