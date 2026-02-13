'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, User, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('[LOGIN] Attempting login with username:', email)
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // CRITICAL: Include cookies in request
        body: JSON.stringify({ username: email, password }),
      })

      console.log('[LOGIN] API Response status:', res.status)
      
      const data = await res.json()
      console.log('[LOGIN] API Response data:', data)

      if (!res.ok) {
        console.error('[LOGIN] Authentication failed')
        throw new Error(data.message || 'Login failed')
      }

      if (data.success) {
        console.log('[LOGIN] Authentication successful, redirecting...')
        setIsLoading(false)
        // Small delay to ensure cookie is set before redirect
        setTimeout(() => {
          console.log('[LOGIN] Pushing to /admin')
          router.push('/admin')
        }, 300)
      } else {
        console.warn('[LOGIN] Server returned success: false')
        setError(data.message || 'Login failed')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('[LOGIN] Error during authentication:', err)
      setError(err.message || 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Login</CardTitle>
          <CardDescription>
            Sign in to manage your portfolio content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="text-sm text-muted-foreground mb-2 block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-sm text-muted-foreground mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to Portfolio
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
