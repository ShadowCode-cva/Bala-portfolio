// import { createClient } from '@/lib/supabase/server'
import { SkillsManager } from '@/components/admin/skills-manager'
import { getPortfolioData } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function AdminSkillsPage() {
  const data = await getPortfolioData()
  const skills = data.skills.sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Skills</h1>
        <p className="text-muted-foreground mt-2">
          Manage your skills and proficiency levels.
        </p>
      </div>

      <SkillsManager skills={skills || []} />
    </div>
  )
}
