import { getPortfolioData } from '@/lib/storage'
// import { createClient } from '@/lib/supabase/server'
import { ProjectsManager } from '@/components/admin/projects-manager'

// Force fresh data on every request - prevents stale cache
export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  // const supabase = await createClient()
  const data = await getPortfolioData()
  const projects = data.projects

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Projects</h1>
        <p className="text-muted-foreground mt-2">
          Showcase your best work and portfolio pieces.
        </p>
      </div>

      <ProjectsManager projects={projects || []} />
    </div>
  )
}
