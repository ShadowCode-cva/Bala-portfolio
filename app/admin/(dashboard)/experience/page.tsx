// import { createClient } from '@/lib/supabase/server'
import { ExperienceManager } from '@/components/admin/experience-manager'
import { getPortfolioData } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function AdminExperiencePage() {
  const data = await getPortfolioData()
  const experience = data.experience.sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Work Experience</h1>
        <p className="text-muted-foreground mt-2">
          Manage your professional experience and career history.
        </p>
      </div>

      <ExperienceManager experience={experience || []} />
    </div>
  )
}
