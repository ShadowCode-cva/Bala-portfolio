import { getPortfolioData } from '@/lib/storage'
// import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Award, Wrench, Briefcase } from 'lucide-react'
import Link from 'next/link'

// Ensure fresh data on every request
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // const supabase = await createClient()

  // Fetch counts for dashboard stats
  const data = await getPortfolioData()

  const skillsCount = data.skills.length
  const toolsCount = data.tools.length
  const projectsCount = data.projects.length
  const experienceCount = data.experience.length

  const stats = [
    { label: 'Skills', count: skillsCount || 0, icon: Award, href: '/admin/skills', color: 'text-blue-500' },
    { label: 'Tools', count: toolsCount || 0, icon: Wrench, href: '/admin/tools', color: 'text-green-500' },
    { label: 'Projects', count: projectsCount || 0, icon: FolderKanban, href: '/admin/projects', color: 'text-amber-500' },
    { label: 'Experience', count: experienceCount || 0, icon: Briefcase, href: '/admin/experience', color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Manage your portfolio content from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to manage
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/profile"
              className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-medium mb-1">Update Profile</h3>
              <p className="text-sm text-muted-foreground">Edit your bio, contact info, and profile image</p>
            </Link>
            <Link
              href="/admin/projects"
              className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-medium mb-1">Add New Project</h3>
              <p className="text-sm text-muted-foreground">Showcase your latest work</p>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-medium mb-1">View Portfolio</h3>
              <p className="text-sm text-muted-foreground">See how your portfolio looks to visitors</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
