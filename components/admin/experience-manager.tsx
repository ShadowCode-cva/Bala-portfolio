'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2, Briefcase, Calendar } from 'lucide-react'
import type { WorkExperience } from '@/lib/types'

interface ExperienceManagerProps {
  experience: WorkExperience[]
}

export function ExperienceManager({ experience }: ExperienceManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false
  })

  const resetForm = () => {
    setFormData({
      company: '',
      role: '',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false
    })
    setEditingExp(null)
  }

  const openEditDialog = (exp: WorkExperience) => {
    setEditingExp(exp)
    setFormData({
      company: exp.company,
      role: exp.role,
      description: exp.description || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_current: exp.is_current
    })
    setIsDialogOpen(true)
  }

  // Helper to save experience updates
  const saveExperience = async (updatedExperience: WorkExperience[]) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'experience', data: updatedExperience }),
      })

      if (!res.ok) throw new Error('Failed to save')

      router.refresh()
      return true
    } catch (error) {
      console.error('Error saving experience:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date || null
      }

      let updatedExperience = [...experience]

      if (editingExp) {
        // Update existing
        updatedExperience = updatedExperience.map(exp =>
          exp.id === editingExp.id
            ? {
              ...exp,
              ...payload,
              updated_at: new Date().toISOString()
            }
            : exp
        )
      } else {
        // Create new
        const newExp: WorkExperience = {
          id: crypto.randomUUID(),
          ...payload,
          sort_order: experience.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        updatedExperience.push(newExp)
      }

      await saveExperience(updatedExperience)

      setIsLoading(false)
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving experience:', error)
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const updatedExperience = experience.filter(exp => exp.id !== id)
      await saveExperience(updatedExperience)
    } catch (error) {
      console.error('Error deleting experience:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
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
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExp ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
              <DialogDescription>
                {editingExp ? 'Update the experience details below.' : 'Add a new work experience entry.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Creative Studios"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Role / Position</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Senior Video Editor"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    disabled={formData.is_current}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Current Position</label>
                <Switch
                  checked={formData.is_current}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingExp ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {experience.map(exp => (
          <Card key={exp.id} className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{exp.role}</h3>
                    <p className="text-primary">{exp.company}</p>
                    {exp.description && (
                      <p className="text-muted-foreground mt-2">{exp.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                      </span>
                      {exp.is_current && (
                        <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(exp)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exp.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {experience.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No experience added yet. Click "Add Experience" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
