'use client'

import { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  ImageIcon,
  Video,
  Type,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  X,
  Edit2,
  Eye,
  EyeOff
} from 'lucide-react'

interface ContentField {
  id: string
  type: 'text' | 'textarea' | 'image' | 'video' | 'number'
  label: string
  value: string
}

interface ContentSection {
  id: string
  name: string
  description: string
  fields: ContentField[]
  isExpanded: boolean
  isVisible: boolean
  sortOrder: number
}

export function SectionsManager() {
  const [sections, setSections] = useState<ContentSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  // const supabase = createClient()

  // Load sections from API
  useEffect(() => {
    const loadSections = async () => {
      try {
        const res = await fetch('/api/data')
        const data = await res.json()
        if (data.sections) {
          setSections(data.sections)
        }
      } catch (error) {
        console.error('Error loading sections:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSections()
  }, [])

  const saveSections = async () => {
    setIsSaving(true)
    setSavedMessage('')
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'sections', data: sections }),
      })

      if (!res.ok) throw new Error('Failed to save')

      setSavedMessage('Changes saved successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Error saving sections:', error)
      setSavedMessage('Error saving changes')
    } finally {
      setIsSaving(false)
    }
  }

  const addSection = () => {
    const newSection: ContentSection = {
      id: `section_${Date.now()}`,
      name: 'New Section',
      description: '',
      fields: [],
      isExpanded: true,
      isVisible: true,
      sortOrder: sections.length
    }
    setSections([...sections, newSection])
  }

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  const updateSection = (sectionId: string, updates: Partial<ContentSection>) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, ...updates } : s
    ))
  }

  const addField = (sectionId: string, type: ContentField['type']) => {
    const newField: ContentField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      value: ''
    }
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, fields: [...s.fields, newField] }
        : s
    ))
  }

  const updateField = (sectionId: string, fieldId: string, updates: Partial<ContentField>) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
          ...s,
          fields: s.fields.map(f =>
            f.id === fieldId ? { ...f, ...updates } : f
          )
        }
        : s
    ))
  }

  const deleteField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
        : s
    ))
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    const newSections = [...sections]
    const [removed] = newSections.splice(index, 1)
    newSections.splice(newIndex, 0, removed)
    setSections(newSections.map((s, i) => ({ ...s, sortOrder: i })))
  }

  const fieldTypes = [
    { type: 'text' as const, icon: Type, label: 'Text' },
    { type: 'textarea' as const, icon: FileText, label: 'Long Text' },
    { type: 'image' as const, icon: ImageIcon, label: 'Image URL' },
    { type: 'video' as const, icon: Video, label: 'Video URL' },
    { type: 'number' as const, icon: Type, label: 'Number' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Content Sections</h2>
          <p className="text-muted-foreground">Create and manage custom content sections like Google Forms</p>
        </div>
        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className={`text-sm ${savedMessage.includes('Error') ? 'text-destructive' : 'text-green-500'} flex items-center gap-1`}>
              <Check className="w-4 h-4" />
              {savedMessage}
            </span>
          )}
          <Button onClick={saveSections} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id} className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Drag handle */}
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Input
                      value={section.name}
                      onChange={(e) => updateSection(section.id, { name: e.target.value })}
                      className="font-semibold text-lg h-auto py-1 px-2 border-transparent hover:border-border focus:border-primary"
                      placeholder="Section Name"
                    />
                    <Input
                      value={section.description}
                      onChange={(e) => updateSection(section.id, { description: e.target.value })}
                      className="text-sm text-muted-foreground h-auto py-1 px-2 border-transparent hover:border-border focus:border-primary"
                      placeholder="Section description (optional)"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateSection(section.id, { isVisible: !section.isVisible })}
                    title={section.isVisible ? 'Hide section' : 'Show section'}
                  >
                    {section.isVisible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateSection(section.id, { isExpanded: !section.isExpanded })}
                  >
                    {section.isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSection(section.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {section.isExpanded && (
              <CardContent className="space-y-4">
                {/* Fields */}
                {section.fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-3 cursor-move" />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                          className="font-medium h-auto py-1 px-2"
                          placeholder="Field label"
                        />
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded capitalize">
                          {field.type}
                        </span>
                      </div>

                      {field.type === 'textarea' ? (
                        <Textarea
                          value={field.value}
                          onChange={(e) => updateField(section.id, field.id, { value: e.target.value })}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          rows={3}
                        />
                      ) : (
                        <Input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={field.value}
                          onChange={(e) => updateField(section.id, field.id, { value: e.target.value })}
                          placeholder={
                            field.type === 'image' ? 'https://example.com/image.jpg' :
                              field.type === 'video' ? 'https://youtube.com/watch?v=...' :
                                `Enter ${field.label.toLowerCase()}...`
                          }
                        />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteField(section.id, field.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Field Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <p className="w-full text-sm text-muted-foreground mb-1">Add field:</p>
                  {fieldTypes.map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addField(section.id, type)}
                      className="bg-transparent"
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Section Button */}
      <Button
        variant="outline"
        onClick={addSection}
        className="w-full py-8 border-dashed border-2 bg-transparent hover:bg-primary/5 hover:border-primary"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Section
      </Button>

      {/* Help text */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            How to use Custom Sections
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Create sections like "Posters", "Event Videos", "Branding Works"</li>
            <li>Add fields for images, videos, titles, and descriptions</li>
            <li>Reorder sections using the up/down arrows</li>
            <li>Toggle visibility to show/hide sections on the portfolio</li>
            <li>All changes are saved when you click "Save All Changes"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
