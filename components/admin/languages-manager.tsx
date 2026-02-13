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
import { Plus, Pencil, Trash2, Loader2, Globe } from 'lucide-react'
import type { Language } from '@/lib/types'

interface LanguagesManagerProps {
  languages: Language[]
}

const levels = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Conversational', 'Basic']

export function LanguagesManager({ languages }: LanguagesManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingLang, setEditingLang] = useState<Language | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    level: 'Intermediate'
  })

  const resetForm = () => {
    setFormData({ name: '', level: 'Intermediate' })
    setEditingLang(null)
  }

  const openEditDialog = (lang: Language) => {
    setEditingLang(lang)
    setFormData({
      name: lang.name,
      level: lang.level
    })
    setIsDialogOpen(true)
  }

  // Helper to save languages updates
  const saveLanguages = async (updatedLanguages: Language[]) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'languages', data: updatedLanguages }),
      })

      if (!res.ok) throw new Error('Failed to save')

      router.refresh()
      return true
    } catch (error) {
      console.error('Error saving languages:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updatedLanguages = [...languages]

      if (editingLang) {
        // Update existing
        updatedLanguages = updatedLanguages.map(l =>
          l.id === editingLang.id
            ? {
              ...l,
              ...formData,
              updated_at: new Date().toISOString() // Note: Language type in types.ts might not have updated_at, let's check
            }
            : l
        )
      } else {
        // Create new
        const newLang: Language = {
          id: crypto.randomUUID(),
          ...formData,
          sort_order: languages.length,
          created_at: new Date().toISOString()
        }
        updatedLanguages.push(newLang)
      }

      await saveLanguages(updatedLanguages)

      setIsLoading(false)
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving language:', error)
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this language?')) return

    try {
      const updatedLanguages = languages.filter(l => l.id !== id)
      await saveLanguages(updatedLanguages)
    } catch (error) {
      console.error('Error deleting language:', error)
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
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLang ? 'Edit Language' : 'Add New Language'}</DialogTitle>
              <DialogDescription>
                {editingLang ? 'Update the language details below.' : 'Add a new language to your profile.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Language</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., English, Hindi, Tamil"
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingLang ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Languages Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map(lang => (
          <Card key={lang.id} className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{lang.name}</h3>
                    <p className="text-sm text-muted-foreground">{lang.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(lang)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(lang.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {languages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No languages added yet. Click "Add Language" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
