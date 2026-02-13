'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2 } from 'lucide-react'
import type { SiteSettings } from '@/lib/types'

interface ProfileFormProps {
  settings: SiteSettings | null
}

export function ProfileForm({ settings }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: settings?.name || '',
    title: settings?.title || '',
    bio: settings?.bio || '',
    email: settings?.email || '',
    phone: settings?.phone || '',
    address: settings?.address || '',
    profile_image_url: settings?.profile_image_url || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const updatedSettings: SiteSettings = {
        ...(settings || {}),
        ...formData,
        id: settings?.id || '1', // Ensure ID exists
        updated_at: new Date().toISOString(),
        created_at: settings?.created_at || new Date().toISOString()
      } as SiteSettings

      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'settings', data: updatedSettings }),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      router.refresh()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save' })
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
            }`}>
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your name and professional title</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Bala Murugan S"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Professional Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Video Editor & Graphic Designer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell visitors about yourself..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Profile Image URL</label>
              <Input
                value={formData.profile_image_url}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                placeholder="https://example.com/your-photo.jpg"
                type="url"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How visitors can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Address / Location</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Chennai, Tamil Nadu, India"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
