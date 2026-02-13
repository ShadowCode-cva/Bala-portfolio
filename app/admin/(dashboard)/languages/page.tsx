// import { createClient } from '@/lib/supabase/server'
import { LanguagesManager } from '@/components/admin/languages-manager'
import { getPortfolioData } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function AdminLanguagesPage() {
  const data = await getPortfolioData()
  const languages = data.languages.sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Languages</h1>
        <p className="text-muted-foreground mt-2">
          Manage the languages you speak and your proficiency levels.
        </p>
      </div>

      <LanguagesManager languages={languages || []} />
    </div>
  )
}
