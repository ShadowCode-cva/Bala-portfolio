'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Skill } from '@/lib/types'

interface SkillsManagerProps {
  skills: Skill[]
}

export function SkillsManager({ skills }: SkillsManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiency: 50,
    description: ''
  })

  const resetForm = () => {
    setFormData({ name: '', category: '', proficiency: 50, description: '' })
    setEditingSkill(null)
  }

  const openEditDialog = (skill: Skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      description: skill.description || ''
    })
    setIsDialogOpen(true)
  }

  // Helper to save skills updates
  const saveSkills = async (updatedSkills: Skill[]) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'skills', data: updatedSkills }),
      })

      if (!res.ok) throw new Error('Failed to save')

      router.refresh()
      return true
    } catch (error) {
      console.error('Error saving skills:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updatedSkills = [...skills]

      if (editingSkill) {
        // Update existing
        updatedSkills = updatedSkills.map(s =>
          s.id === editingSkill.id
            ? {
              ...s,
              ...formData,
              updated_at: new Date().toISOString()
            }
            : s
        )
      } else {
        // Create new
        const newSkill: Skill = {
          id: crypto.randomUUID(),
          ...formData,
          sort_order: skills.length,
          icon_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        updatedSkills.push(newSkill)
      }

      await saveSkills(updatedSkills)

      setIsLoading(false)
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving skill:', error)
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return

    try {
      const updatedSkills = skills.filter(s => s.id !== id)
      await saveSkills(updatedSkills)
    } catch (error) {
      console.error('Error deleting skill:', error)
    }
  }

  const categories = [...new Set(skills.map(s => s.category))]

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
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
              <DialogDescription>
                {editingSkill ? 'Update the skill details below.' : 'Add a new skill to your portfolio.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Skill Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Video Editing"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Video, Design, Creative"
                  list="categories"
                  required
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
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
                <label className="text-sm text-muted-foreground mb-2 block">Description (Optional)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your experience"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSkill ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Skills by Category */}
      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills
                .filter(s => s.category === category)
                .map(skill => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(skill)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(skill.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {skills.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No skills added yet. Click "Add Skill" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
