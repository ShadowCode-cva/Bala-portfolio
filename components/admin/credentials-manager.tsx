'use client'

import React from "react"

import { useState } from 'react'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AdminCredentialsManagerProps {
  userEmail: string
}

export function AdminCredentialsManager({ userEmail }: AdminCredentialsManagerProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain an uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain a lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain a number'
    }
    return null
  }

  /*
  const handleChangePassword = async (e: React.FormEvent) => {
    // ... removed ...
  }
  */

  // Since we are using simple environment variable authentication
  const isEnvAuth = true;

  return (
    <div className="space-y-6">
      {/* Current Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Current Credentials</CardTitle>
          <CardDescription>Your admin account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Email Address</label>
              <Input
                value={userEmail}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Your login email</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your admin account password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="mb-2 font-medium">Authentication is managed via Environment Variables.</p>
            <p className="mb-2">To change your password, update the following variables in your <code>.env.local</code> file or deployment settings:</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs bg-black/5 p-2 rounded">
              <li>ADMIN_USER</li>
              <li>ADMIN_PASSWORD</li>
            </ul>
            <p className="mt-2 text-muted-foreground">After updating, restart your application for changes to take effect.</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Security Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Keep your password secure and never share it</p>
          <p>• Use a unique, strong password not used elsewhere</p>
          <p>• Change your password regularly</p>
          <p>• If you suspect unauthorized access, change your password immediately</p>
        </CardContent>
      </Card>
    </div>
  )
}
