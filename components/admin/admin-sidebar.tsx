'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  User,
  Briefcase,
  FolderKanban,
  Wrench,
  Award,
  Languages,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Layers,
  Settings
} from 'lucide-react'
// import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AdminSidebarProps {
  user: {
    email: string
    id: string
  }
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Profile', href: '/admin/profile', icon: User },
  { label: 'Skills', href: '/admin/skills', icon: Award },
  { label: 'Tools', href: '/admin/tools', icon: Wrench },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Experience', href: '/admin/experience', icon: Briefcase },
  { label: 'Languages', href: '/admin/languages', icon: Languages },
  { label: 'Custom Sections', href: '/admin/sections', icon: Layers },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
      })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">BM</span>
          </div>
          <div>
            <p className="font-semibold">Portfolio Admin</p>
            <p className="text-xs text-muted-foreground">Content Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <Link
          href="/"
          className="block text-center text-sm text-muted-foreground hover:text-primary mt-4 transition-colors"
        >
          View Portfolio
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-border p-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">BM</span>
          </div>
          <span className="font-semibold">Admin</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur-sm pt-16">
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-card border-r border-border">
        <SidebarContent />
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16" />
    </>
  )
}
